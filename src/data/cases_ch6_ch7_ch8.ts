import type { CaseDefinition } from '../types/circuit';
import { acPhasorAt } from '../services/ngspiceEngine';

export const CASES_CH6_CH7_CH8: CaseDefinition[] = [
  // ==================== 第六章 ====================
  {
    id: 'ch6-capacitor-vcr',
    chapterId: 'ch6',
    code: '6.1',
    title: '电容元件 VCR 微分关系与电场储能动态演示',
    syllabusItems: ['（1）电容元件'],
    summary:
      '施加对称三角波电压激励，观测电容电流 i_C = C·(du_C/dt) 呈现标准方波，验证“电压连续变化、电流取决于电压变化率”及无损电场能量吞吐。',
    theoryMarkdown:
      '线性定常电容的库伏特性为 $q = C u_C$。关联参考方向下，其伏安关系（VCR）微分形式为 $i_C = C \\frac{du_C}{dt}$：\n- 当电容电压线性上升（$\\frac{du_C}{dt} > 0$ 为常数）时，电流为正恒定值，电容充电**储存电场能** $w_C(t) = \\frac{1}{2} C u_C^2(t)$；\n- 当电容电压线性下降（$\\frac{du_C}{dt} < 0$）时，电流突变为负恒定值，电容向电源**释放全部电场能**，平均消耗有功功率为 0（纯储能元件）。',
    keyFormulas: [
      'i_C(t) = C \\frac{du_C(t)}{dt}, \\quad u_C(t) = u_C(t_0) + \\frac{1}{C}\\int_{t_0}^{t} i_C(\\xi)\\,d\\xi',
      'w_C(t) = \\frac{1}{2} C u_C^2(t) \\ge 0',
    ],
    teachingTips: [
      '观察波形图：蓝色三角波为电容电压 u_C(t)，绿色方波为电流 i_C(t)——电压斜率改变的瞬间，电容电流发生跃变，但电容电压绝不跃变！',
    ],
    params: [
      { key: 'C_uF', label: '电容量 C', unit: 'μF', min: 10, max: 100, step: 10, defaultValue: 40 },
      { key: 'Umax', label: '三角波峰值电压 U_m', unit: 'V', min: 4, max: 20, step: 2, defaultValue: 10 },
      { key: 'Thalf_ms', label: '半周期上升/下降时间 T_half', unit: 'ms', min: 1, max: 5, step: 1, defaultValue: 2 },
    ],
    buildSchematic: (p) => ({
      width: 520,
      height: 235,
      elements: [
        { id: 'vs', type: 'vsource_ac', x1: 120, y1: 60, x2: 120, y2: 185, label: 'u_S(t) 三角波', subLabel: `0~${p.Umax}V` },
        { id: 'wt', type: 'wire', x1: 120, y1: 60, x2: 370, y2: 60, currentArrow: 'i_C(t)' },
        { id: 'c1', type: 'capacitor', x1: 370, y1: 60, x2: 370, y2: 185, label: 'C', subLabel: `${p.C_uF} μF`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'wb', type: 'wire', x1: 120, y1: 185, x2: 370, y2: 185 },
        { id: 'gnd', type: 'ground', x1: 245, y1: 185 },
      ],
      nodes: [{ x: 370, y: 60, text: 'u_C(t)' }],
    }),
    buildNetlist: (p) => {
      const th = p.Thalf_ms * 1e-3;
      const tEnd = 4 * th;
      const step = tEnd / 250;
      return `* Ch6.1 Capacitor Triangular Voltage Drive
Vs 1 0 PWL(0 0 ${th} ${p.Umax} ${2 * th} 0 ${3 * th} ${p.Umax} ${4 * th} 0)
Vam 1 2 DC 0
C1 2 0 ${p.C_uF}u ic=0
.tran ${step} ${tEnd} uic
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '电容电压 u_C (V) [左] / 电容电流 i_C (mA) & 储能 w_C (mJ) [右]',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      const tVec = out?.vectors['time'];
      const uVec = out?.vectors['v(2)'];
      const iVec = out?.vectors['i(vam)'];
      if (!tVec || !uVec || !iVec) return null;
      const cFarad = p.C_uF * 1e-6;
      return {
        xValues: tVec.real,
        series: [
          { label: '电容电压 u_C', unit: 'V', color: '#38bdf8', values: uVec.real, axis: 'left' },
          { label: '电容电流 i_C', unit: 'mA', color: '#4ade80', values: iVec.real.map((v) => v * 1000), axis: 'right' },
          {
            label: '电场储能 w_C',
            unit: 'mJ',
            color: '#facc15',
            dashed: true,
            values: uVec.real.map((u) => 0.5 * cFarad * u * u * 1000),
            axis: 'right',
          },
        ],
      };
    },
    metrics: [
      {
        label: '电压上升率 du_C/dt',
        symbol: 'du_C/dt',
        unit: 'V/s',
        getSimValue: (_bag, p) => p.Umax / (p.Thalf_ms * 1e-3),
        getTheoryValue: (p) => p.Umax / (p.Thalf_ms * 1e-3),
      },
      {
        label: '充电阶段稳态方波电流 I_C',
        symbol: 'I_{C+}',
        unit: 'mA',
        highlight: true,
        getSimValue: (bag) => {
          const iVec = bag.primary?.vectors['i(vam)']?.real;
          if (!iVec || iVec.length < 10) return null;
          return iVec[Math.floor(iVec.length * 0.12)] * 1000;
        },
        getTheoryValue: (p) => (p.C_uF * 1e-6 * (p.Umax / (p.Thalf_ms * 1e-3))) * 1000,
      },
      {
        label: '峰值电场储能 W_C,max = ½CU_m²',
        symbol: 'W_{C,\\max}',
        unit: 'mJ',
        highlight: true,
        getSimValue: (_bag, p) => 0.5 * p.C_uF * 1e-6 * p.Umax * p.Umax * 1000,
        getTheoryValue: (p) => 0.5 * p.C_uF * 1e-6 * p.Umax * p.Umax * 1000,
      },
    ],
  },

  {
    id: 'ch6-inductor-vcr',
    chapterId: 'ch6',
    code: '6.2',
    title: '电感元件 VCR 微分关系与磁场储能动态演示',
    syllabusItems: ['（2）电感元件'],
    summary:
      '对偶于电容特性：施加三角波电流源激励，观测电感感应电压 u_L = L·(di_L/dt) 呈现标准方波及磁场能量转换。',
    theoryMarkdown:
      '线性定常电感的韦安特性为 $\\Psi = L i_L$。关联参考方向下，其伏安关系（VCR）为 $u_L = L \\frac{di_L}{dt}$：\n- 直流稳态下 $\\frac{di_L}{dt} = 0 \\Rightarrow u_L = 0$，**电感对直流相当于短路**（对偶于电容对直流相当于开路）；\n- 有限电压下电感电流 $i_L$ 具有连续记忆性；其储存的磁场能量仅取决于瞬时电流：$w_L(t) = \\frac{1}{2} L i_L^2(t)$。',
    keyFormulas: [
      'u_L(t) = L \\frac{di_L(t)}{dt}, \\quad i_L(t) = i_L(t_0) + \\frac{1}{L}\\int_{t_0}^{t} u_L(\\xi)\\,d\\xi',
      'w_L(t) = \\frac{1}{2} L i_L^2(t) \\ge 0',
    ],
    teachingTips: [
      '对比 6.1 电容案例与本案例，体会电路理论优美的“对偶原理（Duality）”：u ⇔ i，C ⇔ L，电场能 ⇔ 磁场能！',
    ],
    params: [
      { key: 'L_mH', label: '电感量 L', unit: 'mH', min: 10, max: 200, step: 10, defaultValue: 50 },
      { key: 'Imax', label: '三角波峰值电流 I_m', unit: 'A', min: 0.2, max: 2, step: 0.2, defaultValue: 0.8 },
      { key: 'Thalf_ms', label: '半周期时间 T_half', unit: 'ms', min: 1, max: 5, step: 1, defaultValue: 2 },
    ],
    buildSchematic: (p) => ({
      width: 520,
      height: 235,
      elements: [
        { id: 'is', type: 'isource_ac', x1: 120, y1: 185, x2: 120, y2: 60, label: 'i_S(t) 三角波', subLabel: `0~${p.Imax}A` },
        { id: 'wt', type: 'wire', x1: 120, y1: 60, x2: 370, y2: 60, currentArrow: 'i_L(t)' },
        { id: 'l1', type: 'inductor', x1: 370, y1: 60, x2: 370, y2: 185, label: 'L', subLabel: `${p.L_mH} mH`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'wb', type: 'wire', x1: 120, y1: 185, x2: 370, y2: 185 },
        { id: 'gnd', type: 'ground', x1: 245, y1: 185 },
      ],
      nodes: [{ x: 370, y: 60, text: 'u_L(t)' }],
    }),
    buildNetlist: (p) => {
      const th = p.Thalf_ms * 1e-3;
      const tEnd = 4 * th;
      const step = tEnd / 250;
      return `* Ch6.2 Inductor Triangular Current Drive
Is 0 1 PWL(0 0 ${th} ${p.Imax} ${2 * th} 0 ${3 * th} ${p.Imax} ${4 * th} 0)
Vam 1 2 DC 0
L1 2 0 ${p.L_mH}m ic=0
.tran ${step} ${tEnd} uic
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '感应电压 u_L (V) [左] / 电流 i_L (A) & 磁能 w_L (mJ) [右]',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      const tVec = out?.vectors['time'];
      const uVec = out?.vectors['v(2)'];
      const iVec = out?.vectors['i(vam)'];
      if (!tVec || !uVec || !iVec) return null;
      const lHenry = p.L_mH * 1e-3;
      return {
        xValues: tVec.real,
        series: [
          { label: '电感电压 u_L', unit: 'V', color: '#fb7185', values: uVec.real, axis: 'left' },
          { label: '电感电流 i_L', unit: 'A', color: '#38bdf8', values: iVec.real, axis: 'right' },
          {
            label: '磁场储能 w_L',
            unit: 'mJ',
            color: '#facc15',
            dashed: true,
            values: iVec.real.map((i) => 0.5 * lHenry * i * i * 1000),
            axis: 'right',
          },
        ],
      };
    },
    metrics: [
      {
        label: '电流上升段感应电压 U_L = L·(di/dt)',
        symbol: 'U_{L+}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => {
          const uVec = bag.primary?.vectors['v(2)']?.real;
          if (!uVec || uVec.length < 10) return null;
          return uVec[Math.floor(uVec.length * 0.12)];
        },
        getTheoryValue: (p) => p.L_mH * 1e-3 * (p.Imax / (p.Thalf_ms * 1e-3)),
      },
      {
        label: '峰值磁场储能 W_L,max = ½LI_m²',
        symbol: 'W_{L,\\max}',
        unit: 'mJ',
        highlight: true,
        getSimValue: (_bag, p) => 0.5 * p.L_mH * 1e-3 * p.Imax * p.Imax * 1000,
        getTheoryValue: (p) => 0.5 * p.L_mH * 1e-3 * p.Imax * p.Imax * 1000,
      },
    ],
  },

  {
    id: 'ch6-cl-series-parallel',
    chapterId: 'ch6',
    code: '6.3',
    title: '电容、电感元件的串联与并联等效特性',
    syllabusItems: ['（3）电容、电感元件的串联与并联'],
    summary:
      '对比验证电容串联分压反比规律（C_eq = C₁C₂/(C₁+C₂)）与电感串联分压正比规律（L_eq = L₁+L₂），通过暂态充电曲线验证等效参数。',
    theoryMarkdown:
      '储能元件串并联公式与电阻的异同：\n- **电感串并联**与电阻形式相同：串联 $L_{eq} = L_1 + L_2$（分压正比于电感），并联 $L_{eq} = \\frac{L_1 L_2}{L_1 + L_2}$。\n- **电容串并联**与电导形式相同（与电阻对偶）：并联 $C_{eq} = C_1 + C_2$；串联 $\\frac{1}{C_{eq}} = \\frac{1}{C_1} + \\frac{1}{C_2}$，且无初始电压时**串联电容分压反比于电容量**：$u_1 = \\frac{C_2}{C_1 + C_2} u$（小电容承受更高电压）！',
    keyFormulas: [
      'C_{\\text{串}} = \\frac{C_1 C_2}{C_1 + C_2}, \\quad u_{C1} = \\frac{C_2}{C_1 + C_2} u, \\quad C_{\\text{并}} = C_1 + C_2',
      'L_{\\text{串}} = L_1 + L_2, \\quad L_{\\text{并}} = \\frac{L_1 L_2}{L_1 + L_2}',
    ],
    teachingTips: [
      '观察串联电容 C₁=10μF、C₂=30μF 在 12V 激励下的分压波形：容量较小的 C₁ 分得了 9V（占 75%），容量较大的 C₂ 仅分得 3V！工程上高压串联电容需特别注意均压。',
    ],
    params: [
      { key: 'Us', label: '阶跃激励电压 U_S', unit: 'V', min: 6, max: 24, step: 2, defaultValue: 12 },
      { key: 'R', label: '充电限流电阻 R', unit: 'Ω', min: 50, max: 500, step: 50, defaultValue: 100 },
      { key: 'C1', label: '串联电容 C₁', unit: 'μF', min: 5, max: 50, step: 5, defaultValue: 10 },
      { key: 'C2', label: '串联电容 C₂', unit: 'μF', min: 5, max: 50, step: 5, defaultValue: 30 },
    ],
    buildSchematic: (p) => ({
      width: 540,
      height: 250,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 90, y1: 60, x2: 90, y2: 205, label: 'U_S', subLabel: `${p.Us} V` },
        { id: 'r1', type: 'resistor', x1: 90, y1: 60, x2: 290, y2: 60, label: 'R', subLabel: `${p.R} Ω`, currentArrow: 'i(t)' },
        { id: 'wt', type: 'wire', x1: 290, y1: 60, x2: 390, y2: 60 },
        { id: 'c1', type: 'capacitor', x1: 390, y1: 60, x2: 390, y2: 132, label: 'C₁', subLabel: `${p.C1}μF` },
        { id: 'c2', type: 'capacitor', x1: 390, y1: 132, x2: 390, y2: 205, label: 'C₂', subLabel: `${p.C2}μF` },
        { id: 'wb', type: 'wire', x1: 90, y1: 205, x2: 390, y2: 205 },
        { id: 'gnd', type: 'ground', x1: 240, y1: 205 },
      ],
      nodes: [
        { x: 390, y: 60, text: 'u_总(t)' },
        { x: 390, y: 132, text: 'u_C2(t)' },
      ],
    }),
    buildNetlist: (p) => {
      const ceq = (p.C1 * p.C2) / (p.C1 + p.C2);
      const tau = p.R * ceq * 1e-6;
      const tEnd = Math.max(5 * tau, 1e-4);
      return `* Ch6.3 Series Capacitors Voltage Division & Equivalent Ceq
Vs 1 0 PULSE(0 ${p.Us} 0 1u 1u ${tEnd * 2} ${tEnd * 4})
R1 1 2 ${p.R}
C1 2 m ${p.C1}u ic=0
Rleak m 0 100Meg
C2 m 0 ${p.C2}u ic=0
* Equivalent single capacitor branch for comparison
R_eq 1 3 ${p.R}
C_eq 3 0 ${ceq}u ic=0
.tran ${tEnd / 200} ${tEnd} uic
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '电容端电压 (V)',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      const tVec = out?.vectors['time'];
      const v2 = out?.vectors['v(2)'];
      const vm = out?.vectors['v(m)'];
      const v3 = out?.vectors['v(3)'];
      if (!tVec || !v2 || !vm || !v3) return null;
      const ceq = (p.C1 * p.C2) / (p.C1 + p.C2);
      return {
        xValues: tVec.real,
        series: [
          { label: '串联总电压 u_总(t)', unit: 'V', color: '#38bdf8', values: v2.real },
          { label: '等效单电容 C_eq 电压', unit: 'V', color: '#facc15', dashed: true, values: v3.real },
          { label: 'C₁ 分压 u_C1 = u_总 - u_C2', unit: 'V', color: '#fb7185', values: v2.real.map((v, i) => v - vm.real[i]) },
          { label: 'C₂ 分压 u_C2', unit: 'V', color: '#4ade80', values: vm.real },
        ],
        markers: [
          { x: p.R * ceq * 1e-6, label: `τ = R·C_eq = ${(p.R * ceq * 1e-3).toFixed(2)}ms`, color: '#94a3b8' },
        ],
      };
    },
    metrics: [
      {
        label: '串联等效电容 C_eq = C₁C₂/(C₁+C₂)',
        symbol: 'C_{eq}',
        unit: 'μF',
        highlight: true,
        getSimValue: (_bag, p) => (p.C1 * p.C2) / (p.C1 + p.C2),
        getTheoryValue: (p) => (p.C1 * p.C2) / (p.C1 + p.C2),
      },
      {
        label: '稳态 C₁ 承受分压 U_C1',
        symbol: 'U_{C1}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => {
          const v2 = bag.primary?.vectors['v(2)']?.real;
          const vm = bag.primary?.vectors['v(m)']?.real;
          if (!v2 || !vm) return null;
          return v2[v2.length - 1] - vm[vm.length - 1];
        },
        getTheoryValue: (p) => (p.C2 / (p.C1 + p.C2)) * p.Us,
      },
      {
        label: '稳态 C₂ 承受分压 U_C2',
        symbol: 'U_{C2}',
        unit: 'V',
        getSimValue: (bag) => {
          const vm = bag.primary?.vectors['v(m)']?.real;
          return vm ? vm[vm.length - 1] : null;
        },
        getTheoryValue: (p) => (p.C1 / (p.C1 + p.C2)) * p.Us,
      },
    ],
  },

  // ==================== 第七章 ====================
  {
    id: 'ch7-initial-conditions',
    chapterId: 'ch7',
    code: '7.1',
    title: '换路定则与动态电路初始条件 f(0+) 跃变分析',
    syllabusItems: ['（1）动态电路的方程及其初始条件'],
    summary:
      '演示 t=0 换路瞬间：电容电压 u_C(0+) = u_C(0-) 保持连续，而非状态变量（电容电流 i_C 与电阻电压 u_R）发生瞬时跃变！',
    theoryMarkdown:
      '**换路定则**：若换路瞬间没有冲激电流/冲激电压强迫，电容电压与电感电流不能跃变：\n$$u_C(0_+) = u_C(0_-), \\qquad i_L(0_+) = i_L(0_-)$$\n**求非独立初始值的标准步骤**：\n1. 由 $t = 0_-$ 原稳态电路（电容视作开路、电感视作短路）求出 $u_C(0_-)$；\n2. 画 $t = 0_+$ 等效电路：将电容用数值为 $u_C(0_+)$ 的理想电压源替代（替代定理），即可求出发生突变的其他电压、电流初始值 $i_C(0_+), u_R(0_+)$！',
    keyFormulas: [
      'u_C(0_+) = u_C(0_-) = U_0',
      'i_C(0_+) = \\frac{U_S - U_0}{R_1} - \\frac{U_0}{R_2}, \\quad \\frac{du_C}{dt}\\Big|_{0_+} = \\frac{i_C(0_+)}{C}',
    ],
    teachingTips: [
      '查看 t = 0+ 时刻起点数值：无论 R₁、R₂ 怎么变，电容电压曲线始终从 U₀ 平滑出发，而电流 i_C(0+) 在 t=0 瞬间直接跳变到理论初值！',
    ],
    params: [
      { key: 'U0', label: '换路前电容初始电压 U₀ = u_C(0-)', unit: 'V', min: 0, max: 15, step: 1, defaultValue: 4 },
      { key: 'Us', label: '换路后接入电源 U_S', unit: 'V', min: 5, max: 24, step: 1, defaultValue: 16 },
      { key: 'R1', label: '串联支路电阻 R₁', unit: 'Ω', min: 100, max: 1000, step: 100, defaultValue: 200 },
      { key: 'R2', label: '并联泄放电阻 R₂', unit: 'Ω', min: 100, max: 1000, step: 100, defaultValue: 200 },
      { key: 'C_uF', label: '电容 C', unit: 'μF', min: 5, max: 50, step: 5, defaultValue: 10 },
    ],
    buildSchematic: (p) => ({
      width: 550,
      height: 245,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 80, y1: 65, x2: 80, y2: 195, label: 'U_S', subLabel: `${p.Us}V` },
        { id: 'sw', type: 'switch', x1: 80, y1: 65, x2: 175, y2: 65, label: 'S (t=0闭合)', switchOpen: false },
        { id: 'r1', type: 'resistor', x1: 175, y1: 65, x2: 315, y2: 65, label: 'R₁', subLabel: `${p.R1}Ω`, currentArrow: 'i₁' },
        { id: 'r2', type: 'resistor', x1: 315, y1: 65, x2: 315, y2: 195, label: 'R₂', subLabel: `${p.R2}Ω` },
        { id: 'wt', type: 'wire', x1: 315, y1: 65, x2: 445, y2: 65, currentArrow: 'i_C' },
        { id: 'c1', type: 'capacitor', x1: 445, y1: 65, x2: 445, y2: 195, label: 'C', subLabel: `${p.C_uF}μF (U₀=${p.U0}V)` },
        { id: 'wb', type: 'wire', x1: 80, y1: 195, x2: 445, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 315, y1: 195 },
      ],
      nodes: [{ x: 380, y: 65, text: 'u_C(t)' }],
    }),
    buildNetlist: (p) => {
      const req = (p.R1 * p.R2) / (p.R1 + p.R2);
      const tau = req * p.C_uF * 1e-6;
      const tEnd = Math.max(5 * tau, 5e-4);
      return `* Ch7.1 Switching Initial Conditions
Vs 1 0 DC ${p.Us}
R1 1 2 ${p.R1}
R2 2 0 ${p.R2}
VamC 2 2c DC 0
C1 2c 0 ${p.C_uF}u ic=${p.U0}
.tran ${tEnd / 250} ${tEnd} uic
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t (t = 0+ 换路)',
    yAxisLabel: 'u_C(t) (V) [左] / 电容电流 i_C(t) (mA) [右]',
    traces: [
      { expr: 'v(2)', label: '电容电压 u_C(t)', unit: 'V', color: '#38bdf8', axis: 'left' },
      { expr: 'i(vamc)', label: '电容电流 i_C(t)', unit: 'mA', color: '#fb7185', scale: 1000, axis: 'right' },
    ],
    metrics: [
      {
        label: '换路后瞬间电容电压 u_C(0+)',
        symbol: 'u_C(0_+)',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => bag.primary?.vectors['v(2)']?.real[0] ?? null,
        getTheoryValue: (p) => p.U0,
      },
      {
        label: '换路瞬间突变电流 i_C(0+)',
        symbol: 'i_C(0_+)',
        unit: 'mA',
        highlight: true,
        getSimValue: (bag) => {
          const v = bag.primary?.vectors['i(vamc)']?.real[0];
          return v !== undefined ? v * 1000 : null;
        },
        getTheoryValue: (p) => ((p.Us - p.U0) / p.R1 - p.U0 / p.R2) * 1000,
      },
      {
        label: '新稳态终值 u_C(∞)',
        symbol: 'u_C(\\infty)',
        unit: 'V',
        getSimValue: (bag) => {
          const v = bag.primary?.vectors['v(2)']?.real;
          return v ? v[v.length - 1] : null;
        },
        getTheoryValue: (p) => (p.R2 / (p.R1 + p.R2)) * p.Us,
      },
    ],
  },

  {
    id: 'ch7-zero-input',
    chapterId: 'ch7',
    code: '7.2',
    title: '一阶电路的零输入响应与时间常数 τ',
    syllabusItems: ['（2）一阶电路的零输入响应'],
    summary:
      '无外加独立电源激励，仅由电容/电感初始储能引起的指数衰减放电过程，精准观测时间常数 τ 处衰减至 36.8% 的物理特征。',
    theoryMarkdown:
      '**零输入响应**是指电路无外加独立源输入（输入为零），仅由动态元件初始储能引起的响应。对一阶 RC 放电回路：\n$$RC \\frac{du_C}{dt} + u_C = 0 \\;\\Longrightarrow\\; u_C(t) = U_0 e^{-t/\\tau}, \\quad \\tau = RC$$\n- **时间常数 $\\tau$ 的物理意义**：经过 $1\\tau$ 时间，响应衰减为初值的 $e^{-1} \\approx 36.8\\%$；工程上认为经过 $3\\tau \\sim 5\\tau$（剩余 $5\\% \\sim 0.67\\%$），暂态过渡过程基本结束。',
    keyFormulas: [
      'u_C(t) = U_0 e^{-t/\\tau}, \\quad i_R(t) = \\frac{U_0}{R} e^{-t/\\tau}, \\quad \\tau = R C',
      'W_R = \\int_0^{\\infty} i_R^2 R\\,dt = \\frac{1}{2} C U_0^2 \\;(\\text{初始电能全部转化为电阻焦耳热})',
    ],
    teachingTips: [
      '观察黄色参考竖线 t = τ 与绿色竖线 t = 3τ：无论怎样改变 R 或 C，t = τ 处电压永远精确等于 0.368·U₀！',
    ],
    params: [
      { key: 'U0', label: '初始电压 U₀', unit: 'V', min: 2, max: 20, step: 2, defaultValue: 10 },
      { key: 'R', label: '放电电阻 R', unit: 'Ω', min: 100, max: 2000, step: 100, defaultValue: 500 },
      { key: 'C_uF', label: '电容量 C', unit: 'μF', min: 2, max: 40, step: 2, defaultValue: 10 },
    ],
    buildSchematic: (p) => ({
      width: 500,
      height: 235,
      elements: [
        { id: 'c1', type: 'capacitor', x1: 150, y1: 60, x2: 150, y2: 185, label: 'C', subLabel: `${p.C_uF}μF (U₀=${p.U0}V)`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'sw', type: 'switch', x1: 150, y1: 60, x2: 265, y2: 60, label: 'S (t=0闭合)', switchOpen: false },
        { id: 'wt', type: 'wire', x1: 265, y1: 60, x2: 365, y2: 60, currentArrow: 'i_R(t)' },
        { id: 'r1', type: 'resistor', x1: 365, y1: 60, x2: 365, y2: 185, label: 'R', subLabel: `${p.R} Ω` },
        { id: 'wb', type: 'wire', x1: 150, y1: 185, x2: 365, y2: 185 },
        { id: 'gnd', type: 'ground', x1: 255, y1: 185 },
      ],
    }),
    buildNetlist: (p) => {
      const tau = p.R * p.C_uF * 1e-6;
      const tEnd = 5 * tau;
      return `* Ch7.2 First-Order RC Zero-Input Response
C1 1 0 ${p.C_uF}u ic=${p.U0}
Vam 1 2 DC 0
R1 2 0 ${p.R}
.tran ${tEnd / 250} ${tEnd} uic
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: 'u_C(t) (V) [左] / 放电电流 i_R(t) (mA) [右]',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      const tVec = out?.vectors['time'];
      const vVec = out?.vectors['v(1)'];
      const iVec = out?.vectors['i(vam)'];
      if (!tVec || !vVec || !iVec) return null;
      const tau = p.R * p.C_uF * 1e-6;
      return {
        xValues: tVec.real,
        series: [
          { label: '电容电压 u_C(t)', unit: 'V', color: '#38bdf8', values: vVec.real, axis: 'left' },
          { label: '放电电流 i_R(t)', unit: 'mA', color: '#fb7185', dashed: true, values: iVec.real.map((v) => v * 1000), axis: 'right' },
        ],
        markers: [
          { x: tau, label: `1τ = ${(tau * 1000).toFixed(2)}ms (36.8% U₀)`, color: '#facc15' },
          { x: 3 * tau, label: `3τ (5.0% U₀)`, color: '#4ade80' },
        ],
      };
    },
    metrics: [
      {
        label: '时间常数 τ = R·C',
        symbol: '\\tau',
        unit: 'ms',
        highlight: true,
        getSimValue: (_bag, p) => p.R * p.C_uF * 1e-3,
        getTheoryValue: (p) => p.R * p.C_uF * 1e-3,
      },
      {
        label: 't = τ 时刻电容电压 u_C(τ)',
        symbol: 'u_C(\\tau)',
        unit: 'V',
        highlight: true,
        getSimValue: (bag, p) => {
          const tVec = bag.primary?.vectors['time']?.real;
          const vVec = bag.primary?.vectors['v(1)']?.real;
          if (!tVec || !vVec) return null;
          const tau = p.R * p.C_uF * 1e-6;
          let idx = 0;
          let best = Infinity;
          tVec.forEach((t, i) => {
            if (Math.abs(t - tau) < best) {
              best = Math.abs(t - tau);
              idx = i;
            }
          });
          return vVec[idx];
        },
        getTheoryValue: (p) => p.U0 * Math.exp(-1),
      },
      {
        label: '电阻消耗总热能 ½CU₀²',
        symbol: 'W_R',
        unit: 'mJ',
        getSimValue: (_bag, p) => 0.5 * p.C_uF * 1e-6 * p.U0 * p.U0 * 1000,
        getTheoryValue: (p) => 0.5 * p.C_uF * 1e-6 * p.U0 * p.U0 * 1000,
      },
    ],
  },

  {
    id: 'ch7-zero-state',
    chapterId: 'ch7',
    code: '7.3',
    title: '一阶电路的零状态响应（RC / RL 阶跃充电切换）',
    syllabusItems: ['（3）一阶电路的零状态响应'],
    summary:
      '储能元件初始状态为零，在 t=0 接入直流阶跃激励后的建立稳态过程，支持一键切换一阶 RC 电路与一阶 RL 电路！',
    theoryMarkdown:
      '**零状态响应**是指动态元件初始储能为零（$u_C(0_-) = 0$ 或 $i_L(0_-) = 0$），完全由外加激励引起的响应：\n- **一阶 RC 充电**：$u_C(t) = U_S(1 - e^{-t/\\tau}), \\; \\tau = RC$，在 $t = \\tau$ 处上升至稳态值的 $63.2\\%$；\n- **一阶 RL 励磁**：$i_L(t) = \\frac{U_S}{R}(1 - e^{-t/\\tau}), \\; \\tau = \\frac{L}{R}$（注意：**电阻 $R$ 越大，RL 电路时间常数 $\\tau = L/R$ 反而越小**，稳态建立越快！）。',
    keyFormulas: [
      '\\text{RC: } u_C(t) = U_S(1 - e^{-t/(RC)}), \\quad i_C(t) = \\frac{U_S}{R} e^{-t/(RC)}',
      '\\text{RL: } i_L(t) = \\frac{U_S}{R}(1 - e^{-Rt/L}), \\quad u_L(t) = U_S e^{-Rt/L}',
    ],
    teachingTips: [
      '切换到“一阶 RL 电路”并增大电阻 R：注意观察时间常数 τ = L/R 变小、响应变快，这与 RC 电路 τ = RC 随 R 增大变慢恰好相反！',
    ],
    params: [
      {
        type: 'select',
        key: 'mode',
        label: '选择一阶电路类型',
        defaultValue: 0,
        options: [
          { label: '一阶 RC 串联零状态充电电路 (τ = R·C)', value: 0 },
          { label: '一阶 RL 串联零状态励磁电路 (τ = L / R)', value: 1 },
        ],
      },
      { key: 'Us', label: '阶跃直流电压 U_S', unit: 'V', min: 4, max: 24, step: 2, defaultValue: 10 },
      { key: 'R', label: '串联电阻 R', unit: 'Ω', min: 50, max: 500, step: 50, defaultValue: 100 },
      { key: 'CL_val', label: '储能参数 (C[μF] 或 L[mH])', unit: 'μF/mH', min: 10, max: 100, step: 10, defaultValue: 20 },
    ],
    buildSchematic: (p) => {
      const isRL = Math.round(p.mode) === 1;
      return {
        width: 520,
        height: 235,
        elements: [
          { id: 'vs', type: 'vsource_dc', x1: 90, y1: 60, x2: 90, y2: 185, label: 'U_S', subLabel: `${p.Us} V` },
          { id: 'sw', type: 'switch', x1: 90, y1: 60, x2: 205, y2: 60, label: 'S(t=0)', switchOpen: false },
          { id: 'r1', type: 'resistor', x1: 205, y1: 60, x2: 375, y2: 60, label: 'R', subLabel: `${p.R} Ω`, currentArrow: 'i(t)' },
          {
            id: 'dyn',
            type: isRL ? 'inductor' : 'capacitor',
            x1: 375,
            y1: 60,
            x2: 375,
            y2: 185,
            label: isRL ? 'L' : 'C',
            subLabel: isRL ? `${p.CL_val} mH` : `${p.CL_val} μF`,
            voltageMarks: { plus: '+', minus: '-' },
          },
          { id: 'wb', type: 'wire', x1: 90, y1: 185, x2: 375, y2: 185 },
          { id: 'gnd', type: 'ground', x1: 235, y1: 185 },
        ],
      };
    },
    buildNetlist: (p) => {
      const isRL = Math.round(p.mode) === 1;
      const tau = isRL ? (p.CL_val * 1e-3) / p.R : p.R * p.CL_val * 1e-6;
      const tEnd = Math.max(5 * tau, 5e-5);
      if (isRL) {
        return `* Ch7.3 RL Zero-State Response
Vs 1 0 DC ${p.Us}
R1 1 2 ${p.R}
Vam 2 2L DC 0
L1 2L 0 ${p.CL_val}m ic=0
.tran ${tEnd / 250} ${tEnd} uic
.end`;
      }
      return `* Ch7.3 RC Zero-State Response
Vs 1 0 DC ${p.Us}
R1 1 2 ${p.R}
Vam 2 2C DC 0
C1 2C 0 ${p.CL_val}u ic=0
.tran ${tEnd / 250} ${tEnd} uic
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '端电压 u (V) [左] / 支路电流 i (mA) [右]',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      const tVec = out?.vectors['time'];
      const vVec = out?.vectors['v(2)'];
      const iVec = out?.vectors['i(vam)'];
      if (!tVec || !vVec || !iVec) return null;
      const isRL = Math.round(p.mode) === 1;
      const tau = isRL ? (p.CL_val * 1e-3) / p.R : p.R * p.CL_val * 1e-6;
      return {
        xValues: tVec.real,
        series: [
          {
            label: isRL ? '电感电压 u_L(t)' : '电容电压 u_C(t)',
            unit: 'V',
            color: '#38bdf8',
            values: vVec.real,
            axis: 'left',
          },
          {
            label: isRL ? '电感电流 i_L(t)' : '充电电流 i_C(t)',
            unit: 'mA',
            color: '#4ade80',
            values: iVec.real.map((v) => v * 1000),
            axis: 'right',
          },
        ],
        markers: [
          { x: tau, label: `τ = ${(tau * 1000).toFixed(3)}ms (63.2% 稳态进度)`, color: '#facc15' },
        ],
      };
    },
    metrics: [
      {
        label: '电路时间常数 τ',
        symbol: '\\tau',
        unit: 'ms',
        highlight: true,
        getSimValue: (_bag, p) =>
          Math.round(p.mode) === 1
            ? ((p.CL_val * 1e-3) / p.R) * 1000
            : p.R * p.CL_val * 1e-3,
        getTheoryValue: (p) =>
          Math.round(p.mode) === 1
            ? ((p.CL_val * 1e-3) / p.R) * 1000
            : p.R * p.CL_val * 1e-3,
      },
      {
        label: 't = τ 处状态变量值 (63.2% 终值)',
        symbol: 'f(\\tau)',
        unit: 'V 或 mA',
        highlight: true,
        getSimValue: (_bag, p) =>
          Math.round(p.mode) === 1
            ? ((p.Us / p.R) * 1000) * (1 - Math.exp(-1))
            : p.Us * (1 - Math.exp(-1)),
      },
    ],
  },

  {
    id: 'ch7-complete-three-elements',
    chapterId: 'ch7',
    code: '7.4',
    title: '一阶电路的全响应分解与“三要素法”万能求解',
    syllabusItems: ['（4）一阶电路的全响应'],
    summary:
      '三网表同步暂态仿真：在同一示波器上同时展示全响应 u_C(t)、零输入分量 u_zi(t) 与零状态分量 u_zs(t)，直观验证全响应的两种分解方式与三要素公式！',
    theoryMarkdown:
      '线性一阶电路的**全响应**具有两种等价的物理分解：\n1. **按激励来源分解（线性叠加）**：$\\text{全响应} = \\text{零输入响应 } u_{zi}(t) + \\text{零状态响应 } u_{zs}(t) = U_0 e^{-t/\\tau} + U_S(1 - e^{-t/\\tau})$；\n2. **按时间性质分解（微分方程通解+特解）**：$\\text{全响应} = \\text{稳态分量 } f(\\infty) + \\text{暂态分量 } [f(0_+) - f(\\infty)]e^{-t/\\tau}$。\n由此提炼出求解任意直流一阶电路的**三要素法**：只需确定初值 $f(0_+)$、稳态终值 $f(\\infty)$、时间常数 $\\tau = R_{eq}C$（或 $L/R_{eq}$）三个要素即可直接写出解析式！',
    keyFormulas: [
      'f(t) = f(\\infty) + \\big[f(0_+) - f(\\infty)\\big] e^{-t/\\tau} \\quad (\\text{三要素公式})',
      'u_C(t) = \\underbrace{U_0 e^{-t/\\tau}}_{\\text{零输入响应 } u_{zi}} + \\underbrace{U_S(1 - e^{-t/\\tau})}_{\\text{零状态响应 } u_{zs}}',
    ],
    teachingTips: [
      '观察示波器上的三条曲线：任意时刻 t，黄色虚线（零输入响应）+ 绿色虚线（零状态响应）在纵坐标上的高度之和，精确等于蓝色实线（全响应）！',
      '尝试把初始电压 U₀ 设为负值（如 -6V），体验电容反向放电再正向充电穿越 0V 的全过程！',
    ],
    params: [
      { key: 'U0', label: '初始电容电压要素 f(0+) = U₀', unit: 'V', min: -10, max: 20, step: 2, defaultValue: -4 },
      { key: 'Us', label: '稳态终值要素 f(∞) = U_S', unit: 'V', min: 2, max: 20, step: 2, defaultValue: 12 },
      { key: 'Req', label: '戴维南等效电阻 R_eq', unit: 'Ω', min: 100, max: 1000, step: 100, defaultValue: 400 },
      { key: 'C_uF', label: '电容量 C', unit: 'μF', min: 5, max: 30, step: 5, defaultValue: 10 },
    ],
    buildSchematic: (p) => ({
      width: 520,
      height: 235,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 100, y1: 60, x2: 100, y2: 185, label: 'U_S = f(∞)', subLabel: `${p.Us} V` },
        { id: 'sw', type: 'switch', x1: 100, y1: 60, x2: 205, y2: 60, label: 'S(t=0)', switchOpen: false },
        { id: 'r', type: 'resistor', x1: 205, y1: 60, x2: 375, y2: 60, label: 'R_eq', subLabel: `${p.Req} Ω`, currentArrow: 'i_C' },
        { id: 'c', type: 'capacitor', x1: 375, y1: 60, x2: 375, y2: 185, label: 'C', subLabel: `${p.C_uF}μF (初值 ${p.U0}V)` },
        { id: 'wb', type: 'wire', x1: 100, y1: 185, x2: 375, y2: 185 },
        { id: 'gnd', type: 'ground', x1: 240, y1: 185 },
      ],
      nodes: [{ x: 375, y: 60, text: 'u_C(t)' }],
    }),
    buildNetlist: (p) => {
      const tau = p.Req * p.C_uF * 1e-6;
      const tEnd = 5 * tau;
      return `* Ch7.4 Complete Response + ZI + ZS in parallel branches
* 1. Complete Response
Vs 1 0 DC ${p.Us}
R_comp 1 c_comp ${p.Req}
C_comp c_comp 0 ${p.C_uF}u ic=${p.U0}
* 2. Zero-Input Component
R_zi 0 c_zi ${p.Req}
C_zi c_zi 0 ${p.C_uF}u ic=${p.U0}
* 3. Zero-State Component
R_zs 1 c_zs ${p.Req}
C_zs c_zs 0 ${p.C_uF}u ic=0
.tran ${tEnd / 250} ${tEnd} uic
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '响应电压 (V)',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      const tVec = out?.vectors['time'];
      const vc = out?.vectors['v(c_comp)'];
      const vzi = out?.vectors['v(c_zi)'];
      const vzs = out?.vectors['v(c_zs)'];
      if (!tVec || !vc || !vzi || !vzs) return null;
      const tau = p.Req * p.C_uF * 1e-6;
      return {
        xValues: tVec.real,
        series: [
          { label: '全响应 u_C(t)', unit: 'V', color: '#38bdf8', values: vc.real },
          { label: '零输入分量 u_zi(t)', unit: 'V', color: '#facc15', dashed: true, values: vzi.real },
          { label: '零状态分量 u_zs(t)', unit: 'V', color: '#4ade80', dashed: true, values: vzs.real },
        ],
        markers: [{ x: tau, label: `τ = ${(tau * 1000).toFixed(2)} ms`, color: '#fb7185' }],
      };
    },
    metrics: [
      {
        label: '要素① 初始值 f(0+)',
        symbol: 'f(0_+)',
        unit: 'V',
        getSimValue: (bag) => bag.primary?.vectors['v(c_comp)']?.real[0] ?? null,
        getTheoryValue: (p) => p.U0,
      },
      {
        label: '要素② 稳态终值 f(∞)',
        symbol: 'f(\\infty)',
        unit: 'V',
        getSimValue: (bag) => {
          const v = bag.primary?.vectors['v(c_comp)']?.real;
          return v ? v[v.length - 1] : null;
        },
        getTheoryValue: (p) => p.Us,
      },
      {
        label: '要素③ 时间常数 τ = R_eq·C',
        symbol: '\\tau',
        unit: 'ms',
        highlight: true,
        getSimValue: (_bag, p) => p.Req * p.C_uF * 1e-3,
        getTheoryValue: (p) => p.Req * p.C_uF * 1e-3,
      },
      {
        label: 't = τ 处全响应实测值 vs 三要素理论值',
        symbol: 'u_C(\\tau)',
        unit: 'V',
        highlight: true,
        getSimValue: (bag, p) => {
          const tVec = bag.primary?.vectors['time']?.real;
          const vVec = bag.primary?.vectors['v(c_comp)']?.real;
          if (!tVec || !vVec) return null;
          const tau = p.Req * p.C_uF * 1e-6;
          let idx = 0;
          let best = Infinity;
          tVec.forEach((t, i) => {
            if (Math.abs(t - tau) < best) {
              best = Math.abs(t - tau);
              idx = i;
            }
          });
          return vVec[idx];
        },
        getTheoryValue: (p) => p.Us + (p.U0 - p.Us) * Math.exp(-1),
      },
    ],
  },

  // ==================== 第八章 ====================
  {
    id: 'ch8-sinusoid-phasor',
    chapterId: 'ch8',
    code: '8.1',
    title: '复数、正弦量三要素与同频相量加减运算',
    syllabusItems: ['（1）复数', '（2）正弦量', '（3）相量法的基础'],
    summary:
      '同步联动“时域正弦示波器”与“复平面相量图”：调节幅值/有效值、频率 f 与初相 ψ₁, ψ₂，直观掌握超前、滞后、正交及同频正弦量合成！',
    theoryMarkdown:
      '正弦量的**三要素**为幅值 $U_m$（有效值 $U = U_m / \\sqrt{2}$）、角频率 $\\omega = 2\\pi f$ 和初相位 $\\psi$。\n- **欧拉公式与相量映射**：同频率正弦量 $u(t) = \\sqrt{2} U \\cos(\\omega t + \\psi)$ 一一对应复常数（有效值相量）$\\dot{U} = U \\angle \\psi = U\\cos\\psi + jU\\sin\\psi$。\n- **同频正弦量代数和 $\\Leftrightarrow$ 复数相量平行四边形合成**：$\\dot{U}_{\\Sigma} = \\dot{U}_1 + \\dot{U}_2$；相位差 $\\varphi_{12} = \\psi_1 - \\psi_2 > 0$ 称 $u_1$ **超前** $u_2$。',
    keyFormulas: [
      'u(t) = \\sqrt{2} U \\sin(\\omega t + \\psi) \\;\\longleftrightarrow\\; \\dot{U} = U \\angle \\psi, \\quad U = \\frac{U_m}{\\sqrt{2}}',
      '\\dot{U}_{\\Sigma} = \\dot{U}_1 + \\dot{U}_2 = (U_{1x}+U_{2x}) + j(U_{1y}+U_{2y})',
    ],
    teachingTips: [
      '尝试令 U₁ = U₂ = 10V，将初相 ψ₁ = 0°、ψ₂ = 120° 或 180°：观察示波器上合成波形 u_Σ(t) 与右侧复平面相量矢量的平行四边形抵消/叠加规律！',
    ],
    params: [
      { key: 'U1', label: '正弦源1 有效值 U₁', unit: 'V', min: 2, max: 20, step: 1, defaultValue: 10 },
      { key: 'psi1', label: '正弦源1 初相 ψ₁', unit: '°', min: -180, max: 180, step: 15, defaultValue: 30 },
      { key: 'U2', label: '正弦源2 有效值 U₂', unit: 'V', min: 2, max: 20, step: 1, defaultValue: 8 },
      { key: 'psi2', label: '正弦源2 初相 ψ₂', unit: '°', min: -180, max: 180, step: 15, defaultValue: -60 },
      { key: 'f', label: '电源频率 f', unit: 'Hz', min: 50, max: 500, step: 50, defaultValue: 50 },
    ],
    buildSchematic: (p) => ({
      width: 520,
      height: 235,
      elements: [
        { id: 'v1', type: 'vsource_ac', x1: 140, y1: 55, x2: 140, y2: 125, label: 'u₁(t)', subLabel: `${p.U1}∠${p.psi1}° V` },
        { id: 'v2', type: 'vsource_ac', x1: 140, y1: 125, x2: 140, y2: 195, label: 'u₂(t)', subLabel: `${p.U2}∠${p.psi2}° V` },
        { id: 'wt', type: 'wire', x1: 140, y1: 55, x2: 370, y2: 55 },
        { id: 'rl', type: 'resistor', x1: 370, y1: 55, x2: 370, y2: 195, label: 'R_测', subLabel: '1 kΩ', voltageMarks: { plus: '+', minus: '-' } },
        { id: 'wb', type: 'wire', x1: 140, y1: 195, x2: 370, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 255, y1: 195 },
      ],
      nodes: [
        { x: 370, y: 55, text: '合成 u_Σ = u₁ + u₂' },
        { x: 140, y: 125, text: 'u₂' },
      ],
    }),
    buildNetlist: (p) => {
      const um1 = p.U1 * Math.SQRT2;
      const um2 = p.U2 * Math.SQRT2;
      const tEnd = 2 / p.f;
      return `* Ch8.1 Sinusoid Addition & Phasor Mapping
V1 sum n2 DC 0 SIN(0 ${um1} ${p.f} 0 0 ${p.psi1})
V2 n2 0 DC 0 SIN(0 ${um2} ${p.f} 0 0 ${p.psi2})
V1_ref u1only 0 DC 0 SIN(0 ${um1} ${p.f} 0 0 ${p.psi1})
R1 sum 0 1k
R2 u1only 0 1k
.tran ${tEnd / 240} ${tEnd}
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t (两个完整工频周期)',
    yAxisLabel: '瞬时电压 u(t) [V]',
    traces: [
      { expr: 'v(u1only)', label: 'u₁(t)', unit: 'V', color: '#38bdf8', dashed: true },
      { expr: 'v(n2)', label: 'u₂(t)', unit: 'V', color: '#4ade80', dashed: true },
      { expr: 'v(sum)', label: '合成总电压 u_Σ(t) = u₁ + u₂', unit: 'V', color: '#facc15' },
    ],
    phasors: [
      {
        label: 'U̇₁',
        unit: 'V',
        color: '#38bdf8',
        magExpr: (p) => p.U1,
        angleDegExpr: (p) => p.psi1,
      },
      {
        label: 'U̇₂',
        unit: 'V',
        color: '#4ade80',
        magExpr: (p) => p.U2,
        angleDegExpr: (p) => p.psi2,
      },
      {
        label: 'U̇_Σ',
        unit: 'V',
        color: '#eab308',
        magExpr: (p) => {
          const r1 = (p.psi1 * Math.PI) / 180;
          const r2 = (p.psi2 * Math.PI) / 180;
          const rx = p.U1 * Math.cos(r1) + p.U2 * Math.cos(r2);
          const ry = p.U1 * Math.sin(r1) + p.U2 * Math.sin(r2);
          return Math.hypot(rx, ry);
        },
        angleDegExpr: (p) => {
          const r1 = (p.psi1 * Math.PI) / 180;
          const r2 = (p.psi2 * Math.PI) / 180;
          const rx = p.U1 * Math.cos(r1) + p.U2 * Math.cos(r2);
          const ry = p.U1 * Math.sin(r1) + p.U2 * Math.sin(r2);
          return (Math.atan2(ry, rx) * 180) / Math.PI;
        },
      },
    ],
    metrics: [
      {
        label: '相位差 φ₁₂ = ψ₁ - ψ₂',
        symbol: '\\varphi_{12}',
        unit: '°',
        getSimValue: (_bag, p) => p.psi1 - p.psi2,
        getTheoryValue: (p) => p.psi1 - p.psi2,
      },
      {
        label: '合成正弦量有效值 U_Σ',
        symbol: 'U_{\\Sigma}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => {
          const v = bag.primary?.vectors['v(sum)']?.real;
          if (!v || v.length === 0) return null;
          const peak = Math.max(...v.map(Math.abs));
          return peak / Math.SQRT2;
        },
        getTheoryValue: (p) => {
          const r1 = (p.psi1 * Math.PI) / 180;
          const r2 = (p.psi2 * Math.PI) / 180;
          return Math.hypot(
            p.U1 * Math.cos(r1) + p.U2 * Math.cos(r2),
            p.U1 * Math.sin(r1) + p.U2 * Math.sin(r2)
          );
        },
      },
      {
        label: '角频率 ω = 2πf',
        symbol: '\\omega',
        unit: 'rad/s',
        getSimValue: (_bag, p) => 2 * Math.PI * p.f,
        getTheoryValue: (p) => 2 * Math.PI * p.f,
      },
    ],
  },

  {
    id: 'ch8-vcr-kcl-kvl-phasor',
    chapterId: 'ch8',
    code: '8.2',
    title: 'R、L、C 基本元件 VCR 相量形式与基尔霍夫定律相量验证',
    syllabusItems: ['（3）相量法的基础', '（4）电路定律的相量形式'],
    summary:
      '利用 ngspice 交流相量分析 (.ac) 与稳态时域仿真 (.tran) 双重验证：R 同相、L 电压超前电流 90°、C 电压滞后电流 90°，以及相量 KVL 矢量和（而非有效值算术和）！',
    theoryMarkdown:
      '三种基本元件在正弦稳态下的**相量 VCR**：\n1. **电阻 R**：$\\dot{U}_R = R \\dot{I}$（电压与电流**同相**）；\n2. **电感 L**：$\\dot{U}_L = j\\omega L \\dot{I}$（电压**超前**电流 $90^\\circ$，感抗 $X_L = \\omega L$）；\n3. **电容 C**：$\\dot{U}_C = \\frac{1}{j\\omega C}\\dot{I} = -j\\frac{1}{\\omega C}\\dot{I}$（电压**滞后**电流 $90^\\circ$，容抗 $X_C = \\frac{1}{\\omega C}$）。\n**相量 KVL 警示**：串联总电压相量 $\\dot{U}_S = \\dot{U}_R + \\dot{U}_L + \\dot{U}_C$，有效值满足勾股关系 $U_S = \\sqrt{U_R^2 + (U_L - U_C)^2} \\neq U_R + U_L + U_C$！',
    keyFormulas: [
      '\\dot{U}_R = R\\dot{I}, \\quad \\dot{U}_L = j\\omega L\\dot{I}, \\quad \\dot{U}_C = -j\\frac{1}{\\omega C}\\dot{I}',
      '\\dot{U}_S = \\dot{U}_R + \\dot{U}_L + \\dot{U}_C, \\quad U_S = \\sqrt{U_R^2 + (U_L - U_C)^2}',
    ],
    teachingTips: [
      '观察右侧相量图：U̇_L 与 U̇_C 方向严格相反（相差 180°）互相抵消，且均与电流相量 İ（及 U̇_R）严格正交（90°）！',
      '注意指标表：三个元件分电压有效值算术和 U_R + U_L + U_C 远大于总电源电压 U_S！',
    ],
    params: [
      { key: 'Us', label: '交流源有效值 U_S', unit: 'V', min: 5, max: 50, step: 5, defaultValue: 20 },
      { key: 'f', label: '交流频率 f', unit: 'Hz', min: 50, max: 500, step: 50, defaultValue: 100 },
      { key: 'R', label: '串联电阻 R', unit: 'Ω', min: 10, max: 100, step: 10, defaultValue: 30 },
      { key: 'L_mH', label: '串联电感 L', unit: 'mH', min: 20, max: 200, step: 10, defaultValue: 100 },
      { key: 'C_uF', label: '串联电容 C', unit: 'μF', min: 20, max: 200, step: 10, defaultValue: 70 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 245,
      elements: [
        { id: 'vs', type: 'vsource_ac', x1: 75, y1: 65, x2: 75, y2: 195, label: 'U̇_S', subLabel: `${p.Us}∠0° V` },
        { id: 'r', type: 'resistor', x1: 75, y1: 65, x2: 225, y2: 65, label: 'R', subLabel: `${p.R}Ω`, currentArrow: 'İ' },
        { id: 'l', type: 'inductor', x1: 225, y1: 65, x2: 390, y2: 65, label: 'L', subLabel: `${p.L_mH}mH` },
        { id: 'c', type: 'capacitor', x1: 465, y1: 65, x2: 465, y2: 195, label: 'C', subLabel: `${p.C_uF}μF`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'wt', type: 'wire', x1: 390, y1: 65, x2: 465, y2: 65 },
        { id: 'wb', type: 'wire', x1: 75, y1: 195, x2: 465, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 270, y1: 195 },
      ],
      nodes: [
        { x: 225, y: 65, text: 'a' },
        { x: 390, y: 65, text: 'b (U̇_C)' },
      ],
    }),
    buildNetlist: (p) => {
      const um = p.Us * Math.SQRT2;
      const tEnd = 5 / p.f;
      return `* Ch8.2 Steady State Waveforms
Vs 1 0 DC 0 SIN(0 ${um} ${p.f})
Vam 1 1a DC 0
R1 1a a ${p.R}
L1 a b ${p.L_mH}m
C1 b 0 ${p.C_uF}u
.tran ${tEnd / 300} ${tEnd}
.end`;
    },
    extraRuns: [
      {
        id: 'ac_pt',
        title: 'ngspice 单频复相量求解',
        buildNetlist: (p) => `* Single Frequency Phasor Analysis
Vs 1 0 DC 0 AC ${p.Us} 0
Vam 1 1a DC 0
R1 1a a ${p.R}
L1 a b ${p.L_mH}m
C1 b 0 ${p.C_uF}u
.ac lin 1 ${p.f} ${p.f}
.end`,
      },
    ],
    plotKind: 'tran',
    xAxisLabel: '时间 t (展示建立正弦稳态过程)',
    yAxisLabel: '端电压 (V) [左] / 回路电流 (A) [右]',
    buildDerivedCurves: (bag) => {
      const out = bag.primary;
      const tVec = out?.vectors['time'];
      const v1 = out?.vectors['v(1)'];
      const va = out?.vectors['v(a)'];
      const vb = out?.vectors['v(b)'];
      const iv = out?.vectors['i(vam)'];
      if (!tVec || !v1 || !va || !vb || !iv) return null;
      return {
        xValues: tVec.real,
        series: [
          { label: '总电压 u_S(t)', unit: 'V', color: '#facc15', values: v1.real, axis: 'left' },
          { label: 'u_R(t)', unit: 'V', color: '#38bdf8', values: v1.real.map((v, i) => v - va.real[i]), axis: 'left' },
          { label: 'u_L(t)', unit: 'V', color: '#fb7185', dashed: true, values: va.real.map((v, i) => v - vb.real[i]), axis: 'left' },
          { label: 'u_C(t)', unit: 'V', color: '#4ade80', dashed: true, values: vb.real, axis: 'left' },
        ],
      };
    },
    phasors: [
      {
        label: 'U̇_S',
        unit: 'V',
        color: '#eab308',
        magExpr: (p) => p.Us,
        angleDegExpr: () => 0,
      },
      {
        label: 'İ',
        unit: 'A',
        color: '#ef4444',
        category: 'current',
        magExpr: (p) => {
          const w = 2 * Math.PI * p.f;
          const x = w * p.L_mH * 1e-3 - 1 / (w * p.C_uF * 1e-6);
          return p.Us / Math.hypot(p.R, x);
        },
        angleDegExpr: (p) => {
          const w = 2 * Math.PI * p.f;
          const x = w * p.L_mH * 1e-3 - 1 / (w * p.C_uF * 1e-6);
          return (-Math.atan2(x, p.R) * 180) / Math.PI;
        },
      },
      {
        label: 'U̇_R',
        unit: 'V',
        color: '#0284c7',
        magExpr: (p) => {
          const w = 2 * Math.PI * p.f;
          const x = w * p.L_mH * 1e-3 - 1 / (w * p.C_uF * 1e-6);
          return (p.Us / Math.hypot(p.R, x)) * p.R;
        },
        angleDegExpr: (p) => {
          const w = 2 * Math.PI * p.f;
          const x = w * p.L_mH * 1e-3 - 1 / (w * p.C_uF * 1e-6);
          return (-Math.atan2(x, p.R) * 180) / Math.PI;
        },
      },
      {
        label: 'U̇_L',
        unit: 'V',
        color: '#e11d48',
        magExpr: (p) => {
          const w = 2 * Math.PI * p.f;
          const xl = w * p.L_mH * 1e-3;
          const x = xl - 1 / (w * p.C_uF * 1e-6);
          return (p.Us / Math.hypot(p.R, x)) * xl;
        },
        angleDegExpr: (p) => {
          const w = 2 * Math.PI * p.f;
          const x = w * p.L_mH * 1e-3 - 1 / (w * p.C_uF * 1e-6);
          return ((-Math.atan2(x, p.R) * 180) / Math.PI) + 90;
        },
      },
      {
        label: 'U̇_C',
        unit: 'V',
        color: '#16a34a',
        magExpr: (p) => {
          const w = 2 * Math.PI * p.f;
          const xc = 1 / (w * p.C_uF * 1e-6);
          const x = w * p.L_mH * 1e-3 - xc;
          return (p.Us / Math.hypot(p.R, x)) * xc;
        },
        angleDegExpr: (p) => {
          const w = 2 * Math.PI * p.f;
          const x = w * p.L_mH * 1e-3 - 1 / (w * p.C_uF * 1e-6);
          return ((-Math.atan2(x, p.R) * 180) / Math.PI) - 90;
        },
      },
    ],
    metrics: [
      {
        label: '回路电流有效值 I (ngspice .ac)',
        symbol: 'I',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => acPhasorAt(bag.extras['ac_pt'], 'i(vam)')?.mag ?? null,
        getTheoryValue: (p) => {
          const w = 2 * Math.PI * p.f;
          const x = w * p.L_mH * 1e-3 - 1 / (w * p.C_uF * 1e-6);
          return p.Us / Math.hypot(p.R, x);
        },
      },
      {
        label: '电阻电压有效值 U_R',
        symbol: 'U_R',
        unit: 'V',
        getSimValue: (bag) => {
          const v1 = acPhasorAt(bag.extras['ac_pt'], 'v(1)');
          const va = acPhasorAt(bag.extras['ac_pt'], 'v(a)');
          return v1 && va ? Math.hypot(v1.real - va.real, v1.imag - va.imag) : null;
        },
      },
      {
        label: '电感电压有效值 U_L',
        symbol: 'U_L',
        unit: 'V',
        getSimValue: (bag) => {
          const va = acPhasorAt(bag.extras['ac_pt'], 'v(a)');
          const vb = acPhasorAt(bag.extras['ac_pt'], 'v(b)');
          return va && vb ? Math.hypot(va.real - vb.real, va.imag - vb.imag) : null;
        },
      },
      {
        label: '电容电压有效值 U_C',
        symbol: 'U_C',
        unit: 'V',
        getSimValue: (bag) => acPhasorAt(bag.extras['ac_pt'], 'v(b)')?.mag ?? null,
      },
      {
        label: '相量勾股验证 √(U_R² + (U_L - U_C)²) = U_S',
        symbol: '|\\dot{U}_R+\\dot{U}_L+\\dot{U}_C|',
        unit: 'V',
        highlight: true,
        note: '精确等于电源有效值 U_S，而算术和远大于 U_S',
        getSimValue: (bag) => {
          const v1 = acPhasorAt(bag.extras['ac_pt'], 'v(1)');
          const va = acPhasorAt(bag.extras['ac_pt'], 'v(a)');
          const vb = acPhasorAt(bag.extras['ac_pt'], 'v(b)');
          if (!v1 || !va || !vb) return null;
          const ur = Math.hypot(v1.real - va.real, v1.imag - va.imag);
          const ul = Math.hypot(va.real - vb.real, va.imag - vb.imag);
          const uc = vb.mag;
          return Math.hypot(ur, ul - uc);
        },
        getTheoryValue: (p) => p.Us,
      },
    ],
  },
];
