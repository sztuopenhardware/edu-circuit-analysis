import type { CaseDefinition } from '../types/circuit';
import { opVal } from '../services/ngspiceEngine';

export const CASES_CH1_CH2: CaseDefinition[] = [
  // ==================== 第一章 ====================
  {
    id: 'ch1-ref-power',
    chapterId: 'ch1',
    code: '1.1',
    title: '电流电压参考方向与电功率平衡验证',
    syllabusItems: [
      '（1）电路和电路模型',
      '（2）电流和电压的参考方向',
      '（3）电功率和能量',
    ],
    summary:
      '通过双直流电源充放电电路模型，直观演示关联/非关联参考方向下正负号物理意义，验证全电路功率守恒定律 ∑P = 0。',
    theoryMarkdown:
      '在电路分析中，先任意选定电压与电流的**参考方向**。若电流参考方向从电压“+”极流入、“-”极流出，称为**关联参考方向**，此时吸收功率 $P = UI$（$P>0$ 实际吸收功率，$P<0$ 实际发出功率）；反之在**非关联参考方向**下，发出功率 $P_{发} = UI$。根据能量守恒，任一时刻全电路所有元件吸收功率代数和必为零：$\\sum P_k = 0$。',
    keyFormulas: [
      'I = \\frac{U_{S1} - U_{S2}}{R_1 + R_2}',
      'P_{\\text{吸收}} = U \\cdot I \\;(\\text{关联}), \\quad \\sum_{k} P_k = P_{S1} + P_{S2} + P_{R1} + P_{R2} = 0',
    ],
    teachingTips: [
      '默认 U_S1 = 12V > U_S2 = 6V，此时 I > 0：电源 U_S1 发出功率，电源 U_S2 吸收功率（处于被充电状态）。',
      '尝试将滑块 U_S2 调至 18V（大于 U_S1）：观察电流 I 变为负值，说明实际电流方向与参考方向相反，U_S2 转为发出功率！',
    ],
    params: [
      { key: 'Us1', label: '左侧电源电压 U_S1', unit: 'V', min: 0, max: 24, step: 1, defaultValue: 12 },
      { key: 'Us2', label: '右侧电源电压 U_S2', unit: 'V', min: 0, max: 24, step: 1, defaultValue: 6 },
      { key: 'R1', label: '内阻/限流电阻 R1', unit: 'Ω', min: 1, max: 20, step: 1, defaultValue: 2 },
      { key: 'R2', label: '线路电阻 R2', unit: 'Ω', min: 1, max: 20, step: 1, defaultValue: 4 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 250,
      elements: [
        { id: 'vs1', type: 'vsource_dc', x1: 90, y1: 70, x2: 90, y2: 190, label: 'U_S1', subLabel: `${p.Us1} V` },
        { id: 'r1', type: 'resistor', x1: 90, y1: 70, x2: 270, y2: 70, label: 'R₁', subLabel: `${p.R1} Ω`, currentArrow: 'I', voltageMarks: { plus: '+', minus: '-' } },
        { id: 'r2', type: 'resistor', x1: 270, y1: 70, x2: 450, y2: 70, label: 'R₂', subLabel: `${p.R2} Ω`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'vs2', type: 'vsource_dc', x1: 450, y1: 70, x2: 450, y2: 190, label: 'U_S2', subLabel: `${p.Us2} V` },
        { id: 'w_bot', type: 'wire', x1: 90, y1: 190, x2: 450, y2: 190 },
        { id: 'gnd', type: 'ground', x1: 270, y1: 190 },
      ],
      nodes: [
        { x: 90, y: 70, text: '①', liveExpr: 'v1' },
        { x: 270, y: 70, text: '②', liveExpr: 'v2' },
        { x: 450, y: 70, text: '③', liveExpr: 'v3' },
      ],
      annotations: [
        { x: 135, y: 225, text: '注：I 对 U_S1 为非关联方向，对 R₁、R₂、U_S2 为关联参考方向', color: '#475569' },
      ],
    }),
    buildNetlist: (p) => `* Ch1.1 Reference Direction & Power Balance
Vs1 1 0 DC ${p.Us1}
Vam 1 1a DC 0
R1 1a 2 ${p.R1}
R2 2 3 ${p.R2}
Vs2 3 0 DC ${p.Us2}
.op
.end`,
    plotKind: 'op_dashboard',
    metrics: [
      {
        label: '回路电流（顺时针参考方向）',
        symbol: 'I',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vam)'),
        getTheoryValue: (p) => (p.Us1 - p.Us2) / (p.R1 + p.R2),
      },
      {
        label: '节点②电位',
        symbol: 'V_2',
        unit: 'V',
        getSimValue: (bag) => opVal(bag.primary, 'v(2)'),
        getTheoryValue: (p) => p.Us1 - ((p.Us1 - p.Us2) / (p.R1 + p.R2)) * p.R1,
      },
      {
        label: '电源 U_S1 吸收功率 (-U_S1·I)',
        symbol: 'P_{S1}',
        unit: 'W',
        note: '负值表示实际发出功率',
        getSimValue: (bag, p) => {
          const i = opVal(bag.primary, 'i(vam)');
          return i === null ? null : -p.Us1 * i;
        },
        getTheoryValue: (p) => -p.Us1 * ((p.Us1 - p.Us2) / (p.R1 + p.R2)),
      },
      {
        label: '电源 U_S2 吸收功率 (+U_S2·I)',
        symbol: 'P_{S2}',
        unit: 'W',
        note: '正值表示被充电吸收功率',
        getSimValue: (bag, p) => {
          const i = opVal(bag.primary, 'i(vam)');
          return i === null ? null : p.Us2 * i;
        },
        getTheoryValue: (p) => p.Us2 * ((p.Us1 - p.Us2) / (p.R1 + p.R2)),
      },
      {
        label: '电阻总耗散功率 I²(R₁+R₂)',
        symbol: 'P_R',
        unit: 'W',
        getSimValue: (bag, p) => {
          const i = opVal(bag.primary, 'i(vam)');
          return i === null ? null : i * i * (p.R1 + p.R2);
        },
        getTheoryValue: (p) => {
          const i = (p.Us1 - p.Us2) / (p.R1 + p.R2);
          return i * i * (p.R1 + p.R2);
        },
      },
      {
        label: '全电路吸收功率代数和 ∑P',
        symbol: '\\sum P',
        unit: 'W',
        highlight: true,
        note: '恒等于 0，验证能量守恒',
        getSimValue: (bag, p) => {
          const i = opVal(bag.primary, 'i(vam)');
          if (i === null) return null;
          return -p.Us1 * i + p.Us2 * i + i * i * (p.R1 + p.R2);
        },
        getTheoryValue: () => 0,
      },
    ],
  },

  {
    id: 'ch1-resistor-vi',
    chapterId: 'ch1',
    code: '1.2',
    title: '线性电阻元件与欧姆定律伏安特性扫描',
    syllabusItems: ['（4）电路元件', '（5）电阻元件'],
    summary:
      '利用 ngspice .dc 直流扫描测绘线性电阻在正反向电压下的 U-I 伏安特性过原点直线与耗散功率抛物线。',
    theoryMarkdown:
      '线性定常电阻元件的伏安关系（VCR）服从**欧姆定律**。关联参考方向下 $u = R i$ 或 $i = G u$（电导 $G = 1/R$，单位西门子 $\\text{S}$）。在 $i$-$u$ 平面上，线性电阻的伏安特性是一条通过原点的直线，斜率为电导 $G = 1/R$；电阻是无源耗能元件，任何时刻吸收功率 $p = ui = i^2R = u^2/R \\ge 0$。',
    keyFormulas: [
      'u = R \\cdot i, \\quad i = G \\cdot u \\;\\left(G = \\frac{1}{R}\\right)',
      'p(u) = u \\cdot i = \\frac{u^2}{R} \\ge 0',
    ],
    teachingTips: [
      '减小电阻 R 时，观察伏安特性直线斜率 G = 1/R 变陡，相同电压下电流与功率急剧增大。',
      '将鼠标悬停在波形图上，可实时读取任意扫描电压点对应的电流 mA 值与瞬时功率 mW 值。',
    ],
    params: [
      { key: 'R', label: '被测线性电阻 R', unit: 'Ω', min: 50, max: 1000, step: 50, defaultValue: 200 },
      { key: 'Umax', label: '扫描最大电压 U_max', unit: 'V', min: 4, max: 20, step: 2, defaultValue: 10 },
    ],
    buildSchematic: (p) => ({
      width: 520,
      height: 230,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 130, y1: 55, x2: 130, y2: 175, label: 'U_S (DC Sweep)', subLabel: `-${p.Umax}V ~ +${p.Umax}V` },
        { id: 'w1', type: 'wire', x1: 130, y1: 55, x2: 370, y2: 55, currentArrow: 'i' },
        { id: 'r', type: 'resistor', x1: 370, y1: 55, x2: 370, y2: 175, label: 'R', subLabel: `${p.R} Ω`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'w2', type: 'wire', x1: 130, y1: 175, x2: 370, y2: 175 },
        { id: 'gnd', type: 'ground', x1: 250, y1: 175 },
      ],
      nodes: [{ x: 370, y: 55, text: 'u' }],
    }),
    buildNetlist: (p) => `* Ch1.2 Linear Resistor V-I Sweep
Vs 1 0 DC ${p.Umax}
Vam 1 2 DC 0
R1 2 0 ${p.R}
.dc Vs ${-p.Umax} ${p.Umax} ${(p.Umax / 25).toFixed(3)}
.end`,
    plotKind: 'dc_xy',
    xAxisLabel: '端电压 u (V)',
    yAxisLabel: '电流 i (mA) / 功率 p (mW)',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      const uVec = out?.vectors['__sweep__'];
      const iVec = out?.vectors['i(vam)'];
      if (!uVec || !iVec) return null;
      return {
        xValues: uVec.real,
        series: [
          {
            label: '电流 i(u)',
            unit: 'mA',
            color: '#38bdf8',
            values: iVec.real.map((i) => i * 1000),
            axis: 'left',
          },
          {
            label: '吸收功率 p(u)',
            unit: 'mW',
            color: '#fb7185',
            dashed: true,
            values: uVec.real.map((u, idx) => u * iVec.real[idx] * 1000),
            axis: 'right',
          },
        ],
        markers: [{ x: 0, label: `斜率 G = ${(1000 / p.R).toFixed(2)} mS`, color: '#94a3b8' }],
      };
    },
    metrics: [
      {
        label: '电导 G = 1/R',
        symbol: 'G',
        unit: 'mS',
        highlight: true,
        getSimValue: (bag) => {
          const uVec = bag.primary?.vectors['__sweep__'];
          const iVec = bag.primary?.vectors['i(vam)'];
          if (!uVec || !iVec || uVec.real.length < 2) return null;
          const idx = uVec.real.length - 1;
          return (iVec.real[idx] / uVec.real[idx]) * 1000;
        },
        getTheoryValue: (p) => 1000 / p.R,
      },
      {
        label: '正向最大电压处电流',
        symbol: 'I_{max}',
        unit: 'mA',
        getSimValue: (bag) => {
          const iVec = bag.primary?.vectors['i(vam)'];
          return iVec ? iVec.real[iVec.real.length - 1] * 1000 : null;
        },
        getTheoryValue: (p) => (p.Umax / p.R) * 1000,
      },
      {
        label: '最大电压处耗散功率',
        symbol: 'P_{max}',
        unit: 'mW',
        getSimValue: (bag, p) => {
          const iVec = bag.primary?.vectors['i(vam)'];
          return iVec ? p.Umax * iVec.real[iVec.real.length - 1] * 1000 : null;
        },
        getTheoryValue: (p) => ((p.Umax * p.Umax) / p.R) * 1000,
      },
    ],
  },

  {
    id: 'ch1-sources',
    chapterId: 'ch1',
    code: '1.3',
    title: '独立电压源与实际电源的外特性曲线',
    syllabusItems: ['（6）电压源和电流源'],
    summary:
      '对比理想电压源（内阻 R_S = 0）与实际电压源（含内阻 R_S）在负载电流变化时的端口电压外特性 U(I)。',
    theoryMarkdown:
      '**理想电压源**端电压恒等于 $U_S$，与流过的电流无关（外特性为水平直线）；理想电流源输出电流恒等于 $I_S$，与端电压无关。实际电源存在内阻 $R_S$，端口电压随输出电流增大而线性下降：$U = U_S - R_S I$。内阻 $R_S$ 越小，电源带负载稳压能力越强。',
    keyFormulas: [
      'U_{\\text{理想}} = U_S, \\quad U_{\\text{实际}} = U_S - R_S \\cdot I',
      'I_{sc} = \\frac{U_S}{R_S} \\;(\\text{短路电流})',
    ],
    teachingTips: [
      '调节电源内阻 R_S 从 0.5 Ω 增大到 5 Ω，观察实际电源外特性向下倾斜程度（电压调整率恶化）。',
    ],
    params: [
      { key: 'Us', label: '电源电动势 U_S', unit: 'V', min: 5, max: 24, step: 1, defaultValue: 12 },
      { key: 'Rs', label: '实际电源内阻 R_S', unit: 'Ω', min: 0.5, max: 6, step: 0.5, defaultValue: 2 },
      { key: 'Imax', label: '最大负载抽取电流 I_max', unit: 'A', min: 1, max: 4, step: 0.5, defaultValue: 2 },
    ],
    buildSchematic: (p) => ({
      width: 540,
      height: 240,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 120, y1: 95, x2: 120, y2: 195, label: 'U_S', subLabel: `${p.Us} V` },
        { id: 'rs', type: 'resistor', x1: 120, y1: 65, x2: 280, y2: 65, label: 'R_S (内阻)', subLabel: `${p.Rs} Ω`, currentArrow: 'I' },
        { id: 'w_l', type: 'wire', x1: 120, y1: 65, x2: 120, y2: 95 },
        { id: 'w_top', type: 'wire', x1: 280, y1: 65, x2: 400, y2: 65 },
        { id: 'iload', type: 'isource_dc', x1: 400, y1: 65, x2: 400, y2: 195, label: 'I_L (负载扫描)', subLabel: `0 ~ ${p.Imax} A`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'w_bot', type: 'wire', x1: 120, y1: 195, x2: 400, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 260, y1: 195 },
      ],
      nodes: [{ x: 330, y: 65, text: '端口 U' }],
    }),
    buildNetlist: (p) => `* Ch1.3 Ideal vs Practical Voltage Source
* Ideal branch
V_ideal 1 0 DC ${p.Us}
I_load1 1 0 DC ${p.Imax}
* Practical branch
V_prac 2 0 DC ${p.Us}
R_s 2 3 ${p.Rs}
I_load2 3 0 DC 0
B_mirror 3 0 I=I(V_sense)
* Use shared sweep source via V_sense
V_sense 1 1s DC 0
.dc I_load1 0 ${p.Imax} ${(p.Imax / 40).toFixed(4)}
.end`,
    // Wait: let's use clean linear CCCS F1 3 0 V_sense 1 instead of B source for rock-solid standard SPICE!
    // Even simpler: V_ideal 1 1s DC 0 -> Let's rewrite buildNetlist with standard F1 CCCS!
    plotKind: 'dc_xy',
    xAxisLabel: '输出电流 I (A)',
    yAxisLabel: '端口端电压 U (V)',
    traces: [
      { expr: 'v(1s)', label: '理想电压源端电压 U_理想', unit: 'V', color: '#4ade80', dashed: true },
      { expr: 'v(3)', label: '实际电源端电压 U = U_S - R_S·I', unit: 'V', color: '#38bdf8' },
    ],
    metrics: [
      {
        label: '开路电压 (I = 0)',
        symbol: 'U_{oc}',
        unit: 'V',
        getSimValue: (bag) => bag.primary?.vectors['v(3)']?.real[0] ?? null,
        getTheoryValue: (p) => p.Us,
      },
      {
        label: '满载输出端电压 (I = I_max)',
        symbol: 'U(I_{max})',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => {
          const v = bag.primary?.vectors['v(3)']?.real;
          return v ? v[v.length - 1] : null;
        },
        getTheoryValue: (p) => p.Us - p.Rs * p.Imax,
      },
      {
        label: '理论短路电流 U_S / R_S',
        symbol: 'I_{sc}',
        unit: 'A',
        getSimValue: (_bag, p) => p.Us / p.Rs,
        getTheoryValue: (p) => p.Us / p.Rs,
      },
    ],
  },

  {
    id: 'ch1-controlled-sources',
    chapterId: 'ch1',
    code: '1.4',
    title: '四种线性受控源（VCVS / VCCS / CCVS / CCCS）特性仿真',
    syllabusItems: ['（7）受控源'],
    summary:
      '自由切换四种受控源模型（E、G、H、F），观测控制支路对受控支路电压、电流及负载功率放大的控制规律。',
    theoryMarkdown:
      '**受控源**（非独立源）的输出电压或电流受电路中另一处的电压或电流控制，是晶体管、运算放大器等有源器件的核心电路模型。按控制量与受控量组合分为四类：\n- **VCVS (`E`)**：电压控制电压源 $u_2 = \\mu u_1$\n- **VCCS (`G`)**：电压控制电流源 $i_2 = g u_1$\n- **CCVS (`H`)**：电流控制电压源 $u_2 = r i_1$\n- **CCCS (`F`)**：电流控制电流源 $i_2 = \\beta i_1$',
    keyFormulas: [
      '\\text{VCVS: } U_{out} = \\mu U_1, \\quad \\text{VCCS: } U_{out} = -g U_1 R_L',
      '\\text{CCVS: } U_{out} = r I_1, \\quad \\text{CCCS: } U_{out} = -\\beta I_1 R_L',
    ],
    teachingTips: [
      '通过“受控源类型”下拉参数切换 E / G / H / F 四种受控源，观察右侧受控菱形符号与 SPICE 网表语句（E1/G1/H1/F1）的实时变化！',
      '比较输入控制侧吸收功率 P_in 与负载获得功率 P_L：受控源能够实现显著的功率放大（P_L >> P_in）。',
    ],
    params: [
      {
        type: 'select',
        key: 'csType',
        label: '受控源类型选择',
        defaultValue: 0,
        options: [
          { label: 'VCVS 电压控制电压源 (E: μ·U₁)', value: 0 },
          { label: 'VCCS 电压控制电流源 (G: g·U₁)', value: 1 },
          { label: 'CCVS 电流控制电压源 (H: r·I₁)', value: 2 },
          { label: 'CCCS 电流控制电流源 (F: β·I₁)', value: 3 },
        ],
      },
      { key: 'Us', label: '输入激励电压 U_S', unit: 'V', min: 1, max: 10, step: 0.5, defaultValue: 2 },
      { key: 'R1', label: '输入控制电阻 R₁', unit: 'Ω', min: 100, max: 2000, step: 100, defaultValue: 1000 },
      { key: 'gain', label: '控制系数 (μ / mS / kΩ / β)', unit: '', min: 1, max: 20, step: 1, defaultValue: 5 },
      { key: 'RL', label: '输出负载电阻 R_L', unit: 'Ω', min: 100, max: 2000, step: 100, defaultValue: 500 },
    ],
    buildSchematic: (p) => {
      const names = ['VCVS: μU₁', 'VCCS: gU₁', 'CCVS: rI₁', 'CCCS: βI₁'];
      const types = ['vcvs', 'vccs', 'ccvs', 'cccs'] as const;
      const idx = Math.round(p.csType) % 4;
      return {
        width: 560,
        height: 245,
        elements: [
          { id: 'vs', type: 'vsource_dc', x1: 75, y1: 65, x2: 75, y2: 185, label: 'U_S', subLabel: `${p.Us} V` },
          { id: 'w_in', type: 'wire', x1: 75, y1: 65, x2: 195, y2: 65, currentArrow: 'I₁' },
          { id: 'r1', type: 'resistor', x1: 195, y1: 65, x2: 195, y2: 185, label: 'R₁', subLabel: `${p.R1} Ω`, voltageMarks: { plus: '+', minus: '-' } },
          { id: 'w_b1', type: 'wire', x1: 75, y1: 185, x2: 195, y2: 185 },
          { id: 'gnd1', type: 'ground', x1: 135, y1: 185 },
          // Output stage
          { id: 'cs', type: types[idx], x1: 335, y1: 65, x2: 335, y2: 185, label: names[idx], subLabel: `k=${p.gain}` },
          { id: 'w_out', type: 'wire', x1: 335, y1: 65, x2: 470, y2: 65, currentArrow: 'I_L' },
          { id: 'rl', type: 'resistor', x1: 470, y1: 65, x2: 470, y2: 185, label: 'R_L', subLabel: `${p.RL} Ω`, voltageMarks: { plus: '+', minus: '-' } },
          { id: 'w_b2', type: 'wire', x1: 335, y1: 185, x2: 470, y2: 185 },
          { id: 'gnd2', type: 'ground', x1: 400, y1: 185 },
        ],
        nodes: [
          { x: 195, y: 65, text: '控制端 U₁', liveExpr: 'v1' },
          { x: 470, y: 65, text: '输出 U_out', liveExpr: 'vout' },
        ],
        annotations: [
          { x: 225, y: 128, text: '受控耦合 ⟹', color: '#b45309', bold: true },
        ],
      };
    },
    buildNetlist: (p) => {
      const idx = Math.round(p.csType) % 4;
      let csLine = `E1 out 0 1 0 ${p.gain}`;
      if (idx === 1) {
        // g in mS -> S = gain * 1e-3; current from 0 to out so V(out) > 0 for clarity or standard out->0
        csLine = `G1 0 out 1 0 ${p.gain * 1e-3}`;
      } else if (idx === 2) {
        // r in kOhm -> Ohm = gain * 1000
        csLine = `H1 out 0 Vsense ${p.gain * 1000}`;
      } else if (idx === 3) {
        // beta dimensionless, current pushed into out node
        csLine = `F1 0 out Vsense ${p.gain}`;
      }
      return `* Ch1.4 Controlled Sources (E / G / H / F)
Vs 1s 0 DC ${p.Us}
Vsense 1s 1 DC 0
R1 1 0 ${p.R1}
${csLine}
VamL out outL DC 0
RL outL 0 ${p.RL}
.op
.end`;
    },
    plotKind: 'op_dashboard',
    metrics: [
      {
        label: '控制电压 U₁',
        symbol: 'U_1',
        unit: 'V',
        getSimValue: (bag) => opVal(bag.primary, 'v(1)'),
        getTheoryValue: (p) => p.Us,
      },
      {
        label: '控制电流 I₁',
        symbol: 'I_1',
        unit: 'mA',
        getSimValue: (bag) => opVal(bag.primary, 'i(vsense)', 1000),
        getTheoryValue: (p) => (p.Us / p.R1) * 1000,
      },
      {
        label: '负载输出电压 U_out',
        symbol: 'U_{out}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'v(out)'),
        getTheoryValue: (p) => {
          const idx = Math.round(p.csType) % 4;
          const i1 = p.Us / p.R1;
          if (idx === 0) return p.gain * p.Us;
          if (idx === 1) return p.gain * 1e-3 * p.Us * p.RL;
          if (idx === 2) return p.gain * 1000 * i1;
          return p.gain * i1 * p.RL;
        },
      },
      {
        label: '输入侧消耗功率 P_in',
        symbol: 'P_{in}',
        unit: 'mW',
        getSimValue: (bag, p) => {
          const i1 = opVal(bag.primary, 'i(vsense)');
          return i1 === null ? null : p.Us * i1 * 1000;
        },
        getTheoryValue: (p) => ((p.Us * p.Us) / p.R1) * 1000,
      },
      {
        label: '负载获得功率 P_L',
        symbol: 'P_L',
        unit: 'mW',
        highlight: true,
        note: '对比 P_in 体现有源功率放大作用',
        getSimValue: (bag) => {
          const v = opVal(bag.primary, 'v(out)');
          const i = opVal(bag.primary, 'i(vaml)');
          return v !== null && i !== null ? v * i * 1000 : null;
        },
      },
    ],
  },

  {
    id: 'ch1-kirchhoff',
    chapterId: 'ch1',
    code: '1.5',
    title: '基尔霍夫电流定律 (KCL) 与电压定律 (KVL) 验证',
    syllabusItems: ['（8）基尔霍夫定律'],
    summary:
      '在经典双电源三支路电路中实时求解各支路电流与元件压降，严格验证节点 ∑i = 0 与任意回路 ∑u = 0。',
    theoryMarkdown:
      '**基尔霍夫定律**揭示了集总参数电路的拓扑约束，与元件性质无关：\n1. **KCL（电流定律）**：任一时刻，流入任一节点（或封闭面）的支路电流代数和等于零：$\\sum i_k = 0$（对节点 A：$I_1 + I_2 - I_3 = 0$）。\n2. **KVL（电压定律）**：任一时刻，沿任一闭合回路绕行一周，各支路电压代数和等于零：$\\sum u_k = 0$（左网孔：$R_1 I_1 + R_3 I_3 - U_{S1} = 0$）。',
    keyFormulas: [
      '\\text{KCL (节点 A): } I_1 + I_2 - I_3 = 0',
      '\\text{KVL (网孔 I): } R_1 I_1 + R_3 I_3 - U_{S1} = 0, \\quad \\text{KVL (网孔 II): } R_2 I_2 + R_3 I_3 - U_{S2} = 0',
    ],
    teachingTips: [
      '任意拖动 U_S1、U_S2 或三个电阻阻值，观察下方验证表中 KCL 残差（I₁+I₂-I₃）与 KVL 回路电压残差始终精确为 0！',
    ],
    params: [
      { key: 'Us1', label: '左支路电压源 U_S1', unit: 'V', min: 2, max: 30, step: 1, defaultValue: 14 },
      { key: 'Us2', label: '右支路电压源 U_S2', unit: 'V', min: 2, max: 30, step: 1, defaultValue: 7 },
      { key: 'R1', label: '左支路电阻 R₁', unit: 'Ω', min: 1, max: 20, step: 1, defaultValue: 4 },
      { key: 'R2', label: '右支路电阻 R₂', unit: 'Ω', min: 1, max: 20, step: 1, defaultValue: 2 },
      { key: 'R3', label: '中间支路电阻 R₃', unit: 'Ω', min: 1, max: 20, step: 1, defaultValue: 4 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 255,
      elements: [
        { id: 'vs1', type: 'vsource_dc', x1: 85, y1: 75, x2: 85, y2: 200, label: 'U_S1', subLabel: `${p.Us1} V` },
        { id: 'r1', type: 'resistor', x1: 85, y1: 75, x2: 280, y2: 75, label: 'R₁', subLabel: `${p.R1} Ω`, currentArrow: 'I₁' },
        { id: 'r2', type: 'resistor', x1: 475, y1: 75, x2: 280, y2: 75, label: 'R₂', subLabel: `${p.R2} Ω`, currentArrow: 'I₂' },
        { id: 'vs2', type: 'vsource_dc', x1: 475, y1: 75, x2: 475, y2: 200, label: 'U_S2', subLabel: `${p.Us2} V` },
        { id: 'r3', type: 'resistor', x1: 280, y1: 75, x2: 280, y2: 200, label: 'R₃', subLabel: `${p.R3} Ω`, currentArrow: 'I₃' },
        { id: 'wb', type: 'wire', x1: 85, y1: 200, x2: 475, y2: 200 },
        { id: 'gnd', type: 'ground', x1: 280, y1: 200 },
      ],
      nodes: [
        { x: 280, y: 75, text: '节点 A', liveExpr: 'va' },
      ],
      annotations: [
        { x: 150, y: 145, text: '↻ 网孔 I', color: '#2563eb', bold: true },
        { x: 350, y: 145, text: '↺ 网孔 II', color: '#2563eb', bold: true },
      ],
    }),
    buildNetlist: (p) => `* Ch1.5 Kirchhoff KCL & KVL Verification
Vs1 1 0 DC ${p.Us1}
Vam1 1 1a DC 0
R1 1a a ${p.R1}
Vs2 2 0 DC ${p.Us2}
Vam2 2 2a DC 0
R2 2a a ${p.R2}
Vam3 a 3a DC 0
R3 3a 0 ${p.R3}
.op
.end`,
    plotKind: 'op_dashboard',
    metrics: [
      {
        label: '支路电流 I₁（流入节点 A）',
        symbol: 'I_1',
        unit: 'A',
        getSimValue: (bag) => opVal(bag.primary, 'i(vam1)'),
        getTheoryValue: (p) => {
          const va = (p.Us1 / p.R1 + p.Us2 / p.R2) / (1 / p.R1 + 1 / p.R2 + 1 / p.R3);
          return (p.Us1 - va) / p.R1;
        },
      },
      {
        label: '支路电流 I₂（流入节点 A）',
        symbol: 'I_2',
        unit: 'A',
        getSimValue: (bag) => opVal(bag.primary, 'i(vam2)'),
        getTheoryValue: (p) => {
          const va = (p.Us1 / p.R1 + p.Us2 / p.R2) / (1 / p.R1 + 1 / p.R2 + 1 / p.R3);
          return (p.Us2 - va) / p.R2;
        },
      },
      {
        label: '支路电流 I₃（流出节点 A）',
        symbol: 'I_3',
        unit: 'A',
        getSimValue: (bag) => opVal(bag.primary, 'i(vam3)'),
        getTheoryValue: (p) => {
          const va = (p.Us1 / p.R1 + p.Us2 / p.R2) / (1 / p.R1 + 1 / p.R2 + 1 / p.R3);
          return va / p.R3;
        },
      },
      {
        label: '节点 A 电位 U_A',
        symbol: 'U_A',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'v(a)'),
        getTheoryValue: (p) =>
          (p.Us1 / p.R1 + p.Us2 / p.R2) / (1 / p.R1 + 1 / p.R2 + 1 / p.R3),
      },
      {
        label: 'KCL 检验：I₁ + I₂ - I₃',
        symbol: '\\sum I_A',
        unit: 'A',
        highlight: true,
        note: '等于 0 验证 KCL 成立',
        getSimValue: (bag) => {
          const i1 = opVal(bag.primary, 'i(vam1)') ?? 0;
          const i2 = opVal(bag.primary, 'i(vam2)') ?? 0;
          const i3 = opVal(bag.primary, 'i(vam3)') ?? 0;
          return i1 + i2 - i3;
        },
        getTheoryValue: () => 0,
      },
      {
        label: '网孔 I KVL 检验：R₁I₁ + R₃I₃ - U_S1',
        symbol: '\\sum U_{\\text{I}}',
        unit: 'V',
        highlight: true,
        note: '等于 0 验证 KVL 成立',
        getSimValue: (bag, p) => {
          const i1 = opVal(bag.primary, 'i(vam1)') ?? 0;
          const i3 = opVal(bag.primary, 'i(vam3)') ?? 0;
          return p.R1 * i1 + p.R3 * i3 - p.Us1;
        },
        getTheoryValue: () => 0,
      },
    ],
  },

  // ==================== 第二章 ====================
  {
    id: 'ch2-series-parallel',
    chapterId: 'ch2',
    code: '2.1',
    title: '电阻串联分压、并联分流与混联等效变换',
    syllabusItems: ['（1）电路的等效变换', '（2）电阻的串联和并联'],
    summary:
      '同步运行混联原电路与单等效电阻 R_eq 电路，验证端口等效性以及串联分压公式、并联分流公式。',
    theoryMarkdown:
      '两个一端口网络若具有完全相同的端口伏安关系（VCR），则称它们**对外等效**。对于 $R_1$ 与 $(R_2 \\parallel R_3)$ 串联组成的混联网络：\n- 并联等效：$R_{23} = \\frac{R_2 R_3}{R_2 + R_3}$，支路分流反比于电阻 $I_2 = \\frac{R_3}{R_2+R_3} I$\n- 串联总等效电阻：$R_{eq} = R_1 + R_{23}$，串联分压正比于电阻 $U_{23} = \\frac{R_{23}}{R_1+R_{23}} U_S$',
    keyFormulas: [
      'R_{eq} = R_1 + \\frac{R_2 R_3}{R_2 + R_3}',
      'U_{ab} = \\frac{R_2 \\parallel R_3}{R_{eq}} U_S, \\quad I_2 = \\frac{R_3}{R_2 + R_3} I, \\quad I_3 = \\frac{R_2}{R_2 + R_3} I',
    ],
    teachingTips: [
      '观察下方双电路对比表：无论 R₁、R₂、R₃ 如何调节，原混联电路与等效单电阻电路的端口输入电流 I_in 始终完全一致！',
    ],
    params: [
      { key: 'Us', label: '端口输入电压 U_S', unit: 'V', min: 6, max: 36, step: 2, defaultValue: 24 },
      { key: 'R1', label: '串联干路电阻 R₁', unit: 'Ω', min: 2, max: 30, step: 2, defaultValue: 6 },
      { key: 'R2', label: '并联支路电阻 R₂', unit: 'Ω', min: 2, max: 30, step: 2, defaultValue: 10 },
      { key: 'R3', label: '并联支路电阻 R₃', unit: 'Ω', min: 2, max: 30, step: 2, defaultValue: 15 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 250,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 85, y1: 65, x2: 85, y2: 195, label: 'U_S', subLabel: `${p.Us} V` },
        { id: 'r1', type: 'resistor', x1: 85, y1: 65, x2: 270, y2: 65, label: 'R₁', subLabel: `${p.R1} Ω`, currentArrow: 'I' },
        { id: 'w_sp1', type: 'wire', x1: 270, y1: 65, x2: 455, y2: 65 },
        { id: 'r2', type: 'resistor', x1: 315, y1: 65, x2: 315, y2: 195, label: 'R₂', subLabel: `${p.R2} Ω`, currentArrow: 'I₂' },
        { id: 'r3', type: 'resistor', x1: 455, y1: 65, x2: 455, y2: 195, label: 'R₃', subLabel: `${p.R3} Ω`, currentArrow: 'I₃' },
        { id: 'wb', type: 'wire', x1: 85, y1: 195, x2: 455, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 200, y1: 195 },
      ],
      nodes: [{ x: 270, y: 65, text: '节点 a', liveExpr: 'va' }],
    }),
    buildNetlist: (p) => `* Ch2.1 Original Series-Parallel Network
Vs 1 0 DC ${p.Us}
Vam1 1 1a DC 0
R1 1a a ${p.R1}
Vam2 a 2a DC 0
R2 2a 0 ${p.R2}
Vam3 a 3a DC 0
R3 3a 0 ${p.R3}
.op
.end`,
    extraRuns: [
      {
        id: 'eq',
        title: '单等效电阻 R_eq 电路',
        buildNetlist: (p) => {
          const req = p.R1 + (p.R2 * p.R3) / (p.R2 + p.R3);
          return `* Equivalent R_eq circuit
Vs 1 0 DC ${p.Us}
VamEq 1 2 DC 0
Req 2 0 ${req}
.op
.end`;
        },
      },
    ],
    plotKind: 'op_dashboard',
    comparisonTable: {
      headers: ['对比项目', '混联原电路 (ngspice)', 'R_eq 等效电路 (ngspice)', '等效结论'],
      rows: (bag, p) => {
        const iOrig = opVal(bag.primary, 'i(vam1)') ?? 0;
        const iEq = opVal(bag.extras['eq'], 'i(vameq)') ?? 0;
        const req = p.R1 + (p.R2 * p.R3) / (p.R2 + p.R3);
        return [
          ['等效输入电阻 R_eq', `${(p.Us / iOrig).toFixed(4)} Ω`, `${req.toFixed(4)} Ω`, '完全一致'],
          ['端口干路电流 I', `${iOrig.toFixed(4)} A`, `${iEq.toFixed(4)} A`, '对外完全等效'],
          ['电源发出总功率 P_S', `${(p.Us * iOrig).toFixed(3)} W`, `${(p.Us * iEq).toFixed(3)} W`, '完全一致'],
        ];
      },
    },
    metrics: [
      {
        label: '总等效电阻 R_eq',
        symbol: 'R_{eq}',
        unit: 'Ω',
        highlight: true,
        getSimValue: (bag, p) => {
          const i = opVal(bag.primary, 'i(vam1)');
          return i ? p.Us / i : null;
        },
        getTheoryValue: (p) => p.R1 + (p.R2 * p.R3) / (p.R2 + p.R3),
      },
      {
        label: '并联部分分压 U_a',
        symbol: 'U_a',
        unit: 'V',
        getSimValue: (bag) => opVal(bag.primary, 'v(a)'),
        getTheoryValue: (p) => {
          const r23 = (p.R2 * p.R3) / (p.R2 + p.R3);
          return (r23 / (p.R1 + r23)) * p.Us;
        },
      },
      {
        label: '支路 R₂ 分流 I₂',
        symbol: 'I_2',
        unit: 'A',
        getSimValue: (bag) => opVal(bag.primary, 'i(vam2)'),
        getTheoryValue: (p) => {
          const req = p.R1 + (p.R2 * p.R3) / (p.R2 + p.R3);
          const i = p.Us / req;
          return (p.R3 / (p.R2 + p.R3)) * i;
        },
      },
      {
        label: '支路 R₃ 分流 I₃',
        symbol: 'I_3',
        unit: 'A',
        getSimValue: (bag) => opVal(bag.primary, 'i(vam3)'),
        getTheoryValue: (p) => {
          const req = p.R1 + (p.R2 * p.R3) / (p.R2 + p.R3);
          const i = p.Us / req;
          return (p.R2 / (p.R2 + p.R3)) * i;
        },
      },
    ],
  },

  {
    id: 'ch2-ydelta',
    chapterId: 'ch2',
    code: '2.2',
    title: '电阻 Y 形连接与 Δ 形连接的等效变换（不平衡惠斯通电桥）',
    syllabusItems: ['（3）电阻的 Y 形连接和 Δ 形连接的等效变换'],
    summary:
      '针对无法直接串并联化简的不平衡电桥，利用 Δ→Y 变换将其化为简单串并联网络，并用 ngspice 双网表同步核验！',
    theoryMarkdown:
      '非平衡电桥中各电阻既非串联也非并联。将上半部三角形网络 $(R_{12}, R_{23}, R_{31})$ 等效变换为星形（Y形）网络 $(R_1, R_2, R_3)$ 后，电路即化为简单的串并联结构！\n- **$\\Delta \\to \\text{Y}$ 变换公式**：星形电阻等于相邻两三角形电阻乘积除以三角形三电阻之和。特别地，若三电阻对称相等，则 $R_Y = \\frac{1}{3} R_\\Delta$。',
    keyFormulas: [
      'R_1 = \\frac{R_{12} R_{31}}{R_{12}+R_{23}+R_{31}}, \\quad R_2 = \\frac{R_{12} R_{23}}{R_{12}+R_{23}+R_{31}}, \\quad R_3 = \\frac{R_{23} R_{31}}{R_{12}+R_{23}+R_{31}}',
      'R_{eq} = R_1 + \\big[(R_2 + R_4) \\parallel (R_3 + R_5)\\big]',
    ],
    teachingTips: [
      '当满足电桥平衡条件 R₁₂·R₅ = R₃₁·R₄ 时，观察桥臂检流电流 I_bridge 变为 0 A！',
      '打破平衡条件时，对比下方“原电桥电路”与“Δ→Y 变换后电路”的 ngspice 仿真结果：端口总电流精确相等！',
    ],
    params: [
      { key: 'Us', label: '电桥激励电压 U_S', unit: 'V', min: 5, max: 30, step: 1, defaultValue: 12 },
      { key: 'R12', label: '上左桥臂 R₁₂ (Δ边)', unit: 'Ω', min: 2, max: 30, step: 1, defaultValue: 6 },
      { key: 'R31', label: '上右桥臂 R₃₁ (Δ边)', unit: 'Ω', min: 2, max: 30, step: 1, defaultValue: 12 },
      { key: 'R23', label: '中间桥臂 R₂₃ (Δ底边)', unit: 'Ω', min: 2, max: 30, step: 1, defaultValue: 6 },
      { key: 'R4', label: '下左桥臂 R₄', unit: 'Ω', min: 2, max: 30, step: 1, defaultValue: 8 },
      { key: 'R5', label: '下右桥臂 R₅', unit: 'Ω', min: 2, max: 30, step: 1, defaultValue: 4 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 275,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 85, y1: 60, x2: 85, y2: 235, label: 'U_S', subLabel: `${p.Us} V` },
        { id: 'wt', type: 'wire', x1: 85, y1: 35, x2: 330, y2: 35, currentArrow: 'I_in' },
        { id: 'wl', type: 'wire', x1: 85, y1: 35, x2: 85, y2: 60 },
        { id: 'r12', type: 'resistor', x1: 330, y1: 35, x2: 220, y2: 135, label: 'R₁₂', subLabel: `${p.R12}Ω` },
        { id: 'r31', type: 'resistor', x1: 330, y1: 35, x2: 440, y2: 135, label: 'R₃₁', subLabel: `${p.R31}Ω` },
        { id: 'r23', type: 'resistor', x1: 220, y1: 135, x2: 440, y2: 135, label: 'R₂₃', subLabel: `${p.R23}Ω`, currentArrow: 'I_桥' },
        { id: 'r4', type: 'resistor', x1: 220, y1: 135, x2: 330, y2: 235, label: 'R₄', subLabel: `${p.R4}Ω` },
        { id: 'r5', type: 'resistor', x1: 440, y1: 135, x2: 330, y2: 235, label: 'R₅', subLabel: `${p.R5}Ω` },
        { id: 'wb', type: 'wire', x1: 85, y1: 235, x2: 330, y2: 235 },
        { id: 'gnd', type: 'ground', x1: 330, y1: 235 },
      ],
      nodes: [
        { x: 330, y: 35, text: '①' },
        { x: 220, y: 135, text: '②', liveExpr: 'v2' },
        { x: 440, y: 135, text: '③', liveExpr: 'v3' },
      ],
    }),
    buildNetlist: (p) => `* Ch2.2 Original Delta Bridge Circuit
Vs 1s 0 DC ${p.Us}
VamIn 1s 1 DC 0
R12 1 2 ${p.R12}
R31 1 3 ${p.R31}
VamBr 2 2b DC 0
R23 2b 3 ${p.R23}
R4 2 0 ${p.R4}
R5 3 0 ${p.R5}
.op
.end`,
    extraRuns: [
      {
        id: 'y_eq',
        title: 'Δ→Y 等效变换后电路',
        buildNetlist: (p) => {
          const sum = p.R12 + p.R23 + p.R31;
          const r1 = (p.R12 * p.R31) / sum;
          const r2 = (p.R12 * p.R23) / sum;
          const r3 = (p.R23 * p.R31) / sum;
          return `* Y-Transformed Bridge
Vs 1s 0 DC ${p.Us}
VamY 1s 1 DC 0
Ry1 1 c ${r1}
Ry2 c 2 ${r2}
Ry3 c 3 ${r3}
R4 2 0 ${p.R4}
R5 3 0 ${p.R5}
.op
.end`;
        },
      },
    ],
    plotKind: 'op_dashboard',
    comparisonTable: {
      headers: ['物理量', '原 Δ 电桥仿真值', 'Δ→Y 变换后仿真值', '验证结果'],
      rows: (bag, p) => {
        const iOrig = opVal(bag.primary, 'i(vamin)') ?? 0;
        const iY = opVal(bag.extras['y_eq'], 'i(vamy)') ?? 0;
        const v2Orig = opVal(bag.primary, 'v(2)') ?? 0;
        const v2Y = opVal(bag.extras['y_eq'], 'v(2)') ?? 0;
        const v3Orig = opVal(bag.primary, 'v(3)') ?? 0;
        const v3Y = opVal(bag.extras['y_eq'], 'v(3)') ?? 0;
        return [
          ['端口总电流 I_in', `${iOrig.toFixed(5)} A`, `${iY.toFixed(5)} A`, '完全相等'],
          ['等效输入电阻 R_eq', `${(p.Us / iOrig).toFixed(4)} Ω`, `${(p.Us / iY).toFixed(4)} Ω`, '完全相等'],
          ['外节点②电位 V₂', `${v2Orig.toFixed(4)} V`, `${v2Y.toFixed(4)} V`, '节点电位不变'],
          ['外节点③电位 V₃', `${v3Orig.toFixed(4)} V`, `${v3Y.toFixed(4)} V`, '节点电位不变'],
        ];
      },
    },
    metrics: [
      {
        label: 'Y形等效电阻 R₁（上顶点）',
        symbol: 'R_{Y1}',
        unit: 'Ω',
        getSimValue: (_bag, p) => (p.R12 * p.R31) / (p.R12 + p.R23 + p.R31),
        getTheoryValue: (p) => (p.R12 * p.R31) / (p.R12 + p.R23 + p.R31),
      },
      {
        label: '电桥总输入等效电阻 R_eq',
        symbol: 'R_{eq}',
        unit: 'Ω',
        highlight: true,
        getSimValue: (bag, p) => {
          const i = opVal(bag.primary, 'i(vamin)');
          return i ? p.Us / i : null;
        },
        getTheoryValue: (p) => {
          const sum = p.R12 + p.R23 + p.R31;
          const r1 = (p.R12 * p.R31) / sum;
          const r2 = (p.R12 * p.R23) / sum;
          const r3 = (p.R23 * p.R31) / sum;
          return r1 + ((r2 + p.R4) * (r3 + p.R5)) / (r2 + p.R4 + r3 + p.R5);
        },
      },
      {
        label: '桥臂电流 I_桥 (②→③)',
        symbol: 'I_{\\text{桥}}',
        unit: 'A',
        highlight: true,
        note: '电桥平衡时等于 0 A',
        getSimValue: (bag) => opVal(bag.primary, 'i(vambr)'),
      },
    ],
  },

  {
    id: 'ch2-source-transform',
    chapterId: 'ch2',
    code: '2.3',
    title: '电源串并联与实际电源两种模型等效变换',
    syllabusItems: [
      '（4）电压源、电流源的串联和并联',
      '（5）实际电源的两种模型及其等效变换',
    ],
    summary:
      '演示电压源串联合成及“实际电压源模型 (U_S 串联 R_S) ⇔ 实际电流源模型 (I_S 并联 R_S)”等效变换，深刻理解“对外等效、对内不等效”。',
    theoryMarkdown:
      '1. **电源串并联**：多个电压源串联等效为代数和 $U_S = \\sum U_{Sk}$；多个电流源并联等效为代数和 $I_S = \\sum I_{Sk}$。\n2. **实际电源两种模型等效变换**：电压源 $U_S$ 串联内阻 $R_S$ 可与电流源 $I_S$ 并联内阻 $R_S$ 相互等效，满足 $U_S = R_S I_S$。注意：等效仅对**外部负载 $R_L$** 成立，电源**内部电阻 $R_S$ 消耗的功率并不相等**！',
    keyFormulas: [
      'I_S = \\frac{U_{S1} + U_{S2}}{R_S}, \\quad R_{S\\text{(并)}} = R_{S\\text{(串)}}',
      'U_L = \\frac{R_L}{R_S + R_L}(U_{S1}+U_{S2}) \\;\\;(\\text{两种模型对负载完全一致})',
    ],
    teachingTips: [
      '重点观察对比表最后一行：当负载开路（R_L 很大）时，电压源模型内阻几乎不耗能，而电流源模型的内阻 R_S 却持续消耗 I_S²·R_S 功率！这就是“对外等效、对内不等效”的经典体现。',
    ],
    params: [
      { key: 'Us1', label: '串联分电压源 U_S1', unit: 'V', min: 2, max: 20, step: 1, defaultValue: 10 },
      { key: 'Us2', label: '串联分电压源 U_S2', unit: 'V', min: 0, max: 20, step: 1, defaultValue: 5 },
      { key: 'Rs', label: '电源内阻 R_S', unit: 'Ω', min: 1, max: 20, step: 1, defaultValue: 5 },
      { key: 'RL', label: '外部负载电阻 R_L', unit: 'Ω', min: 1, max: 50, step: 1, defaultValue: 10 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 245,
      elements: [
        { id: 'vs1', type: 'vsource_dc', x1: 75, y1: 60, x2: 75, y2: 125, label: 'U_S1', subLabel: `${p.Us1}V` },
        { id: 'vs2', type: 'vsource_dc', x1: 75, y1: 125, x2: 75, y2: 195, label: 'U_S2', subLabel: `${p.Us2}V` },
        { id: 'rs', type: 'resistor', x1: 75, y1: 60, x2: 215, y2: 60, label: 'R_S', subLabel: `${p.Rs}Ω`, currentArrow: 'I_L' },
        { id: 'rl1', type: 'resistor', x1: 215, y1: 60, x2: 215, y2: 195, label: 'R_L', subLabel: `${p.RL}Ω` },
        { id: 'wb1', type: 'wire', x1: 75, y1: 195, x2: 215, y2: 195 },
        { id: 'g1', type: 'ground', x1: 145, y1: 195 },
        // Right side Norton Equivalent
        { id: 'is', type: 'isource_dc', x1: 340, y1: 195, x2: 340, y2: 60, label: 'I_S', subLabel: `${((p.Us1 + p.Us2) / p.Rs).toFixed(2)}A` },
        { id: 'wt2', type: 'wire', x1: 340, y1: 60, x2: 500, y2: 60 },
        { id: 'rs2', type: 'resistor', x1: 415, y1: 60, x2: 415, y2: 195, label: 'R_S', subLabel: `${p.Rs}Ω` },
        { id: 'rl2', type: 'resistor', x1: 500, y1: 60, x2: 500, y2: 195, label: 'R_L', subLabel: `${p.RL}Ω` },
        { id: 'wb2', type: 'wire', x1: 340, y1: 195, x2: 500, y2: 195 },
        { id: 'g2', type: 'ground', x1: 420, y1: 195 },
      ],
      annotations: [
        { x: 255, y: 130, text: '⟺', fontSize: 22, bold: true, color: '#2563eb' },
        { x: 243, y: 152, text: '等效变换', fontSize: 11, color: '#2563eb', bold: true },
      ],
    }),
    buildNetlist: (p) => `* Ch2.3 Voltage Source Model
Vs1 1 1m DC ${p.Us1}
Vs2 1m 0 DC ${p.Us2}
Rs 1 2 ${p.Rs}
VamV 2 2L DC 0
RL 2L 0 ${p.RL}
.op
.end`,
    extraRuns: [
      {
        id: 'norton',
        title: '等效电流源模型',
        buildNetlist: (p) => {
          const isVal = (p.Us1 + p.Us2) / p.Rs;
          return `* Ch2.3 Current Source Model
Is 0 2 DC ${isVal}
Rs 2 0 ${p.Rs}
VamI 2 2L DC 0
RL 2L 0 ${p.RL}
.op
.end`;
        },
      },
    ],
    plotKind: 'op_dashboard',
    comparisonTable: {
      headers: ['对比物理量', '实际电压源模型', '实际电流源模型', '辩证分析结论'],
      rows: (bag, p) => {
        const uV = opVal(bag.primary, 'v(2)') ?? 0;
        const iV = opVal(bag.primary, 'i(vamv)') ?? 0;
        const uI = opVal(bag.extras['norton'], 'v(2)') ?? 0;
        const iI = opVal(bag.extras['norton'], 'i(vami)') ?? 0;
        const pRs_V = iV * iV * p.Rs;
        const pRs_I = (uI * uI) / p.Rs;
        return [
          ['外部负载电压 U_L', `${uV.toFixed(4)} V`, `${uI.toFixed(4)} V`, '对外完全等效'],
          ['外部负载电流 I_L', `${iV.toFixed(4)} A`, `${iI.toFixed(4)} A`, '对外完全等效'],
          ['外部负载功率 P_L', `${(uV * iV).toFixed(4)} W`, `${(uI * iI).toFixed(4)} W`, '对外完全等效'],
          ['电源内阻 R_S 消耗功率', `${pRs_V.toFixed(4)} W`, `${pRs_I.toFixed(4)} W`, '对内不等效！'],
        ];
      },
    },
    metrics: [
      {
        label: '等效电流源电流 I_S',
        symbol: 'I_S',
        unit: 'A',
        getSimValue: (_bag, p) => (p.Us1 + p.Us2) / p.Rs,
        getTheoryValue: (p) => (p.Us1 + p.Us2) / p.Rs,
      },
      {
        label: '负载端电压 U_L',
        symbol: 'U_L',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'v(2)'),
        getTheoryValue: (p) => ((p.Us1 + p.Us2) * p.RL) / (p.Rs + p.RL),
      },
      {
        label: '负载电流 I_L',
        symbol: 'I_L',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vamv)'),
        getTheoryValue: (p) => (p.Us1 + p.Us2) / (p.Rs + p.RL),
      },
    ],
  },

  {
    id: 'ch2-input-resistance',
    chapterId: 'ch2',
    code: '2.4',
    title: '含受控源一端口网络的输入电阻（含负电阻现象演示）',
    syllabusItems: ['（6）输入电阻'],
    summary:
      '采用外加测试电压源法求含受控源无独立源一端口网络的输入电阻 R_in = U_0 / I_0，并演示有源网络独有的负输入电阻特性！',
    theoryMarkdown:
      '不含独立源的一端口网络，若内部含有**受控源**，不能直接用串并联公式求等效电阻，必须采用**外加电源法**（加压求流或加流求压）：在端口施加测试电压 $U_0$，求出流入端口的电流 $I_0$，则输入电阻 $R_{in} = \\frac{U_0}{I_0}$。\n本电路中：$I_0 = \\frac{U_0 - \\mu U_0}{R_1} + \\frac{U_0}{R_2}$，故 $R_{in} = \\frac{1}{\\frac{1-\\mu}{R_1} + \\frac{1}{R_2}}$。当受控增益 $\\mu > 1 + \\frac{R_1}{R_2}$ 时，会出现 **$R_{in} < 0$（负输入电阻，向测试源回馈能量）**！',
    keyFormulas: [
      'R_{in} = \\frac{U_0}{I_0} = \\frac{R_1 R_2}{(1 - \\mu) R_2 + R_1}',
    ],
    teachingTips: [
      '默认 μ = 0.5 时 R_in > 0（耗能特性）；尝试将受控系数 μ 调大至 2.5，观察 I_0 变为负值、输入电阻 R_in 变为负电阻！',
    ],
    params: [
      { key: 'U0', label: '端口测试电压 U₀', unit: 'V', min: 2, max: 20, step: 2, defaultValue: 10 },
      { key: 'R1', label: '支路电阻 R₁', unit: 'Ω', min: 10, max: 100, step: 10, defaultValue: 20 },
      { key: 'R2', label: '并联电阻 R₂', unit: 'Ω', min: 10, max: 100, step: 10, defaultValue: 40 },
      { key: 'mu', label: 'VCVS 控制系数 μ', unit: '', min: -1, max: 3, step: 0.25, defaultValue: 0.5 },
    ],
    buildSchematic: (p) => ({
      width: 540,
      height: 245,
      elements: [
        { id: 'v0', type: 'vsource_dc', x1: 95, y1: 65, x2: 95, y2: 195, label: '测试源 U₀', subLabel: `${p.U0} V` },
        { id: 'wt', type: 'wire', x1: 95, y1: 65, x2: 245, y2: 65, currentArrow: 'I₀' },
        { id: 'r2', type: 'resistor', x1: 245, y1: 65, x2: 245, y2: 195, label: 'R₂', subLabel: `${p.R2} Ω`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'r1', type: 'resistor', x1: 245, y1: 65, x2: 430, y2: 65, label: 'R₁', subLabel: `${p.R1} Ω` },
        { id: 'e1', type: 'vcvs', x1: 430, y1: 65, x2: 430, y2: 195, label: 'μ·U₀', subLabel: `μ=${p.mu}` },
        { id: 'wb', type: 'wire', x1: 95, y1: 195, x2: 430, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 245, y1: 195 },
      ],
      nodes: [{ x: 245, y: 65, text: '端口 a (U₀)' }],
    }),
    buildNetlist: (p) => `* Ch2.4 Input Resistance with VCVS
V0 1s 0 DC ${p.U0}
Vam0 1s 1 DC 0
R2 1 0 ${p.R2}
R1 1 2 ${p.R1}
E1 2 0 1 0 ${p.mu}
.op
.end`,
    plotKind: 'op_dashboard',
    metrics: [
      {
        label: '端口流入电流 I₀',
        symbol: 'I_0',
        unit: 'A',
        getSimValue: (bag) => opVal(bag.primary, 'i(vam0)'),
        getTheoryValue: (p) => p.U0 * ((1 - p.mu) / p.R1 + 1 / p.R2),
      },
      {
        label: '一端口输入电阻 R_in = U₀ / I₀',
        symbol: 'R_{in}',
        unit: 'Ω',
        highlight: true,
        note: 'μ > 1 + R₁/R₂ 时呈现负输入电阻',
        getSimValue: (bag, p) => {
          const i0 = opVal(bag.primary, 'i(vam0)');
          if (i0 === null || Math.abs(i0) < 1e-9) return Infinity;
          return p.U0 / i0;
        },
        getTheoryValue: (p) => {
          const gIn = (1 - p.mu) / p.R1 + 1 / p.R2;
          return Math.abs(gIn) < 1e-9 ? Infinity : 1 / gIn;
        },
      },
      {
        label: '一端口输入电导 G_in = I₀ / U₀',
        symbol: 'G_{in}',
        unit: 'S',
        getSimValue: (bag, p) => {
          const i0 = opVal(bag.primary, 'i(vam0)');
          return i0 === null ? null : i0 / p.U0;
        },
        getTheoryValue: (p) => (1 - p.mu) / p.R1 + 1 / p.R2,
      },
    ],
  },
];

// Fix netlist for ch1-sources so F1 CCCS mirrors load sweep cleanly in standard SPICE:
CASES_CH1_CH2[2].buildNetlist = (p) => `* Ch1.3 Ideal vs Practical Voltage Source Load Sweep
V_ideal 1 0 DC ${p.Us}
V_sense 1 1s DC 0
I_load 1s 0 DC ${p.Imax}
V_prac 2 0 DC ${p.Us}
R_s 2 3 ${p.Rs}
F_mirror 3 0 V_sense 1
.dc I_load 0 ${p.Imax} ${(p.Imax / 40).toFixed(4)}
.end`;
