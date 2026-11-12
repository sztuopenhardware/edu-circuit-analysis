import type { ChapterDefinition } from '../types/circuit';

export const CHAPTERS: ChapterDefinition[] = [
  {
    id: 'ch1',
    badge: '第一章',
    title: '电路模型和电路定律',
    enTitle: 'Chapter 1: Circuit Models and Circuit Laws',
    syllabusContents: [
      '（1）电路和电路模型',
      '（2）电流和电压的参考方向',
      '（3）电功率和能量',
      '（4）电路元件',
      '（5）电阻元件',
      '（6）电压源和电流源',
      '（7）受控源',
      '（8）基尔霍夫定律',
    ],
    objectives: {
      master: [
        '电压、电流参考方向的概念',
        '电路功率的计算方法（吸收功率与发出功率判定）',
        '熟练运用基尔霍夫定律（KCL、KVL）求解电路',
      ],
      comprehend: [
        '电路模型的概念',
        '电阻元件、独立电源元件和受控源元件的特性',
      ],
    },
    ideologicalPoint: {
      tag: '科学精神 · 规范意识',
      content:
        '通过电路建模、参考方向和基本定律的学习，培养尊重客观规律、遵循统一工程规范的科学态度。',
    },
  },
  {
    id: 'ch2',
    badge: '第二章',
    title: '电阻电路的等效变换',
    enTitle: 'Chapter 2: Equivalent Transformation of Resistive Circuits',
    syllabusContents: [
      '（1）电路的等效变换',
      '（2）电阻的串联和并联',
      '（3）电阻的 Y 形连接和 Δ 形连接的等效变换',
      '（4）电压源、电流源的串联和并联',
      '（5）实际电源的两种模型及其等效变换',
      '（6）输入电阻',
    ],
    objectives: {
      master: [
        '电阻的串联分压、并联分流与混联等效计算',
        '电阻的 Y-Δ 形等效变换公式与应用',
        '实际电压源模型与实际电流源模型的等效变换',
      ],
      comprehend: [
        '电路“对外等效、对内不等效”的概念',
        '含受控源一端口网络输入电阻的外加电源计算方法',
      ],
    },
    ideologicalPoint: {
      tag: '辩证思维 · 化繁为简',
      content:
        '通过电路等效变换，体会“变与不变”的辩证关系，培养多角度分析问题、化繁为简的工程思维能力。',
    },
  },
  {
    id: 'ch3',
    badge: '第三章',
    title: '电阻电路的一般分析方法',
    enTitle: 'Chapter 3: General Analysis Methods of Resistive Circuits',
    syllabusContents: [
      '（1）电路的图',
      '（2）KCL 和 KVL 的独立方程数',
      '（3）支路电流法',
      '（4）网孔电流法',
      '（5）回路电流法',
      '（6）节点电压法',
    ],
    objectives: {
      master: [
        '支路电流法、网孔/回路电流法、节点电压法的概念与标准方程格式',
        '熟练运用电路分析方法列写方程并进行分析计算（含无伴源及受控源处理）',
      ],
      comprehend: ['电路的连通图、树（Tree）、树支与基本回路的概念'],
    },
    ideologicalPoint: {
      tag: '严谨求实 · 工程作风',
      content:
        '通过分析方法的合理选择、标准电路方程的建立与求解，培养认真细致、有理有据的工程作风。',
    },
  },
  {
    id: 'ch4',
    badge: '第四章',
    title: '电路定理',
    enTitle: 'Chapter 4: Circuit Theorems',
    syllabusContents: [
      '（1）叠加定理',
      '（2）替代定理',
      '（3）戴维南定理和诺顿定理',
      '（4）最大功率传输定理',
    ],
    objectives: {
      master: [
        '熟练运用叠加定理、替代定理分析计算电路',
        '熟练运用戴维南定理、诺顿定理化简复杂线性有源一端口网络',
        '等效电阻（开路/短路法、外加电源法）的概念及其计算方法',
      ],
      comprehend: ['电路最大功率传输定理及其匹配条件与传输效率关系'],
    },
    ideologicalPoint: {
      tag: '科学精神 · 尊重前提',
      content:
        '通过电路定理及其适用条件（如线性条件、功率不可叠加性）的学习，培养尊重理论前提、依据事实进行科学判断的意识。',
    },
  },
  {
    id: 'ch6',
    badge: '第六章',
    title: '储能元件',
    enTitle: 'Chapter 6: Energy Storage Elements',
    syllabusContents: [
      '（1）电容元件',
      '（2）电感元件',
      '（3）电容、电感元件的串联与并联',
    ],
    objectives: {
      master: [
        '电容、电感元件的伏安特性（VCR 微分与积分形式）及记忆特性',
        '电容、电感元件的串并联等效计算',
      ],
      comprehend: ['电容电场储能与电感磁场储能的物理意义与对偶关系'],
    },
    ideologicalPoint: {
      tag: '辩证思维 · 严谨求实',
      content:
        '通过电容、电感对偶特性及串并联规律的比较，培养认识事物共性与差异、准确运用基本规律的科学态度。',
    },
  },
  {
    id: 'ch7',
    badge: '第七章',
    title: '一阶电路的时域分析',
    enTitle: 'Chapter 7: Time-Domain Analysis of First-Order Circuits',
    syllabusContents: [
      '（1）动态电路的方程及其初始条件',
      '（2）一阶电路的零输入响应',
      '（3）一阶电路的零状态响应',
      '（4）一阶电路的全响应',
    ],
    objectives: {
      master: [
        '换路定则及初始值的确定，一阶电路零输入、零状态和全响应的物理本质',
        '熟练运用“三要素法”求解任意一阶线性电路的阶跃/直流暂态响应',
      ],
      comprehend: ['动态电路、换路、时间常数 τ、暂态过程与稳态等核心概念'],
    },
    ideologicalPoint: {
      tag: '发展观念 · 动态视角',
      content:
        '通过初始状态、暂态过渡过程与新稳态之间联系的分析，引导学生以动态、发展的眼光认识事物的变化规律。',
    },
  },
  {
    id: 'ch8',
    badge: '第八章',
    title: '相量法',
    enTitle: 'Chapter 8: Phasor Method',
    syllabusContents: [
      '（1）复数',
      '（2）正弦量',
      '（3）相量法的基础',
      '（4）电路定律的相量形式',
    ],
    objectives: {
      master: [
        '正弦量的三要素（幅值/有效值、角频率、初相位）、相位差及其相量表示',
        'R、L、C 三种基本元件 VCR 的相量形式（同相、超前 90°、滞后 90°）',
        '基尔霍夫定律的相量形式（相量 KCL、相量 KVL）',
      ],
      comprehend: ['复数运算与正弦稳态微分方程代数化的数学映射意义'],
    },
    ideologicalPoint: {
      tag: '科学思维 · 科技强国',
      content:
        '通过正弦量与复数相量的转换，体会数学工具与工程知识深度融合的价值；结合我国先进特高压交流电网工程，树立科技强国意识。',
    },
  },
  {
    id: 'ch9',
    badge: '第九章',
    title: '正弦稳态电路的分析',
    enTitle: 'Chapter 9: Sinusoidal Steady-State Analysis',
    syllabusContents: [
      '（1）阻抗与导纳',
      '（2）电路的相量图',
      '（3）正弦稳态电路的分析',
      '（4）正弦稳态电路的功率',
      '（5）复功率',
      '（6）最大功率传输',
    ],
    objectives: {
      master: [
        '运用复阻抗、复导纳与相量法分析正弦稳态电路并绘制相量图',
        '有功功率 P、无功功率 Q、视在功率 S、功率因数 λ 的概念与功率因数提高方法',
        'R、L、C 及任意一端口电路的功率计算',
      ],
      comprehend: [
        '复功率守恒的概念与计算',
        '正弦稳态最大功率传输的共轭匹配条件（ZL = Zeq*）与模匹配条件',
      ],
    },
    ideologicalPoint: {
      tag: '绿色发展 · 节能意识',
      content:
        '结合无功补偿与功率因数提高分析，阐明降低输电线路损耗、提高发供电设备利用率的重大工程意义，增强服务绿色低碳发展的意识。',
    },
  },
  {
    id: 'ch10',
    badge: '第十章',
    title: '含有耦合电感的电路',
    enTitle: 'Chapter 10: Circuits with Mutually Coupled Inductors',
    syllabusContents: [
      '（1）互感',
      '（2）含有耦合电感电路的计算',
      '（3）耦合电感的功率',
      '（4）变压器原理',
      '（5）理想变压器',
    ],
    objectives: {
      master: [
        '互感系数 M、耦合系数 k 与同名端的概念及伏安关系',
        '含有耦合电感电路的串并联及 T 形去耦等效计算',
      ],
      comprehend: [
        '空心变压器的反射阻抗原理与理想变压器的变压、变流、变阻抗特性',
      ],
    },
    ideologicalPoint: {
      tag: '联系观念 · 系统思维',
      content:
        '通过互感磁耦合及原副边能量传递相互作用的分析，培养从普遍联系与系统协同的角度认识工程问题。',
    },
  },
  {
    id: 'ch11',
    badge: '第十一章',
    title: '电路的频率响应',
    enTitle: 'Chapter 11: Frequency Response of Circuits',
    syllabusContents: [
      '（1）网络函数',
      '（2）RLC 串联电路的谐振',
      '（3）RLC 串联电路的频率响应',
      '（4）RLC 并联谐振电路',
      '（5）波特图',
    ],
    objectives: {
      master: [
        '网络函数 H(jω) 及电路谐振的概念',
        'RLC 串联谐振、并联谐振的条件、特征阻抗与频率选频特性',
      ],
      comprehend: ['电路的幅频/相频特性与品质因数 Q、通频带 BW 的关系'],
      knowAbout: ['波特图（Bode Plot）对数坐标渐近线绘制与滤波器概念'],
    },
    ideologicalPoint: {
      tag: '辩证思维 · 具体分析',
      content:
        '通过同一电路在不同频率条件下呈现阻性、感性、容性及谐振过电压现象的分析，认识外部条件变化对事物性质的影响，培养具体问题具体分析的思维习惯。',
    },
  },
  {
    id: 'ch12',
    badge: '第十二章',
    title: '三相电路',
    enTitle: 'Chapter 12: Three-Phase Circuits',
    syllabusContents: [
      '（1）三相电路',
      '（2）线电压（电流）与相电压（电流）的关系',
      '（3）对称三相电路的计算',
      '（4）不对称三相电路的概念',
      '（5）三相电路的功率',
    ],
    objectives: {
      master: [
        '星形联接（Y）和三角形联接（Δ）线电压/电流与相电压/电流的 √3 倍及 30° 相位关系',
        '对称三相电路归结为一相的电压、电流、功率计算及二瓦计法测功率',
      ],
      comprehend: ['三相四线制中中线（Neutral Wire）抑制中性点位移的关键作用'],
      knowAbout: ['不对称三相电路中性点位移现象与用电安全防护'],
    },
    ideologicalPoint: {
      tag: '科技强国 · 供电安全责任',
      content:
        '结合三相供电系统在国家电网与智能制造工业生产中的核心应用，增强服务科技强国建设的使命感与保障配电安全（严防中线断路故障）的工程责任意识。',
    },
  },
  {
    id: 'labs',
    badge: '课内实践 (18学时)',
    title: '教学大纲必做实验项目 (实验一 ~ 实验六)',
    enTitle: 'In-Class Laboratory Projects (Projects 1 - 6)',
    syllabusContents: [
      '实验一：电路基本仪器设备使用及预备实验（3学时 · 必做）',
      '实验二：元件的伏安特性的测试（线性与非线性元件，3学时 · 必做）',
      '实验三：基尔霍夫定律与叠加定理验证实验（3学时 · 必做）',
      '实验四：戴维南定理及等效电路外特性测量（3学时 · 必做）',
      '实验五：一阶动态电路研究（RC 微分电路与积分电路，3学时 · 必做）',
      '实验六：R、L、C 元件交流特性与正弦稳态电路综合实验（3学时 · 必做）',
    ],
    objectives: {
      master: [
        '掌握便携/台式万用表、数字示波器、函数信号发生器、交流毫伏表的虚拟测量方法',
        '掌握搭建电路验证定理、测绘伏安/外特性曲线、观察过渡过程与相量关系的实验技能',
      ],
      comprehend: ['实验测量误差分析、故障排查思路与规范实验数据记录方法'],
    },
    ideologicalPoint: {
      tag: '实践出真知 · 规范操作',
      content:
        '通过“理论计算—仿真预习—实验核验”闭环训练，践行理论联系实际的工科精神，养成严谨记录与安全规范操作的工程素养。',
    },
  },
];
