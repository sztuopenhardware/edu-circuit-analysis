export type ParamControl =
  | {
      type?: 'slider';
      key: string;
      label: string;
      symbol?: string;
      unit: string;
      min: number;
      max: number;
      step: number;
      defaultValue: number;
      description?: string;
    }
  | {
      type: 'select';
      key: string;
      label: string;
      defaultValue: number;
      options: { label: string; value: number }[];
      description?: string;
    };

export type SchematicComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'vsource_dc'
  | 'vsource_ac'
  | 'isource_dc'
  | 'isource_ac'
  | 'vcvs'
  | 'vccs'
  | 'ccvs'
  | 'cccs'
  | 'diode'
  | 'switch'
  | 'wire'
  | 'ground'
  | 'port_open';

export interface SchematicElement {
  id: string;
  type: SchematicComponentType;
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  label?: string;
  subLabel?: string; // e.g. live value "10 Ω"
  currentArrow?: string; // e.g. "I₁"
  currentReverse?: boolean;
  voltageMarks?: { plus: '+' | '-'; minus: '-' | '+'; label?: string };
  dotPos?: 'start' | 'end'; // for coupled inductors •
  switchOpen?: boolean;
  color?: string;
  dashed?: boolean;
}

export interface SchematicNodeLabel {
  x: number;
  y: number;
  text: string;
  liveExpr?: string; // key in computed metrics to show live voltage badge
  color?: string;
}

export interface SchematicAnnotation {
  x: number;
  y: number;
  text: string;
  color?: string;
  fontSize?: number;
  bold?: boolean;
  box?: boolean;
}

export interface SchematicMutualArc {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

export interface SchematicSpec {
  width?: number;
  height?: number;
  elements: SchematicElement[];
  nodes?: SchematicNodeLabel[];
  annotations?: SchematicAnnotation[];
  mutualArcs?: SchematicMutualArc[];
}

export interface TraceConfig {
  expr: string; // vector name in ngspice (case-insensitive) or custom derived key
  label: string;
  unit: string;
  color: string;
  scale?: number; // e.g. 1000 for mA, -1 to invert Vsource branch current
  dashed?: boolean;
  axis?: 'left' | 'right';
}

export interface PhasorConfig {
  label: string;
  magExpr: (params: Record<string, number>, simMetrics: Record<string, number>) => number;
  angleDegExpr: (params: Record<string, number>, simMetrics: Record<string, number>) => number;
  unit: string;
  color: string;
  category?: 'voltage' | 'current';
}

export interface MetricRow {
  label: string;
  symbol: string;
  unit: string;
  /** Extract value from ngspice simulation result(s) */
  getSimValue: (simBag: SimResultBag, params: Record<string, number>) => number | null;
  /** Theoretical textbook value for verification */
  getTheoryValue?: (params: Record<string, number>) => number | null;
  highlight?: boolean;
  note?: string;
}

export interface ComparisonRunSpec {
  id: string;
  title: string;
  buildNetlist: (params: Record<string, number>) => string;
}

export interface ComparisonTableSpec {
  headers: string[]; // e.g. ['待观测物理量', '原电路仿真', 'U_S单独作用', 'I_S单独作用', '分量代数和', '结论']
  rows: (simBag: SimResultBag, params: Record<string, number>) => string[][];
}

export type PrimaryPlotKind = 'op_dashboard' | 'dc_xy' | 'tran' | 'ac_bode';

export interface DerivedSeriesPoint {
  x: number;
  y: number;
}

export interface CaseDefinition {
  id: string;
  chapterId: string;
  code: string; // e.g. "1.1" or "Exp.1"
  title: string;
  syllabusItems: string[]; // exact syllabus bullet points covered
  summary: string;
  theoryMarkdown: string; // concise explanation
  keyFormulas: string[]; // KaTeX formulas
  teachingTips: string[]; // Interactive experiments suggested to students/teachers
  params: ParamControl[];
  buildSchematic: (params: Record<string, number>) => SchematicSpec;
  /** Primary ngspice netlist */
  buildNetlist: (params: Record<string, number>) => string;
  /** Optional extra ngspice runs for equivalence / superposition verification */
  extraRuns?: ComparisonRunSpec[];
  plotKind: PrimaryPlotKind;
  xAxisLabel?: string;
  yAxisLabel?: string;
  yRightAxisLabel?: string;
  acMagnitudeMode?: 'dB' | 'linear';
  traces?: TraceConfig[];
  /** Custom derived curves from ngspice raw vectors (e.g. Power P_L = V(load)^2 / R_L across sweep) */
  buildDerivedCurves?: (
    simBag: SimResultBag,
    params: Record<string, number>
  ) => {
    xValues: number[];
    series: {
      label: string;
      unit: string;
      color: string;
      values: number[];
      dashed?: boolean;
      axis?: 'left' | 'right';
    }[];
    markers?: { x: number; label: string; color?: string }[];
  } | null;
  phasors?: PhasorConfig[];
  metrics: MetricRow[];
  comparisonTable?: ComparisonTableSpec;
}

export interface ChapterDefinition {
  id: string;
  badge: string; // e.g. "第一章"
  title: string; // e.g. "电路模型和电路定律"
  enTitle: string;
  syllabusContents: string[];
  objectives: {
    master: string[];
    comprehend: string[];
    knowAbout?: string[];
  };
  ideologicalPoint: {
    tag: string;
    content: string;
  };
}

/** Normalized vector output from ngspice wasm */
export interface NormalizedVector {
  name: string;
  real: number[];
  imag?: number[]; // present for complex AC vectors
  mag?: number[];
  phaseDeg?: number[];
}

export interface NormalizedSimOutput {
  rawHeader: string;
  analysisType: string;
  numPoints: number;
  vectors: Record<string, NormalizedVector>; // lower-case key -> vector
  rawResult: unknown;
  infoLog: string;
  errorLog: string;
  durationMs: number;
}

export interface SimResultBag {
  primary: NormalizedSimOutput | null;
  extras: Record<string, NormalizedSimOutput>;
}
