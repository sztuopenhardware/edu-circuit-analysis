import React, { useState, useMemo } from 'react';
import type {
  CaseDefinition,
  SimResultBag,
} from '../types/circuit';

interface WaveformChartProps {
  caseDef: CaseDefinition;
  simBag: SimResultBag;
  params: Record<string, number>;
}

interface PlotSeries {
  label: string;
  unit: string;
  color: string;
  values: number[];
  phaseValues?: number[];
  dashed?: boolean;
  axis: 'left' | 'right';
}

export const WaveformChart: React.FC<WaveformChartProps> = ({
  caseDef,
  simBag,
  params,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const prepared = useMemo(() => {
    const out = simBag.primary;
    if (!out || out.numPoints === 0) return null;

    if (caseDef.buildDerivedCurves) {
      const custom = caseDef.buildDerivedCurves(simBag, params);
      if (custom && custom.xValues.length > 0) {
        return {
          isLogX: caseDef.plotKind === 'ac_bode',
          isBode: false,
          xValues: custom.xValues,
          series: custom.series.map((s) => ({
            ...s,
            axis: s.axis ?? 'left',
          })) as PlotSeries[],
          markers: custom.markers ?? [],
        };
      }
    }

    const sweepVec =
      out.vectors['time'] ||
      out.vectors['frequency'] ||
      out.vectors['__sweep__'];
    if (!sweepVec || sweepVec.real.length < 2) return null;

    const xValues = sweepVec.real;
    const isBode = caseDef.plotKind === 'ac_bode';
    const magMode = caseDef.acMagnitudeMode ?? 'dB';

    const series: PlotSeries[] = [];
    for (const tr of caseDef.traces ?? []) {
      const vec = out.vectors[tr.expr.toLowerCase()];
      if (!vec) continue;
      const scale = tr.scale ?? 1;
      if (isBode) {
        const rawMag = vec.mag ?? vec.real.map((v) => Math.abs(v));
        const values =
          magMode === 'dB'
            ? rawMag.map((m) => 20 * Math.log10(Math.max(m * Math.abs(scale), 1e-12)))
            : rawMag.map((m) => m * scale);
        const phaseValues =
          vec.phaseDeg ?? vec.real.map((v) => (v * scale >= 0 ? 0 : 180));
        series.push({
          label: tr.label,
          unit: magMode === 'dB' ? 'dB' : tr.unit,
          color: tr.color,
          values,
          phaseValues,
          dashed: tr.dashed,
          axis: tr.axis ?? 'left',
        });
      } else {
        series.push({
          label: tr.label,
          unit: tr.unit,
          color: tr.color,
          values: vec.real.map((v) => v * scale),
          dashed: tr.dashed,
          axis: tr.axis ?? 'left',
        });
      }
    }

    if (series.length === 0) return null;
    return {
      isLogX: isBode,
      isBode,
      xValues,
      series,
      markers: [] as { x: number; label: string; color?: string }[],
    };
  }, [caseDef, simBag, params]);

  if (!prepared) {
    return null;
  }

  const { isLogX, isBode, xValues, series, markers } = prepared;
  const W = 720;
  const H = isBode ? 390 : 285;
  const padL = 62;
  const padR = series.some((s) => s.axis === 'right') ? 62 : 26;
  const padT = 22;
  const padB = 38;

  const xMinRaw = xValues[0];
  const xMaxRaw = xValues[xValues.length - 1];
  const xToPx = (x: number) => {
    if (isLogX) {
      const lxMin = Math.log10(Math.max(xMinRaw, 1e-6));
      const lxMax = Math.log10(Math.max(xMaxRaw, 1e-5));
      const lx = Math.log10(Math.max(x, 1e-6));
      return padL + ((lx - lxMin) / (lxMax - lxMin || 1)) * (W - padL - padR);
    }
    return (
      padL + ((x - xMinRaw) / (xMaxRaw - xMinRaw || 1)) * (W - padL - padR)
    );
  };

  const computeRange = (vals: number[]) => {
    if (vals.length === 0) return { min: -1, max: 1 };
    let min = Infinity;
    let max = -Infinity;
    for (const v of vals) {
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: -1, max: 1 };
    if (Math.abs(max - min) < 1e-9) {
      const pad = Math.max(Math.abs(max) * 0.2, 1);
      return { min: min - pad, max: max + pad };
    }
    const span = max - min;
    return { min: min - span * 0.08, max: max + span * 0.08 };
  };

  const leftSeries = series.filter((s) => s.axis === 'left');
  const rightSeries = series.filter((s) => s.axis === 'right');
  const leftRange = computeRange(leftSeries.flatMap((s) => s.values));
  const rightRange = computeRange(rightSeries.flatMap((s) => s.values));

  // Sub-plot heights
  const topPlotBottom = isBode ? 195 : H - padB;
  const phasePlotTop = 228;
  const phasePlotBottom = H - padB;

  const yLeftToPx = (v: number) =>
    topPlotBottom -
    ((v - leftRange.min) / (leftRange.max - leftRange.min || 1)) *
      (topPlotBottom - padT);

  const yRightToPx = (v: number) =>
    topPlotBottom -
    ((v - rightRange.min) / (rightRange.max - rightRange.min || 1)) *
      (topPlotBottom - padT);

  const phaseRange = isBode
    ? computeRange(series.flatMap((s) => s.phaseValues ?? []))
    : { min: -180, max: 180 };

  const yPhaseToPx = (deg: number) =>
    phasePlotBottom -
    ((deg - phaseRange.min) / (phaseRange.max - phaseRange.min || 1)) *
      (phasePlotBottom - phasePlotTop);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    if (relX < padL || relX > W - padR) {
      setHoverIdx(null);
      return;
    }
    const ratio = (relX - padL) / (W - padL - padR);
    let targetX: number;
    if (isLogX) {
      const lxMin = Math.log10(Math.max(xMinRaw, 1e-6));
      const lxMax = Math.log10(Math.max(xMaxRaw, 1e-5));
      targetX = Math.pow(10, lxMin + ratio * (lxMax - lxMin));
    } else {
      targetX = xMinRaw + ratio * (xMaxRaw - xMinRaw);
    }
    let best = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < xValues.length; i++) {
      const d = Math.abs(xValues[i] - targetX);
      if (d < bestDiff) {
        bestDiff = d;
        best = i;
      }
    }
    setHoverIdx(best);
  };

  // X ticks
  const xTicks: { x: number; label: string }[] = [];
  if (isLogX) {
    const eMin = Math.ceil(Math.log10(Math.max(xMinRaw, 1e-3)));
    const eMax = Math.floor(Math.log10(Math.max(xMaxRaw, 1)));
    for (let e = eMin; e <= eMax; e++) {
      const val = Math.pow(10, e);
      xTicks.push({ x: val, label: formatFreq(val) });
    }
  } else {
    for (let i = 0; i <= 5; i++) {
      const val = xMinRaw + ((xMaxRaw - xMinRaw) * i) / 5;
      xTicks.push({
        x: val,
        label:
          caseDef.plotKind === 'tran' ? formatTime(val) : formatNum(val, 3),
      });
    }
  }

  const yTicksLeft = [0, 0.25, 0.5, 0.75, 1].map(
    (t) => leftRange.min + (leftRange.max - leftRange.min) * t
  );
  const yTicksRight =
    rightSeries.length > 0
      ? [0, 0.25, 0.5, 0.75, 1].map(
          (t) => rightRange.min + (rightRange.max - rightRange.min) * t
        )
      : [];

  return (
    <div className="waveform-card">
      <div className="waveform-legend-bar">
        <div className="legend-items">
          {series.map((s, idx) => (
            <span key={idx} className="legend-chip">
              <span
                className="legend-dot"
                style={{
                  backgroundColor: s.color,
                  borderStyle: s.dashed ? 'dashed' : 'solid',
                }}
              />
              {s.label} ({s.unit})
            </span>
          ))}
        </div>
        {hoverIdx !== null && xValues[hoverIdx] !== undefined && (
          <div className="cursor-readout">
            <span className="cursor-x">
              {isLogX
                ? `f = ${formatFreq(xValues[hoverIdx])}`
                : caseDef.plotKind === 'tran'
                  ? `t = ${formatTime(xValues[hoverIdx])}`
                  : `X = ${formatNum(xValues[hoverIdx], 4)}`}
            </span>
            {series.map((s, idx) => (
              <span key={idx} style={{ color: s.color, fontWeight: 600 }}>
                {s.label}: {formatNum(s.values[hoverIdx], 3)} {s.unit}
                {isBode && s.phaseValues
                  ? ` (${formatNum(s.phaseValues[hoverIdx], 1)}°)`
                  : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="waveform-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <rect
          x={padL}
          y={padT}
          width={W - padL - padR}
          height={topPlotBottom - padT}
          fill="#0f172a"
          rx={4}
        />

        {/* Horizontal gridlines (Main / Magnitude plot) */}
        {yTicksLeft.map((val, i) => {
          const py = yLeftToPx(val);
          return (
            <g key={`yl-${i}`}>
              <line
                x1={padL}
                y1={py}
                x2={W - padR}
                y2={py}
                stroke="#1e293b"
                strokeWidth={1}
              />
              <text
                x={padL - 7}
                y={py + 4}
                textAnchor="end"
                fontSize={10.5}
                fill="#64748b"
              >
                {formatNum(val, 3)}
              </text>
            </g>
          );
        })}

        {/* Zero baseline if inside range */}
        {leftRange.min < 0 && leftRange.max > 0 && (
          <line
            x1={padL}
            y1={yLeftToPx(0)}
            x2={W - padR}
            y2={yLeftToPx(0)}
            stroke="#334155"
            strokeDasharray="4,3"
            strokeWidth={1.2}
          />
        )}

        {yTicksRight.map((val, i) => {
          const py = yRightToPx(val);
          return (
            <text
              key={`yr-${i}`}
              x={W - padR + 7}
              y={py + 4}
              textAnchor="start"
              fontSize={10.5}
              fill="#64748b"
            >
              {formatNum(val, 3)}
            </text>
          );
        })}

        {/* Vertical X gridlines */}
        {xTicks.map((tk, i) => {
          const px = xToPx(tk.x);
          return (
            <g key={`xt-${i}`}>
              <line
                x1={px}
                y1={padT}
                x2={px}
                y2={topPlotBottom}
                stroke="#1e293b"
                strokeWidth={1}
              />
              {!isBode && (
                <text
                  x={px}
                  y={topPlotBottom + 16}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill="#475569"
                >
                  {tk.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Main Traces */}
        {series.map((s, idx) => {
          const mapY = s.axis === 'right' ? yRightToPx : yLeftToPx;
          const d = s.values
            .map((v, i) => {
              const px = xToPx(xValues[i]);
              const py = mapY(v);
              return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
            })
            .join(' ');
          return (
            <path
              key={`path-${idx}`}
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={2.2}
              strokeDasharray={s.dashed ? '6,4' : undefined}
            />
          );
        })}

        {/* Reference Markers */}
        {markers.map((m, idx) => {
          if (m.x < xMinRaw || m.x > xMaxRaw) return null;
          const px = xToPx(m.x);
          return (
            <g key={`mk-${idx}`}>
              <line
                x1={px}
                y1={padT}
                x2={px}
                y2={topPlotBottom}
                stroke={m.color ?? '#facc15'}
                strokeWidth={1.5}
                strokeDasharray="4,3"
              />
              <text
                x={px + 4}
                y={padT + 14 + idx * 14}
                fontSize={10.5}
                fontWeight={600}
                fill={m.color ?? '#facc15'}
              >
                {m.label}
              </text>
            </g>
          );
        })}

        {/* Bode Phase Lower Plot */}
        {isBode && (
          <g>
            <rect
              x={padL}
              y={phasePlotTop}
              width={W - padL - padR}
              height={phasePlotBottom - phasePlotTop}
              fill="#0f172a"
              rx={4}
            />
            {[0, 0.5, 1].map((t, i) => {
              const deg =
                phaseRange.min + (phaseRange.max - phaseRange.min) * t;
              const py = yPhaseToPx(deg);
              return (
                <g key={`ph-${i}`}>
                  <line
                    x1={padL}
                    y1={py}
                    x2={W - padR}
                    y2={py}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <text
                    x={padL - 7}
                    y={py + 4}
                    textAnchor="end"
                    fontSize={10.5}
                    fill="#64748b"
                  >
                    {formatNum(deg, 0)}°
                  </text>
                </g>
              );
            })}
            {xTicks.map((tk, i) => {
              const px = xToPx(tk.x);
              return (
                <g key={`pxt-${i}`}>
                  <line
                    x1={px}
                    y1={phasePlotTop}
                    x2={px}
                    y2={phasePlotBottom}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <text
                    x={px}
                    y={phasePlotBottom + 16}
                    textAnchor="middle"
                    fontSize={10.5}
                    fill="#475569"
                  >
                    {tk.label}
                  </text>
                </g>
              );
            })}
            {series.map((s, idx) => {
              if (!s.phaseValues) return null;
              const d = s.phaseValues
                .map((deg, i) => {
                  const px = xToPx(xValues[i]);
                  const py = yPhaseToPx(deg);
                  return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
                })
                .join(' ');
              return (
                <path
                  key={`ph-path-${idx}`}
                  d={d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeDasharray="5,3"
                />
              );
            })}
            <text
              x={padL + 8}
              y={phasePlotTop + 15}
              fontSize={11}
              fontWeight={600}
              fill="#94a3b8"
            >
              相频特性 ∠φ(f) [°]
            </text>
          </g>
        )}

        {/* Axis Titles */}
        <text
          x={(padL + W - padR) / 2}
          y={H - 5}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight={600}
          fill="#334155"
        >
          {caseDef.xAxisLabel ??
            (isBode
              ? '频率 f (Hz, 对数坐标)'
              : caseDef.plotKind === 'tran'
                ? '时间 t'
                : '扫描变量')}
        </text>
        {caseDef.yAxisLabel && (
          <text
            x={padL + 8}
            y={padT + 15}
            fontSize={11}
            fontWeight={600}
            fill="#cbd5e1"
          >
            {caseDef.yAxisLabel}
          </text>
        )}

        {/* Interactive Hover Crosshair */}
        {hoverIdx !== null && xValues[hoverIdx] !== undefined && (
          <g>
            <line
              x1={xToPx(xValues[hoverIdx])}
              y1={padT}
              x2={xToPx(xValues[hoverIdx])}
              y2={isBode ? phasePlotBottom : topPlotBottom}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            {series.map((s, idx) => {
              const mapY = s.axis === 'right' ? yRightToPx : yLeftToPx;
              return (
                <circle
                  key={`dot-${idx}`}
                  cx={xToPx(xValues[hoverIdx])}
                  cy={mapY(s.values[hoverIdx])}
                  r={4}
                  fill={s.color}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};

function formatNum(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return '-';
  if (Math.abs(v) < 1e-11) return '0';
  if (Math.abs(v) >= 10000 || (Math.abs(v) > 0 && Math.abs(v) < 0.001)) {
    return v.toExponential(2);
  }
  return Number(v.toPrecision(digits)).toString();
}

function formatTime(sec: number): string {
  const a = Math.abs(sec);
  if (a === 0) return '0 s';
  if (a < 1e-6) return `${(sec * 1e9).toPrecision(3)} ns`;
  if (a < 1e-3) return `${(sec * 1e6).toPrecision(3)} μs`;
  if (a < 1) return `${(sec * 1e3).toPrecision(3)} ms`;
  return `${sec.toPrecision(3)} s`;
}

function formatFreq(hz: number): string {
  if (hz >= 1e6) return `${(hz / 1e6).toPrecision(3)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toPrecision(3)} kHz`;
  return `${hz.toPrecision(3)} Hz`;
}
