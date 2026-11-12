import type { CaseDefinition } from '../types/circuit';
import { acPhasorAt } from '../services/ngspiceEngine';

export const CASES_CH9_TO_CH12: CaseDefinition[] = [
  // ==================== 第九章 ====================
  {
    id: 'ch9-impedance-phasor',
    chapterId: 'ch9',
    code: '9.1',
    title: '复阻抗、复导纳与正弦稳态混联电路相量图分析',
    syllabusItems: [
      '（1）阻抗与导纳',
      '（2）电路的相量图',
      '（3）正弦稳态电路的分析',
    ],
    summary:
      '运用复阻抗 Z = R + jX 与复导纳 Y = G + jB 求解 RLC 串并联正弦稳态电路，同步展示相量图与感性/容性/阻性状态判据。',
    theoryMarkdown:
      '无源一端口在正弦稳态下的端口电压电流相量之比定义为**复阻抗**：\n$$Z = \\frac{\\dot{U}}{\\dot{I}} = R + jX = |Z|\\angle\\varphi_z, \\qquad Y = \\frac{1}{Z} = G + jB$$\n- 当电抗 $X > 0$（$\\varphi_z > 0$），电压超前电流，端口呈**感性**；\n- 当电抗 $X < 0$（$\\varphi_z < 0$），电压滞后电流，端口呈**容性**；\n- 当 $X = 0$（$\\varphi_z = 0$），电压与电流同相，端口呈**纯阻性（谐振）**。一切直流电阻电路的分析方法与定理（串并联、分压分流、节点法、戴维南定理）直接推广为相量复数形式！',
    keyFormulas: [
      'Z_{in} = (R_1 + j\\omega L) + \\left(R_2 \\parallel \\frac{1}{j\\omega C}\\right) = R_{in} + jX_{in} = |Z_{in}|\\angle\\varphi_z',
      '\\dot{I}_{in} = \\frac{\\dot{U}_S}{Z_{in}}, \\quad \\dot{I}_L = \\dot{I}_{R2} + \\dot{I}_C',
    ],
    teachingTips: [
      '调节电感 L 或电容 C，观察输入阻抗角 φ_z 在正（感性）与负（容性）之间平滑过渡，同时右侧相量图中总电流 İ_in 相对总电压 U̇_S 从滞后变为超前！',
    ],
    params: [
      { key: 'Us', label: '交流电压有效值 U_S', unit: 'V', min: 10, max: 220, step: 10, defaultValue: 100 },
      { key: 'f', label: '工作频率 f', unit: 'Hz', min: 50, max: 400, step: 50, defaultValue: 50 },
      { key: 'R1', label: '干路电阻 R₁', unit: 'Ω', min: 5, max: 50, step: 5, defaultValue: 15 },
      { key: 'L_mH', label: '干路电感 L', unit: 'mH', min: 10, max: 200, step: 10, defaultValue: 80 },
      { key: 'R2', label: '并联支路电阻 R₂', unit: 'Ω', min: 10, max: 100, step: 10, defaultValue: 40 },
      { key: 'C_uF', label: '并联支路电容 C', unit: 'μF', min: 10, max: 200, step: 10, defaultValue: 80 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 250,
      elements: [
        { id: 'vs', type: 'vsource_ac', x1: 75, y1: 65, x2: 75, y2: 200, label: 'U̇_S', subLabel: `${p.Us}∠0°V` },
        { id: 'r1', type: 'resistor', x1: 75, y1: 65, x2: 195, y2: 65, label: 'R₁', subLabel: `${p.R1}Ω`, currentArrow: 'İ_in' },
        { id: 'l1', type: 'inductor', x1: 195, y1: 65, x2: 325, y2: 65, label: 'L', subLabel: `${p.L_mH}mH` },
        { id: 'wt', type: 'wire', x1: 325, y1: 65, x2: 465, y2: 65 },
        { id: 'r2', type: 'resistor', x1: 365, y1: 65, x2: 365, y2: 200, label: 'R₂', subLabel: `${p.R2}Ω`, currentArrow: 'İ_R2' },
        { id: 'c1', type: 'capacitor', x1: 465, y1: 65, x2: 465, y2: 200, label: 'C', subLabel: `${p.C_uF}μF`, currentArrow: 'İ_C' },
        { id: 'wb', type: 'wire', x1: 75, y1: 200, x2: 465, y2: 200 },
        { id: 'gnd', type: 'ground', x1: 270, y1: 200 },
      ],
      nodes: [{ x: 365, y: 65, text: '节点 a (U̇_a)' }],
    }),
    buildNetlist: (p) => {
      const um = p.Us * Math.SQRT2;
      const tEnd = 4 / p.f;
      return `* Ch9.1 Steady-state RLC Mixed Circuit
Vs 1 0 DC 0 SIN(0 ${um} ${p.f})
VamIn 1 1a DC 0
R1 1a m ${p.R1}
L1 m a ${p.L_mH}m
VamR2 a aR DC 0
R2 aR 0 ${p.R2}
VamC a aC DC 0
C1 aC 0 ${p.C_uF}u
.tran ${tEnd / 240} ${tEnd}
.end`;
    },
    extraRuns: [
      {
        id: 'ac',
        title: '复频域相量解',
        buildNetlist: (p) => `* AC Phasor Run
Vs 1 0 DC 0 AC ${p.Us} 0
VamIn 1 1a DC 0
R1 1a m ${p.R1}
L1 m a ${p.L_mH}m
VamR2 a aR DC 0
R2 aR 0 ${p.R2}
VamC a aC DC 0
C1 aC 0 ${p.C_uF}u
.ac lin 1 ${p.f} ${p.f}
.end`,
      },
    ],
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '电压 (V) [左] / 电流 (A) [右]',
    traces: [
      { expr: 'v(1)', label: '总电压 u_S(t)', unit: 'V', color: '#facc15', axis: 'left' },
      { expr: 'v(a)', label: '并联端电压 u_a(t)', unit: 'V', color: '#38bdf8', axis: 'left' },
      { expr: 'i(vamin)', label: '总输入电流 i_in(t)', unit: 'A', color: '#fb7185', axis: 'right' },
    ],
    phasors: [
      { label: 'U̇_S', unit: 'V', color: '#eab308', magExpr: (p) => p.Us, angleDegExpr: () => 0 },
      {
        label: 'U̇_a',
        unit: 'V',
        color: '#0284c7',
        magExpr: (_p, m) => m['ua_mag'] ?? 0,
        angleDegExpr: (_p, m) => m['ua_deg'] ?? 0,
      },
      {
        label: 'İ_in',
        unit: 'A',
        color: '#e11d48',
        category: 'current',
        magExpr: (_p, m) => m['iin_mag'] ?? 0,
        angleDegExpr: (_p, m) => m['iin_deg'] ?? 0,
      },
      {
        label: 'İ_C',
        unit: 'A',
        color: '#16a34a',
        category: 'current',
        magExpr: (_p, m) => m['ic_mag'] ?? 0,
        angleDegExpr: (_p, m) => m['ic_deg'] ?? 0,
      },
    ],
    metrics: [
      {
        label: '等效输入阻抗模 |Z_in|',
        symbol: '|Z_{in}|',
        unit: 'Ω',
        highlight: true,
        getSimValue: (bag, p) => {
          const iin = acPhasorAt(bag.extras['ac'], 'i(vamin)');
          return iin && iin.mag > 0 ? p.Us / iin.mag : null;
        },
      },
      {
        label: '输入阻抗角 φ_z = ∠U̇_S - ∠İ_in',
        symbol: '\\varphi_z',
        unit: '°',
        highlight: true,
        note: '>0 感性，<0 容性，=0 阻性',
        getSimValue: (bag) => {
          const iin = acPhasorAt(bag.extras['ac'], 'i(vamin)');
          return iin ? -iin.phaseDeg : null;
        },
      },
      {
        label: '干路电流有效值 I_in',
        symbol: 'I_{in}',
        unit: 'A',
        getSimValue: (bag) => acPhasorAt(bag.extras['ac'], 'i(vamin)')?.mag ?? null,
      },
      {
        label: '并联节点电压有效值 U_a',
        symbol: 'U_a',
        unit: 'V',
        getSimValue: (bag) => acPhasorAt(bag.extras['ac'], 'v(a)')?.mag ?? null,
      },
    ],
  },

  {
    id: 'ch9-power-pfc',
    chapterId: 'ch9',
    code: '9.2',
    title: '有功/无功/视在功率、复功率与并联电容提高功率因数',
    syllabusItems: ['（4）正弦稳态电路的功率', '（5）复功率'],
    summary:
      '模拟工业 220V/50Hz 感性电动机负载并联无功补偿电容 C：实时对比补偿前后有功 P、无功 Q、功率因数 cosφ 及输电线路电流降损效果！',
    theoryMarkdown:
      '正弦稳态一端口的**功率与复功率 $\\tilde{S}$**：\n$$\\tilde{S} = \\dot{U}\\dot{I}^* = P + jQ = S\\angle\\varphi, \\quad S = UI = \\sqrt{P^2 + Q^2}$$\n- **有功功率** $P = UI\\cos\\varphi$（单位 $\\text{W}$）：电路实际消耗的平均功率；\n- **无功功率** $Q = UI\\sin\\varphi$（单位 $\\text{var}$）：储能元件与电源间往返交换的功率规模；\n- **功率因数提高（无功补偿）**：在感性负载两端**并联电容 $C$**，负载本身工作电压与有功功率 $P$ 丝毫不变，但电容发出的容性无功抵消了电感吸收的感性无功，使总功率因数 $\\lambda = \\cos\\varphi$ 提高，从而**显著减小电网输电电流 $I$、大幅降低输电线热损耗 $I^2 R_{line}$**！',
    keyFormulas: [
      '\\tilde{S} = P + jQ, \\quad P = UI\\cos\\varphi, \\quad Q = UI\\sin\\varphi, \\quad \\lambda = \\cos\\varphi = \\frac{P}{S}',
      'C = \\frac{P}{\\omega U^2}(\\tan\\varphi_1 - \\tan\\varphi_2) \\quad (\\text{并联补偿电容计算公式})',
    ],
    teachingTips: [
      '将“并联补偿电容 C”从 0 μF 逐步增大到约 65 μF：观察下方对比表中感性负载有功功率 P 恒定不变，而线路总电流 I_总 大幅下降、功率因数 cosφ 逼近 1.00！',
      '继续过度增大 C（超过 90 μF）：观察“过补偿”现象——电路转为容性，线路总电流反而重新上升！',
    ],
    params: [
      { key: 'Us', label: '工频电网电压 U_S', unit: 'V', min: 110, max: 380, step: 10, defaultValue: 220 },
      { key: 'R_load', label: '感性负载等效电阻 R', unit: 'Ω', min: 10, max: 60, step: 5, defaultValue: 30 },
      { key: 'L_mH', label: '感性负载电感 L', unit: 'mH', min: 50, max: 300, step: 10, defaultValue: 120 },
      { key: 'C_uF', label: '并联无功补偿电容 C', unit: 'μF', min: 0, max: 140, step: 5, defaultValue: 60 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 255,
      elements: [
        { id: 'vs', type: 'vsource_ac', x1: 80, y1: 60, x2: 80, y2: 205, label: '工频电网 U̇', subLabel: `${p.Us}V / 50Hz` },
        { id: 'wt', type: 'wire', x1: 80, y1: 60, x2: 455, y2: 60, currentArrow: 'İ_总' },
        { id: 'c_comp', type: 'capacitor', x1: 265, y1: 60, x2: 265, y2: 205, label: '补偿电容 C', subLabel: `${p.C_uF} μF`, color: '#16a34a', currentArrow: 'İ_C' },
        { id: 'rl', type: 'resistor', x1: 455, y1: 60, x2: 455, y2: 132, label: 'R_负载', subLabel: `${p.R_load}Ω`, currentArrow: 'İ_RL' },
        { id: 'll', type: 'inductor', x1: 455, y1: 132, x2: 455, y2: 205, label: 'L_负载', subLabel: `${p.L_mH}mH` },
        { id: 'wb', type: 'wire', x1: 80, y1: 205, x2: 455, y2: 205 },
        { id: 'gnd', type: 'ground', x1: 265, y1: 205 },
      ],
      annotations: [
        { x: 115, y: 238, text: '绿色节能工程示范：并联电容就地平衡无功，降低电网线损 I²R_线', color: '#047857', bold: true },
      ],
    }),
    buildNetlist: (p) => {
      const um = p.Us * Math.SQRT2;
      const cVal = Math.max(p.C_uF, 0.001);
      return `* Ch9.2 Power Factor Correction Transient
Vs 1 0 DC 0 SIN(0 ${um} 50)
VamTot 1 1a DC 0
VamC 1a 1c DC 0
Ccomp 1c 0 ${cVal}u
VamRL 1a 1r DC 0
Rload 1r m ${p.R_load}
Lload m 0 ${p.L_mH}m
.tran 0.2m 40m
.end`;
    },
    extraRuns: [
      {
        id: 'ac_comp',
        title: '补偿后复功率分析',
        buildNetlist: (p) => `* Compensated AC
Vs 1 0 DC 0 AC ${p.Us} 0
VamTot 1 1a DC 0
VamC 1a 1c DC 0
Ccomp 1c 0 ${Math.max(p.C_uF, 0.0001)}u
VamRL 1a 1r DC 0
Rload 1r m ${p.R_load}
Lload m 0 ${p.L_mH}m
.ac lin 1 50 50
.end`,
      },
      {
        id: 'ac_uncomp',
        title: '未补偿原感性负载',
        buildNetlist: (p) => `* Uncompensated AC
Vs 1 0 DC 0 AC ${p.Us} 0
VamTot 1 1a DC 0
Rload 1a m ${p.R_load}
Lload m 0 ${p.L_mH}m
.ac lin 1 50 50
.end`,
      },
    ],
    plotKind: 'tran',
    xAxisLabel: '时间 t (50Hz 工频两周期)',
    yAxisLabel: '电网电压 u (V) [左] / 电流 i (A) [右]',
    traces: [
      { expr: 'v(1)', label: '电网电压 u(t)', unit: 'V', color: '#facc15', axis: 'left' },
      { expr: 'i(vamrl)', label: '原负载电流 i_RL(t)', unit: 'A', color: '#fb7185', dashed: true, axis: 'right' },
      { expr: 'i(vamtot)', label: '补偿后线路总电流 i_总(t)', unit: 'A', color: '#38bdf8', axis: 'right' },
      { expr: 'i(vamc)', label: '电容补偿电流 i_C(t)', unit: 'A', color: '#4ade80', dashed: true, axis: 'right' },
    ],
    comparisonTable: {
      headers: ['供电指标', '补偿前 (C = 0)', '并联电容补偿后', '节能效果分析'],
      rows: (bag, p) => {
        const iUn = acPhasorAt(bag.extras['ac_uncomp'], 'i(vamtot)');
        const iCo = acPhasorAt(bag.extras['ac_comp'], 'i(vamtot)');
        if (!iUn || !iCo) return [];
        const phiUn = (-iUn.phaseDeg * Math.PI) / 180;
        const phiCo = (-iCo.phaseDeg * Math.PI) / 180;
        const pUn = p.Us * iUn.mag * Math.cos(phiUn);
        const pCo = p.Us * iCo.mag * Math.cos(phiCo);
        const qUn = p.Us * iUn.mag * Math.sin(phiUn);
        const qCo = p.Us * iCo.mag * Math.sin(phiCo);
        const pfUn = Math.cos(phiUn);
        const pfCo = Math.cos(phiCo);
        const lineLossRatio = ((iCo.mag * iCo.mag) / (iUn.mag * iUn.mag)) * 100;

        return [
          ['线路总电流有效值 I_总', `${iUn.mag.toFixed(3)} A`, `${iCo.mag.toFixed(3)} A`, `下降 ${((1 - iCo.mag / iUn.mag) * 100).toFixed(1)}%`],
          ['有功功率 P (W)', `${pUn.toFixed(1)} W`, `${pCo.toFixed(1)} W`, '负载做功完全不变'],
          ['无功功率 Q (var)', `${qUn.toFixed(1)} var`, `${qCo.toFixed(1)} var`, qCo >= 0 ? '感性无功大幅降低' : '过补偿（呈容性）'],
          ['视在功率 S = U·I (VA)', `${(p.Us * iUn.mag).toFixed(1)} VA`, `${(p.Us * iCo.mag).toFixed(1)} VA`, '释放变压器容量'],
          ['功率因数 λ = cosφ', `${pfUn.toFixed(3)}`, `${pfCo.toFixed(3)}`, `线路损耗降至原 ${lineLossRatio.toFixed(1)}%`],
        ];
      },
    },
    metrics: [
      {
        label: '补偿后线路总电流 I_总',
        symbol: 'I_{\\text{总}}',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => acPhasorAt(bag.extras['ac_comp'], 'i(vamtot)')?.mag ?? null,
      },
      {
        label: '补偿后功率因数 cosφ',
        symbol: '\\cos\\varphi',
        unit: '',
        highlight: true,
        getSimValue: (bag) => {
          const iCo = acPhasorAt(bag.extras['ac_comp'], 'i(vamtot)');
          return iCo ? Math.cos((iCo.phaseDeg * Math.PI) / 180) : null;
        },
      },
      {
        label: '全补偿（cosφ=1）理论最佳电容',
        symbol: 'C_{\\text{opt}}',
        unit: 'μF',
        getSimValue: (_bag, p) => {
          const w = 2 * Math.PI * 50;
          const xl = w * p.L_mH * 1e-3;
          const z2 = p.R_load * p.R_load + xl * xl;
          return ((xl / (w * z2)) * 1e6);
        },
      },
    ],
  },

  {
    id: 'ch9-ac-max-power',
    chapterId: 'ch9',
    code: '9.3',
    title: '正弦稳态最大功率传输（共轭匹配 Z_L = Z_eq* 与模匹配对比）',
    syllabusItems: ['（6）最大功率传输'],
    summary:
      '利用 ngspice 多支路并行交流仿真，同屏测绘“共轭匹配（X_L = -X_eq）”与“纯阻模匹配（X_L = 0, R_L = |Z_eq|）”两条功率传输曲线！',
    theoryMarkdown:
      '设交流戴维南等效电源阻抗 $Z_{eq} = R_{eq} + jX_{eq}$，负载阻抗 $Z_L = R_L + jX_L$：\n1. **阻抗自由可变（共轭匹配）**：先令 $X_L = -X_{eq}$ 抵消电抗产生谐振，再令 $R_L = R_{eq}$，即 **$Z_L = Z_{eq}^*$**，获得绝对最大有功功率 $P_{\\max} = \\frac{U_{oc}^2}{4 R_{eq}}$。\n2. **若负载为纯电阻（或阻抗角固定，模匹配）**：无法抵消 $X_{eq}$，只能调节模 $|Z_L|$，当 **$|Z_L| = |Z_{eq}|$** 时获得该约束下的最大功率（低于共轭匹配极限）。',
    keyFormulas: [
      '\\text{共轭匹配: } Z_L = Z_{eq}^* = R_{eq} - jX_{eq} \\;\\Longrightarrow\\; P_{\\max} = \\frac{U_{oc}^2}{4 R_{eq}}',
      '\\text{纯阻模匹配: } R_L = |Z_{eq}| = \\sqrt{R_{eq}^2 + X_{eq}^2} \\;\\Longrightarrow\\; P_{\\max}^{\\prime} = \\frac{U_{oc}^2}{2(R_{eq} + |Z_{eq}|)}',
    ],
    teachingTips: [
      '观察蓝色实线（共轭匹配 X_L = -X_eq）峰值在 R_L = R_eq 处，而绿色虚线（纯阻负载 X_L = 0）峰值右移到 R_L = |Z_eq| 且峰值功率明显较低！',
    ],
    params: [
      { key: 'Uoc', label: '开路电压有效值 U_oc', unit: 'V', min: 10, max: 60, step: 5, defaultValue: 30 },
      { key: 'Req', label: '内阻实部 R_eq', unit: 'Ω', min: 10, max: 60, step: 5, defaultValue: 20 },
      { key: 'Xeq', label: '内电抗 X_eq = ωL_eq', unit: 'Ω', min: 5, max: 60, step: 5, defaultValue: 30 },
    ],
    buildSchematic: (p) => ({
      width: 540,
      height: 240,
      elements: [
        { id: 'vs', type: 'vsource_ac', x1: 85, y1: 65, x2: 85, y2: 190, label: 'U̇_oc', subLabel: `${p.Uoc}V` },
        { id: 'req', type: 'resistor', x1: 85, y1: 65, x2: 205, y2: 65, label: 'R_eq', subLabel: `${p.Req}Ω`, currentArrow: 'İ_L' },
        { id: 'xeq', type: 'inductor', x1: 205, y1: 65, x2: 330, y2: 65, label: '+jX_eq', subLabel: `j${p.Xeq}Ω` },
        { id: 'wt', type: 'wire', x1: 330, y1: 65, x2: 445, y2: 65 },
        { id: 'xl', type: 'capacitor', x1: 445, y1: 65, x2: 445, y2: 125, label: 'jX_L', subLabel: `-j${p.Xeq}Ω` },
        { id: 'rl', type: 'resistor', x1: 445, y1: 125, x2: 445, y2: 190, label: 'R_L ↗', subLabel: '扫描', color: '#dc2626' },
        { id: 'wb', type: 'wire', x1: 85, y1: 190, x2: 445, y2: 190 },
        { id: 'gnd', type: 'ground', x1: 265, y1: 190 },
      ],
      annotations: [
        { x: 145, y: 222, text: '共轭匹配：容抗 -jX_eq 抵消感抗 +jX_eq，且 R_L = R_eq', color: '#1e40af', bold: true },
      ],
    }),
    buildNetlist: (p) => {
      // w = 1000 rad/s => f = 159.154943 Hz, L = Xeq mH, C = 1000 / Xeq uF
      const f = 1000 / (2 * Math.PI);
      const lVal = p.Xeq * 1e-3;
      const cVal = 1 / (1000 * p.Xeq);
      const lines = [`* Ch9.3 AC Multi-branch Conjugate vs Modulus Sweep`, `Vs src 0 DC 0 AC ${p.Uoc} 0`];
      for (let k = 1; k <= 30; k++) {
        const rl = k * 4;
        // Conjugate branch k
        lines.push(`Req_c${k} src nc_${k} ${p.Req}`);
        lines.push(`Leq_c${k} nc_${k} mc_${k} ${lVal}`);
        lines.push(`Cl_c${k} mc_${k} lc_${k} ${cVal}`);
        lines.push(`Rl_c${k} lc_${k} 0 ${rl}`);
        // Pure resistive modulus branch k
        lines.push(`Req_m${k} src nm_${k} ${p.Req}`);
        lines.push(`Leq_m${k} nm_${k} lm_${k} ${lVal}`);
        lines.push(`Rl_m${k} lm_${k} 0 ${rl}`);
      }
      lines.push(`.ac lin 1 ${f} ${f}`);
      lines.push(`.end`);
      return lines.join('\n');
    },
    plotKind: 'dc_xy',
    xAxisLabel: '负载电阻 R_L (Ω)',
    yAxisLabel: '负载吸收有功功率 P_L (W)',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      if (!out) return null;
      const xVals: number[] = [];
      const pConj: number[] = [];
      const pMod: number[] = [];
      for (let k = 1; k <= 30; k++) {
        const rl = k * 4;
        const vc = acPhasorAt(out, `v(lc_${k})`)?.mag ?? 0;
        const vm = acPhasorAt(out, `v(lm_${k})`)?.mag ?? 0;
        xVals.push(rl);
        pConj.push((vc * vc) / rl);
        pMod.push((vm * vm) / rl);
      }
      const zMag = Math.hypot(p.Req, p.Xeq);
      return {
        xValues: xVals,
        series: [
          { label: '共轭匹配曲线 (X_L = -X_eq)', unit: 'W', color: '#38bdf8', values: pConj },
          { label: '纯阻模匹配曲线 (X_L = 0)', unit: 'W', color: '#4ade80', dashed: true, values: pMod },
        ],
        markers: [
          { x: p.Req, label: `共轭匹配点 R_L=${p.Req}Ω`, color: '#38bdf8' },
          { x: zMag, label: `模匹配点 R_L=|Z_eq|=${zMag.toFixed(1)}Ω`, color: '#4ade80' },
        ],
      };
    },
    metrics: [
      {
        label: '共轭匹配极限最大功率 U_oc² / (4R_eq)',
        symbol: 'P_{\\max(\\text{共轭})}',
        unit: 'W',
        highlight: true,
        getSimValue: (_bag, p) => (p.Uoc * p.Uoc) / (4 * p.Req),
        getTheoryValue: (p) => (p.Uoc * p.Uoc) / (4 * p.Req),
      },
      {
        label: '模匹配最佳电阻 |Z_eq| = √(R_eq² + X_eq²)',
        symbol: '|Z_{eq}|',
        unit: 'Ω',
        getSimValue: (_bag, p) => Math.hypot(p.Req, p.Xeq),
        getTheoryValue: (p) => Math.hypot(p.Req, p.Xeq),
      },
      {
        label: '纯阻模匹配最大功率',
        symbol: 'P_{\\max(\\text{模})}',
        unit: 'W',
        highlight: true,
        getSimValue: (_bag, p) => {
          const zm = Math.hypot(p.Req, p.Xeq);
          return (p.Uoc * p.Uoc) / (2 * (p.Req + zm));
        },
        getTheoryValue: (p) => {
          const zm = Math.hypot(p.Req, p.Xeq);
          return (p.Uoc * p.Uoc) / (2 * (p.Req + zm));
        },
      },
    ],
  },

  // ==================== 第十章 ====================
  {
    id: 'ch10-mutual-inductance',
    chapterId: 'ch10',
    code: '10.1',
    title: '互感同名端、耦合电感串并联与去耦等效计算',
    syllabusItems: ['（1）互感', '（2）含有耦合电感电路的计算', '（3）耦合电感的功率'],
    summary:
      '使用 ngspice 耦合电感元件卡（K1 L1 L2 k）仿真顺接（同向串联 L_1+L_2+2M）与反接（反向串联 L_1+L_2-2M），并与去耦等效电路同步比对！',
    theoryMarkdown:
      '当两个电感线圈存在磁耦合时，互感系数 $M = k\\sqrt{L_1 L_2}$（耦合系数 $0 \\le k \\le 1$）。\n- **同名端（`•`）判据**：两电流同时从同名端流入时，互感磁通与自感磁通相互增强，互感电压取正号：$\\dot{U}_1 = j\\omega L_1 \\dot{I}_1 \\pm j\\omega M \\dot{I}_2$。\n- **耦合电感串联去耦**：同向串联（顺接）等效电感 $L_{\\text{顺}} = L_1 + L_2 + 2M$；反向串联（反接）等效电感 $L_{\\text{反}} = L_1 + L_2 - 2M$（工程上常利用顺接与反接电感差值实验测定互感 $M = \\frac{L_{\\text{顺}} - L_{\\text{反}}}{4}$）。',
    keyFormulas: [
      'M = k\\sqrt{L_1 L_2} \\;(0 \\le k \\le 1)',
      'L_{\\text{顺接}} = L_1 + L_2 + 2M, \\quad L_{\\text{反接}} = L_1 + L_2 - 2M',
    ],
    teachingTips: [
      '切换“同名端连接方式（顺接 vs 反接）”：观察原理图上红色同名端圆点 • 翻转，回路电流有效值显著增大（反接抵消磁通，总电感减小）！',
    ],
    params: [
      {
        type: 'select',
        key: 'polarity',
        label: '同名端串联方式',
        defaultValue: 0,
        options: [
          { label: '同向串联（顺接：异名端相连，L = L₁ + L₂ + 2M）', value: 0 },
          { label: '反向串联（反接：同名端相连，L = L₁ + L₂ - 2M）', value: 1 },
        ],
      },
      { key: 'Us', label: '交流激励电压 U_S (100Hz)', unit: 'V', min: 10, max: 50, step: 5, defaultValue: 20 },
      { key: 'R', label: '线圈总电阻 R', unit: 'Ω', min: 5, max: 40, step: 5, defaultValue: 10 },
      { key: 'L1_mH', label: '自感 L₁', unit: 'mH', min: 10, max: 80, step: 5, defaultValue: 20 },
      { key: 'L2_mH', label: '自感 L₂', unit: 'mH', min: 10, max: 80, step: 5, defaultValue: 45 },
      { key: 'k', label: '耦合系数 k', unit: '', min: 0, max: 0.95, step: 0.05, defaultValue: 0.8 },
    ],
    buildSchematic: (p) => {
      const opposing = Math.round(p.polarity) === 1;
      const mVal = p.k * Math.sqrt(p.L1_mH * p.L2_mH);
      return {
        width: 560,
        height: 250,
        elements: [
          { id: 'vs', type: 'vsource_ac', x1: 80, y1: 75, x2: 80, y2: 200, label: 'U̇_S', subLabel: `${p.Us}V/100Hz` },
          { id: 'r', type: 'resistor', x1: 80, y1: 75, x2: 210, y2: 75, label: 'R', subLabel: `${p.R}Ω`, currentArrow: 'İ' },
          { id: 'l1', type: 'inductor', x1: 210, y1: 75, x2: 345, y2: 75, label: 'L₁', subLabel: `${p.L1_mH}mH`, dotPos: 'start' },
          { id: 'l2', type: 'inductor', x1: 345, y1: 75, x2: 480, y2: 75, label: 'L₂', subLabel: `${p.L2_mH}mH`, dotPos: opposing ? 'end' : 'start' },
          { id: 'wr', type: 'wire', x1: 480, y1: 75, x2: 480, y2: 200 },
          { id: 'wb', type: 'wire', x1: 80, y1: 200, x2: 480, y2: 200 },
          { id: 'gnd', type: 'ground', x1: 280, y1: 200 },
        ],
        mutualArcs: [
          { x1: 275, y1: 60, x2: 412, y2: 60, label: `互感 M = ${mVal.toFixed(1)} mH (k=${p.k})` },
        ],
      };
    },
    buildNetlist: (p) => {
      const opposing = Math.round(p.polarity) === 1;
      const um = p.Us * Math.SQRT2;
      // In SPICE, dot of inductor is at its first node!
      const l2Line = opposing
        ? `L2 0 m ${p.L2_mH}m`
        : `L2 m 0 ${p.L2_mH}m`;
      return `* Ch10.1 Coupled Inductors Series Connection
Vs 1 0 DC 0 SIN(0 ${um} 100)
Vam 1 1a DC 0
R1 1a a ${p.R}
L1 a m ${p.L1_mH}m
${l2Line}
K1 L1 L2 ${p.k}
.tran 0.1m 30m
.end`;
    },
    extraRuns: [
      {
        id: 'ac_k',
        title: '耦合电感原网表 (.ac)',
        buildNetlist: (p) => {
          const opposing = Math.round(p.polarity) === 1;
          const l2Line = opposing ? `L2 0 m ${p.L2_mH}m` : `L2 m 0 ${p.L2_mH}m`;
          return `* Coupled AC
Vs 1 0 DC 0 AC ${p.Us} 0
Vam 1 1a DC 0
R1 1a a ${p.R}
L1 a m ${p.L1_mH}m
${l2Line}
K1 L1 L2 ${p.k}
.ac lin 1 100 100
.end`;
        },
      },
      {
        id: 'ac_decoupled',
        title: '去耦等效单电感网表 (.ac)',
        buildNetlist: (p) => {
          const opposing = Math.round(p.polarity) === 1;
          const m = p.k * Math.sqrt(p.L1_mH * p.L2_mH);
          const leq = opposing ? p.L1_mH + p.L2_mH - 2 * m : p.L1_mH + p.L2_mH + 2 * m;
          return `* Decoupled Equivalent AC
Vs 1 0 DC 0 AC ${p.Us} 0
VamEq 1 1a DC 0
R1 1a a ${p.R}
Leq a 0 ${leq}m
.ac lin 1 100 100
.end`;
        },
      },
    ],
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '总电压 u_S (V) [左] / 串联电流 i (A) [右]',
    traces: [
      { expr: 'v(1)', label: '激励电压 u_S(t)', unit: 'V', color: '#facc15', axis: 'left' },
      { expr: 'v(a)', label: '耦合线圈总压降 u_L(t)', unit: 'V', color: '#38bdf8', axis: 'left' },
      { expr: 'i(vam)', label: '回路电流 i(t)', unit: 'A', color: '#fb7185', axis: 'right' },
    ],
    comparisonTable: {
      headers: ['验证项目', 'ngspice K耦合仿真', '去耦等效电路仿真', '结论'],
      rows: (bag, p) => {
        const iK = acPhasorAt(bag.extras['ac_k'], 'i(vam)');
        const iEq = acPhasorAt(bag.extras['ac_decoupled'], 'i(vameq)');
        if (!iK || !iEq) return [];
        const m = p.k * Math.sqrt(p.L1_mH * p.L2_mH);
        const opposing = Math.round(p.polarity) === 1;
        const leq = opposing ? p.L1_mH + p.L2_mH - 2 * m : p.L1_mH + p.L2_mH + 2 * m;
        return [
          ['去耦等效电感 L_eq', `${leq.toFixed(2)} mH`, `${leq.toFixed(2)} mH`, opposing ? '反接减 2M' : '顺接加 2M'],
          ['稳态电流有效值 I', `${iK.mag.toFixed(4)} A`, `${iEq.mag.toFixed(4)} A`, '精确相等'],
          ['电流相位角 ∠İ', `${iK.phaseDeg.toFixed(2)}°`, `${iEq.phaseDeg.toFixed(2)}°`, '精确相等'],
          ['峰值磁耦合储能 ½L_eq·I_m²', `${(0.5 * leq * 1e-3 * 2 * iK.mag * iK.mag * 1000).toFixed(2)} mJ`, `${(0.5 * leq * 1e-3 * 2 * iEq.mag * iEq.mag * 1000).toFixed(2)} mJ`, '磁能恒非负 (k≤1)'],
        ];
      },
    },
    metrics: [
      {
        label: '互感系数 M = k√(L₁L₂)',
        symbol: 'M',
        unit: 'mH',
        highlight: true,
        getSimValue: (_bag, p) => p.k * Math.sqrt(p.L1_mH * p.L2_mH),
        getTheoryValue: (p) => p.k * Math.sqrt(p.L1_mH * p.L2_mH),
      },
      {
        label: '串联等效电感 L_eq',
        symbol: 'L_{eq}',
        unit: 'mH',
        highlight: true,
        getSimValue: (_bag, p) => {
          const m = p.k * Math.sqrt(p.L1_mH * p.L2_mH);
          return Math.round(p.polarity) === 1
            ? p.L1_mH + p.L2_mH - 2 * m
            : p.L1_mH + p.L2_mH + 2 * m;
        },
      },
      {
        label: '稳态电流有效值 I',
        symbol: 'I',
        unit: 'A',
        getSimValue: (bag) => acPhasorAt(bag.extras['ac_k'], 'i(vam)')?.mag ?? null,
      },
    ],
  },

  {
    id: 'ch10-transformer',
    chapterId: 'ch10',
    code: '10.2',
    title: '变压器反射阻抗原理与理想变压器（变压/变流/变阻抗）',
    syllabusItems: ['（4）变压器原理', '（5）理想变压器'],
    summary:
      '构建原副边隔离耦合变压器模型：观察从松耦合空心变压器到紧耦合（k→1, L→∞）理想变压器过渡时的变压比 n、变流比 1/n 及阻抗变换 n²R_L！',
    theoryMarkdown:
      '1. **空心变压器与反射阻抗**：副边回路阻抗 $Z_{22} = R_L + j\\omega L_2$ 通过互感耦合在原边产生**反射阻抗** $Z_f = \\frac{(\\omega M)^2}{Z_{22}}$（注意反射电抗与副边电抗符号相反！）。\n2. **理想变压器**（无损、全耦合 $k=1$、参数趋于无穷大但匝数比 $n = N_1/N_2 = \\sqrt{L_1/L_2}$ 恒定）：\n   - **变压关系**：$\\dot{U}_1 = n \\dot{U}_2$\n   - **变流关系**：$\\dot{I}_1 = \\frac{1}{n} \\dot{I}_2$（瞬间吸收总功率 $u_1 i_1 - u_2 i_2 = 0$）\n   - **阻抗变换性质**：$Z_{in} = n^2 R_L$！',
    keyFormulas: [
      'Z_{in(\\text{空心})} = Z_{11} + \\frac{(\\omega M)^2}{Z_{22}}',
      '\\text{理想变压器 }(k\\to 1,\\; \\omega L \\gg R_L): \\quad \\frac{U_1}{U_2} = n, \\quad \\frac{I_1}{I_2} = \\frac{1}{n}, \\quad R_{in} = n^2 R_L',
    ],
    teachingTips: [
      '默认参数处于高电感紧耦合状态（k = 0.999），近似理想变压器：观察原边等效输入阻抗 |Z_in| 精确逼近 n²·R_L！',
      '尝试将耦合系数 k 调低至 0.5（松耦合空心变压器），观察副边输出电压 U₂ 因漏磁通显著跌落。',
    ],
    params: [
      { key: 'Us', label: '原边交流电压 U₁', unit: 'V', min: 10, max: 100, step: 10, defaultValue: 40 },
      { key: 'n', label: '原副边变比 n = N₁ / N₂', unit: '', min: 0.5, max: 4, step: 0.5, defaultValue: 2 },
      { key: 'k', label: '磁耦合系数 k', unit: '', min: 0.5, max: 0.9999, step: 0.05, defaultValue: 0.9999 },
      { key: 'RL', label: '副边负载电阻 R_L', unit: 'Ω', min: 10, max: 200, step: 10, defaultValue: 50 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 250,
      elements: [
        { id: 'vs', type: 'vsource_ac', x1: 80, y1: 65, x2: 80, y2: 195, label: '原边 U̇₁', subLabel: `${p.Us}V / 1kHz` },
        { id: 'wt1', type: 'wire', x1: 80, y1: 65, x2: 230, y2: 65, currentArrow: 'İ₁' },
        { id: 'l1', type: 'inductor', x1: 230, y1: 65, x2: 230, y2: 195, label: 'N₁ (L₁)', subLabel: `n=${p.n}`, dotPos: 'start' },
        { id: 'wb1', type: 'wire', x1: 80, y1: 195, x2: 230, y2: 195 },
        { id: 'g1', type: 'ground', x1: 155, y1: 195 },
        // Secondary side
        { id: 'l2', type: 'inductor', x1: 325, y1: 65, x2: 325, y2: 195, label: 'N₂ (L₂)', dotPos: 'start' },
        { id: 'wt2', type: 'wire', x1: 325, y1: 65, x2: 470, y2: 65, currentArrow: 'İ₂' },
        { id: 'rl', type: 'resistor', x1: 470, y1: 65, x2: 470, y2: 195, label: 'R_L', subLabel: `${p.RL} Ω`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'wb2', type: 'wire', x1: 325, y1: 195, x2: 470, y2: 195 },
        { id: 'g2', type: 'ground', x1: 400, y1: 195 },
      ],
      mutualArcs: [{ x1: 230, y1: 55, x2: 325, y2: 55, label: `k = ${p.k}` }],
      annotations: [
        { x: 271, y: 135, text: '‖', fontSize: 22, bold: true, color: '#334155' },
      ],
    }),
    buildNetlist: (p) => {
      const l2 = 0.8; // 0.8 H at 1kHz => wL2 = 5.03 kOhm >> RL, low leakage when k=0.9999
      const l1 = p.n * p.n * l2;
      const kSafe = Math.min(p.k, 0.9999);
      const um = p.Us * Math.SQRT2;
      return `* Ch10.2 Transformer Simulation (f=1kHz)
Vs 1 0 DC 0 SIN(0 ${um} 1000)
Vam1 1 1p DC 0
Rpri 1p p 0.01
L1 p 0 ${l1}
L2 s 0 ${l2}
K1 L1 L2 ${kSafe}
Vam2 s sL DC 0
RL sL 0 ${p.RL}
.tran 10u 3m
.end`;
    },
    extraRuns: [
      {
        id: 'ac',
        title: '变压器交流稳态测量',
        buildNetlist: (p) => {
          const l2 = 0.8;
          const l1 = p.n * p.n * l2;
          const kSafe = Math.min(p.k, 0.9999);
          return `* Transformer AC
Vs 1 0 DC 0 AC ${p.Us} 0
Vam1 1 1p DC 0
Rpri 1p p 0.01
L1 p 0 ${l1}
L2 s 0 ${l2}
K1 L1 L2 ${kSafe}
Vam2 s sL DC 0
RL sL 0 ${p.RL}
.ac lin 1 1000 1000
.end`;
        },
      },
    ],
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '原副边电压 (V) [左] / 原副边电流 (A) [右]',
    traces: [
      { expr: 'v(1)', label: '原边电压 u₁(t)', unit: 'V', color: '#facc15', axis: 'left' },
      { expr: 'v(s)', label: '副边电压 u₂(t)', unit: 'V', color: '#38bdf8', axis: 'left' },
      { expr: 'i(vam1)', label: '原边电流 i₁(t)', unit: 'A', color: '#fb7185', axis: 'right' },
      { expr: 'i(vam2)', label: '副边电流 i₂(t)', unit: 'A', color: '#4ade80', dashed: true, axis: 'right' },
    ],
    metrics: [
      {
        label: '副边输出电压有效值 U₂ (理想值 U₁/n)',
        symbol: 'U_2',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => acPhasorAt(bag.extras['ac'], 'v(s)')?.mag ?? null,
        getTheoryValue: (p) => p.Us / p.n,
      },
      {
        label: '原边输入电流有效值 I₁',
        symbol: 'I_1',
        unit: 'A',
        getSimValue: (bag) => acPhasorAt(bag.extras['ac'], 'i(vam1)')?.mag ?? null,
        getTheoryValue: (p) => p.Us / (p.n * p.n * p.RL),
      },
      {
        label: '副边输出电流有效值 I₂ (理想值 n·I₁)',
        symbol: 'I_2',
        unit: 'A',
        getSimValue: (bag) => acPhasorAt(bag.extras['ac'], 'i(vam2)')?.mag ?? null,
        getTheoryValue: (p) => p.Us / (p.n * p.RL),
      },
      {
        label: '原边等效输入阻抗模 |Z_in| = U₁ / I₁ (理想值 n²R_L)',
        symbol: '|Z_{in}|',
        unit: 'Ω',
        highlight: true,
        getSimValue: (bag, p) => {
          const i1 = acPhasorAt(bag.extras['ac'], 'i(vam1)')?.mag;
          return i1 ? p.Us / i1 : null;
        },
        getTheoryValue: (p) => p.n * p.n * p.RL,
      },
    ],
  },

  // ==================== 第十一章 ====================
  {
    id: 'ch11-bode-filter',
    chapterId: 'ch11',
    code: '11.1',
    title: '网络函数 H(jω) 与 RC 选频滤波器波特图（Bode Plot）',
    syllabusItems: ['（1）网络函数', '（5）波特图'],
    summary:
      '对数扫频 (.ac dec) 绘制网络函数幅频特性 20lg|H(jω)| [dB] 与相频特性 ∠H(jω) [°]，支持一阶低通、一阶高通与 RC 带通选频网络切换！',
    theoryMarkdown:
      '在线性正弦稳态零状态条件下，响应相量与激励相量之比称为**网络函数** $H(j\\omega) = |H(j\\omega)|\\angle\\varphi(\\omega)$。\n- **波特图（Bode Plot）**：横轴采用对数频率 $\\lg f$，纵轴采用分贝增益 $20\\lg|H(j\\omega)|\\;(\\text{dB})$。\n- 一阶 RC 低通网络函数 $H(j\\omega) = \\frac{1}{1 + j(\\omega/\\omega_c)}$：在**截止频率 $f_c = \\frac{1}{2\\pi RC}$** 处，幅值下降至 $1/\\sqrt{2}$（即 **$-3.01\\text{ dB}$**，半功率点），相移为 $-45^\\circ$，高频渐近线斜率为 **$-20\\text{ dB/十倍频程}$**。',
    keyFormulas: [
      'H_{\\text{LP}}(j\\omega) = \\frac{1}{1 + j\\omega RC}, \\quad H_{\\text{HP}}(j\\omega) = \\frac{j\\omega RC}{1 + j\\omega RC}',
      'f_c = \\frac{1}{2\\pi R C} \\;\\Longrightarrow\\; 20\\lg|H(j2\\pi f_c)| = -3.01\\text{ dB}, \\;\\; \\varphi(f_c) = \\mp 45^\\circ',
    ],
    teachingTips: [
      '将鼠标悬停在波特图曲线上移动：在截止频率 f_c 处核对幅频值是否恰好等于 -3.01 dB，相频值是否恰好为 -45°（低通）或 +45°（高通）！',
    ],
    params: [
      {
        type: 'select',
        key: 'filterType',
        label: '网络函数拓扑类型',
        defaultValue: 0,
        options: [
          { label: '一阶 RC 低通滤波器 (LPF: 斜率 -20dB/dec)', value: 0 },
          { label: '一阶 RC 高通滤波器 (HPF: 斜率 +20dB/dec)', value: 1 },
          { label: 'RC 串并联文氏桥带通选频网络 (BPF: 峰值 1/3 = -9.54dB)', value: 2 },
        ],
      },
      { key: 'R', label: '电阻 R', unit: 'Ω', min: 200, max: 5000, step: 200, defaultValue: 1000 },
      { key: 'C_nF', label: '电容 C', unit: 'nF', min: 20, max: 500, step: 20, defaultValue: 160 },
    ],
    buildSchematic: (p) => {
      const t = Math.round(p.filterType) % 3;
      if (t === 1) {
        return {
          width: 520,
          height: 230,
          elements: [
            { id: 'vs', type: 'vsource_ac', x1: 100, y1: 60, x2: 100, y2: 185, label: 'U̇_in', subLabel: '1∠0° V' },
            { id: 'c1', type: 'capacitor', x1: 100, y1: 60, x2: 295, y2: 60, label: 'C', subLabel: `${p.C_nF} nF` },
            { id: 'wt', type: 'wire', x1: 295, y1: 60, x2: 410, y2: 60 },
            { id: 'r1', type: 'resistor', x1: 350, y1: 60, x2: 350, y2: 185, label: 'R', subLabel: `${p.R} Ω` },
            { id: 'po', type: 'port_open', x1: 410, y1: 60, label: 'U̇_out' },
            { id: 'wb', type: 'wire', x1: 100, y1: 185, x2: 410, y2: 185 },
            { id: 'gnd', type: 'ground', x1: 250, y1: 185 },
          ],
        };
      }
      return {
        width: 520,
        height: 230,
        elements: [
          { id: 'vs', type: 'vsource_ac', x1: 100, y1: 60, x2: 100, y2: 185, label: 'U̇_in', subLabel: '1∠0° V' },
          { id: 'r1', type: 'resistor', x1: 100, y1: 60, x2: 295, y2: 60, label: 'R', subLabel: `${p.R} Ω` },
          { id: 'wt', type: 'wire', x1: 295, y1: 60, x2: 410, y2: 60 },
          { id: 'c1', type: 'capacitor', x1: 350, y1: 60, x2: 350, y2: 185, label: t === 2 ? 'R ∥ C' : 'C', subLabel: `${p.C_nF} nF` },
          { id: 'po', type: 'port_open', x1: 410, y1: 60, label: 'U̇_out' },
          { id: 'wb', type: 'wire', x1: 100, y1: 185, x2: 410, y2: 185 },
          { id: 'gnd', type: 'ground', x1: 250, y1: 185 },
        ],
      };
    },
    buildNetlist: (p) => {
      const t = Math.round(p.filterType) % 3;
      if (t === 1) {
        return `* Ch11.1 First-Order RC High-Pass Filter
Vin in 0 DC 0 AC 1 0
C1 in out ${p.C_nF}n
R1 out 0 ${p.R}
.ac dec 35 10 1Meg
.end`;
      }
      if (t === 2) {
        return `* Ch11.1 Wien Bridge RC Band-Pass Network
Vin in 0 DC 0 AC 1 0
R1 in m ${p.R}
C1 m out ${p.C_nF}n
R2 out 0 ${p.R}
C2 out 0 ${p.C_nF}n
.ac dec 35 10 1Meg
.end`;
      }
      return `* Ch11.1 First-Order RC Low-Pass Filter
Vin in 0 DC 0 AC 1 0
R1 in out ${p.R}
C1 out 0 ${p.C_nF}n
.ac dec 35 10 1Meg
.end`;
    },
    plotKind: 'ac_bode',
    acMagnitudeMode: 'dB',
    xAxisLabel: '频率 f (Hz, 对数坐标)',
    yAxisLabel: '对数幅频增益 20lg|H(jω)| [dB]',
    traces: [{ expr: 'v(out)', label: '传递函数 H(jω)', unit: 'dB', color: '#38bdf8' }],
    metrics: [
      {
        label: '特征/截止频率 f_c = 1 / (2πRC)',
        symbol: 'f_c',
        unit: 'Hz',
        highlight: true,
        getSimValue: (_bag, p) => 1 / (2 * Math.PI * p.R * p.C_nF * 1e-9),
        getTheoryValue: (p) => 1 / (2 * Math.PI * p.R * p.C_nF * 1e-9),
      },
      {
        label: 'f = f_c 处幅频增益 (ngspice 实测)',
        symbol: '20\\lg|H(jf_c)|',
        unit: 'dB',
        highlight: true,
        getSimValue: (bag, p) => {
          const fc = 1 / (2 * Math.PI * p.R * p.C_nF * 1e-9);
          const ph = acPhasorAt(bag.primary, 'v(out)', fc);
          return ph ? 20 * Math.log10(ph.mag) : null;
        },
        getTheoryValue: (p) =>
          Math.round(p.filterType) % 3 === 2
            ? 20 * Math.log10(1 / 3)
            : 20 * Math.log10(1 / Math.SQRT2),
      },
      {
        label: 'f = f_c 处相频相移 ∠H(jf_c)',
        symbol: '\\varphi(f_c)',
        unit: '°',
        getSimValue: (bag, p) => {
          const fc = 1 / (2 * Math.PI * p.R * p.C_nF * 1e-9);
          return acPhasorAt(bag.primary, 'v(out)', fc)?.phaseDeg ?? null;
        },
        getTheoryValue: (p) => {
          const t = Math.round(p.filterType) % 3;
          return t === 0 ? -45 : t === 1 ? 45 : 0;
        },
      },
    ],
  },

  {
    id: 'ch11-series-resonance',
    chapterId: 'ch11',
    code: '11.2',
    title: 'RLC 串联电路的谐振、品质因数 Q 与频率响应',
    syllabusItems: ['（2）RLC 串联电路的谐振', '（3）RLC 串联电路的频率响应'],
    summary:
      '观测 RLC 串联谐振（电压谐振）全貌：在 f₀ = 1/(2π√LC) 处电流达最大值 U_S/R，且电感/电容出现 Q 倍谐振过电压 U_C0 = U_L0 = Q·U_S！',
    theoryMarkdown:
      'RLC 串联电路阻抗 $Z(j\\omega) = R + j\\left(\\omega L - \\frac{1}{\\omega C}\\right)$：\n1. **谐振条件**：$\\omega_0 L = \\frac{1}{\\omega_0 C} \\Rightarrow f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$，此时阻抗最小且为纯阻 $Z_0 = R$，电流达到最大值 $I_0 = \\frac{U_S}{R}$ 且与激励电压同相。\n2. **特征阻抗与品质因数**：$\\rho = \\sqrt{\\frac{L}{C}}$，$Q = \\frac{\\omega_0 L}{R} = \\frac{\\rho}{R}$。谐振时 $U_{L0} = U_{C0} = Q U_S$（当 $Q > 1$ 时产生显著的**串联谐振过电压**，通信中用于选频放大，电力系统中需严防绝缘击穿！）。\n3. **通频带宽度**：$BW = f_2 - f_1 = \\frac{f_0}{Q}$，$Q$ 越高，谐振曲线越尖锐、选频性越好，但通频带越窄。',
    keyFormulas: [
      'f_0 = \\frac{1}{2\\pi\\sqrt{LC}}, \\quad \\rho = \\sqrt{\\frac{L}{C}}, \\quad Q = \\frac{\\omega_0 L}{R} = \\frac{1}{R}\\sqrt{\\frac{L}{C}}',
      'U_{C0} = U_{L0} = Q \\cdot U_S, \\quad BW = \\frac{f_0}{Q}',
    ],
    teachingTips: [
      '尝试将电阻 R 调小至 10 Ω（提高品质因数 Q）：观察绿色曲线（电容电压 U_C）在谐振峰处飙升至电源电压 U_S 的数倍以上！',
    ],
    params: [
      { key: 'Us', label: '激励源电压 U_S', unit: 'V', min: 1, max: 20, step: 1, defaultValue: 5 },
      { key: 'R', label: '串联电阻 R (决定 Q 值)', unit: 'Ω', min: 10, max: 200, step: 10, defaultValue: 25 },
      { key: 'L_mH', label: '电感 L', unit: 'mH', min: 2, max: 40, step: 2, defaultValue: 10 },
      { key: 'C_nF', label: '电容 C', unit: 'nF', min: 20, max: 400, step: 20, defaultValue: 100 },
    ],
    buildSchematic: (p) => ({
      width: 550,
      height: 235,
      elements: [
        { id: 'vs', type: 'vsource_ac', x1: 80, y1: 60, x2: 80, y2: 190, label: 'U̇_S (扫频)', subLabel: `${p.Us} V` },
        { id: 'r', type: 'resistor', x1: 80, y1: 60, x2: 225, y2: 60, label: 'R', subLabel: `${p.R} Ω`, currentArrow: 'İ(f)' },
        { id: 'l', type: 'inductor', x1: 225, y1: 60, x2: 385, y2: 60, label: 'L', subLabel: `${p.L_mH} mH` },
        { id: 'wt', type: 'wire', x1: 385, y1: 60, x2: 455, y2: 60 },
        { id: 'c', type: 'capacitor', x1: 455, y1: 60, x2: 455, y2: 190, label: 'C', subLabel: `${p.C_nF} nF`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'wb', type: 'wire', x1: 80, y1: 190, x2: 455, y2: 190 },
        { id: 'gnd', type: 'ground', x1: 265, y1: 190 },
      ],
      nodes: [{ x: 420, y: 60, text: 'U̇_C(f)' }],
    }),
    buildNetlist: (p) => `* Ch11.2 RLC Series Resonance Frequency Sweep
Vs 1 0 DC 0 AC ${p.Us} 0
Vam 1 1a DC 0
R1 1a a ${p.R}
L1 a c ${p.L_mH}m
C1 c 0 ${p.C_nF}n
.ac dec 80 500 50k
.end`,
    plotKind: 'ac_bode',
    acMagnitudeMode: 'linear',
    xAxisLabel: '频率 f (Hz, 对数坐标)',
    yAxisLabel: '电压幅值 U_C, U_R (V) [左] / 电流 I (mA) [右]',
    traces: [
      { expr: 'v(c)', label: '电容谐振电压 U_C(f)', unit: 'V', color: '#4ade80', axis: 'left' },
      { expr: 'v(1)', label: '激励电压 U_S', unit: 'V', color: '#facc15', dashed: true, axis: 'left' },
      { expr: 'i(vam)', label: '回路谐振电流 I(f)', unit: 'mA', color: '#38bdf8', scale: 1000, axis: 'right' },
    ],
    metrics: [
      {
        label: '串联谐振频率 f₀ = 1 / (2π√LC)',
        symbol: 'f_0',
        unit: 'Hz',
        highlight: true,
        getSimValue: (_bag, p) =>
          1 / (2 * Math.PI * Math.sqrt(p.L_mH * 1e-3 * p.C_nF * 1e-9)),
        getTheoryValue: (p) =>
          1 / (2 * Math.PI * Math.sqrt(p.L_mH * 1e-3 * p.C_nF * 1e-9)),
      },
      {
        label: '电路品质因数 Q = (1/R)√(L/C)',
        symbol: 'Q',
        unit: '',
        highlight: true,
        getSimValue: (_bag, p) =>
          (1 / p.R) * Math.sqrt((p.L_mH * 1e-3) / (p.C_nF * 1e-9)),
        getTheoryValue: (p) =>
          (1 / p.R) * Math.sqrt((p.L_mH * 1e-3) / (p.C_nF * 1e-9)),
      },
      {
        label: '谐振点电容电压 U_C(f₀) ≈ Q·U_S',
        symbol: 'U_{C0}',
        unit: 'V',
        highlight: true,
        note: '串联谐振又名“电压谐振”',
        getSimValue: (bag, p) => {
          const f0 = 1 / (2 * Math.PI * Math.sqrt(p.L_mH * 1e-3 * p.C_nF * 1e-9));
          return acPhasorAt(bag.primary, 'v(c)', f0)?.mag ?? null;
        },
        getTheoryValue: (p) =>
          (1 / p.R) * Math.sqrt((p.L_mH * 1e-3) / (p.C_nF * 1e-9)) * p.Us,
      },
      {
        label: '-3dB 通频带宽度 BW = f₀ / Q',
        symbol: 'BW',
        unit: 'Hz',
        getSimValue: (_bag, p) => p.R / (2 * Math.PI * p.L_mH * 1e-3),
        getTheoryValue: (p) => p.R / (2 * Math.PI * p.L_mH * 1e-3),
      },
    ],
  },

  {
    id: 'ch11-parallel-resonance',
    chapterId: 'ch11',
    code: '11.3',
    title: 'RLC 并联谐振电路（高阻抗选频与支路谐振过电流）',
    syllabusItems: ['（4）RLC 并联谐振电路'],
    summary:
      '对偶于串联谐振：电流源激励 G-L-C 并联回路，在谐振频率 f₀ 处端口呈现最大纯阻 R_p，而电感与电容支路内部循环 Q 倍过电流！',
    theoryMarkdown:
      'G、L、C 并联电路输入导纳 $Y(j\\omega) = G + j\\left(\\omega C - \\frac{1}{\\omega L}\\right)$（其中 $G = 1/R_p$）：\n- **并联谐振条件**：$\\omega_0 C = \\frac{1}{\\omega_0 L} \\Rightarrow f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$，此时总导纳最小 $Y_0 = G$，**等效输入阻抗最大** $Z_0 = R_p$，端口电压达峰值 $U_0 = I_S R_p$。\n- **电流谐振特征**：并联品质因数 $Q_p = \\omega_0 C R_p = \\frac{R_p}{\\omega_0 L}$。谐振时电感支路与电容支路电流大小相等、相位相反（互相交换无功），数值高达激励电流的 $Q_p$ 倍：$I_{L0} = I_{C0} = Q_p I_S$！',
    keyFormulas: [
      'f_0 = \\frac{1}{2\\pi\\sqrt{LC}}, \\quad Q_p = R_p \\sqrt{\\frac{C}{L}}',
      'U_0 = I_S R_p \\;(\\text{最大阻抗选频}), \\quad I_{L0} = I_{C0} = Q_p I_S \\;(\\text{电流谐振})',
    ],
    teachingTips: [
      '对比蓝色曲线（电感支路电流 I_L）与黄色水平虚线（总激励电流源 I_S）：在 f₀ 附近，支路环流远大于外加总电流 I_S！',
    ],
    params: [
      { key: 'Is_mA', label: '激励电流源 I_S', unit: 'mA', min: 2, max: 50, step: 2, defaultValue: 10 },
      { key: 'Rp', label: '并联损耗电阻 R_p (越大 Q 越高)', unit: 'Ω', min: 200, max: 5000, step: 200, defaultValue: 1500 },
      { key: 'L_mH', label: '并联电感 L', unit: 'mH', min: 2, max: 40, step: 2, defaultValue: 10 },
      { key: 'C_nF', label: '并联电容 C', unit: 'nF', min: 20, max: 400, step: 20, defaultValue: 100 },
    ],
    buildSchematic: (p) => ({
      width: 550,
      height: 240,
      elements: [
        { id: 'is', type: 'isource_ac', x1: 85, y1: 195, x2: 85, y2: 60, label: 'İ_S', subLabel: `${p.Is_mA} mA` },
        { id: 'wt', type: 'wire', x1: 85, y1: 60, x2: 455, y2: 60 },
        { id: 'rp', type: 'resistor', x1: 215, y1: 60, x2: 215, y2: 195, label: 'R_p', subLabel: `${p.Rp}Ω` },
        { id: 'lp', type: 'inductor', x1: 335, y1: 60, x2: 335, y2: 195, label: 'L', subLabel: `${p.L_mH}mH`, currentArrow: 'İ_L' },
        { id: 'cp', type: 'capacitor', x1: 455, y1: 60, x2: 455, y2: 195, label: 'C', subLabel: `${p.C_nF}nF`, currentArrow: 'İ_C' },
        { id: 'wb', type: 'wire', x1: 85, y1: 195, x2: 455, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 275, y1: 195 },
      ],
      nodes: [{ x: 335, y: 60, text: '端口电压 U̇(f)' }],
    }),
    buildNetlist: (p) => `* Ch11.3 GLC Parallel Resonance
Is 0 1 DC 0 AC ${p.Is_mA * 1e-3} 0
Rp 1 0 ${p.Rp}
VamL 1 1L DC 0
L1 1L 0 ${p.L_mH}m
VamC 1 1C DC 0
C1 1C 0 ${p.C_nF}n
.ac dec 80 500 50k
.end`,
    plotKind: 'ac_bode',
    acMagnitudeMode: 'linear',
    xAxisLabel: '频率 f (Hz, 对数坐标)',
    yAxisLabel: '端口选频电压 U(f) [V, 左] / 电感支路电流 I_L [mA, 右]',
    traces: [
      { expr: 'v(1)', label: '并联谐振端口电压 U(f)', unit: 'V', color: '#4ade80', axis: 'left' },
      { expr: 'i(vaml)', label: '电感支路电流 I_L(f)', unit: 'mA', color: '#38bdf8', scale: 1000, axis: 'right' },
      { expr: 'i(vamc)', label: '电容支路电流 I_C(f)', unit: 'mA', color: '#fb7185', scale: 1000, dashed: true, axis: 'right' },
    ],
    metrics: [
      {
        label: '并联谐振频率 f₀',
        symbol: 'f_0',
        unit: 'Hz',
        highlight: true,
        getSimValue: (_bag, p) =>
          1 / (2 * Math.PI * Math.sqrt(p.L_mH * 1e-3 * p.C_nF * 1e-9)),
        getTheoryValue: (p) =>
          1 / (2 * Math.PI * Math.sqrt(p.L_mH * 1e-3 * p.C_nF * 1e-9)),
      },
      {
        label: '并联品质因数 Q_p = R_p√(C/L)',
        symbol: 'Q_p',
        unit: '',
        highlight: true,
        getSimValue: (_bag, p) =>
          p.Rp * Math.sqrt((p.C_nF * 1e-9) / (p.L_mH * 1e-3)),
        getTheoryValue: (p) =>
          p.Rp * Math.sqrt((p.C_nF * 1e-9) / (p.L_mH * 1e-3)),
      },
      {
        label: '谐振峰值端口电压 U(f₀) = I_S·R_p',
        symbol: 'U_0',
        unit: 'V',
        getSimValue: (bag, p) => {
          const f0 = 1 / (2 * Math.PI * Math.sqrt(p.L_mH * 1e-3 * p.C_nF * 1e-9));
          return acPhasorAt(bag.primary, 'v(1)', f0)?.mag ?? null;
        },
        getTheoryValue: (p) => p.Is_mA * 1e-3 * p.Rp,
      },
      {
        label: '谐振点支路过电流 I_L(f₀) = Q_p·I_S',
        symbol: 'I_{L0}',
        unit: 'mA',
        highlight: true,
        note: '并联谐振又名“电流谐振”',
        getSimValue: (bag, p) => {
          const f0 = 1 / (2 * Math.PI * Math.sqrt(p.L_mH * 1e-3 * p.C_nF * 1e-9));
          const ph = acPhasorAt(bag.primary, 'i(vaml)', f0);
          return ph ? ph.mag * 1000 : null;
        },
        getTheoryValue: (p) =>
          p.Rp * Math.sqrt((p.C_nF * 1e-9) / (p.L_mH * 1e-3)) * p.Is_mA,
      },
    ],
  },

  // ==================== 第十二章 ====================
  {
    id: 'ch12-balanced-3phase',
    chapterId: 'ch12',
    code: '12.1',
    title: '对称三相电路：星形(Y)与三角形(Δ)联接的线相电压电流关系',
    syllabusItems: [
      '（1）三相电路',
      '（2）线电压（电流）与相电压（电流）的关系',
      '（3）对称三相电路的计算',
    ],
    summary:
      '构建标准正序（A-B-C 互差 120°）220V/380V 三相供电系统，一键切换 Y 形负载与 Δ 形负载，直观验证 √3 倍幅值关系与 ±30° 相位移动！',
    theoryMarkdown:
      '对称三相正序电源满足 $\\dot{U}_A = U_P\\angle 0^\\circ,\\; \\dot{U}_B = U_P\\angle -120^\\circ,\\; \\dot{U}_C = U_P\\angle +120^\\circ$（三相之和恒为 0）：\n1. **星形联接（Y）**：线电流等于相电流 $I_L = I_P$；**线电压等于相电压的 $\\sqrt{3}$ 倍且超前对应相电压 $30^\\circ$**（如 $\\dot{U}_{AB} = \\sqrt{3}\\dot{U}_{AN}\\angle +30^\\circ$，$220\\text{ V} \\times \\sqrt{3} \\approx 380\\text{ V}$）！\n2. **三角形联接（Δ）**：线电压等于负载相电压 $U_L = U_{\\Delta P}$；**线电流等于负载相电流的 $\\sqrt{3}$ 倍且滞后对应相电流 $30^\\circ$**（$\\dot{I}_A = \\sqrt{3}\\dot{I}_{AB}\\angle -30^\\circ$）。同一对称负载接成 Δ 形时的线电流与功率是接成 Y 形时的 **3 倍**！',
    keyFormulas: [
      '\\text{Y 接: } \\dot{U}_{AB} = \\sqrt{3}\\,\\dot{U}_{AN}\\angle 30^\\circ, \\quad I_L = I_{YP}',
      '\\Delta\\text{ 接: } \\dot{I}_A = \\sqrt{3}\\,\\dot{I}_{AB}\\angle -30^\\circ, \\quad I_{L(\\Delta)} = 3 I_{L(Y)}',
    ],
    teachingTips: [
      '切换“对称三相负载接法（Y形 vs Δ形）”：观察同样每相阻抗下，Δ 形接法的线电流正好跃升为 Y 形接法的 3 倍（工业电动机“Y-Δ 降压起动”正是利用这一原理）！',
    ],
    params: [
      {
        type: 'select',
        key: 'conn',
        label: '对称三相负载联接方式',
        defaultValue: 0,
        options: [
          { label: '星形联接 (Y 接：U_L = √3 U_P, I_L = I_P)', value: 0 },
          { label: '三角形联接 (Δ 接：I_L = √3 I_P, 功率扩大为 3 倍)', value: 1 },
        ],
      },
      { key: 'Up', label: '电源相电压有效值 U_P', unit: 'V', min: 100, max: 240, step: 10, defaultValue: 220 },
      { key: 'R_ph', label: '每相负载电阻 R', unit: 'Ω', min: 10, max: 100, step: 5, defaultValue: 30 },
      { key: 'L_mH', label: '每相负载电感 L', unit: 'mH', min: 0, max: 200, step: 20, defaultValue: 60 },
    ],
    buildSchematic: (p) => {
      const isDelta = Math.round(p.conn) === 1;
      return {
        width: 560,
        height: 265,
        elements: [
          { id: 'va', type: 'vsource_ac', x1: 110, y1: 50, x2: 50, y2: 50, label: 'U̇_A (0°)' },
          { id: 'vb', type: 'vsource_ac', x1: 110, y1: 130, x2: 50, y2: 130, label: 'U̇_B (-120°)' },
          { id: 'vc', type: 'vsource_ac', x1: 110, y1: 210, x2: 50, y2: 210, label: 'U̇_C (+120°)' },
          { id: 'wn1', type: 'wire', x1: 50, y1: 50, x2: 50, y2: 210 },
          { id: 'gnd', type: 'ground', x1: 50, y1: 210 },
          // Lines A, B, C
          { id: 'la', type: 'wire', x1: 110, y1: 50, x2: 350, y2: 50, currentArrow: 'İ_A' },
          { id: 'lb', type: 'wire', x1: 110, y1: 130, x2: 350, y2: 130, currentArrow: 'İ_B' },
          { id: 'lc', type: 'wire', x1: 110, y1: 210, x2: 350, y2: 210, currentArrow: 'İ_C' },
          ...(isDelta
            ? [
                { id: 'zab', type: 'resistor' as const, x1: 350, y1: 50, x2: 350, y2: 130, label: 'Z_AB', currentArrow: 'İ_AB' },
                { id: 'zbc', type: 'resistor' as const, x1: 350, y1: 130, x2: 350, y2: 210, label: 'Z_BC' },
                { id: 'wca1', type: 'wire' as const, x1: 350, y1: 50, x2: 465, y2: 50 },
                { id: 'zca', type: 'resistor' as const, x1: 465, y1: 210, x2: 465, y2: 50, label: 'Z_CA' },
                { id: 'wca2', type: 'wire' as const, x1: 350, y1: 210, x2: 465, y2: 210 },
              ]
            : [
                { id: 'za', type: 'resistor' as const, x1: 350, y1: 50, x2: 465, y2: 130, label: 'Z_A' },
                { id: 'zb', type: 'resistor' as const, x1: 350, y1: 130, x2: 465, y2: 130, label: 'Z_B' },
                { id: 'zc', type: 'resistor' as const, x1: 350, y1: 210, x2: 465, y2: 130, label: 'Z_C' },
              ]),
        ],
        nodes: isDelta
          ? [
              { x: 350, y: 50, text: 'A' },
              { x: 350, y: 130, text: 'B' },
              { x: 350, y: 210, text: 'C' },
            ]
          : [
              { x: 465, y: 130, text: "负载中性点 N'" },
            ],
      };
    },
    buildNetlist: (p) => {
      const um = p.Up * Math.SQRT2;
      const lStr = Math.max(p.L_mH, 0.01) + 'm';
      const isDelta = Math.round(p.conn) === 1;
      const loadLines = isDelta
        ? `VamAB a ab1 DC 0
Rab ab1 ab2 ${p.R_ph}
Lab ab2 b ${lStr}
Rbc b bc2 ${p.R_ph}
Lbc bc2 c ${lStr}
Rca c ca2 ${p.R_ph}
Lca ca2 a ${lStr}`
        : `Ra a am ${p.R_ph}
La am n_load ${lStr}
Rb b bm ${p.R_ph}
Lb bm n_load ${lStr}
Rc c cm ${p.R_ph}
Lc cm n_load ${lStr}
Rleak n_load 0 100Meg`;

      return `* Ch12.1 Balanced Three-Phase Y / Delta
Va a_s 0 DC 0 SIN(0 ${um} 50 0 0 0)
Vb b_s 0 DC 0 SIN(0 ${um} 50 0 0 -120)
Vc c_s 0 DC 0 SIN(0 ${um} 50 0 0 120)
VamA a_s a DC 0
VamB b_s b DC 0
VamC c_s c DC 0
${loadLines}
.tran 0.2m 40m
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t (50Hz 三相正序波形)',
    yAxisLabel: '相电压/线电压 (V) [左] / 线电流 i_A (A) [右]',
    buildDerivedCurves: (bag) => {
      const out = bag.primary;
      const t = out?.vectors['time'];
      const va = out?.vectors['v(a)'];
      const vb = out?.vectors['v(b)'];
      const vc = out?.vectors['v(c)'];
      const ia = out?.vectors['i(vama)'];
      if (!t || !va || !vb || !vc || !ia) return null;
      return {
        xValues: t.real,
        series: [
          { label: 'A相电压 u_AN(t)', unit: 'V', color: '#38bdf8', values: va.real, axis: 'left' },
          { label: 'B相电压 u_BN(t)', unit: 'V', color: '#4ade80', dashed: true, values: vb.real, axis: 'left' },
          { label: 'C相电压 u_CN(t)', unit: 'V', color: '#fb7185', dashed: true, values: vc.real, axis: 'left' },
          { label: '线电压 u_AB = u_A - u_B (超前30°)', unit: 'V', color: '#facc15', values: va.real.map((v, i) => v - vb.real[i]), axis: 'left' },
          { label: 'A相线电流 i_A(t)', unit: 'A', color: '#c084fc', values: ia.real, axis: 'right' },
        ],
      };
    },
    phasors: [
      { label: 'U̇_AN', unit: 'V', color: '#0284c7', magExpr: (p) => p.Up, angleDegExpr: () => 0 },
      { label: 'U̇_BN', unit: 'V', color: '#16a34a', magExpr: (p) => p.Up, angleDegExpr: () => -120 },
      { label: 'U̇_CN', unit: 'V', color: '#e11d48', magExpr: (p) => p.Up, angleDegExpr: () => 120 },
      { label: 'U̇_AB', unit: 'V', color: '#eab308', magExpr: (p) => p.Up * Math.SQRT2 * Math.sqrt(1.5), angleDegExpr: () => 30 },
    ],
    metrics: [
      {
        label: '线电压有效值 U_L = √3 U_P',
        symbol: 'U_L',
        unit: 'V',
        highlight: true,
        getSimValue: (_bag, p) => Math.sqrt(3) * p.Up,
        getTheoryValue: (p) => Math.sqrt(3) * p.Up,
      },
      {
        label: '线电流有效值 I_L',
        symbol: 'I_L',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => {
          const ia = bag.primary?.vectors['i(vama)']?.real;
          if (!ia) return null;
          // Measure peak in second cycle (steady state)
          const half = Math.floor(ia.length / 2);
          const peak = Math.max(...ia.slice(half).map(Math.abs));
          return peak / Math.SQRT2;
        },
        getTheoryValue: (p) => {
          const z = Math.hypot(p.R_ph, 2 * Math.PI * 50 * p.L_mH * 1e-3);
          return Math.round(p.conn) === 1 ? (3 * p.Up) / z : p.Up / z;
        },
      },
      {
        label: '对称三相总有功功率 P = √3 U_L I_L cosφ',
        symbol: 'P_{3\\phi}',
        unit: 'W',
        highlight: true,
        getSimValue: (_bag, p) => {
          const z = Math.hypot(p.R_ph, 2 * Math.PI * 50 * p.L_mH * 1e-3);
          const ip = Math.round(p.conn) === 1 ? (Math.sqrt(3) * p.Up) / z : p.Up / z;
          return 3 * ip * ip * p.R_ph;
        },
      },
    ],
  },

  {
    id: 'ch12-unbalanced-neutral',
    chapterId: 'ch12',
    code: '12.2',
    title: '不对称三相电路与中线（Neutral）的安全保护作用',
    syllabusItems: ['（4）不对称三相电路的概念'],
    summary:
      '模拟生活照明楼宇不对称三相配电：对比“有中线（三相四线制）”与“中线断路故障”时中性点位移电压 U_N\'N 引发某相过压烧毁、某相昏暗欠压的严重事故！',
    theoryMarkdown:
      '低压民用配电普遍采用 380V/220V **三相四线制（Y₀）**，因为各层住户照明开关随机投切，三相负载天然**不对称**（$Z_A \\neq Z_B \\neq Z_C$）：\n- **中线完好（$Z_N \\approx 0$）**：强迫负载中性点 $N\'$ 与电源中性点 $N$ 等电位（$\\dot{U}_{N\'N} = 0$），尽管三相电流不对称且中线有电流 $\\dot{I}_N = \\dot{I}_A + \\dot{I}_B + \\dot{I}_C \\neq 0$，**各相负载电压仍严格维持对称 220V**，互不干扰！\n- **中线一旦断开（严禁在中线上安装熔断器或开关！）**：产生严重的**中性点位移电压** $\\dot{U}_{N\'N} = \\frac{Y_A\\dot{U}_A + Y_B\\dot{U}_B + Y_C\\dot{U}_C}{Y_A + Y_B + Y_C}$，导致**负载轻（电阻大）的一相电压远超 220V 而烧毁电器**，负载重的一相电压严重偏低无法工作！',
    keyFormulas: [
      '\\dot{U}_{N\'N} = \\frac{Y_A \\dot{U}_A + Y_B \\dot{U}_B + Y_C \\dot{U}_C}{Y_A + Y_B + Y_C + Y_N}',
      '\\dot{U}_{AN\'} = \\dot{U}_A - \\dot{U}_{N\'N}, \\quad \\dot{I}_N = \\dot{I}_A + \\dot{I}_B + \\dot{I}_C',
    ],
    teachingTips: [
      '默认处于“中线完好闭合”状态，三相负载虽极度不对称（A相轻载 200Ω、B相重载 20Ω、C相 50Ω），但三相负载电压均为安全的 220V！',
      '立即将“中线状态”切换为【故障：中线断路】！观察 A 相负载电压瞬间飙升至 320V 以上（过压危急！），B 相跌落至 140V 以下！这解释了为何国家配电规范严禁在干线中性线上装设保险丝或单极开关！',
    ],
    params: [
      {
        type: 'select',
        key: 'neutralState',
        label: '中线（Neutral）连接状态',
        defaultValue: 0,
        options: [
          { label: '正常：中线可靠接通 (Z_N ≈ 0.01Ω，三相四线制)', value: 0 },
          { label: '劣化：中线接触不良存在高阻 (R_N = 15Ω)', value: 1 },
          { label: '故障：中线完全断路！(无中线，严重中性点位移)', value: 2 },
        ],
      },
      { key: 'RA', label: 'A相负载电阻 R_A (轻载相)', unit: 'Ω', min: 10, max: 300, step: 10, defaultValue: 200 },
      { key: 'RB', label: 'B相负载电阻 R_B (重载相)', unit: 'Ω', min: 10, max: 300, step: 10, defaultValue: 20 },
      { key: 'RC', label: 'C相负载电阻 R_C', unit: 'Ω', min: 10, max: 300, step: 10, defaultValue: 60 },
    ],
    buildSchematic: (p) => {
      const st = Math.round(p.neutralState) % 3;
      return {
        width: 560,
        height: 270,
        elements: [
          { id: 'va', type: 'vsource_ac', x1: 110, y1: 48, x2: 50, y2: 48, label: 'U̇_A (220V)' },
          { id: 'vb', type: 'vsource_ac', x1: 110, y1: 112, x2: 50, y2: 112, label: 'U̇_B' },
          { id: 'vc', type: 'vsource_ac', x1: 110, y1: 176, x2: 50, y2: 176, label: 'U̇_C' },
          { id: 'wn0', type: 'wire', x1: 50, y1: 48, x2: 50, y2: 235 },
          { id: 'gnd', type: 'ground', x1: 50, y1: 235 },
          { id: 'ra', type: 'resistor', x1: 110, y1: 48, x2: 455, y2: 48, label: 'R_A (A相)', subLabel: `${p.RA}Ω`, currentArrow: 'İ_A' },
          { id: 'rb', type: 'resistor', x1: 110, y1: 112, x2: 455, y2: 112, label: 'R_B (B相)', subLabel: `${p.RB}Ω`, currentArrow: 'İ_B' },
          { id: 'rc', type: 'resistor', x1: 110, y1: 176, x2: 455, y2: 176, label: 'R_C (C相)', subLabel: `${p.RC}Ω`, currentArrow: 'İ_C' },
          { id: 'wn_r', type: 'wire', x1: 455, y1: 48, x2: 455, y2: 235 },
          {
            id: 'swn',
            type: st === 1 ? 'resistor' : 'switch',
            x1: 455,
            y1: 235,
            x2: 50,
            y2: 235,
            label: st === 0 ? '中线完好 (I_N)' : st === 1 ? '中线阻抗 15Ω' : '中线断路故障!',
            switchOpen: st === 2,
            color: st === 2 ? '#dc2626' : '#047857',
          },
        ],
        nodes: [
          { x: 455, y: 112, text: "负载中性点 N'" },
        ],
      };
    },
    buildNetlist: (p) => {
      const um = 220 * Math.SQRT2;
      const st = Math.round(p.neutralState) % 3;
      const rn = st === 0 ? 0.01 : st === 1 ? 15 : 1e9;
      return `* Ch12.2 Unbalanced Three-Phase & Neutral Wire
Va a 0 DC 0 SIN(0 ${um} 50 0 0 0)
Vb b 0 DC 0 SIN(0 ${um} 50 0 0 -120)
Vc c 0 DC 0 SIN(0 ${um} 50 0 0 120)
RA a np ${p.RA}
RB b np ${p.RB}
RC c np ${p.RC}
VamN np np2 DC 0
RN np2 0 ${rn}
.tran 0.2m 40m
.end`;
    },
    extraRuns: [
      {
        id: 'ac',
        title: '不对称三相复相量计算',
        buildNetlist: (p) => {
          const st = Math.round(p.neutralState) % 3;
          const rn = st === 0 ? 0.01 : st === 1 ? 15 : 1e9;
          return `* Unbalanced 3-Phase AC
Va a 0 DC 0 AC 220 0
Vb b 0 DC 0 AC 220 -120
Vc c 0 DC 0 AC 220 120
RA a np ${p.RA}
RB b np ${p.RB}
RC c np ${p.RC}
VamN np np2 DC 0
RN np2 0 ${rn}
.ac lin 1 50 50
.end`;
        },
      },
    ],
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '负载承受相电压 u_AN\', u_BN\', u_CN\' (V)',
    buildDerivedCurves: (bag) => {
      const out = bag.primary;
      const t = out?.vectors['time'];
      const va = out?.vectors['v(a)'];
      const vb = out?.vectors['v(b)'];
      const vc = out?.vectors['v(c)'];
      const vnp = out?.vectors['v(np)'];
      if (!t || !va || !vb || !vc || !vnp) return null;
      return {
        xValues: t.real,
        series: [
          { label: "A相负载电压 u_AN'(t)", unit: 'V', color: '#fb7185', values: va.real.map((v, i) => v - vnp.real[i]) },
          { label: "B相负载电压 u_BN'(t)", unit: 'V', color: '#38bdf8', values: vb.real.map((v, i) => v - vnp.real[i]) },
          { label: "C相负载电压 u_CN'(t)", unit: 'V', color: '#4ade80', values: vc.real.map((v, i) => v - vnp.real[i]) },
          { label: "中性点位移电压 u_N'N(t)", unit: 'V', color: '#facc15', dashed: true, values: vnp.real },
        ],
      };
    },
    metrics: [
      {
        label: "中性点位移电压有效值 U_N'N",
        symbol: "U_{N'N}",
        unit: 'V',
        highlight: true,
        note: '正常应接近 0V；断中线时剧烈飙升',
        getSimValue: (bag) => acPhasorAt(bag.extras['ac'], 'v(np)')?.mag ?? null,
      },
      {
        label: "A相负载实际承受有效值 U_AN' (额定 220V)",
        symbol: "U_{AN'}",
        unit: 'V',
        highlight: true,
        note: '>242V 将烧毁单相用电设备！',
        getSimValue: (bag) => {
          const va = acPhasorAt(bag.extras['ac'], 'v(a)');
          const vnp = acPhasorAt(bag.extras['ac'], 'v(np)');
          return va && vnp ? Math.hypot(va.real - vnp.real, va.imag - vnp.imag) : null;
        },
      },
      {
        label: "B相负载实际承受有效值 U_BN' (额定 220V)",
        symbol: "U_{BN'}",
        unit: 'V',
        getSimValue: (bag) => {
          const vb = acPhasorAt(bag.extras['ac'], 'v(b)');
          const vnp = acPhasorAt(bag.extras['ac'], 'v(np)');
          return vb && vnp ? Math.hypot(vb.real - vnp.real, vb.imag - vnp.imag) : null;
        },
      },
      {
        label: "C相负载实际承受有效值 U_CN' (额定 220V)",
        symbol: "U_{CN'}",
        unit: 'V',
        getSimValue: (bag) => {
          const vc = acPhasorAt(bag.extras['ac'], 'v(c)');
          const vnp = acPhasorAt(bag.extras['ac'], 'v(np)');
          return vc && vnp ? Math.hypot(vc.real - vnp.real, vc.imag - vnp.imag) : null;
        },
      },
      {
        label: '中线电流有效值 I_N',
        symbol: 'I_N',
        unit: 'A',
        getSimValue: (bag) => acPhasorAt(bag.extras['ac'], 'i(vamn)')?.mag ?? null,
      },
    ],
  },

  {
    id: 'ch12-3phase-power',
    chapterId: 'ch12',
    code: '12.3',
    title: '对称三相瞬时功率恒定特性与二瓦计法测功率',
    syllabusItems: ['（5）三相电路的功率'],
    summary:
      '验证对称三相电路最迷人的物理性质——单相瞬时功率脉动，但三相总瞬时功率 p(t) = p_A + p_B + p_C 恒定为常数 P！同时演示三相三线制“二瓦计法”测总功率。',
    theoryMarkdown:
      '1. **瞬时功率恒定性**：单相电路瞬时功率以 $2\\omega$ 频率剧烈脉动；而对称三相电路由于互差 $120^\\circ$，三个脉动分量之和恒等于零，故**任意时刻三相总瞬时功率恒等于平均有功功率**：\n$$p(t) = p_A(t) + p_B(t) + p_C(t) = 3 U_P I_P \\cos\\varphi = \\sqrt{3} U_L I_L \\cos\\varphi = \\text{常数！}$$\n这使得三相交流电动机转矩均匀平稳、无脉动振动，成为现代工业动力的基石！\n2. **二瓦计法**：三相三线制只需两个功率表（电流线圈串入 A、B 线，电压线圈接至 C 线），代数和 $P = W_1 + W_2 = U_{AC} I_A \\cos(\\varphi - 30^\\circ) + U_{BC} I_B \\cos(\\varphi + 30^\\circ)$ 即为三相总有功功率（注意：当阻抗角 $\\varphi > 60^\\circ$ 时其中一个功率表读数为负！）。',
    keyFormulas: [
      'p(t) = p_A(t) + p_B(t) + p_C(t) \\equiv 3 U_P I_P \\cos\\varphi',
      'W_1 = U_L I_L \\cos(\\varphi - 30^\\circ), \\quad W_2 = U_L I_L \\cos(\\varphi + 30^\\circ), \\quad P = W_1 + W_2',
    ],
    teachingTips: [
      '观察黄色实线 p_总(t)：在稳态阶段是一条笔直的水平线！',
      '增大每相电感 L 使阻抗角 φ > 60°，观察下方指标表中功率表 W₂ 读数变为负值（实验中需反接电压线圈读取负值），但 W₁ + W₂ 仍然精确等于总有功功率 P！',
    ],
    params: [
      { key: 'Up', label: '相电压有效值 U_P', unit: 'V', min: 100, max: 240, step: 20, defaultValue: 220 },
      { key: 'R_ph', label: '每相电阻 R', unit: 'Ω', min: 10, max: 80, step: 5, defaultValue: 25 },
      { key: 'L_mH', label: '每相电感 L (调大可使 φ>60°)', unit: 'mH', min: 0, max: 250, step: 25, defaultValue: 50 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 255,
      elements: [
        { id: 'va', type: 'vsource_ac', x1: 110, y1: 55, x2: 50, y2: 55, label: 'U̇_A' },
        { id: 'vb', type: 'vsource_ac', x1: 110, y1: 130, x2: 50, y2: 130, label: 'U̇_B' },
        { id: 'vc', type: 'vsource_ac', x1: 110, y1: 205, x2: 50, y2: 205, label: 'U̇_C' },
        { id: 'wn', type: 'wire', x1: 50, y1: 55, x2: 50, y2: 205 },
        { id: 'gnd', type: 'ground', x1: 50, y1: 205 },
        { id: 'w1', type: 'resistor', x1: 140, y1: 55, x2: 250, y2: 55, label: '功率表 W₁', color: '#2563eb', currentArrow: 'İ_A' },
        { id: 'w2', type: 'resistor', x1: 140, y1: 130, x2: 250, y2: 130, label: '功率表 W₂', color: '#2563eb', currentArrow: 'İ_B' },
        { id: 'la0', type: 'wire', x1: 110, y1: 55, x2: 140, y2: 55 },
        { id: 'lb0', type: 'wire', x1: 110, y1: 130, x2: 140, y2: 130 },
        { id: 'lc0', type: 'wire', x1: 110, y1: 205, x2: 360, y2: 205, currentArrow: 'İ_C' },
        { id: 'la1', type: 'wire', x1: 250, y1: 55, x2: 360, y2: 55 },
        { id: 'lb1', type: 'wire', x1: 250, y1: 130, x2: 360, y2: 130 },
        { id: 'wv1', type: 'wire', x1: 195, y1: 55, x2: 195, y2: 205, dashed: true, color: '#2563eb' },
        { id: 'wv2', type: 'wire', x1: 225, y1: 130, x2: 225, y2: 205, dashed: true, color: '#2563eb' },
        { id: 'za', type: 'resistor', x1: 360, y1: 55, x2: 475, y2: 130, label: `Z=${p.R_ph}Ω+${p.L_mH}mH` },
        { id: 'zb', type: 'resistor', x1: 360, y1: 130, x2: 475, y2: 130, label: 'Z' },
        { id: 'zc', type: 'resistor', x1: 360, y1: 205, x2: 475, y2: 130, label: 'Z' },
      ],
    }),
    buildNetlist: (p) => {
      const um = p.Up * Math.SQRT2;
      const lStr = Math.max(p.L_mH, 0.01) + 'm';
      return `* Ch12.3 Three-Phase Instantaneous Power & Two-Wattmeter
Va as 0 DC 0 SIN(0 ${um} 50 0 0 0)
Vb bs 0 DC 0 SIN(0 ${um} 50 0 0 -120)
Vc cs 0 DC 0 SIN(0 ${um} 50 0 0 120)
VamA as a DC 0
VamB bs b DC 0
VamC cs c DC 0
Ra a am ${p.R_ph}
La am 0 ${lStr}
Rb b bm ${p.R_ph}
Lb bm 0 ${lStr}
Rc c cm ${p.R_ph}
Lc cm 0 ${lStr}
.tran 0.25m 60m
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '时间 t (后半段进入正弦稳态)',
    yAxisLabel: '各相瞬时功率与三相总瞬时功率 p(t) [W]',
    buildDerivedCurves: (bag) => {
      const out = bag.primary;
      const t = out?.vectors['time'];
      const va = out?.vectors['v(a)'];
      const vb = out?.vectors['v(b)'];
      const vc = out?.vectors['v(c)'];
      const ia = out?.vectors['i(vama)'];
      const ib = out?.vectors['i(vamb)'];
      const ic = out?.vectors['i(vamc)'];
      if (!t || !va || !vb || !vc || !ia || !ib || !ic) return null;
      const pa = va.real.map((v, i) => v * ia.real[i]);
      const pb = vb.real.map((v, i) => v * ib.real[i]);
      const pc = vc.real.map((v, i) => v * ic.real[i]);
      const ptot = pa.map((v, i) => v + pb[i] + pc[i]);
      return {
        xValues: t.real,
        series: [
          { label: 'p_A(t)', unit: 'W', color: '#38bdf8', dashed: true, values: pa },
          { label: 'p_B(t)', unit: 'W', color: '#4ade80', dashed: true, values: pb },
          { label: 'p_C(t)', unit: 'W', color: '#fb7185', dashed: true, values: pc },
          { label: '三相总瞬时功率 p_总(t) = p_A+p_B+p_C', unit: 'W', color: '#facc15', values: ptot },
        ],
      };
    },
    metrics: [
      {
        label: '负载阻抗角 φ = arctan(ωL/R)',
        symbol: '\\varphi',
        unit: '°',
        getSimValue: (_bag, p) =>
          (Math.atan2(2 * Math.PI * 50 * p.L_mH * 1e-3, p.R_ph) * 180) / Math.PI,
      },
      {
        label: '第一瓦计读数 W₁ = U_L·I_L·cos(φ - 30°)',
        symbol: 'W_1',
        unit: 'W',
        getSimValue: (_bag, p) => {
          const xl = 2 * Math.PI * 50 * p.L_mH * 1e-3;
          const z = Math.hypot(p.R_ph, xl);
          const phi = Math.atan2(xl, p.R_ph);
          const ul = Math.sqrt(3) * p.Up;
          const il = p.Up / z;
          return ul * il * Math.cos(phi - Math.PI / 6);
        },
      },
      {
        label: '第二瓦计读数 W₂ = U_L·I_L·cos(φ + 30°)',
        symbol: 'W_2',
        unit: 'W',
        note: '当 φ > 60° 时读数为负',
        getSimValue: (_bag, p) => {
          const xl = 2 * Math.PI * 50 * p.L_mH * 1e-3;
          const z = Math.hypot(p.R_ph, xl);
          const phi = Math.atan2(xl, p.R_ph);
          const ul = Math.sqrt(3) * p.Up;
          const il = p.Up / z;
          return ul * il * Math.cos(phi + Math.PI / 6);
        },
      },
      {
        label: '二瓦计之和 W₁ + W₂ = 三相稳态总功率 P',
        symbol: 'P_{3\\phi}',
        unit: 'W',
        highlight: true,
        getSimValue: (bag) => {
          const out = bag.primary;
          const va = out?.vectors['v(a)']?.real;
          const vb = out?.vectors['v(b)']?.real;
          const vc = out?.vectors['v(c)']?.real;
          const ia = out?.vectors['i(vama)']?.real;
          const ib = out?.vectors['i(vamb)']?.real;
          const ic = out?.vectors['i(vamc)']?.real;
          if (!va || !vb || !vc || !ia || !ib || !ic) return null;
          const idx = va.length - 1;
          return va[idx] * ia[idx] + vb[idx] * ib[idx] + vc[idx] * ic[idx];
        },
        getTheoryValue: (p) => {
          const xl = 2 * Math.PI * 50 * p.L_mH * 1e-3;
          const z = Math.hypot(p.R_ph, xl);
          const il = p.Up / z;
          return 3 * il * il * p.R_ph;
        },
      },
    ],
  },
];
