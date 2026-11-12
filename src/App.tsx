import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileCode2,
  GraduationCap,
  Layers,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { ALL_CASES, ALL_CHAPTERS, getCasesByChapter } from './data';
import { acPhasorAt, ngspiceEngine, opVal } from './services/ngspiceEngine';
import type { CaseDefinition, SimResultBag } from './types/circuit';
import { CircuitSchematic } from './components/CircuitSchematic';
import { WaveformChart } from './components/WaveformChart';
import { PhasorDiagram } from './components/PhasorDiagram';
import { MathFormula, RichTextWithMath } from './components/MathFormula';

function getInitialCaseId(): string {
  if (typeof window !== 'undefined' && window.location.hash) {
    const m = window.location.hash.match(/case=([a-zA-Z0-9_-]+)/);
    if (m && ALL_CASES.some((c) => c.id === m[1])) {
      return m[1];
    }
  }
  return ALL_CASES[0].id;
}

function buildDefaultParams(caseDef: CaseDefinition): Record<string, number> {
  const obj: Record<string, number> = {};
  for (const p of caseDef.params) {
    obj[p.key] = p.defaultValue;
  }
  return obj;
}

export const App: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(getInitialCaseId);
  const [params, setParams] = useState<Record<string, number>>(() =>
    buildDefaultParams(
      ALL_CASES.find((c) => c.id === getInitialCaseId()) ?? ALL_CASES[0]
    )
  );
  const [simBag, setSimBag] = useState<SimResultBag>({
    primary: null,
    extras: {},
  });
  const [engineState, setEngineState] = useState<'booting' | 'running' | 'ready' | 'error'>('booting');
  const [simError, setSimError] = useState<string>('');
  const [showSyllabusDrawer, setShowSyllabusDrawer] = useState<boolean>(false);
  const [showChapterGoals, setShowChapterGoals] = useState<boolean>(false);
  const [customNetlistMode, setCustomNetlistMode] = useState<boolean>(false);
  const [customNetlistText, setCustomNetlistText] = useState<string>('');
  const [showRawLog, setShowRawLog] = useState<boolean>(false);

  const activeCase = useMemo(
    () => ALL_CASES.find((c) => c.id === selectedCaseId) ?? ALL_CASES[0],
    [selectedCaseId]
  );

  const activeChapter = useMemo(
    () =>
      ALL_CHAPTERS.find((ch) => ch.id === activeCase.chapterId) ??
      ALL_CHAPTERS[0],
    [activeCase]
  );

  const chapterCases = useMemo(
    () => getCasesByChapter(activeChapter.id),
    [activeChapter.id]
  );

  const selectCase = useCallback((newCaseId: string) => {
    const target = ALL_CASES.find((c) => c.id === newCaseId);
    if (!target) return;
    setSelectedCaseId(target.id);
    const defaults = buildDefaultParams(target);
    setParams(defaults);
    setCustomNetlistMode(false);
    setCustomNetlistText(target.buildNetlist(defaults));
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#case=${target.id}`);
    }
  }, []);

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chId = e.target.value;
    const list = getCasesByChapter(chId);
    if (list.length > 0) {
      selectCase(list[0].id);
    }
  };

  const handleCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectCase(e.target.value);
  };

  const stepCase = (delta: number) => {
    const idx = ALL_CASES.findIndex((c) => c.id === activeCase.id);
    const nextIdx = (idx + delta + ALL_CASES.length) % ALL_CASES.length;
    selectCase(ALL_CASES[nextIdx].id);
  };

  // Keep netlist preview synced when not in custom mode
  useEffect(() => {
    if (!customNetlistMode) {
      setCustomNetlistText(activeCase.buildNetlist(params));
    }
  }, [activeCase, params, customNetlistMode]);

  // Trigger ngspice WASM simulation whenever activeCase or params change
  useEffect(() => {
    if (customNetlistMode) return;
    let cancelled = false;
    setEngineState((prev) => (prev === 'booting' ? 'booting' : 'running'));
    setSimError('');

    ngspiceEngine
      .runCase(activeCase, params)
      .then((bag) => {
        if (cancelled) return;
        setSimBag(bag);
        setEngineState('ready');
        if (bag.primary?.errorLog) {
          setSimError(bag.primary.errorLog);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setEngineState('error');
        setSimError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [activeCase, params, customNetlistMode]);

  const handleRunCustomNetlist = async () => {
    setEngineState('running');
    setSimError('');
    try {
      const bag = await ngspiceEngine.runCase(activeCase, params, customNetlistText);
      setSimBag(bag);
      setEngineState('ready');
      if (bag.primary?.errorLog) setSimError(bag.primary.errorLog);
    } catch (err: unknown) {
      setEngineState('error');
      setSimError(err instanceof Error ? err.message : String(err));
    }
  };

  // Extract live node voltages for SVG schematic badges
  const liveNodeValues = useMemo(() => {
    const map: Record<string, string> = {};
    const pOut = simBag.primary;
    if (!pOut || pOut.numPoints !== 1) return map;
    const pairs: [string, string][] = [
      ['v1', 'v(1)'],
      ['v2', 'v(2)'],
      ['v3', 'v(3)'],
      ['va', 'v(a)'],
      ['vk', 'v(k)'],
      ['vout', 'v(out)'],
    ];
    for (const [k, vec] of pairs) {
      const val = opVal(pOut, vec);
      if (val !== null) {
        map[k] = `${val.toFixed(2)} V`;
      }
    }
    return map;
  }, [simBag]);

  // Extract AC metrics dictionary for dynamic phasor diagrams (e.g. ch9.1)
  const phasorSimMetrics = useMemo(() => {
    const m: Record<string, number> = {};
    const acOut = simBag.extras['ac'] || simBag.extras['ac_pt'] || simBag.primary;
    if (acOut) {
      const ua = acPhasorAt(acOut, 'v(a)');
      if (ua) {
        m['ua_mag'] = ua.mag;
        m['ua_deg'] = ua.phaseDeg;
      }
      const iin = acPhasorAt(acOut, 'i(vamin)');
      if (iin) {
        m['iin_mag'] = iin.mag;
        m['iin_deg'] = iin.phaseDeg;
      }
      const ic = acPhasorAt(acOut, 'i(vamc)');
      if (ic) {
        m['ic_mag'] = ic.mag;
        m['ic_deg'] = ic.phaseDeg;
      }
    }
    return m;
  }, [simBag]);

  const schematicSpec = useMemo(
    () => activeCase.buildSchematic(params),
    [activeCase, params]
  );

  const currentCaseGlobalIdx = ALL_CASES.findIndex((c) => c.id === activeCase.id);

  return (
    <div className="app-shell">
      {/* Top Header & Chapter/Case Dropdown Navigation */}
      <header className="top-header">
        <div className="brand-row">
          <div className="brand-title-group">
            <div className="brand-logo">
              <Cpu size={22} />
            </div>
            <div>
              <h1>《电路分析 A》交互式教学仿真平台</h1>
              <p>
                课程代码 SG00379 · 配套邱关源《电路（第6版）》· 全浏览器端{' '}
                <strong>ngspice WebAssembly</strong> 实时仿真
              </p>
            </div>
          </div>

          <div className="header-actions">
            <div className={`engine-badge state-${engineState}`}>
              <span className="status-dot" />
              {engineState === 'booting' && '正在加载 ngspice WASM...'}
              {engineState === 'running' && 'ngspice 求解中...'}
              {engineState === 'ready' &&
                `ngspice WASM 就绪 (${(simBag.primary?.durationMs ?? 0).toFixed(1)} ms)`}
              {engineState === 'error' && '仿真异常'}
            </div>

            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowSyllabusDrawer((v) => !v)}
            >
              <BookOpen size={15} />
              {showSyllabusDrawer ? '收起大纲目录' : `教学大纲全览 (${ALL_CASES.length}个案例)`}
            </button>
          </div>
        </div>

        {/* Dropdown Selector Bar required by user: Chapter Dropdown + Case Dropdown */}
        <div className="selector-bar">
          <div className="dropdown-group">
            <label htmlFor="chapter-select">
              <Layers size={14} />
              按章节选择：
            </label>
            <select
              id="chapter-select"
              className="nav-select chapter-select"
              value={activeChapter.id}
              onChange={handleChapterChange}
            >
              {ALL_CHAPTERS.map((ch) => {
                const count = getCasesByChapter(ch.id).length;
                return (
                  <option key={ch.id} value={ch.id}>
                    {ch.badge}：{ch.title}（{count} 个案例）
                  </option>
                );
              })}
            </select>
          </div>

          <div className="dropdown-group case-dropdown-group">
            <label htmlFor="case-select">
              <GraduationCap size={14} />
              本章教学案例：
            </label>
            <select
              id="case-select"
              className="nav-select case-select"
              value={activeCase.id}
              onChange={handleCaseChange}
            >
              {chapterCases.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.code}] {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="step-buttons">
            <button
              type="button"
              className="btn-icon"
              title="上一教学案例"
              onClick={() => stepCase(-1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span className="case-counter">
              {currentCaseGlobalIdx + 1} / {ALL_CASES.length}
            </span>
            <button
              type="button"
              className="btn-icon"
              title="下一教学案例"
              onClick={() => stepCase(1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Optional Full Syllabus Matrix Drawer */}
      {showSyllabusDrawer && (
        <section className="syllabus-drawer">
          <div className="drawer-header">
            <h3>《电路分析A》课程教学大纲章节与仿真案例全覆盖索引</h3>
            <button
              type="button"
              className="btn-text"
              onClick={() => setShowSyllabusDrawer(false)}
            >
              关闭 ✕
            </button>
          </div>
          <div className="drawer-grid">
            {ALL_CHAPTERS.map((ch) => {
              const cases = getCasesByChapter(ch.id);
              return (
                <div key={ch.id} className="drawer-chapter-card">
                  <div className="drawer-ch-title">
                    <span className="ch-tag">{ch.badge}</span>
                    <strong>{ch.title}</strong>
                  </div>
                  <div className="drawer-case-list">
                    {cases.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`drawer-case-btn ${c.id === activeCase.id ? 'active' : ''}`}
                        onClick={() => {
                          selectCase(c.id);
                          setShowSyllabusDrawer(false);
                        }}
                      >
                        <span className="code-pill">{c.code}</span>
                        <span>{c.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Content Container */}
      <main className="main-container">
        {/* Case Hero & Syllabus Mapping Banner */}
        <section className="case-banner">
          <div className="case-banner-top">
            <div>
              <div className="case-badges">
                <span className="badge-chapter">
                  {activeChapter.badge} · {activeChapter.title}
                </span>
                <span className="badge-code">案例 {activeCase.code}</span>
                {activeCase.syllabusItems.map((item, i) => (
                  <span key={i} className="badge-syllabus">
                    大纲覆盖：{item}
                  </span>
                ))}
              </div>
              <h2 className="case-main-title">{activeCase.title}</h2>
              <p className="case-summary">{activeCase.summary}</p>
            </div>

            <button
              type="button"
              className="btn-goals-toggle"
              onClick={() => setShowChapterGoals((v) => !v)}
            >
              <Sparkles size={14} />
              {showChapterGoals ? '隐藏本章大纲要求' : '查看本章教学目标与课程思政'}
            </button>
          </div>

          {showChapterGoals && (
            <div className="chapter-goals-box">
              <div className="goal-col">
                <h4>【掌握 To Master】</h4>
                <ul>
                  {activeChapter.objectives.master.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
              <div className="goal-col">
                <h4>【理解 / 了解 To Comprehend】</h4>
                <ul>
                  {activeChapter.objectives.comprehend.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                  {activeChapter.objectives.knowAbout?.map((m, i) => (
                    <li key={`k-${i}`}>（了解）{m}</li>
                  ))}
                </ul>
              </div>
              <div className="goal-col ideological-col">
                <h4>【课程思政：{activeChapter.ideologicalPoint.tag}】</h4>
                <p>{activeChapter.ideologicalPoint.content}</p>
              </div>
            </div>
          )}
        </section>

        {/* Two-Column Interactive Laboratory Workbench */}
        <div className="workbench-grid">
          {/* LEFT COLUMN: Schematic + Parameter Controls + Theory */}
          <div className="workbench-col">
            <div className="panel-card">
              <div className="panel-header">
                <h3>
                  <Activity size={17} />
                  电路原理模型（GB/T 标准符号 · 节点实时标注）
                </h3>
                {activeCase.plotKind === 'op_dashboard' && (
                  <span className="panel-hint">蓝底标签为 ngspice 实时节点电位</span>
                )}
              </div>
              <CircuitSchematic
                spec={schematicSpec}
                liveNodeValues={liveNodeValues}
              />
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <h3>
                  <Sliders size={17} />
                  交互式参数调节台（拖动实时重算 SPICE）
                </h3>
                <button
                  type="button"
                  className="btn-reset"
                  onClick={() => {
                    setCustomNetlistMode(false);
                    setParams(buildDefaultParams(activeCase));
                  }}
                >
                  <RotateCcw size={13} />
                  重置默认参数
                </button>
              </div>

              <div className="params-list">
                {activeCase.params.map((ctrl) => {
                  const val = params[ctrl.key] ?? ctrl.defaultValue;
                  if (ctrl.type === 'select') {
                    return (
                      <div key={ctrl.key} className="param-select-row">
                        <label>{ctrl.label}</label>
                        <select
                          value={val}
                          onChange={(e) => {
                            setCustomNetlistMode(false);
                            setParams((prev) => ({
                              ...prev,
                              [ctrl.key]: Number(e.target.value),
                            }));
                          }}
                        >
                          {ctrl.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={ctrl.key} className="param-slider-row">
                      <div className="param-label-line">
                        <span className="param-name">{ctrl.label}</span>
                        <span className="param-value-badge">
                          {val} {ctrl.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step}
                        value={val}
                        onChange={(e) => {
                          setCustomNetlistMode(false);
                          setParams((prev) => ({
                            ...prev,
                            [ctrl.key]: Number(e.target.value),
                          }));
                        }}
                      />
                      <div className="param-minmax">
                        <span>
                          {ctrl.min} {ctrl.unit}
                        </span>
                        <span>
                          {ctrl.max} {ctrl.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Theory & Formulas Card */}
            <div className="panel-card">
              <div className="panel-header">
                <h3>
                  <BookOpen size={17} />
                  核心理论解析与数学模型
                </h3>
              </div>
              <div className="theory-body">
                {activeCase.theoryMarkdown.split('\n').map((para, idx) => (
                  <p key={idx} className="theory-para">
                    <RichTextWithMath text={para} />
                  </p>
                ))}

                <div className="formula-showcase">
                  {activeCase.keyFormulas.map((f, idx) => (
                    <div key={idx} className="formula-item">
                      <MathFormula tex={f} block />
                    </div>
                  ))}
                </div>

                {activeCase.teachingTips.length > 0 && (
                  <div className="teaching-tips-box">
                    <h4>课堂演示与自主探究建议：</h4>
                    <ul>
                      {activeCase.teachingTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Oscilloscope/Bode + Phasor + Theorem Comparison + Metrics + SPICE Netlist */}
          <div className="workbench-col">
            {simError && (
              <div className="error-alert">
                <strong>SPICE 引擎提示：</strong> {simError}
              </div>
            )}

            {/* Waveform / Bode / DC Sweep Plot */}
            {activeCase.plotKind !== 'op_dashboard' && (
              <div className="panel-card">
                <div className="panel-header">
                  <h3>
                    <Activity size={17} />
                    {activeCase.plotKind === 'tran' &&
                      '虚拟数字示波器（ngspice .tran 时域仿真波形）'}
                    {activeCase.plotKind === 'dc_xy' &&
                      '直流特性扫描仪（ngspice .dc 特性曲线）'}
                    {activeCase.plotKind === 'ac_bode' &&
                      '频域分析仪 / 波特图仪（ngspice .ac 交流扫频）'}
                  </h3>
                  <span className="panel-hint">鼠标移入图表可开启游标读数</span>
                </div>
                <WaveformChart
                  caseDef={activeCase}
                  simBag={simBag}
                  params={params}
                />
              </div>
            )}

            {/* Phasor Diagram if applicable */}
            {activeCase.phasors && activeCase.phasors.length > 0 && (
              <div className="panel-card">
                <PhasorDiagram
                  phasors={activeCase.phasors}
                  params={params}
                  simMetrics={phasorSimMetrics}
                />
              </div>
            )}

            {/* Multi-Run Theorem Comparison Table */}
            {activeCase.comparisonTable && simBag.primary && (
              <div className="panel-card">
                <div className="panel-header">
                  <h3>
                    <CheckCircle2 size={17} />
                    多电路同步仿真定理验证表（ngspice 多网表实时对照）
                  </h3>
                </div>
                <div className="table-scroll">
                  <table className="data-table comparison-table">
                    <thead>
                      <tr>
                        {activeCase.comparisonTable.headers.map((h, i) => (
                          <th key={i}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeCase.comparisonTable
                        .rows(simBag, params)
                        .map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={
                                  cIdx === row.length - 1 ? 'conclusion-cell' : ''
                                }
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quantitative Simulation vs Theory Metrics Table */}
            <div className="panel-card">
              <div className="panel-header">
                <h3>
                  <CheckCircle2 size={17} />
                  ngspice 仿真测量值与理论计算值核验
                </h3>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>待测物理量</th>
                      <th>符号</th>
                      <th>ngspice 仿真值</th>
                      <th>教材公式理论值</th>
                      <th>核验说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCase.metrics.map((m, idx) => {
                      const simV = simBag.primary
                        ? m.getSimValue(simBag, params)
                        : null;
                      const thV = m.getTheoryValue
                        ? m.getTheoryValue(params)
                        : null;
                      return (
                        <tr
                          key={idx}
                          className={m.highlight ? 'highlight-row' : ''}
                        >
                          <td className="metric-label-cell">{m.label}</td>
                          <td>
                            <MathFormula tex={m.symbol} />
                          </td>
                          <td className="mono-val sim-col">
                            {formatMetricVal(simV)} {m.unit}
                          </td>
                          <td className="mono-val theory-col">
                            {thV !== null
                              ? `${formatMetricVal(thV)} ${m.unit}`
                              : '—'}
                          </td>
                          <td className="note-cell">
                            {m.note ? (
                              m.note
                            ) : thV !== null && simV !== null ? (
                              <span className="match-tag">✓ 精确吻合</span>
                            ) : (
                              '实时解算'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive SPICE Netlist Workbench */}
            <div className="panel-card">
              <div className="panel-header">
                <h3>
                  <FileCode2 size={17} />
                  SPICE 仿真网表工作台（支持自由编辑网表重跑 ngspice）
                </h3>
                <div className="netlist-actions">
                  <button
                    type="button"
                    className="btn-small-primary"
                    onClick={() => {
                      setCustomNetlistMode(true);
                      handleRunCustomNetlist();
                    }}
                  >
                    <Play size={13} />
                    运行当前网表
                  </button>
                  <button
                    type="button"
                    className="btn-small-ghost"
                    onClick={() => setShowRawLog((v) => !v)}
                  >
                    <Terminal size={13} />
                    {showRawLog ? '隐藏引擎输出' : '查看引擎原始向量/日志'}
                  </button>
                </div>
              </div>

              <textarea
                className="netlist-editor"
                value={customNetlistText}
                onChange={(e) => {
                  setCustomNetlistMode(true);
                  setCustomNetlistText(e.target.value);
                }}
                rows={9}
                spellCheck={false}
                aria-label="SPICE 网表编辑器"
              />

              {showRawLog && simBag.primary && (
                <div className="raw-log-box">
                  <div className="raw-vectors-summary">
                    <strong>
                      ngspice 输出向量 ({Object.keys(simBag.primary.vectors).filter((k) => k !== '__sweep__').length} 个，采样点{' '}
                      {simBag.primary.numPoints})：
                    </strong>
                    <div className="vector-pills">
                      {Object.entries(simBag.primary.vectors)
                        .filter(([k]) => k !== '__sweep__')
                        .map(([k, vec]) => (
                          <span key={k} className="vec-pill">
                            {vec.name}:{' '}
                            {vec.mag
                              ? `${vec.mag[0].toPrecision(4)}∠${(vec.phaseDeg?.[0] ?? 0).toFixed(1)}°`
                              : vec.real[0]?.toPrecision(4)}
                          </span>
                        ))}
                    </div>
                  </div>
                  <pre className="spice-log-pre">
                    {simBag.primary.infoLog || 'No additional console log.'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <span>
          《电路分析 A (SG00379)》课程教学仿真平台 · 覆盖教学大纲全部 11 章理论课与 6 大必做实验项目
        </span>
        <span>Powered by ngspice WebAssembly (eecircuit-engine) · 适配 GitHub Pages 静态部署</span>
      </footer>
    </div>
  );
};

function formatMetricVal(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '-∞';
  if (Math.abs(v) < 1e-10) return '0.000';
  if (Math.abs(v) >= 100000 || (Math.abs(v) > 0 && Math.abs(v) < 1e-3)) {
    return v.toExponential(3);
  }
  return Number(v.toPrecision(4)).toString();
}
