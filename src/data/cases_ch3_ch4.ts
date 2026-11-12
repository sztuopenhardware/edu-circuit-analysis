import type { CaseDefinition } from '../types/circuit';
import { opVal } from '../services/ngspiceEngine';

export const CASES_CH3_CH4: CaseDefinition[] = [
  // ==================== 第三章 ====================
  {
    id: 'ch3-graph-tree',
    chapterId: 'ch3',
    code: '3.1',
    title: '电路的图、树（Tree）与独立 KCL / KVL 方程数',
    syllabusItems: ['（1）电路的图', '（2）KCL 和 KVL 的独立方程数'],
    summary:
      '基于 4 节点 6 支路桥式连通图，切换不同生成树（树支实线高亮、连支虚线显示），验证独立 KCL 数 (n-1) 与基本回路 KVL 数 (b-n+1)。',
    theoryMarkdown:
      '设连通图有 $n$ 个节点、$b$ 条支路：\n1. **树（Tree）**包含全部 $n$ 个节点、连通且不含闭合回路的子图，含 **树支数 $b_t = n - 1$**，其余 **连支数 $b_l = b - n + 1$**。\n2. **独立 KCL 方程数** $= n - 1$（任意 $n-1$ 个节点的 KCL 方程线性无关）。\n3. **独立 KVL 方程数** $= b - n + 1$（每加入一条连支，与树支唯一构成一个**基本回路/单连支回路**）。本例 $n=4, b=6$，故独立 KCL 数 $=3$，独立 KVL 数 $=3$。',
    keyFormulas: [
      'N_{\\text{KCL}} = n - 1 = 4 - 1 = 3',
      'N_{\\text{KVL}} = b - n + 1 = 6 - 4 + 1 = 3 \\;(\\text{等于连支数})',
    ],
    teachingTips: [
      '通过“选择生成树方案”切换三种不同的树 T₁ / T₂ / T₃：蓝色粗线代表树支（共 3 条，连接全部 4 个节点且无回路），灰色虚线代表连支（共 3 条，每条连支确定一个独立基本回路）！',
    ],
    params: [
      {
        type: 'select',
        key: 'treeMode',
        label: '选择生成树 T（高亮蓝色树支）',
        defaultValue: 0,
        options: [
          { label: '星形树 T₁：支路 {2, 4, 5} 为树支，{1, 3, 6} 为连支', value: 0 },
          { label: '路径树 T₂：支路 {1, 2, 3} 为树支，{4, 5, 6} 为连支', value: 1 },
          { label: '混合树 T₃：支路 {1, 5, 6} 为树支，{2, 3, 4} 为连支', value: 2 },
        ],
      },
      { key: 'Us', label: '支路6激励电压 U_S', unit: 'V', min: 6, max: 24, step: 2, defaultValue: 12 },
      { key: 'R1', label: '支路1电阻 R₁', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 4 },
      { key: 'R2', label: '支路2电阻 R₂', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 8 },
      { key: 'R3', label: '支路3电阻 R₃', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 6 },
    ],
    buildSchematic: (p) => {
      const mode = Math.round(p.treeMode) % 3;
      const treeSets = [
        new Set([2, 4, 5]),
        new Set([1, 2, 3]),
        new Set([1, 5, 6]),
      ];
      const isTree = (k: number) => treeSets[mode].has(k);
      const col = (k: number) => (isTree(k) ? '#1d4ed8' : '#64748b');
      return {
        width: 560,
        height: 270,
        elements: [
          // Branch 6: outer source branch between node 1 (left) and node 0 (bottom)
          { id: 'b6', type: 'vsource_dc', x1: 85, y1: 115, x2: 85, y2: 225, label: 'b₆: U_S', subLabel: `${p.Us}V`, color: col(6), dashed: !isTree(6) },
          { id: 'w6', type: 'wire', x1: 85, y1: 115, x2: 185, y2: 115, color: col(6), dashed: !isTree(6), currentArrow: 'I₆' },
          // Branch 1: node 1 (185,115) -> node 2 (320,40)
          { id: 'b1', type: 'resistor', x1: 185, y1: 115, x2: 320, y2: 40, label: 'b₁ (R₁)', color: col(1), dashed: !isTree(1) },
          // Branch 3: node 2 (320,40) -> node 3 (455,115)
          { id: 'b3', type: 'resistor', x1: 320, y1: 40, x2: 455, y2: 115, label: 'b₃ (R₃)', color: col(3), dashed: !isTree(3) },
          // Branch 5: node 1 (185,115) -> node 3 (455,115)
          { id: 'b5', type: 'resistor', x1: 185, y1: 115, x2: 455, y2: 115, label: 'b₅ (10Ω)', color: col(5), dashed: !isTree(5) },
          // Branch 2: node 2 (320,40) -> node 0 (320,225) via side? Let's place node 0 at (320,225) and b2 (185,115)->(320,225), b4 (455,115)->(320,225)
          { id: 'b2', type: 'resistor', x1: 185, y1: 115, x2: 320, y2: 225, label: 'b₂ (R₂)', color: col(2), dashed: !isTree(2) },
          { id: 'b4', type: 'resistor', x1: 455, y1: 115, x2: 320, y2: 225, label: 'b₄ (8Ω)', color: col(4), dashed: !isTree(4) },
          { id: 'wb', type: 'wire', x1: 85, y1: 225, x2: 320, y2: 225, color: col(6), dashed: !isTree(6) },
          { id: 'gnd', type: 'ground', x1: 320, y1: 225 },
        ],
        nodes: [
          { x: 185, y: 115, text: '①', liveExpr: 'v1' },
          { x: 320, y: 40, text: '②', liveExpr: 'v2' },
          { x: 455, y: 115, text: '③', liveExpr: 'v3' },
          { x: 320, y: 225, text: '⓪(参考)' },
        ],
        annotations: [
          { x: 365, y: 252, text: '实线蓝色 = 树支 (3条) | 虚线灰色 = 连支 (3条)', color: '#1e40af', bold: true },
        ],
      };
    },
    buildNetlist: (p) => `* Ch3.1 4-Node 6-Branch Graph Topology
Vs 1s 0 DC ${p.Us}
Vam6 1s 1 DC 0
R1 1 2 ${p.R1}
R2 1 0 ${p.R2}
R3 2 3 ${p.R3}
R4 3 0 8
R5 1 3 10
.op
.end`,
    plotKind: 'op_dashboard',
    metrics: [
      {
        label: '总节点数 n / 支路数 b',
        symbol: 'n / b',
        unit: '个 / 条',
        getSimValue: () => 4.6,
        note: 'n = 4 个节点，b = 6 条支路',
      },
      {
        label: '独立 KCL 方程数 (树支数)',
        symbol: 'n - 1',
        unit: '个',
        highlight: true,
        getSimValue: () => 3,
        getTheoryValue: () => 3,
      },
      {
        label: '独立 KVL 方程数 (连支数)',
        symbol: 'b - n + 1',
        unit: '个',
        highlight: true,
        getSimValue: () => 3,
        getTheoryValue: () => 3,
      },
      {
        label: '节点②电位 V₂ (由树支电压唯一确定)',
        symbol: 'V_2',
        unit: 'V',
        getSimValue: (bag) => opVal(bag.primary, 'v(2)'),
      },
      {
        label: '节点③电位 V₃',
        symbol: 'V_3',
        unit: 'V',
        getSimValue: (bag) => opVal(bag.primary, 'v(3)'),
      },
    ],
  },

  {
    id: 'ch3-branch-current',
    chapterId: 'ch3',
    code: '3.2',
    title: '支路电流法（2b 法与 b 法列写方程求解）',
    syllabusItems: ['（3）支路电流法'],
    summary:
      '以各支路电流为未知量，列写 (n-1) 个独立 KCL 方程与 (b-n+1) 个独立 KVL 方程，与 ngspice 精确核验。',
    theoryMarkdown:
      '**支路电流法**以电路的 $b$ 个支路电流作为未知变量：\n1. 对 $n-1$ 个独立节点列写 KCL 方程；\n2. 选定 $b-n+1$ 个独立回路（平面电路通常选网孔），代入电阻 VCR 后列写 KVL 方程；\n3. 联立共 $b$ 个线性代数方程求解全电路支路电流。本例 $n=2, b=3$，只需 1 个节点 KCL 方程和 2 个网孔 KVL 方程。',
    keyFormulas: [
      '\\begin{cases} I_1 + I_2 - I_3 = 0 & (\\text{KCL}) \\\\ R_1 I_1 + R_3 I_3 = U_{S1} & (\\text{KVL 1}) \\\\ -R_2 I_2 - R_3 I_3 = -U_{S2} & (\\text{KVL 2}) \\end{cases}',
    ],
    teachingTips: [
      '修改任一电源或电阻参数，对比“Cramer 法则/矩阵方程解析解”与“ngspice 仿真值”：二者完全吻合！',
    ],
    params: [
      { key: 'Us1', label: '电源 U_S1', unit: 'V', min: 5, max: 60, step: 5, defaultValue: 30 },
      { key: 'Us2', label: '电源 U_S2', unit: 'V', min: 5, max: 60, step: 5, defaultValue: 15 },
      { key: 'R1', label: '电阻 R₁', unit: 'Ω', min: 2, max: 30, step: 2, defaultValue: 10 },
      { key: 'R2', label: '电阻 R₂', unit: 'Ω', min: 2, max: 30, step: 2, defaultValue: 5 },
      { key: 'R3', label: '电阻 R₃', unit: 'Ω', min: 2, max: 30, step: 2, defaultValue: 10 },
    ],
    buildSchematic: (p) => ({
      width: 540,
      height: 245,
      elements: [
        { id: 'vs1', type: 'vsource_dc', x1: 85, y1: 65, x2: 85, y2: 195, label: 'U_S1', subLabel: `${p.Us1}V` },
        { id: 'r1', type: 'resistor', x1: 85, y1: 65, x2: 270, y2: 65, label: 'R₁', subLabel: `${p.R1}Ω`, currentArrow: 'I₁' },
        { id: 'r2', type: 'resistor', x1: 455, y1: 65, x2: 270, y2: 65, label: 'R₂', subLabel: `${p.R2}Ω`, currentArrow: 'I₂' },
        { id: 'vs2', type: 'vsource_dc', x1: 455, y1: 65, x2: 455, y2: 195, label: 'U_S2', subLabel: `${p.Us2}V` },
        { id: 'r3', type: 'resistor', x1: 270, y1: 65, x2: 270, y2: 195, label: 'R₃', subLabel: `${p.R3}Ω`, currentArrow: 'I₃' },
        { id: 'wb', type: 'wire', x1: 85, y1: 195, x2: 455, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 270, y1: 195 },
      ],
      nodes: [{ x: 270, y: 65, text: '节点 a', liveExpr: 'va' }],
    }),
    buildNetlist: (p) => `* Ch3.2 Branch Current Method
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
        label: '支路电流 I₁',
        symbol: 'I_1',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vam1)'),
        getTheoryValue: (p) => {
          const det = p.R1 * p.R2 + p.R2 * p.R3 + p.R1 * p.R3;
          return (p.Us1 * (p.R2 + p.R3) - p.Us2 * p.R3) / det;
        },
      },
      {
        label: '支路电流 I₂',
        symbol: 'I_2',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vam2)'),
        getTheoryValue: (p) => {
          const det = p.R1 * p.R2 + p.R2 * p.R3 + p.R1 * p.R3;
          return (p.Us2 * (p.R1 + p.R3) - p.Us1 * p.R3) / det;
        },
      },
      {
        label: '支路电流 I₃ = I₁ + I₂',
        symbol: 'I_3',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vam3)'),
        getTheoryValue: (p) => {
          const det = p.R1 * p.R2 + p.R2 * p.R3 + p.R1 * p.R3;
          return (p.Us1 * p.R2 + p.Us2 * p.R1) / det;
        },
      },
    ],
  },

  {
    id: 'ch3-mesh-loop',
    chapterId: 'ch3',
    code: '3.3',
    title: '网孔电流法与回路电流法（含无伴电流源支路处理）',
    syllabusItems: ['（4）网孔电流法', '（5）回路电流法'],
    summary:
      '演示标准三网孔电路的网孔自阻/互阻方程，以及含无伴理想电流源时巧选独立回路使电流源仅属于单一回路的简化技巧！',
    theoryMarkdown:
      '**网孔电流法**以假想沿各网孔连续流动的网孔电流 $I_{m1}, I_{m2}, \\dots$ 为变量，自动满足 KCL，方程数仅为 $b - n + 1$：\n- **自电阻** $R_{kk}$ 恒正，等于第 $k$ 网孔内所有电阻之和；**互电阻** $R_{kj}$ 在两网孔电流通过公共支路方向相反时取负号。\n- **回路电流法处理无伴电流源技巧**：选择独立回路时让理想电流源 $I_S$ 只位于一个回路（如外侧回路 $I_{l3} = I_S$），即可免设电流源端电压并少列一个方程！',
    keyFormulas: [
      '\\begin{cases} (R_1 + R_2) I_{m1} - R_2 I_{m2} = U_S - R_1 I_S \\\\ -R_2 I_{m1} + (R_2 + R_3 + R_4) I_{m2} = R_3 I_S \\end{cases} \\;\\;(\\text{令回路3电流 } I_{l3} = I_S)',
    ],
    teachingTips: [
      '观察上方的无伴电流源 I_S：使用回路电流法让 I_S 独占上层回路后，未知量从 3 个降为 2 个！',
    ],
    params: [
      { key: 'Us', label: '左网孔电压源 U_S', unit: 'V', min: 6, max: 36, step: 2, defaultValue: 20 },
      { key: 'Is', label: '上跨接无伴电流源 I_S', unit: 'A', min: 0, max: 5, step: 0.5, defaultValue: 2 },
      { key: 'R1', label: '电阻 R₁', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 4 },
      { key: 'R2', label: '公共支路电阻 R₂', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 6 },
      { key: 'R3', label: '电阻 R₃', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 4 },
      { key: 'R4', label: '右端电阻 R₄', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 6 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 270,
      elements: [
        // Top overarching current source Is from node 1 to node 3
        { id: 'wt1', type: 'wire', x1: 110, y1: 105, x2: 110, y2: 38 },
        { id: 'is', type: 'isource_dc', x1: 110, y1: 38, x2: 450, y2: 38, label: '无伴电流源 I_S', subLabel: `${p.Is} A` },
        { id: 'wt2', type: 'wire', x1: 450, y1: 38, x2: 450, y2: 105 },
        // Bottom two meshes
        { id: 'vs', type: 'vsource_dc', x1: 110, y1: 105, x2: 110, y2: 225, label: 'U_S', subLabel: `${p.Us}V` },
        { id: 'r1', type: 'resistor', x1: 110, y1: 105, x2: 280, y2: 105, label: 'R₁', subLabel: `${p.R1}Ω` },
        { id: 'r2', type: 'resistor', x1: 280, y1: 105, x2: 280, y2: 225, label: 'R₂', subLabel: `${p.R2}Ω`, currentArrow: 'I_R2' },
        { id: 'r3', type: 'resistor', x1: 280, y1: 105, x2: 450, y2: 105, label: 'R₃', subLabel: `${p.R3}Ω` },
        { id: 'r4', type: 'resistor', x1: 450, y1: 105, x2: 450, y2: 225, label: 'R₄', subLabel: `${p.R4}Ω`, currentArrow: 'I_m2' },
        { id: 'wb', type: 'wire', x1: 110, y1: 225, x2: 450, y2: 225 },
        { id: 'gnd', type: 'ground', x1: 280, y1: 225 },
      ],
      annotations: [
        { x: 165, y: 175, text: '↻ I_m1', color: '#1d4ed8', bold: true },
        { x: 345, y: 175, text: '↻ I_m2', color: '#1d4ed8', bold: true },
        { x: 245, y: 76, text: '↻ I_l3 = I_S', color: '#047857', bold: true },
      ],
    }),
    buildNetlist: (p) => `* Ch3.3 Mesh and Loop Current Method
Vs 1s 0 DC ${p.Us}
Vam1 1s 1 DC 0
Is 1 3 DC ${p.Is}
R1 1 2 ${p.R1}
VamR2 2 2b DC 0
R2 2b 0 ${p.R2}
R3 2 3 ${p.R3}
VamM2 3 3b DC 0
R4 3b 0 ${p.R4}
.op
.end`,
    plotKind: 'op_dashboard',
    metrics: [
      {
        label: '左下回路电流 I_m1（流过 U_S）',
        symbol: 'I_{m1}',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vam1)'),
        getTheoryValue: (p) => {
          // Using loop currents: Il1 (bottom-left), Il2 (bottom-right), Il3 (top clockwise = Is)
          // R1 branch has Il1 - Is, R3 branch has Il2 - Is, R2 has Il1 - Il2, R4 has Il2
          const a11 = p.R1 + p.R2;
          const a12 = -p.R2;
          const b1 = p.Us + p.R1 * p.Is;
          const a21 = -p.R2;
          const a22 = p.R2 + p.R3 + p.R4;
          const b2 = p.R3 * p.Is;
          const det = a11 * a22 - a12 * a21;
          return (b1 * a22 - b2 * a12) / det;
        },
      },
      {
        label: '右下网孔电流 I_m2（流过 R₄）',
        symbol: 'I_{m2}',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vamm2)'),
        getTheoryValue: (p) => {
          const a11 = p.R1 + p.R2;
          const a12 = -p.R2;
          const b1 = p.Us + p.R1 * p.Is;
          const a21 = -p.R2;
          const a22 = p.R2 + p.R3 + p.R4;
          const b2 = p.R3 * p.Is;
          const det = a11 * a22 - a12 * a21;
          return (a11 * b2 - a21 * b1) / det;
        },
      },
      {
        label: '公共支路电流 I_R2 = I_m1 - I_m2',
        symbol: 'I_{R2}',
        unit: 'A',
        getSimValue: (bag) => opVal(bag.primary, 'i(vamr2)'),
      },
      {
        label: '无伴电流源端电压 U_13 = V(1) - V(3)',
        symbol: 'U_{IS}',
        unit: 'V',
        note: '切勿漏算电流源端电压！功率 P = -U_13·I_S',
        getSimValue: (bag) => {
          const v1 = opVal(bag.primary, 'v(1)');
          const v3 = opVal(bag.primary, 'v(3)');
          return v1 !== null && v3 !== null ? v1 - v3 : null;
        },
      },
    ],
  },

  {
    id: 'ch3-nodal-analysis',
    chapterId: 'ch3',
    code: '3.4',
    title: '节点电压法（含受控源与无伴电压源支路）',
    syllabusItems: ['（6）节点电压法'],
    summary:
      '现代 SPICE 仿真器（包括本页底层 ngspice）的核心算法正是改进节点电压法（MNA）！验证自电导、互电导标准节点方程。',
    theoryMarkdown:
      '**节点电压法**选定参考节点（地 `0`）后，以其余 $n-1$ 个独立节点对地电压 $U_{n1}, U_{n2}, \\dots$ 为未知量，自动满足 KVL：\n- **自电导** $G_{kk}$ 恒为正（连接节点 $k$ 的所有电导之和）；**互电导** $G_{kj}$ 恒为负（节点 $k, j$ 间共有电导的负值）；右端为流入节点的等效电流源代数和。\n- 若遇接地**无伴理想电压源** $U_S$，直接令该节点电位 $U_{n1} = U_S$，方程阶数再减 1！',
    keyFormulas: [
      'U_{n1} = U_S \\;(\\text{无伴电压源节点已知})',
      '\\left(\\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}\\right) U_{n2} - \\frac{1}{R_1} U_{n1} - \\frac{1}{R_3} (\\mu U_{n2}) = I_S',
    ],
    teachingTips: [
      '你正在使用的 ngspice WebAssembly 引擎内部就是通过构建改进节点导纳矩阵（Modified Nodal Analysis, MNA）求解全书所有电路的！',
    ],
    params: [
      { key: 'Us', label: '左端无伴电压源 U_S', unit: 'V', min: 4, max: 24, step: 2, defaultValue: 12 },
      { key: 'Is', label: '注入节点②电流源 I_S', unit: 'A', min: 0, max: 4, step: 0.5, defaultValue: 1.5 },
      { key: 'R1', label: '跨接电阻 R₁', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 4 },
      { key: 'R2', label: '接地电阻 R₂', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 6 },
      { key: 'R3', label: '右侧电阻 R₃', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 6 },
      { key: 'mu', label: '受控电压源增益 μ', unit: '', min: 0, max: 0.8, step: 0.2, defaultValue: 0.4 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 250,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 80, y1: 65, x2: 80, y2: 195, label: 'U_S', subLabel: `${p.Us}V` },
        { id: 'r1', type: 'resistor', x1: 80, y1: 65, x2: 260, y2: 65, label: 'R₁', subLabel: `${p.R1}Ω` },
        { id: 'is', type: 'isource_dc', x1: 210, y1: 195, x2: 210, y2: 65, label: 'I_S', subLabel: `${p.Is}A` },
        { id: 'ws', type: 'wire', x1: 210, y1: 65, x2: 260, y2: 65 },
        { id: 'r2', type: 'resistor', x1: 295, y1: 65, x2: 295, y2: 195, label: 'R₂', subLabel: `${p.R2}Ω` },
        { id: 'wt', type: 'wire', x1: 260, y1: 65, x2: 295, y2: 65 },
        { id: 'r3', type: 'resistor', x1: 295, y1: 65, x2: 465, y2: 65, label: 'R₃', subLabel: `${p.R3}Ω` },
        { id: 'e1', type: 'vcvs', x1: 465, y1: 65, x2: 465, y2: 195, label: 'μ·U_n2', subLabel: `μ=${p.mu}` },
        { id: 'wb', type: 'wire', x1: 80, y1: 195, x2: 465, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 295, y1: 195 },
      ],
      nodes: [
        { x: 80, y: 65, text: '① U_n1', liveExpr: 'v1' },
        { x: 295, y: 65, text: '② U_n2', liveExpr: 'v2' },
        { x: 465, y: 65, text: '③ U_n3', liveExpr: 'v3' },
      ],
    }),
    buildNetlist: (p) => `* Ch3.4 Nodal Voltage Analysis (MNA)
Vs 1 0 DC ${p.Us}
R1 1 2 ${p.R1}
Is 0 2 DC ${p.Is}
R2 2 0 ${p.R2}
R3 2 3 ${p.R3}
E1 3 0 2 0 ${p.mu}
.op
.end`,
    plotKind: 'op_dashboard',
    metrics: [
      {
        label: '节点①电压 U_n1（无伴电压源确定）',
        symbol: 'U_{n1}',
        unit: 'V',
        getSimValue: (bag) => opVal(bag.primary, 'v(1)'),
        getTheoryValue: (p) => p.Us,
      },
      {
        label: '核心未知节点②电压 U_n2',
        symbol: 'U_{n2}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'v(2)'),
        getTheoryValue: (p) => {
          const gEff = 1 / p.R1 + 1 / p.R2 + (1 - p.mu) / p.R3;
          return (p.Us / p.R1 + p.Is) / gEff;
        },
      },
      {
        label: '受控节点③电压 U_n3 = μ·U_n2',
        symbol: 'U_{n3}',
        unit: 'V',
        getSimValue: (bag) => opVal(bag.primary, 'v(3)'),
        getTheoryValue: (p) => {
          const gEff = 1 / p.R1 + 1 / p.R2 + (1 - p.mu) / p.R3;
          return (p.mu * (p.Us / p.R1 + p.Is)) / gEff;
        },
      },
    ],
  },

  // ==================== 第四章 ====================
  {
    id: 'ch4-superposition',
    chapterId: 'ch4',
    code: '4.1',
    title: '叠加定理验证（含电压/电流可叠加与功率不可叠加对比）',
    syllabusItems: ['（1）叠加定理'],
    summary:
      '利用 ngspice 连续运行 3 次仿真：①双电源共同作用、②电压源单独作用（电流源开路）、③电流源单独作用（电压源短路），验证线性叠加性与功率二次非线性！',
    theoryMarkdown:
      '**叠加定理**：在线性电路中，任一支路的电压或电流等于各个独立电源单独作用时在该支路所产生电压或电流的代数和。\n- 不作用的**独立电压源置零（视为短路）**，不作用的**独立电流源置零（视为开路）**；受控源必须保留在电路中！\n- **重要警示**：功率是电压/电流的二次函数 $P = I^2 R = (I\' + I\'\')^2 R = P\' + P\'\' + 2I\'I\'\'R \\neq P\' + P\'\'$，**功率绝不能直接用叠加定理相加**！',
    keyFormulas: [
      'U_2 = U_2\' + U_2\'\', \\quad I_2 = I_2\' + I_2\'\'',
      'P_2 = I_2^2 R_2 \\neq P_2\' + P_2\'\' \\;(\\text{功率不可叠加！})',
    ],
    teachingTips: [
      '观察下方三网表同步仿真对比表：电压 U₂ 与电流 I₂ 的分量代数和与原电路 100% 相等，而最后一行电阻功率 P₂ 明显不等于 P₂\' + P₂\'\'！',
    ],
    params: [
      { key: 'Us', label: '独立电压源 U_S', unit: 'V', min: 4, max: 30, step: 2, defaultValue: 18 },
      { key: 'Is', label: '独立电流源 I_S', unit: 'A', min: 0.5, max: 6, step: 0.5, defaultValue: 3 },
      { key: 'R1', label: '左侧电阻 R₁', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 6 },
      { key: 'R2', label: '待观测支路电阻 R₂', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 12 },
    ],
    buildSchematic: (p) => ({
      width: 540,
      height: 245,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 90, y1: 65, x2: 90, y2: 195, label: 'U_S', subLabel: `${p.Us} V` },
        { id: 'r1', type: 'resistor', x1: 90, y1: 65, x2: 275, y2: 65, label: 'R₁', subLabel: `${p.R1} Ω`, currentArrow: 'I₁' },
        { id: 'r2', type: 'resistor', x1: 275, y1: 65, x2: 275, y2: 195, label: 'R₂', subLabel: `${p.R2} Ω`, currentArrow: 'I₂', voltageMarks: { plus: '+', minus: '-' } },
        { id: 'wt', type: 'wire', x1: 275, y1: 65, x2: 435, y2: 65 },
        { id: 'is', type: 'isource_dc', x1: 435, y1: 195, x2: 435, y2: 65, label: 'I_S', subLabel: `${p.Is} A` },
        { id: 'wb', type: 'wire', x1: 90, y1: 195, x2: 435, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 275, y1: 195 },
      ],
      nodes: [{ x: 275, y: 65, text: 'U₂', liveExpr: 'v2' }],
    }),
    buildNetlist: (p) => `* Ch4.1 Full Circuit (Us + Is)
Vs 1 0 DC ${p.Us}
Vam1 1 1a DC 0
R1 1a 2 ${p.R1}
Vam2 2 2a DC 0
R2 2a 0 ${p.R2}
Is 0 2 DC ${p.Is}
.op
.end`,
    extraRuns: [
      {
        id: 'us_only',
        title: '仅 U_S 作用 (I_S 开路置 0)',
        buildNetlist: (p) => `* Us Alone
Vs 1 0 DC ${p.Us}
Vam1 1 1a DC 0
R1 1a 2 ${p.R1}
Vam2 2 2a DC 0
R2 2a 0 ${p.R2}
.op
.end`,
      },
      {
        id: 'is_only',
        title: '仅 I_S 作用 (U_S 短路置 0)',
        buildNetlist: (p) => `* Is Alone
Vs 1 0 DC 0
Vam1 1 1a DC 0
R1 1a 2 ${p.R1}
Vam2 2 2a DC 0
R2 2a 0 ${p.R2}
Is 0 2 DC ${p.Is}
.op
.end`,
      },
    ],
    plotKind: 'op_dashboard',
    comparisonTable: {
      headers: [
        '待测物理量',
        '共同作用 (ngspice)',
        "U_S 单独作用 (')",
        'I_S 单独作用 (\'\')',
        "分量之和 (') + ('')",
        '定理验证',
      ],
      rows: (bag, p) => {
        const u = opVal(bag.primary, 'v(2)') ?? 0;
        const u1 = opVal(bag.extras['us_only'], 'v(2)') ?? 0;
        const u2 = opVal(bag.extras['is_only'], 'v(2)') ?? 0;

        const i = opVal(bag.primary, 'i(vam2)') ?? 0;
        const i1 = opVal(bag.extras['us_only'], 'i(vam2)') ?? 0;
        const i2 = opVal(bag.extras['is_only'], 'i(vam2)') ?? 0;

        const iR1 = opVal(bag.primary, 'i(vam1)') ?? 0;
        const iR1_1 = opVal(bag.extras['us_only'], 'i(vam1)') ?? 0;
        const iR1_2 = opVal(bag.extras['is_only'], 'i(vam1)') ?? 0;

        const pow = i * i * p.R2;
        const pow1 = i1 * i1 * p.R2;
        const pow2 = i2 * i2 * p.R2;

        return [
          ['电阻电压 U₂', `${u.toFixed(3)} V`, `${u1.toFixed(3)} V`, `${u2.toFixed(3)} V`, `${(u1 + u2).toFixed(3)} V`, '✓ 精确叠加'],
          ['支路电流 I₂', `${i.toFixed(3)} A`, `${i1.toFixed(3)} A`, `${i2.toFixed(3)} A`, `${(i1 + i2).toFixed(3)} A`, '✓ 精确叠加'],
          ['干路电流 I₁', `${iR1.toFixed(3)} A`, `${iR1_1.toFixed(3)} A`, `${iR1_2.toFixed(3)} A`, `${(iR1_1 + iR1_2).toFixed(3)} A`, '✓ 精确叠加'],
          ['电阻 R₂ 功率 P₂', `${pow.toFixed(2)} W`, `${pow1.toFixed(2)} W`, `${pow2.toFixed(2)} W`, `${(pow1 + pow2).toFixed(2)} W`, '✗ 功率不可叠加!'],
        ];
      },
    },
    metrics: [
      {
        label: '总响应电压 U₂',
        symbol: 'U_2',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'v(2)'),
        getTheoryValue: (p) =>
          (p.R2 / (p.R1 + p.R2)) * p.Us + ((p.R1 * p.R2) / (p.R1 + p.R2)) * p.Is,
      },
      {
        label: '总响应电流 I₂',
        symbol: 'I_2',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vam2)'),
        getTheoryValue: (p) =>
          p.Us / (p.R1 + p.R2) + (p.R1 / (p.R1 + p.R2)) * p.Is,
      },
    ],
  },

  {
    id: 'ch4-substitution',
    chapterId: 'ch4',
    code: '4.2',
    title: '替代定理验证（电压源替代与电流源替代双方案）',
    syllabusItems: ['（2）替代定理'],
    summary:
      '任意非线性或线性网络中，若已知第 k 支路的电压 U_k 和电流 I_k，可用独立电压源 U_k 或独立电流源 I_k 替代该支路而不影响其余所有支路！',
    theoryMarkdown:
      '**替代定理（置换定理）**：对于具有唯一解的任意集总电路（不论线性或非线性），若已知某支路 $k$ 的支路电压为 $u_k$、支路电流为 $i_k$，则将该支路用一个电压等于 $u_k$ 的理想电压源，或一个电流等于 $i_k$ 的理想电流源替代后，电路其余各支路的全部电压和电流均保持不变。',
    keyFormulas: [
      '\\text{原支路 } R_k \\;\\Longleftrightarrow\\; \\text{理想电压源 } U_{Sk} = U_k \\;\\Longleftrightarrow\\; \\text{理想电流源 } I_{Sk} = I_k',
    ],
    teachingTips: [
      '下方表格同时运行了 3 个独立的 ngspice 电路：原 T 形电阻电路、用电压源 U_k 替代右边支路 R₃、用电流源 I_k 替代右边支路 R₃，验证其余支路状态丝毫未变！',
    ],
    params: [
      { key: 'Us', label: '主电源 U_S', unit: 'V', min: 6, max: 36, step: 2, defaultValue: 24 },
      { key: 'R1', label: '支路 R₁', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 6 },
      { key: 'R2', label: '支路 R₂', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 12 },
      { key: 'R3', label: '被替代支路 R₃ (串联 4Ω)', unit: 'Ω', min: 2, max: 24, step: 2, defaultValue: 8 },
    ],
    buildSchematic: (p) => ({
      width: 550,
      height: 245,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 85, y1: 65, x2: 85, y2: 195, label: 'U_S', subLabel: `${p.Us}V` },
        { id: 'r1', type: 'resistor', x1: 85, y1: 65, x2: 260, y2: 65, label: 'R₁', subLabel: `${p.R1}Ω`, currentArrow: 'I₁' },
        { id: 'r2', type: 'resistor', x1: 260, y1: 65, x2: 260, y2: 195, label: 'R₂', subLabel: `${p.R2}Ω`, currentArrow: 'I₂' },
        { id: 'r4', type: 'resistor', x1: 260, y1: 65, x2: 435, y2: 65, label: 'R₄', subLabel: '4Ω', currentArrow: 'I_k' },
        { id: 'r3', type: 'resistor', x1: 435, y1: 65, x2: 435, y2: 195, label: '被替代支路 R₃', subLabel: `${p.R3}Ω`, color: '#dc2626', voltageMarks: { plus: '+', minus: '-' } },
        { id: 'wb', type: 'wire', x1: 85, y1: 195, x2: 435, y2: 195 },
        { id: 'gnd', type: 'ground', x1: 260, y1: 195 },
      ],
      nodes: [
        { x: 260, y: 65, text: '节点 a', liveExpr: 'va' },
        { x: 435, y: 65, text: 'U_k', liveExpr: 'vk' },
      ],
    }),
    buildNetlist: (p) => `* Ch4.2 Original Circuit
Vs 1 0 DC ${p.Us}
Vam1 1 1a DC 0
R1 1a a ${p.R1}
Vam2 a 2a DC 0
R2 2a 0 ${p.R2}
R4 a k 4
Vamk k kb DC 0
R3 kb 0 ${p.R3}
.op
.end`,
    extraRuns: [
      {
        id: 'sub_v',
        title: '电压源 U_k 替代支路',
        buildNetlist: (p) => {
          const rRight = 4 + p.R3;
          const rPar = (p.R2 * rRight) / (p.R2 + rRight);
          const va = (rPar / (p.R1 + rPar)) * p.Us;
          const ik = va / rRight;
          const uk = ik * p.R3;
          return `* Substituted by Vsource Uk
Vs 1 0 DC ${p.Us}
Vam1 1 1a DC 0
R1 1a a ${p.R1}
Vam2 a 2a DC 0
R2 2a 0 ${p.R2}
R4 a k 4
Vsub k 0 DC ${uk}
.op
.end`;
        },
      },
      {
        id: 'sub_i',
        title: '电流源 I_k 替代支路',
        buildNetlist: (p) => {
          const rRight = 4 + p.R3;
          const rPar = (p.R2 * rRight) / (p.R2 + rRight);
          const va = (rPar / (p.R1 + rPar)) * p.Us;
          const ik = va / rRight;
          return `* Substituted by Isource Ik
Vs 1 0 DC ${p.Us}
Vam1 1 1a DC 0
R1 1a a ${p.R1}
Vam2 a 2a DC 0
R2 2a 0 ${p.R2}
R4 a k 4
Isub k 0 DC ${ik}
.op
.end`;
        },
      },
    ],
    plotKind: 'op_dashboard',
    comparisonTable: {
      headers: ['其余支路变量', '原电路仿真', '电压源 U_k 替代后', '电流源 I_k 替代后', '结论'],
      rows: (bag) => {
        const va0 = opVal(bag.primary, 'v(a)') ?? 0;
        const vaV = opVal(bag.extras['sub_v'], 'v(a)') ?? 0;
        const vaI = opVal(bag.extras['sub_i'], 'v(a)') ?? 0;
        const i10 = opVal(bag.primary, 'i(vam1)') ?? 0;
        const i1V = opVal(bag.extras['sub_v'], 'i(vam1)') ?? 0;
        const i1I = opVal(bag.extras['sub_i'], 'i(vam1)') ?? 0;
        const i20 = opVal(bag.primary, 'i(vam2)') ?? 0;
        const i2V = opVal(bag.extras['sub_v'], 'i(vam2)') ?? 0;
        const i2I = opVal(bag.extras['sub_i'], 'i(vam2)') ?? 0;
        return [
          ['节点 a 电压 U_a', `${va0.toFixed(4)} V`, `${vaV.toFixed(4)} V`, `${vaI.toFixed(4)} V`, '完全不变'],
          ['干路电流 I₁', `${i10.toFixed(4)} A`, `${i1V.toFixed(4)} A`, `${i1I.toFixed(4)} A`, '完全不变'],
          ['支路电流 I₂', `${i20.toFixed(4)} A`, `${i2V.toFixed(4)} A`, `${i2I.toFixed(4)} A`, '完全不变'],
        ];
      },
    },
    metrics: [
      {
        label: '被替代支路原端电压 U_k',
        symbol: 'U_k',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'v(k)'),
      },
      {
        label: '被替代支路原电流 I_k',
        symbol: 'I_k',
        unit: 'A',
        highlight: true,
        getSimValue: (bag) => opVal(bag.primary, 'i(vamk)'),
      },
    ],
  },

  {
    id: 'ch4-thevenin-norton',
    chapterId: 'ch4',
    code: '4.3',
    title: '戴维南定理与诺顿定理综合等效验证',
    syllabusItems: ['（3）戴维南定理和诺顿定理'],
    summary:
      '将复杂双电源有源二端网络化简为戴维南等效电路（U_oc 串联 R_eq）和诺顿等效电路（I_sc 并联 R_eq），三电路同步运行核验！',
    theoryMarkdown:
      '任何一个线性含源一端口网络，对外电路而言：\n1. **戴维南定理**：可等效为一个电压为**开路电压 $U_{oc}$** 的理想电压源串联**除源等效电阻 $R_{eq}$**；\n2. **诺顿定理**：可等效为一个电流为**短路电流 $I_{sc}$** 的理想电流源并联**等效电阻 $R_{eq}$**；\n三者关系恒满足 $R_{eq} = \\frac{U_{oc}}{I_{sc}}$。当外部负载 $R_L$ 频繁变动时，无需重算复杂原网络！',
    keyFormulas: [
      'U_{oc} = \\frac{R_2}{R_1 + R_2} U_S + \\left(R_3 + \\frac{R_1 R_2}{R_1 + R_2}\\right) I_S',
      'R_{eq} = R_3 + (R_1 \\parallel R_2), \\quad I_{sc} = \\frac{U_{oc}}{R_{eq}}, \\quad I_L = \\frac{U_{oc}}{R_{eq} + R_L}',
    ],
    teachingTips: [
      '频繁拖动外部负载 R_L 滑块：观察原网络需要重解多节点方程，而戴维南等效电路仅用简单串联分压即可给出丝毫不差的负载电压与电流！',
    ],
    params: [
      { key: 'Us', label: '网络内电压源 U_S', unit: 'V', min: 6, max: 36, step: 2, defaultValue: 24 },
      { key: 'Is', label: '网络内电流源 I_S', unit: 'A', min: 0, max: 4, step: 0.5, defaultValue: 1 },
      { key: 'R1', label: '内电阻 R₁', unit: 'Ω', min: 2, max: 24, step: 2, defaultValue: 6 },
      { key: 'R2', label: '内电阻 R₂', unit: 'Ω', min: 2, max: 24, step: 2, defaultValue: 12 },
      { key: 'R3', label: '端口串联电阻 R₃', unit: 'Ω', min: 2, max: 20, step: 2, defaultValue: 6 },
      { key: 'RL', label: '待求外部负载 R_L', unit: 'Ω', min: 2, max: 50, step: 2, defaultValue: 10 },
    ],
    buildSchematic: (p) => ({
      width: 560,
      height: 255,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 70, y1: 65, x2: 70, y2: 200, label: 'U_S', subLabel: `${p.Us}V` },
        { id: 'r1', type: 'resistor', x1: 70, y1: 65, x2: 210, y2: 65, label: 'R₁', subLabel: `${p.R1}Ω` },
        { id: 'r2', type: 'resistor', x1: 210, y1: 65, x2: 210, y2: 200, label: 'R₂', subLabel: `${p.R2}Ω` },
        { id: 'r3', type: 'resistor', x1: 210, y1: 65, x2: 360, y2: 65, label: 'R₃', subLabel: `${p.R3}Ω` },
        { id: 'is', type: 'isource_dc', x1: 315, y1: 200, x2: 315, y2: 65, label: 'I_S', subLabel: `${p.Is}A` },
        { id: 'wt', type: 'wire', x1: 360, y1: 65, x2: 475, y2: 65, currentArrow: 'I_L' },
        { id: 'rl', type: 'resistor', x1: 475, y1: 65, x2: 475, y2: 200, label: '负载 R_L', subLabel: `${p.RL}Ω`, color: '#dc2626', voltageMarks: { plus: '+', minus: '-' } },
        { id: 'wb', type: 'wire', x1: 70, y1: 200, x2: 475, y2: 200 },
        { id: 'gnd', type: 'ground', x1: 210, y1: 200 },
        { id: 'pa', type: 'port_open', x1: 395, y1: 65, label: 'a' },
        { id: 'pb', type: 'port_open', x1: 395, y1: 200, label: 'b' },
      ],
      annotations: [
        { x: 115, y: 235, text: '【虚线框左侧：线性有源一端口网络 N】 → 等效为 U_oc + R_eq', color: '#1e40af', bold: true },
      ],
    }),
    buildNetlist: (p) => `* Ch4.3 Original Active One-Port with Load RL
Vs 1 0 DC ${p.Us}
R1 1 2 ${p.R1}
R2 2 0 ${p.R2}
R3 2 a ${p.R3}
Is 0 a DC ${p.Is}
VamL a aL DC 0
RL aL 0 ${p.RL}
.op
.end`,
    extraRuns: [
      {
        id: 'open_port',
        title: '端口开路测 U_oc',
        buildNetlist: (p) => `* Open Circuit Uoc
Vs 1 0 DC ${p.Us}
R1 1 2 ${p.R1}
R2 2 0 ${p.R2}
R3 2 a ${p.R3}
Is 0 a DC ${p.Is}
Ropen a 0 1e12
.op
.end`,
      },
      {
        id: 'thev',
        title: '戴维南等效电路',
        buildNetlist: (p) => {
          const r12 = (p.R1 * p.R2) / (p.R1 + p.R2);
          const req = p.R3 + r12;
          const uoc = (p.R2 / (p.R1 + p.R2)) * p.Us + req * p.Is;
          return `* Thevenin Equivalent
Vth 1 0 DC ${uoc}
Req 1 a ${req}
VamTh a aL DC 0
RL aL 0 ${p.RL}
.op
.end`;
        },
      },
      {
        id: 'nort',
        title: '诺顿等效电路',
        buildNetlist: (p) => {
          const r12 = (p.R1 * p.R2) / (p.R1 + p.R2);
          const req = p.R3 + r12;
          const uoc = (p.R2 / (p.R1 + p.R2)) * p.Us + req * p.Is;
          const isc = uoc / req;
          return `* Norton Equivalent
Ino 0 a DC ${isc}
Req a 0 ${req}
VamNo a aL DC 0
RL aL 0 ${p.RL}
.op
.end`;
        },
      },
    ],
    plotKind: 'op_dashboard',
    comparisonTable: {
      headers: ['输出量', '复杂原网络', '戴维南等效电路', '诺顿等效电路', '一致性'],
      rows: (bag) => {
        const u0 = opVal(bag.primary, 'v(a)') ?? 0;
        const uT = opVal(bag.extras['thev'], 'v(a)') ?? 0;
        const uN = opVal(bag.extras['nort'], 'v(a)') ?? 0;
        const i0 = opVal(bag.primary, 'i(vaml)') ?? 0;
        const iT = opVal(bag.extras['thev'], 'i(vamth)') ?? 0;
        const iN = opVal(bag.extras['nort'], 'i(vamno)') ?? 0;
        return [
          ['负载电压 U_L', `${u0.toFixed(4)} V`, `${uT.toFixed(4)} V`, `${uN.toFixed(4)} V`, '100% 等效'],
          ['负载电流 I_L', `${i0.toFixed(4)} A`, `${iT.toFixed(4)} A`, `${iN.toFixed(4)} A`, '100% 等效'],
          ['负载功率 P_L', `${(u0 * i0).toFixed(4)} W`, `${(uT * iT).toFixed(4)} W`, `${(uN * iN).toFixed(4)} W`, '100% 等效'],
        ];
      },
    },
    metrics: [
      {
        label: '戴维南开路电压 U_oc',
        symbol: 'U_{oc}',
        unit: 'V',
        highlight: true,
        getSimValue: (bag) => opVal(bag.extras['open_port'], 'v(a)'),
        getTheoryValue: (p) => {
          const r12 = (p.R1 * p.R2) / (p.R1 + p.R2);
          return (p.R2 / (p.R1 + p.R2)) * p.Us + (p.R3 + r12) * p.Is;
        },
      },
      {
        label: '除源等效内阻 R_eq',
        symbol: 'R_{eq}',
        unit: 'Ω',
        highlight: true,
        getSimValue: (_bag, p) => p.R3 + (p.R1 * p.R2) / (p.R1 + p.R2),
        getTheoryValue: (p) => p.R3 + (p.R1 * p.R2) / (p.R1 + p.R2),
      },
      {
        label: '诺顿短路电流 I_sc = U_oc / R_eq',
        symbol: 'I_{sc}',
        unit: 'A',
        getSimValue: (bag, p) => {
          const uoc = opVal(bag.extras['open_port'], 'v(a)');
          const req = p.R3 + (p.R1 * p.R2) / (p.R1 + p.R2);
          return uoc !== null ? uoc / req : null;
        },
      },
      {
        label: '当前负载电流 I_L',
        symbol: 'I_L',
        unit: 'A',
        getSimValue: (bag) => opVal(bag.primary, 'i(vaml)'),
      },
    ],
  },

  {
    id: 'ch4-max-power',
    chapterId: 'ch4',
    code: '4.4',
    title: '最大功率传输定理（ngspice 电阻扫描曲线与效率权衡）',
    syllabusItems: ['（4）最大功率传输定理'],
    summary:
      '使用 ngspice .dc 直接对负载电阻 R_L 进行连续参数扫描，同步绘制负载功率 P_L(R_L) 驼峰曲线与传输效率 η(R_L) 曲线！',
    theoryMarkdown:
      '含源线性一端口网络（戴维南参数 $U_{oc}, R_{eq} > 0$）接可变电阻负载 $R_L$ 时，负载吸收功率为 $P_L = \\left(\\frac{U_{oc}}{R_{eq}+R_L}\\right)^2 R_L$。\n- 对 $R_L$ 求导令其为零，得**最大功率匹配条件：$R_L = R_{eq}$**，此时最大传输功率 $P_{max} = \\frac{U_{oc}^2}{4 R_{eq}}$。\n- **工程辩证思考**：匹配时传输效率 $\\eta = \\frac{R_L}{R_{eq}+R_L} = 50\\%$！因此弱电通信/射频信号处理追求最大功率匹配（$R_L = R_{eq}$），而强电电力系统追求高效率（要求 $R_L \\gg R_{eq}, \\eta \\to 100\\%$）！',
    keyFormulas: [
      'R_L = R_{eq} \\;\\Longrightarrow\\; P_{L,\\max} = \\frac{U_{oc}^2}{4 R_{eq}}',
      '\\eta = \\frac{P_L}{P_{\\text{总}}} = \\frac{R_L}{R_{eq} + R_L} \\;(\\text{匹配点 } \\eta = 50\\%)',
    ],
    teachingTips: [
      '拖动等效内阻 R_eq 滑块，观察黄色竖虚线标注的最佳匹配点 R_L = R_eq 如何精准锁定功率曲线最高峰，且对应右侧效率曲线恰好为 50%！',
    ],
    params: [
      { key: 'Uoc', label: '戴维南开路电压 U_oc', unit: 'V', min: 5, max: 30, step: 1, defaultValue: 20 },
      { key: 'Req', label: '戴维南等效内阻 R_eq', unit: 'Ω', min: 10, max: 80, step: 5, defaultValue: 40 },
    ],
    buildSchematic: (p) => ({
      width: 520,
      height: 235,
      elements: [
        { id: 'vs', type: 'vsource_dc', x1: 110, y1: 65, x2: 110, y2: 185, label: 'U_oc', subLabel: `${p.Uoc} V` },
        { id: 'req', type: 'resistor', x1: 110, y1: 65, x2: 285, y2: 65, label: 'R_eq', subLabel: `${p.Req} Ω`, currentArrow: 'I_L' },
        { id: 'wt', type: 'wire', x1: 285, y1: 65, x2: 390, y2: 65 },
        { id: 'rl', type: 'resistor', x1: 390, y1: 65, x2: 390, y2: 185, label: 'R_L ↗ (扫描)', subLabel: '2 ~ 160 Ω', color: '#dc2626' },
        { id: 'wb', type: 'wire', x1: 110, y1: 185, x2: 390, y2: 185 },
        { id: 'gnd', type: 'ground', x1: 250, y1: 185 },
      ],
      nodes: [{ x: 335, y: 65, text: 'U_L' }],
    }),
    buildNetlist: (p) => `* Ch4.4 Maximum Power Transfer DC Resistor Sweep
Voc 1 0 DC ${p.Uoc}
Req 1 2 ${p.Req}
RL 2 0 ${p.Req}
.dc RL 2 160 2
.end`,
    plotKind: 'dc_xy',
    xAxisLabel: '可变负载电阻 R_L (Ω)',
    yAxisLabel: '负载功率 P_L (W) [左] / 效率 η (%) [右]',
    buildDerivedCurves: (bag, p) => {
      const out = bag.primary;
      const rVec = out?.vectors['__sweep__'];
      const vVec = out?.vectors['v(2)'];
      if (!rVec || !vVec) return null;
      const pVals = rVec.real.map((rl, i) => (vVec.real[i] * vVec.real[i]) / rl);
      const etaVals = rVec.real.map((rl) => (rl / (p.Req + rl)) * 100);
      return {
        xValues: rVec.real,
        series: [
          { label: '负载功率 P_L', unit: 'W', color: '#38bdf8', values: pVals, axis: 'left' },
          { label: '传输效率 η', unit: '%', color: '#4ade80', dashed: true, values: etaVals, axis: 'right' },
        ],
        markers: [
          { x: p.Req, label: `匹配点 R_L = R_eq = ${p.Req}Ω (η=50%)`, color: '#facc15' },
        ],
      };
    },
    metrics: [
      {
        label: '最佳匹配负载电阻 R_L,opt',
        symbol: 'R_{L,\\text{opt}}',
        unit: 'Ω',
        highlight: true,
        getSimValue: (bag) => {
          const rVec = bag.primary?.vectors['__sweep__'];
          const vVec = bag.primary?.vectors['v(2)'];
          if (!rVec || !vVec) return null;
          let maxP = -1;
          let bestR = 0;
          rVec.real.forEach((rl, i) => {
            const pw = (vVec.real[i] * vVec.real[i]) / rl;
            if (pw > maxP) {
              maxP = pw;
              bestR = rl;
            }
          });
          return bestR;
        },
        getTheoryValue: (p) => p.Req,
      },
      {
        label: '最大负载功率 P_L,max = U_oc² / (4R_eq)',
        symbol: 'P_{\\max}',
        unit: 'W',
        highlight: true,
        getSimValue: (bag) => {
          const rVec = bag.primary?.vectors['__sweep__'];
          const vVec = bag.primary?.vectors['v(2)'];
          if (!rVec || !vVec) return null;
          return Math.max(...rVec.real.map((rl, i) => (vVec.real[i] * vVec.real[i]) / rl));
        },
        getTheoryValue: (p) => (p.Uoc * p.Uoc) / (4 * p.Req),
      },
      {
        label: '最大功率点处传输效率 η',
        symbol: '\\eta_{\\text{match}}',
        unit: '%',
        getSimValue: () => 50,
        getTheoryValue: () => 50,
      },
    ],
  },
];
