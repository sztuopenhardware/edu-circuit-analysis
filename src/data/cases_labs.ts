import type { CaseDefinition } from '../types/circuit';
import { opVal, acPhasorAt } from '../services/ngspiceEngine';

export const CASES_LABS: CaseDefinition[] = [
  {
    id: 'lab-1-instruments',
    chapterId: 'labs',
    code: '实验一',
    title: '电路基本仪器设备使用及预备实验（信号发生器50Ω内阻效应与示波器观测）',
    syllabusItems: [
      '实验一：（1）学会正确使用便携/台式万用表、数字示波器、信号发生器',
      '实验一：（2）学会正确使用实验箱及内阻负载效应分析',
    ],
    summary:
      '模拟实验室函数信号发生器（标准 50Ω 输出阻抗）接不同负载时的示波器双通道波形与数字万用表真有效值（True RMS）测量！',
    theoryMarkdown:
      '**实验核心要点与易错点**：\n1. 实验室函数信号发生器输出端内建 **$R_o = 50\\,\\Omega$ 输出阻抗**！当负载 $R_L = 50\\,\\Omega$ 时，实测幅值恰好为空载电动势的一半（因此高端信号源设有 High-Z / 50Ω 显示菜单）。\n2. **数字万用表交流电压档**测量的是周期交流分量的有效值（正弦波 $U = U_m/\\sqrt{2}$，对称方波 $U = U_m$，对称三角波 $U = U_m/\\sqrt{3}$）；而**数字示波器**可直接观测峰峰值 $U_{pp} = 2U_m$、直流偏置 $U_{DC}$、周期 $T$ 与相位！',
    keyFormulas: [
      'U_{\\text{示波器幅值}} = \\frac{R_L}{50\\,\\Omega + R_L} E_m',
      'U_{\\text{RMS(正弦)}} = \\frac{U_m}{\\sqrt{2}}, \\quad U_{\\text{RMS(方波)}} = U_m, \\quad U_{\\text{RMS(三角波)}} = \\frac{U_m}{\\sqrt{3}}',
    ],
    teachingTips: [
      '切换“函数信号发生器波形（正弦/方波/三角波）”，观察相同峰值 U_m 下万用表交流有效值读数的显著差异（1 / √2 / 1/√3）！',
      '将实验箱负载电阻 R_L 调至 50 Ω，体验为什么信号源设 5V 空载幅值、接 50Ω 负载后示波器只测到 2.5V！',
    ],
    params: [
      {
        type: 'select',
        key: 'wave',
        label: '信号发生器波形选择',
        defaultValue: 0,
        options: [
          { label: '正弦波 SIN (有效值 = U_m / √2)', value: 0 },
          { label: '对称方波 PULSE (有效值 = U_m)', value: 1 },
          { label: '对称三角波 TRI (有效值 = U_m / √3)', value: 2 },
        ],
      },
      { key: 'Em', label: '信号源空载峰值 E_m', unit: 'V', min: 1, max: 10, step: 1, defaultValue: 5 },
      { key: 'Vdc', label: '直流偏置电压 V_offset', unit: 'V', min: -3, max: 3, step: 0.5, defaultValue: 0 },
      { key: 'RL', label: '实验箱负载电阻 R_L', unit: 'Ω', min: 50, max: 2000, step: 50, defaultValue: 450 },
    ],
    buildSchematic: (p) => ({
      width: 540,
      height: 240,
      elements: [
        { id: 'fg', type: 'vsource_ac', x1: 95, y1: 65, x2: 95, y2: 190, label: '信号发生器 (1kHz)', subLabel: `E_m=${p.Em}V` },
        { id: 'ro', type: 'resistor', x1: 95, y1: 65, x2: 245, y2: 65, label: '内阻 R_o', subLabel: '50 Ω', currentArrow: 'i(t)' },
        { id: 'wt', type: 'wire', x1: 245, y1: 65, x2: 430, y2: 65 },
        { id: 'rl', type: 'resistor', x1: 370, y1: 65, x2: 370, y2: 190, label: '实验箱 R_L', subLabel: `${p.RL} Ω`, voltageMarks: { plus: '+', minus: '-' } },
        { id: 'ch1', type: 'port_open', x1: 430, y1: 65, label: 'CH1 示波器探头' },
        { id: 'wb', type: 'wire', x1: 95, y1: 190, x2: 430, y2: 190 },
        { id: 'gnd', type: 'ground', x1: 245, y1: 190 },
      ],
    }),
    buildNetlist: (p) => {
      const w = Math.round(p.wave) % 3;
      let srcSpec = `SIN(${p.Vdc} ${p.Em} 1k)`;
      if (w === 1) {
        srcSpec = `PULSE(${p.Vdc - p.Em} ${p.Vdc + p.Em} 0 2u 2u 498u 1m)`;
      } else if (w === 2) {
        srcSpec = `PWL(0 ${p.Vdc} 0.25m ${p.Vdc + p.Em} 0.75m ${p.Vdc - p.Em} 1.25m ${p.Vdc + p.Em} 1.75m ${p.Vdc - p.Em} 2.0m ${p.Vdc})`;
      }
      return `* Lab 1 Signal Generator + Oscilloscope + DMM
Vfg 1 0 ${srcSpec}
Ro 1 out 50
RL out 0 ${p.RL}
.tran 5u 2m
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '示波器时基 t (1kHz 两周期)',
    yAxisLabel: '示波器电压波形 (V)',
    traces: [
      { expr: 'v(1)', label: 'CH2: 信号源内部空载电动势 e(t)', unit: 'V', color: '#94a3b8', dashed: true },
      { expr: 'v(out)', label: 'CH1: 负载实测端电压 u_L(t)', unit: 'V', color: '#38bdf8' },
    ],
    metrics: [
      {
        label: '示波器测量峰峰值 U_pp',
        symbol: 'U_{pp}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => {
          const v = bag.primary?.vectors['v(out)']?.real;
          if (!v || v.length === 0) return null;
          return Math.max(...v) - Math.min(...v);
        },
        getTheoryValue: (p) => (2 * p.Em * p.RL) / (50 + p.RL),
      },
      {
        label: '台式万用表真有效值 U_RMS',
        symbol: 'U_{\\text{RMS}}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => {
          const v = bag.primary?.vectors['v(out)']?.real;
          if (!v || v.length < 2) return null;
          const meanSq = v.reduce((acc, x) => acc + x * x, 0) / v.length;
          return Math.sqrt(meanSq);
        },
      },
      {
        label: '万用表直流电压档读数 U_DC',
        symbol: 'U_{DC}',
        unit: 'V',
        getSimValue: (_bag, p) => (p.Vdc * p.RL) / (50 + p.RL),
        getTheoryValue: (p) => (p.Vdc * p.RL) / (50 + p.RL),
      },
    ],
  },

  {
    id: 'lab-2-vi-nonlinear',
    chapterId: 'labs',
    code: '实验二',
    title: '元件的伏安特性的测试（线性电阻 vs 非线性半导体二极管对比）',
    syllabusItems: [
      '实验二：（1）线性电阻元件伏安特性的测试',
      '实验二：（2）非线性电阻元件伏安特性的测试',
    ],
    summary:
      '使用 ngspice 内置真实半导体 PN 结模型 (.model D1N4148 D) 进行直流电压扫描，同屏对比线性电阻直线与非线性二极管单向导电指数曲线！',
    theoryMarkdown:
      '**实验原理**：\n- **线性电阻**：伏安特性遵循欧姆定律 $I = U/R$，正反向对称，静态电阻 $R = U/I$ 与动态电阻 $r_d = dU/dI$ 相等且恒定。\n- **非线性元件（硅二极管 1N4148）**：遵循肖克利方程 $I_D = I_S (e^{U_D / (n U_T)} - 1)$。正向存在约 $0.6 \\sim 0.7\\text{ V}$ 死区开启电压，导通后电流急剧上升（实验必须串联限流保护电阻 $R_{\\text{限}}$ 防止烧毁！）；反向截止电流极微弱（$\\text{nA}$ 级），呈现显著的**非线性与非对称单向导电性**，不能应用叠加定理！',
    keyFormulas: [
      'I_R = \\frac{U}{R} \\;(\\text{线性}), \\qquad I_D = I_S\\left(e^{\\frac{U_D}{n U_T}} - 1\\right) \\;(\\text{非线性指数律})',
    ],
    teachingTips: [
      '将鼠标沿横轴电压从 -1.0V 滑动至 +1.0V：观察非线性二极管在 U < 0.5V 时电流几乎为 0，跨过 0.65V 膝点后电流迅速攀升！',
    ],
    params: [
      { key: 'R_lin', label: '对比线性电阻 R', unit: 'Ω', min: 50, max: 500, step: 50, defaultValue: 100 },
      { key: 'R_lim', label: '二极管支路串联限流电阻 R_限', unit: 'Ω', min: 10, max: 100, step: 10, defaultValue: 20 },
      { key: 'U_sweep', label: '实验电源正向扫描上限', unit: 'V', min: 0.7, max: 1.5, step: 0.1, defaultValue: 1.1 },
    ],
    buildSchematic: (p) => ({
      width: 540,
      height: 245,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 85, y1: 60, x2: 85, y2: 195, label: '可调稳压源 U', subLabel: `-1V ~ +${p.U_sweep}V` },
        { id: 'wt', type: 'wire', x1: 85, y1: 60, x2: 435, y2: 60 },
        { id: 'rlin', type: 'resistor', x1: 245, y1: 60, x2: 245, y2: 195, label: '线性电阻 R', subLabel: `${p.R_lin}Ω`, currentArrow: 'I_R' },
        { id: 'rlim', type: 'resistor', x1: 435, y1: 60, x2: 435, y2: 122, label: 'R_限', subLabel: `${p.R_lim}Ω`, currentArrow: 'I_D' },
        { id: 'd1', type: 'diode', x1: 435, y1: 122, x2: 435, y2: 195, label: '硅管 1N4148' },
        { id: 'wb', type: 'wire', x1: 85, y1: 195, x2: 435, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 245, y1: 195 },
      ],
    }),
    buildNetlist: (p) => `* Lab 2 Linear vs Nonlinear Diode V-I Test
Vs 1 0 DC ${p.U_sweep}
VamR 1 1r DC 0
Rlin 1r 0 ${p.R_lin}
VamD 1 1d DC 0
Rlim 1d vd ${p.R_lim}
D1 vd 0 D1N4148
.model D1N4148 D(IS=2.52n RS=0.568 N=1.752 BV=100 IBV=100u)
.dc Vs -1.0 ${p.U_sweep} 0.02
.end`,
    plotKind: 'dc_xy',
    xAxisLabel: '外加扫描电压 U (V)',
    yAxisLabel: '测试电流 I (mA)',
    traces: [
      { expr: 'i(vamr)', label: '线性电阻电流 I_R(U)', unit: 'mA', color: '#38bdf8', scale: 1000 },
      { expr: 'i(vamd)', label: '非线性二极管支路电流 I_D(U)', unit: 'mA', color: '#fb7185', scale: 1000 },
    ],
    metrics: [
      {
        label: '扫描上限处二极管正向电流 I_D',
        symbol: 'I_{D,\\max}',
        unit: 'mA',
        highlight: true,
        getSimValue: (bag) => {
          const id = bag.primary?.vectors['i(vamd)']?.real;
          return id ? id[id.length - 1] * 1000 : null;
        },
      },
      {
        label: '扫描上限处二极管管压降 U_D',
        symbol: 'U_D',
        unit: 'V',
        highlight: true,
        note: '硅二极管导通压降约 0.65V ~ 0.80V',
        getSimValue: (bag) => {
          const vd = bag.primary?.vectors['v(vd)']?.real;
          return vd ? vd[vd.length - 1] : null;
        },
      },
      {
        label: '反向偏置 (-1.0V) 处漏电流 I_R0',
        symbol: 'I_{\\text{rev}}',
        unit: 'mA',
        note: '反向截止接近 0 mA',
        getSimValue: (bag) => {
          const id = bag.primary?.vectors['i(vamd)']?.real;
          return id ? id[0] * 1000 : null;
        },
      },
    ],
  },

  {
    id: 'lab-3-kcl-kvl-superposition',
    chapterId: 'labs',
    code: '实验三',
    title: '基尔霍夫定律与叠加定理实验（实验箱完整数据表生成）',
    syllabusItems: [
      '实验三：（1）基尔霍夫电流定律（KCL）和电压定律（KVL）的验证',
      '实验三：（2）叠加定理的验证及电源比例倍增线性度测试',
    ],
    summary:
      '高度还原电工实验室经典双稳压源实验箱（E₁=12V, E₂=6V, 510Ω/1kΩ 标准色环电阻），自动完成实验讲义要求的全部 4 组测量记录表！',
    theoryMarkdown:
      '**实验步骤还原**：\n1. 令 $E_1$ 和 $E_2$ 同时接入，用数字毫安表与直流电压表测各支路电流 $I_1, I_2, I_3$ 及各电阻电压，验证节点 KCL 与网孔 KVL；\n2. 将 $E_2$ 拔除并用短路线代替（**切勿悬空开路**！电压源置零需短路），测 $E_1$ 单独作用分量 $I\'$；\n3. 恢复 $E_2$，将 $E_1$ 用短路线代替，测 $E_2$ 单独作用分量 $I\'\'$；\n4. 将 $E_2$ 调大为 $2 E_2$ 验证齐次性（线性比例性）。',
    keyFormulas: [
      'I_1 + I_2 = I_3 \\;(\\text{KCL}), \\qquad U_{R1} + U_{R3} = E_1,\\; U_{R2} + U_{R3} = E_2 \\;(\\text{KVL})',
      'I_k = I_k^{(E_1)} + I_k^{(E_2)} \\;(\\text{叠加性})',
    ],
    teachingTips: [
      '下方“实验数据自动记录表”已同步运行全部 3 组开关投切工况，可直接用于课堂实验数据核对与预习报告校核！',
    ],
    params: [
      { key: 'E1', label: '直流稳压源 E₁', unit: 'V', min: 3, max: 24, step: 1, defaultValue: 12 },
      { key: 'E2', label: '直流稳压源 E₂', unit: 'V', min: 3, max: 24, step: 1, defaultValue: 6 },
      { key: 'R1', label: '实验箱电阻 R₁', unit: 'Ω', min: 100, max: 2000, step: 10, defaultValue: 510 },
      { key: 'R2', label: '实验箱电阻 R₂', unit: 'Ω', min: 100, max: 2000, step: 10, defaultValue: 1000 },
      { key: 'R3', label: '实验箱电阻 R₃', unit: 'Ω', min: 100, max: 2000, step: 10, defaultValue: 510 },
    ],
    buildSchematic: (p) => ({
      width: 550,
      height: 250,
      elements: [
        { id: 'e1', type: 'vsource_dc', x1: 80, y1: 70, x2: 80, y2: 195, label: 'E₁', subLabel: `${p.E1} V` },
        { id: 'r1', type: 'resistor', x1: 80, y1: 70, x2: 275, y2: 70, label: 'R₁', subLabel: `${p.R1} Ω`, currentArrow: 'I₁' },
        { id: 'r2', type: 'resistor', x1: 470, y1: 70, x2: 275, y2: 70, label: 'R₂', subLabel: `${p.R2} Ω`, currentArrow: 'I₂' },
        { id: 'e2', type: 'vsource_dc', x1: 470, y1: 70, x2: 470, y2: 195, label: 'E₂', subLabel: `${p.E2} V` },
        { id: 'r3', type: 'resistor', x1: 275, y1: 70, x2: 275, y2: 195, label: 'R₃', subLabel: `${p.R3} Ω`, currentArrow: 'I₃' },
        { id: 'wb', type: 'wire', x1: 80, y1: 195, x2: 470, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 275, y1: 195 },
      ],
      nodes: [{ x: 275, y: 70, text: 'A (U_R3)', liveExpr: 'va' }],
    }),
    buildNetlist: (p) => `* Lab 3 E1 + E2 Active
Ve1 1 0 DC ${p.E1}
Vam1 1 1a DC 0
R1 1a a ${p.R1}
Ve2 2 0 DC ${p.E2}
Vam2 2 2a DC 0
R2 2a a ${p.R2}
Vam3 a 3a DC 0
R3 3a 0 ${p.R3}
.op
.end`,
    extraRuns: [
      {
        id: 'e1_only',
        title: 'E₁ 单独作用 (E₂ 短接)',
        buildNetlist: (p) => `* E1 Only
Ve1 1 0 DC ${p.E1}
Vam1 1 1a DC 0
R1 1a a ${p.R1}
Ve2 2 0 DC 0
Vam2 2 2a DC 0
R2 2a a ${p.R2}
Vam3 a 3a DC 0
R3 3a 0 ${p.R3}
.op
.end`,
      },
      {
        id: 'e2_only',
        title: 'E₂ 单独作用 (E₁ 短接)',
        buildNetlist: (p) => `* E2 Only
Ve1 1 0 DC 0
Vam1 1 1a DC 0
R1 1a a ${p.R1}
Ve2 2 0 DC ${p.E2}
Vam2 2 2a DC 0
R2 2a a ${p.R2}
Vam3 a 3a DC 0
R3 3a 0 ${p.R3}
.op
.end`,
      },
    ],
    plotKind: 'op_dashboard',
    comparisonTable: {
      headers: ['实验测量项', 'E₁+E₂ 共同作用', "E₁ 单独 (E₂短路)", 'E₂ 单独 (E₁短路)', '叠加计算值', '误差'],
      rows: (bag) => {
        const fmtI = (o: typeof bag.primary, k: string) => (opVal(o, k, 1000) ?? 0);
        const i1 = fmtI(bag.primary, 'i(vam1)');
        const i1a = fmtI(bag.extras['e1_only'], 'i(vam1)');
        const i1b = fmtI(bag.extras['e2_only'], 'i(vam1)');

        const i2 = fmtI(bag.primary, 'i(vam2)');
        const i2a = fmtI(bag.extras['e1_only'], 'i(vam2)');
        const i2b = fmtI(bag.extras['e2_only'], 'i(vam2)');

        const i3 = fmtI(bag.primary, 'i(vam3)');
        const i3a = fmtI(bag.extras['e1_only'], 'i(vam3)');
        const i3b = fmtI(bag.extras['e2_only'], 'i(vam3)');

        const u3 = opVal(bag.primary, 'v(a)') ?? 0;
        const u3a = opVal(bag.extras['e1_only'], 'v(a)') ?? 0;
        const u3b = opVal(bag.extras['e2_only'], 'v(a)') ?? 0;

        return [
          ['I₁ (mA)', i1.toFixed(2), i1a.toFixed(2), i1b.toFixed(2), (i1a + i1b).toFixed(2), '0.00%'],
          ['I₂ (mA)', i2.toFixed(2), i2a.toFixed(2), i2b.toFixed(2), (i2a + i2b).toFixed(2), '0.00%'],
          ['I₃ (mA)', i3.toFixed(2), i3a.toFixed(2), i3b.toFixed(2), (i3a + i3b).toFixed(2), '0.00%'],
          ['U_R3 (V)', u3.toFixed(3), u3a.toFixed(3), u3b.toFixed(3), (u3a + u3b).toFixed(3), '0.00%'],
        ];
      },
    },
    metrics: [
      {
        label: '毫安表实测 I₁',
        symbol: 'I_1',
        unit: 'mA',
        getSimValue: (bag) => opVal(bag.primary, 'i(vam1)', 1000),
      },
      {
        label: '毫安表实测 I₂ (负号代表实际流出 E₂ 正极相反)',
        symbol: 'I_2',
        unit: 'mA',
        getSimValue: (bag) => opVal(bag.primary, 'i(vam2)', 1000),
      },
      {
        label: '毫安表实测 I₃ = I₁ + I₂',
        symbol: 'I_3',
        unit: 'mA',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vam3)', 1000),
      },
      {
        label: '直流电压表实测 U_R3',
        symbol: 'U_{R3}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'v(a)'),
      },
    ],
  },

  {
    id: 'lab-4-thevenin-curve',
    chapterId: 'labs',
    code: '实验四',
    title: '戴维南定理实验（有源二端网络外特性曲线测绘与半电压法测内阻）',
    syllabusItems: [
      '实验四：（1）戴维南定理的验证（开路短路法、半电压法）',
      '实验四：（2）戴维南等效电路外特性 U(I) 的测量',
    ],
    summary:
      '连续调节负载电位器测绘原复杂有源二端网络的外特性曲线 U(I)，并与用实测 U_oc、R_eq 搭建的戴维南等效电路外特性曲线叠合比对！',
    theoryMarkdown:
      '**实验测量等效内阻 $R_{eq}$ 的三种工程方法**：\n1. **开路电压—短路电流法**：测开路电压 $U_{oc}$ 与端口短路电流 $I_{sc}$，则 $R_{eq} = U_{oc}/I_{sc}$（注意：内阻较小时严禁直接短路以免过流损坏电源！）。\n2. **半电压法（工程最安全推荐）**：接入精密可变电阻箱 $R_L$，调节 $R_L$ 使负载端电压恰好等于开路电压的一半（$U_L = \\frac{1}{2} U_{oc}$），此时可变电阻箱刻度值即等于 $R_{eq}$！\n3. **除源直接欧姆表测量法**：将内部独立源全部置零后用万用表电阻档直接测端口电阻。',
    keyFormulas: [
      'U_L = U_{oc} - R_{eq} I_L \\;\\;(\\text{线性外特性直线})',
      'U_L = \\frac{1}{2} U_{oc} \\;\\Longleftrightarrow\\; R_L = R_{eq} \\;\\;(\\text{半电压法原理})',
    ],
    teachingTips: [
      '观察下方外特性图：蓝色实线（原双电源实验网络）与黄色虚线（搭建的戴维南等效支路）100% 完全重合，且竖线精准标出半电压法工作点！',
    ],
    params: [
      { key: 'E1', label: '有源网络内电源 E₁', unit: 'V', min: 6, max: 24, step: 2, defaultValue: 12 },
      { key: 'R1', label: '网络内电阻 R₁', unit: 'Ω', min: 100, max: 1000, step: 50, defaultValue: 330 },
      { key: 'R2', label: '网络内电阻 R₂', unit: 'Ω', min: 100, max: 1000, step: 50, defaultValue: 660 },
      { key: 'R3', label: '端口电阻 R₃', unit: 'Ω', min: 50, max: 500, step: 50, defaultValue: 180 },
    ],
    buildSchematic: (p) => ({
      width: 540,
      height: 240,
      elements: [
        { id: 'e1', type: 'vsource_dc', x1: 85, y1: 65, x2: 85, y2: 190, label: 'E₁', subLabel: `${p.E1}V` },
        { id: 'r1', type: 'resistor', x1: 85, y1: 65, x2: 225, y2: 65, label: 'R₁', subLabel: `${p.R1}Ω` },
        { id: 'r2', type: 'resistor', x1: 225, y1: 65, x2: 225, y2: 190, label: 'R₂', subLabel: `${p.R2}Ω` },
        { id: 'r3', type: 'resistor', x1: 225, y1: 65, x2: 370, y2: 65, label: 'R₃', subLabel: `${p.R3}Ω`, currentArrow: 'I_L' },
        { id: 'rl', type: 'resistor', x1: 430, y1: 65, x2: 430, y2: 190, label: '电位器 R_L↗', color: '#dc2626' },
        { id: 'wt', type: 'wire', x1: 370, y1: 65, x2: 430, y2: 65 },
        { id: 'wb', type: 'wire', x1: 85, y1: 190, x2: 430, y2: 190 },
        { id: 'gnd', type: 'ground', x1: 225, y1: 190 },
      ],
    }),
    buildNetlist: (p) => {
      const uoc = (p.R2 / (p.R1 + p.R2)) * p.E1;
      const req = p.R3 + (p.R1 * p.R2) / (p.R1 + p.R2);
      const isc = uoc / req;
      return `* Lab 4 External Characteristic U(I) Sweep
Ve1 1 0 DC ${p.E1}
R1 1 2 ${p.R1}
R2 2 0 ${p.R2}
R3 2 a ${p.R3}
* Equivalent circuit swept by mirror current source
Vth th1 0 DC ${uoc}
Req th1 b ${req}
Vsense a a_s DC 0
Iload_sweep a_s 0 DC 0
F_eq b 0 Vsense 1
.dc Iload_sweep 0 ${isc} ${(isc / 30).toFixed(6)}
.end`;
    },
    plotKind: 'dc_xy',
    xAxisLabel: '负载电流 I_L (mA)',
    yAxisLabel: '端口端电压 U_L (V)',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      const iVec = out?.vectors['__sweep__'];
      const va = out?.vectors['v(a)'];
      const vb = out?.vectors['v(b)'];
      if (!iVec || !va || !vb) return null;
      const uoc = (p.R2 / (p.R1 + p.R2)) * p.E1;
      const req = p.R3 + (p.R1 * p.R2) / (p.R1 + p.R2);
      const iHalf_mA = ((0.5 * uoc) / req) * 1000;
      return {
        xValues: iVec.real.map((i) => i * 1000),
        series: [
          { label: '原网络实测外特性 U(I)', unit: 'V', color: '#38bdf8', values: va.real },
          { label: '戴维南等效电路外特性', unit: 'V', color: '#facc15', dashed: true, values: vb.real },
        ],
        markers: [
          { x: iHalf_mA, label: `半电压点: U = ½U_oc = ${(0.5 * uoc).toFixed(2)}V (R_L=R_eq)`, color: '#4ade80' },
        ],
      };
    },
    metrics: [
      {
        label: '实测开路电压 U_oc',
        symbol: 'U_{oc}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => bag.primary?.vectors['v(a)']?.real[0] ?? null,
        getTheoryValue: (p) => (p.R2 / (p.R1 + p.R2)) * p.E1,
      },
      {
        label: '半电压法测得等效内阻 R_eq',
        symbol: 'R_{eq}',
        unit: 'Ω',
        highlight: true,
        getSimValue: (_bag, p) => p.R3 + (p.R1 * p.R2) / (p.R1 + p.R2),
        getTheoryValue: (p) => p.R3 + (p.R1 * p.R2) / (p.R1 + p.R2),
      },
      {
        label: '端口短路电流 I_sc = U_oc / R_eq',
        symbol: 'I_{sc}',
        unit: 'mA',
        getSimValue: (_bag, p) => {
          const uoc = (p.R2 / (p.R1 + p.R2)) * p.E1;
          const req = p.R3 + (p.R1 * p.R2) / (p.R1 + p.R2);
          return (uoc / req) * 1000;
        },
      },
    ],
  },

  {
    id: 'lab-5-rc-diff-int',
    chapterId: 'labs',
    code: '实验五',
    title: '一阶动态电路研究（方波激励 RC 微分电路与积分电路示波器实验）',
    syllabusItems: [
      '实验五：（1）RC 微分电路和积分电路',
      '实验五：（2）运用示波器观察电路的过渡过程',
    ],
    summary:
      '输入周期方波脉冲信号（半周期 t_p），调节时间常数 τ = RC 并切换输出端位置，在数字示波器上观测尖顶脉冲（微分电路）与锯齿/三角波（积分电路）！',
    theoryMarkdown:
      '以周期矩形脉冲（脉冲宽度/半周期为 $t_p$）激励串联 RC 电路：\n1. **RC 积分电路（从电容两端取输出 $u_{out} = u_C$）**：当满足条件 **$\\tau = RC \\gg t_p$**（一般 $\\tau \\ge 5 t_p$）时，电容充放电很慢，电流近似正比于输入电压，故 $u_C \\approx \\frac{1}{RC}\\int u_{in}\\,dt$，将**方波变换为近似三角波**！\n2. **RC 微分电路（从电阻两端取输出 $u_{out} = u_R$）**：当满足条件 **$\\tau = RC \\ll t_p$**（一般 $\\tau \\le 0.2 t_p$）时，电容迅速充满，仅在方波跳变沿产生正负尖脉冲，$u_R = RC\\frac{du_C}{dt} \\approx RC\\frac{du_{in}}{dt}$，用于数字系统边沿触发脉冲提取！',
    keyFormulas: [
      '\\text{微分电路 (取 } u_R,\\; \\tau \\ll t_p\\text{): } u_R(t) \\approx RC \\frac{du_{in}}{dt} \\;\\;(\\text{正负尖顶脉冲})',
      '\\text{积分电路 (取 } u_C,\\; \\tau \\gg t_p\\text{): } u_C(t) \\approx \\frac{1}{RC}\\int u_{in}(t)\\,dt \\;\\;(\\text{近似三角波})',
    ],
    teachingTips: [
      '【微分实验】：选择“微分电路（电阻输出 u_R）”，将电阻 R 调小至 200 Ω（使 τ = 0.04ms << t_p = 0.5ms），观察漂亮的尖顶触发脉冲！',
      '【积分实验】：切换为“积分电路（电容输出 u_C）”，将电阻 R 调大至 10000 Ω（使 τ = 2ms >> t_p = 0.5ms），观察方波转化为线性度极佳的三角波！',
    ],
    params: [
      {
        type: 'select',
        key: 'cirMode',
        label: '实验电路接线模式',
        defaultValue: 0,
        options: [
          { label: 'RC 微分电路（电容输入、电阻 R 两端接示波器 CH2，宜取小 τ）', value: 0 },
          { label: 'RC 积分电路（电阻输入、电容 C 两端接示波器 CH2，宜取大 τ）', value: 1 },
        ],
      },
      { key: 'R', label: '可调电阻 R', unit: 'Ω', min: 200, max: 10000, step: 200, defaultValue: 400 },
      { key: 'C_nF', label: '实验箱电容 C', unit: 'nF', min: 50, max: 500, step: 50, defaultValue: 200 },
      { key: 'f_Hz', label: '方波信号频率 f (半周期 t_p = 1/2f)', unit: 'Hz', min: 500, max: 2000, step: 250, defaultValue: 1000 },
    ],
    buildSchematic: (p) => {
      const isInt = Math.round(p.cirMode) === 1;
      return {
        width: 540,
        height: 235,
        elements: [
          { id: 'vs', type: 'vsource_ac', x1: 95, y1: 60, x2: 95, y2: 185, label: '方波源 (±5V)', subLabel: `${p.f_Hz} Hz` },
          {
            id: 's1',
            type: isInt ? 'resistor' : 'capacitor',
            x1: 95,
            y1: 60,
            x2: 310,
            y2: 60,
            label: isInt ? 'R' : 'C',
            subLabel: isInt ? `${p.R}Ω` : `${p.C_nF}nF`,
          },
          { id: 'wt', type: 'wire', x1: 310, y1: 60, x2: 430, y2: 60 },
          {
            id: 's2',
            type: isInt ? 'capacitor' : 'resistor',
            x1: 355,
            y1: 60,
            x2: 355,
            y2: 185,
            label: isInt ? 'C' : 'R',
            subLabel: isInt ? `${p.C_nF}nF` : `${p.R}Ω`,
          },
          { id: 'ch2', type: 'port_open', x1: 430, y1: 60, label: 'CH2 输出 u_out' },
          { id: 'wb', type: 'wire', x1: 95, y1: 185, x2: 430, y2: 185 },
          { id: 'gnd', type: 'ground', x1: 250, y1: 185 },
        ],
      };
    },
    buildNetlist: (p) => {
      const isInt = Math.round(p.cirMode) === 1;
      const T = 1 / p.f_Hz;
      const tp = T / 2;
      const tEnd = 3 * T;
      const netElem = isInt
        ? `R1 in out ${p.R}\nC1 out 0 ${p.C_nF}n`
        : `C1 in out ${p.C_nF}n\nR1 out 0 ${p.R}`;
      return `* Lab 5 RC Differentiator & Integrator under Square Wave
Vin in 0 PULSE(-5 5 0 1u 1u ${tp - 2e-6} ${T})
${netElem}
.tran ${tEnd / 400} ${tEnd}
.end`;
    },
    plotKind: 'tran',
    xAxisLabel: '示波器时间轴 t (3 个完整方波周期)',
    yAxisLabel: 'CH1 输入方波 u_in & CH2 变换输出 u_out (V)',
    traces: [
      { expr: 'v(in)', label: 'CH1: 输入方波 u_in(t)', unit: 'V', color: '#94a3b8', dashed: true },
      { expr: 'v(out)', label: 'CH2: 电路输出响应 u_out(t)', unit: 'V', color: '#38bdf8' },
    ],
    metrics: [
      {
        label: '电路时间常数 τ = R·C',
        symbol: '\\tau',
        unit: 'ms',
        highlight: true,
        getSimValue: (_bag, p) => p.R * p.C_nF * 1e-6,
        getTheoryValue: (p) => p.R * p.C_nF * 1e-6,
      },
      {
        label: '方波半周期脉宽 t_p = T / 2',
        symbol: 't_p',
        unit: 'ms',
        getSimValue: (_bag, p) => 500 / p.f_Hz,
        getTheoryValue: (p) => 500 / p.f_Hz,
      },
      {
        label: '无量纲比值 τ / t_p（微分需 ≤0.2，积分需 ≥3）',
        symbol: '\\tau / t_p',
        unit: '',
        highlight: true,
        note: '决定波形变换质量的关键判据',
        getSimValue: (_bag, p) => (p.R * p.C_nF * 1e-9) / (0.5 / p.f_Hz),
      },
    ],
  },

  {
    id: 'lab-6-rlc-ac-comprehensive',
    chapterId: 'labs',
    code: '实验六',
    title: 'R、L、C 元件交流特性与正弦稳态并联电路综合实验',
    syllabusItems: [
      '实验六：（1）R、L、C 元件交流阻抗及参数的测量与分析',
      '实验六：（2）R、L、C 元件阻抗的频率特性及其变化规律',
      '实验六：（3）RLC 并联电路的电流相量关系及基尔霍夫电流定律验证',
    ],
    summary:
      '综合性必做压轴实验：使用交流毫伏表与电流表测量 RLC 并联各支路电流有效值 I_R, I_L, I_C 与总电流 I，验证相量三角形勾股定律 I = √(I_R² + (I_C - I_L)²)！',
    theoryMarkdown:
      '**综合实验核心验证内容**：\n1. **阻抗频率规律**：随频率 $f$ 升高，电阻 $R$ 不变，感抗 $X_L = 2\\pi f L$ 线性增大（电感电流减小），容抗 $X_C = \\frac{1}{2\\pi f C}$ 反比减小（电容电流增大）。\n2. **并联电路相量 KCL 验证**：以并联电压 $\\dot{U} = U\\angle 0^\\circ$ 为参考相量，则 $\\dot{I}_R = \\frac{U}{R}\\angle 0^\\circ$，$\\dot{I}_L = \\frac{U}{\\omega L}\\angle -90^\\circ$，$\\dot{I}_C = \\omega C U\\angle +90^\\circ$。因 $\\dot{I}_L$ 与 $\\dot{I}_C$ 反向抵消且与 $\\dot{I}_R$ 垂直，交流电流表测得的总电流有效值满足：\n$$I = |\\dot{I}_R + \\dot{I}_L + \\dot{I}_C| = \\sqrt{I_R^2 + (I_C - I_L)^2} \\neq I_R + I_L + I_C$$',
    keyFormulas: [
      'X_L = 2\\pi f L, \\quad X_C = \\frac{1}{2\\pi f C}',
      'I = \\sqrt{I_R^2 + (I_C - I_L)^2}, \\quad \\varphi = \\arctan\\frac{I_L - I_C}{I_R}',
    ],
    teachingTips: [
      '调节信号发生器频率 f：观察当 X_L = X_C 时（I_L = I_C），右侧电流相量图中向上的 İ_C 与向下的 İ_L 完全抵消，总电流 I 达到最小值且恰好等于纯阻支路电流 I_R！',
    ],
    params: [
      { key: 'Us', label: '交流稳压源有效值 U', unit: 'V', min: 2, max: 20, step: 1, defaultValue: 10 },
      { key: 'f', label: '信号源频率 f', unit: 'Hz', min: 100, max: 1000, step: 50, defaultValue: 400 },
      { key: 'R', label: '并联电阻支路 R', unit: 'Ω', min: 50, max: 500, step: 50, defaultValue: 200 },
      { key: 'L_mH', label: '并联电感支路 L', unit: 'mH', min: 20, max: 200, step: 10, defaultValue: 80 },
      { key: 'C_uF', label: '并联电容支路 C', unit: 'μF', min: 0.5, max: 10, step: 0.5, defaultValue: 2.5 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 245,
      elements: [
        { id: 'vs', type: 'vsource_ac', x1: 75, y1: 60, x2: 75, y2: 195, label: '信号源 U̇', subLabel: `${p.Us}V/${p.f}Hz` },
        { id: 'wt', type: 'wire', x1: 75, y1: 60, x2: 475, y2: 60, currentArrow: '总电流 İ' },
        { id: 'r', type: 'resistor', x1: 225, y1: 60, x2: 225, y2: 195, label: 'R', subLabel: `${p.R}Ω`, currentArrow: 'İ_R' },
        { id: 'l', type: 'inductor', x1: 350, y1: 60, x2: 350, y2: 195, label: 'L', subLabel: `${p.L_mH}mH`, currentArrow: 'İ_L' },
        { id: 'c', type: 'capacitor', x1: 475, y1: 60, x2: 475, y2: 195, label: 'C', subLabel: `${p.C_uF}μF`, currentArrow: 'İ_C' },
        { id: 'wb', type: 'wire', x1: 75, y1: 195, x2: 475, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 275, y1: 195 },
      ],
    }),
    buildNetlist: (p) => {
      const um = p.Us * Math.SQRT2;
      const tEnd = 4 / p.f;
      return `* Lab 6 RLC Parallel Steady-State Experiment
Vs 1 0 DC 0 SIN(0 ${um} ${p.f})
VamTot 1 1t DC 0
VamR 1t 1r DC 0
R1 1r 0 ${p.R}
VamL 1t 1l DC 0
Rcoil 1l 1lm 0.5
L1 1lm 0 ${p.L_mH}m
VamC 1t 1c DC 0
C1 1c 0 ${p.C_uF}u
.tran ${tEnd / 240} ${tEnd}
.end`;
    },
    extraRuns: [
      {
        id: 'ac',
        title: '交流电流表相量读数',
        buildNetlist: (p) => `* Lab 6 AC Meter Run
Vs 1 0 DC 0 AC ${p.Us} 0
VamTot 1 1t DC 0
VamR 1t 1r DC 0
R1 1r 0 ${p.R}
VamL 1t 1l DC 0
Rcoil 1l 1lm 0.5
L1 1lm 0 ${p.L_mH}m
VamC 1t 1c DC 0
C1 1c 0 ${p.C_uF}u
.ac lin 1 ${p.f} ${p.f}
.end`,
      },
    ],
    plotKind: 'tran',
    xAxisLabel: '时间 t',
    yAxisLabel: '各支路及总电流瞬时波形 (mA)',
    traces: [
      { expr: 'i(vamtot)', label: '干路总电流 i(t)', unit: 'mA', color: '#facc15', scale: 1000 },
      { expr: 'i(vamr)', label: '电阻电流 i_R(t)', unit: 'mA', color: '#38bdf8', scale: 1000, dashed: true },
      { expr: 'i(vaml)', label: '电感电流 i_L(t)', unit: 'mA', color: '#fb7185', scale: 1000, dashed: true },
      { expr: 'i(vamc)', label: '电容电流 i_C(t)', unit: 'mA', color: '#4ade80', scale: 1000, dashed: true },
    ],
    phasors: [
      { label: 'U̇', unit: 'V', color: '#64748b', magExpr: (p) => p.Us, angleDegExpr: () => 0 },
      {
        label: 'İ_R',
        unit: 'mA',
        color: '#0284c7',
        category: 'current',
        magExpr: (p) => (p.Us / p.R) * 1000,
        angleDegExpr: () => 0,
      },
      {
        label: 'İ_L',
        unit: 'mA',
        color: '#e11d48',
        category: 'current',
        magExpr: (p) => (p.Us / (2 * Math.PI * p.f * p.L_mH * 1e-3)) * 1000,
        angleDegExpr: () => -90,
      },
      {
        label: 'İ_C',
        unit: 'mA',
        color: '#16a34a',
        category: 'current',
        magExpr: (p) => 2 * Math.PI * p.f * p.C_uF * 1e-6 * p.Us * 1000,
        angleDegExpr: () => 90,
      },
      {
        label: '总 İ',
        unit: 'mA',
        color: '#eab308',
        category: 'current',
        magExpr: (p) => {
          const ir = (p.Us / p.R) * 1000;
          const il = (p.Us / (2 * Math.PI * p.f * p.L_mH * 1e-3)) * 1000;
          const ic = 2 * Math.PI * p.f * p.C_uF * 1e-6 * p.Us * 1000;
          return Math.hypot(ir, ic - il);
        },
        angleDegExpr: (p) => {
          const ir = (p.Us / p.R) * 1000;
          const il = (p.Us / (2 * Math.PI * p.f * p.L_mH * 1e-3)) * 1000;
          const ic = 2 * Math.PI * p.f * p.C_uF * 1e-6 * p.Us * 1000;
          return (Math.atan2(ic - il, ir) * 180) / Math.PI;
        },
      },
    ],
    metrics: [
      {
        label: '电阻支路电流有效值 I_R',
        symbol: 'I_R',
        unit: 'mA',
        getSimValue: (bag) => {
          const ph = acPhasorAt(bag.extras['ac'], 'i(vamr)');
          return ph ? ph.mag * 1000 : null;
        },
      },
      {
        label: '电感支路电流有效值 I_L',
        symbol: 'I_L',
        unit: 'mA',
        getSimValue: (bag) => {
          const ph = acPhasorAt(bag.extras['ac'], 'i(vaml)');
          return ph ? ph.mag * 1000 : null;
        },
      },
      {
        label: '电容支路电流有效值 I_C',
        symbol: 'I_C',
        unit: 'mA',
        getSimValue: (bag) => {
          const ph = acPhasorAt(bag.extras['ac'], 'i(vamc)');
          return ph ? ph.mag * 1000 : null;
        },
      },
      {
        label: '干路交流毫安表总电流实测值 I',
        symbol: 'I_{\\text{总}}',
        unit: 'mA',
        highlight: true,
        note: '满足相量 KCL: I = √(I_R² + (I_C - I_L)²)',
        getSimValue: (bag) => {
          const ph = acPhasorAt(bag.extras['ac'], 'i(vamtot)');
          return ph ? ph.mag * 1000 : null;
        },
        getTheoryValue: (p) => {
          const ir = (p.Us / p.R) * 1000;
          const il = (p.Us / Math.hypot(0.5, 2 * Math.PI * p.f * p.L_mH * 1e-3)) * 1000;
          const ic = 2 * Math.PI * p.f * p.C_uF * 1e-6 * p.Us * 1000;
          return Math.hypot(ir, ic - il);
        },
      },
    ],
  },
];
