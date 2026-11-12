import type { Simulation, ResultType, ComplexNumber } from 'eecircuit-engine';
import type {
  CaseDefinition,
  NormalizedSimOutput,
  NormalizedVector,
  SimResultBag,
} from '../types/circuit';

class NgspiceEngineManager {
  private sim: Simulation | null = null;
  private initPromise: Promise<void> | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private ready = false;

  public isReady(): boolean {
    return this.ready;
  }

  public async ensureStarted(): Promise<void> {
    if (this.ready && this.sim) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        const mod = await import('eecircuit-engine');
        const instance = new mod.Simulation();
        await instance.start();
        this.sim = instance;
        this.ready = true;
      })();
    }
    await this.initPromise;
  }

  public runNetlist(netlist: string): Promise<NormalizedSimOutput> {
    const job = this.queue.then(async () => {
      await this.ensureStarted();
      if (!this.sim) {
        throw new Error('ngspice WASM 引擎尚未完成初始化');
      }
      const t0 = performance.now();
      this.sim.setNetList(netlist.trim() + '\n');
      const raw = await this.sim.runSim();
      const durationMs = performance.now() - t0;
      const infoLog = this.sim.getInfo() || '';
      const errs = this.sim.getError() || [];
      const errorLog = errs
        .filter((line) => !line.startsWith('Note:'))
        .join('\n');
      return this.normalizeResult(raw, infoLog, errorLog, durationMs);
    });
    // Keep queue alive even if one simulation fails
    this.queue = job.catch(() => undefined);
    return job;
  }

  public async runCase(
    caseDef: CaseDefinition,
    params: Record<string, number>,
    customNetlist?: string
  ): Promise<SimResultBag> {
    const primaryNetlist = customNetlist ?? caseDef.buildNetlist(params);
    const primary = await this.runNetlist(primaryNetlist);
    const extras: Record<string, NormalizedSimOutput> = {};
    if (!customNetlist && caseDef.extraRuns && caseDef.extraRuns.length > 0) {
      for (const extra of caseDef.extraRuns) {
        extras[extra.id] = await this.runNetlist(extra.buildNetlist(params));
      }
    }
    return { primary, extras };
  }

  private normalizeResult(
    raw: ResultType,
    infoLog: string,
    errorLog: string,
    durationMs: number
  ): NormalizedSimOutput {
    const vectors: Record<string, NormalizedVector> = {};
    const header = raw?.header || '';
    let analysisType = 'op';
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes('transient')) analysisType = 'tran';
    else if (lowerHeader.includes('ac analysis')) analysisType = 'ac';
    else if (lowerHeader.includes('dc transfer')) analysisType = 'dc';

    if (raw && Array.isArray(raw.data)) {
      raw.data.forEach((entry, index) => {
        const key = entry.name.toLowerCase();
        if (raw.dataType === 'complex') {
          const cVals = entry.values as ComplexNumber[];
          const real = cVals.map((v) => v.real);
          const imag = cVals.map((v) => v.img);
          const mag = cVals.map((v) => Math.hypot(v.real, v.img));
          const phaseDeg = cVals.map(
            (v) => (Math.atan2(v.img, v.real) * 180) / Math.PI
          );
          const vec: NormalizedVector = {
            name: entry.name,
            real,
            imag,
            mag,
            phaseDeg,
          };
          vectors[key] = vec;
          if (index === 0) vectors['__sweep__'] = vec;
        } else {
          const rVals = (entry.values as number[]).map((v) => Number(v));
          const vec: NormalizedVector = {
            name: entry.name,
            real: rVals,
          };
          vectors[key] = vec;
          if (index === 0) vectors['__sweep__'] = vec;
        }
      });
    }

    return {
      rawHeader: header,
      analysisType,
      numPoints: raw?.numPoints ?? 0,
      vectors,
      rawResult: raw,
      infoLog,
      errorLog,
      durationMs,
    };
  }
}

export const ngspiceEngine = new NgspiceEngineManager();

/** Helper: read scalar DC / OP point from normalized output */
export function opVal(
  out: NormalizedSimOutput | null | undefined,
  vecName: string,
  scale = 1
): number | null {
  if (!out) return null;
  const v = out.vectors[vecName.toLowerCase()];
  if (!v || v.real.length === 0) return null;
  return v.real[0] * scale;
}

/** Helper: read AC phasor { mag, phaseDeg, real, imag } at a given frequency or index */
export function acPhasorAt(
  out: NormalizedSimOutput | null | undefined,
  vecName: string,
  targetFreqHz?: number
): { mag: number; phaseDeg: number; real: number; imag: number; freq: number } | null {
  if (!out) return null;
  const freqVec = out.vectors['frequency'] || out.vectors['__sweep__'];
  const v = out.vectors[vecName.toLowerCase()];
  if (!v || !freqVec || v.real.length === 0) return null;

  let idx = 0;
  if (targetFreqHz !== undefined && freqVec.real.length > 1) {
    let bestDiff = Infinity;
    for (let i = 0; i < freqVec.real.length; i++) {
      const diff = Math.abs(freqVec.real[i] - targetFreqHz);
      if (diff < bestDiff) {
        bestDiff = diff;
        idx = i;
      }
    }
  }
  const real = v.real[idx] ?? 0;
  const imag = v.imag?.[idx] ?? 0;
  const mag = v.mag?.[idx] ?? Math.hypot(real, imag);
  const phaseDeg = v.phaseDeg?.[idx] ?? (Math.atan2(imag, real) * 180) / Math.PI;
  return { mag, phaseDeg, real, imag, freq: freqVec.real[idx] ?? 0 };
}
