'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { controls, factoryReducer, formatTime, initialState, mesBatches, mesEvidence, scenarios, stations } from '@/lib/factory/simulation';
import type { FactoryState, Parameters } from '@/lib/factory/simulation';
import './factory.css';

const FactoryScene = dynamic(() => import('./FactoryScene'), { ssr: false, loading: () => <div className="factory-loading"><span />正在构建三维产线…</div> });
const fmt = (n: number) => Math.floor(n).toLocaleString('en-US');
const DEMO_DURATION = 90;
const demoSteps = [
  { at: 0, title: '建立稳定基线', text: '从 60 SPM 稳定窗口开始，确认尺寸能力、综合良率和 AOI 状态。' },
  { at: 8, title: '模拟客户提速', text: '冲压提升至 94 SPM。3D 产线加速，动态载荷开始放大波动。' },
  { at: 25, title: 'AOI 捕捉异常', text: '边缘毛刺和尺寸波动连续上升，NG 工件进入隔离料框。' },
  { at: 34, title: '询问产线 AI', text: 'AI 读取当前窗口并匹配相近速度、同磨损状态的合成 MES 批次。' },
  { at: 50, title: '执行协同优化', text: '冲压、整平、覆膜、擦洁和机械手恢复到同步配方。' },
  { at: 72, title: '验证恢复结果', text: '新工件进入 32 件滚动窗口，对比预测和当前实测趋势。' },
  { at: 90, title: '闭环演示完成', text: '异常、依据、动作和恢复结果已进入决策记录。' },
] as const;

function Icon({ name }: { name: 'cube' | 'pulse' | 'ai' | 'sliders' | 'data' | 'arrow' }) {
  const paths = {
    cube: <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z" /><path d="m3 8 9 5 9-5M12 13v9M7.5 5.5l9 5" /></>,
    pulse: <path d="M2 12h5l3-8 4 16 3-8h5" />,
    ai: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" /><path d="m20 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" /></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></>,
    data: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Trend({ values, color, min, max, threshold, label }: { values: number[]; color: string; min: number; max: number; threshold?: number; label: string }) {
  const y = (v: number) => 62 - Math.min(1, Math.max(0, (v - min) / (max - min))) * 54;
  const points = values.map((v, i) => `${8 + i * 224 / Math.max(1, values.length - 1)},${y(v)}`).join(' ');
  return <svg className="factory-trend" viewBox="0 0 240 72" role="img" aria-label={label}>
    {[16, 39, 62].map(n => <path key={n} d={`M8 ${n}H232`} stroke="rgba(180,210,240,.07)" />)}
    {threshold !== undefined ? <path d={`M8 ${y(threshold)}H232`} stroke="#ffbd69" strokeDasharray="3 4" opacity=".65" /> : null}
    <polygon points={`8,68 ${points} ${8 + (values.length > 1 ? 224 : 0)},68`} fill={color} opacity=".07" />
    <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <circle cx={values.length > 1 ? 232 : 8} cy={y(values.at(-1) ?? min)} r="3" fill={color} />
  </svg>;
}

function Monitor({ state }: { state: FactoryState }) {
  const { metrics: m } = state;
  const quality = m.cpk >= 1.33 && m.yieldRate >= 98.5;
  return <aside className="factory-monitor" aria-label="实时产线数据">
    <div className="factory-panel-heading"><span><Icon name="pulse" />实时监控</span><small>SIM / 1s</small></div>
    <section className="factory-glass factory-kpi">
      <div className="factory-between"><span>过程能力 <small>CPK</small></span><span className={`factory-tag ${m.cpk < 1.33 ? 'warn' : ''}`}>{m.cpk < 1.33 ? '低于目标' : '能力稳定'}</span></div>
      <div className="factory-number">{m.cpk.toFixed(2)}<small>目标 ≥ 1.33</small></div>
      <Trend values={state.history.map(x => x.cpk)} color="#70d9ef" min={0} max={3} threshold={1.33} label="平面度单侧能力指数最近60次更新趋势，虚线为1.33" />
      <div className="factory-kpi-foot">平面度 · 单侧 Cpu · n = 32</div>
    </section>
    <section className="factory-glass factory-kpi">
      <div className="factory-between"><span>综合良率 <small>YIELD</small></span><span className="factory-dot" data-alert={m.yieldRate < 98.5} /></div>
      <div className="factory-number">{m.yieldRate.toFixed(2)}<sup>%</sup></div>
      <Trend values={state.history.map(x => x.yieldRate)} color="#87ebbc" min={85} max={100} threshold={98.5} label="综合良率最近60次更新趋势，虚线为98.5%" />
      <div className="factory-kpi-foot">滚动估计 · 演示目标 ≥ 98.5%</div>
    </section>
    <section className="factory-glass factory-kpi">
      <div className="factory-between"><span>毛刺缺陷率 <small>BURR</small></span><span className="factory-dot" data-alert={m.burr > 1} /></div>
      <div className={`factory-number ${m.burr > 1 ? 'factory-amber' : ''}`}>{m.burr.toFixed(2)}<sup>%</sup></div>
      <Trend values={state.history.map(x => x.burr)} color="#ffc178" min={0} max={10} threshold={1} label="毛刺缺陷率最近60次更新趋势，虚线为1%" />
      <div className="factory-kpi-foot">外观缺陷 · 与尺寸能力独立统计</div>
    </section>
    <section className="factory-glass factory-operations">
      <div className="factory-between"><span>产线运行</span><small>{quality ? '质量窗口稳定' : '质量待优化'}</small></div>
      <dl><div><dt>有效产能</dt><dd>{state.running ? m.throughput.toFixed(0) : '0'} <small>件/min</small></dd></div><div><dt>累计产出</dt><dd>{fmt(state.produced)} <small>件</small></dd></div><div><dt>预计合格件</dt><dd>{fmt(state.good)} <small>件</small></dd></div><div><dt>估算功率</dt><dd>{state.running ? m.power.toFixed(1) : '2.0'} <small>kW</small></dd></div></dl>
      <div className="factory-between"><span>下料缓冲区</span><strong>{state.buffer.toFixed(0)} / 60</strong></div>
      <progress max={60} value={state.buffer} aria-label="下料缓冲区库存" />
    </section>
  </aside>;
}

function MesRecords({ state }: { state: FactoryState }) {
  const [matched, setMatched] = useState(false), [page, setPage] = useState(0);
  const evidence = useMemo(() => mesEvidence(state.params, state.wear), [state.params, state.wear]);
  const rows = matched ? evidence.rows : mesBatches;
  const pages = Math.max(1, Math.ceil(rows.length / 10));
  const current = Math.min(page, pages - 1);
  return <section className="factory-glass factory-records">
    <div className="factory-section-title"><div><span className="factory-eyebrow">CONNECTED INTELLIGENCE</span><h2><Icon name="data" />MES 批次追溯 <span className="factory-tag">合成数据</span></h2></div><label className="factory-checkbox"><input type="checkbox" checked={matched} onChange={e => { setMatched(e.target.checked); setPage(0); }} />仅看相近工况</label></div>
    <p className="factory-muted">120 批 · {fmt(mesBatches.reduce((a, b) => a + b.count, 0))} 件虚拟记录。相近工况按速度 ±8 SPM、同磨损状态筛选；匹配 {evidence.rows.length} 批，按件数加权良率 {evidence.yieldRate.toFixed(2)}%。</p>
    <div className="factory-table-wrap" tabIndex={0} aria-label="MES合成批次数据，可横向滚动"><table><thead><tr><th>批次 / 匿名料号 UT-SUS-01</th><th>冲压 SPM</th><th>覆膜 m/min</th><th>下料 次/min</th><th>样本量</th><th>能力参考</th><th>BURR</th><th>YIELD</th><th>模具</th></tr></thead><tbody>{rows.slice(current * 10, current * 10 + 10).map(row => <tr key={row.id}><td>{row.id}</td><td>{row.speed}</td><td>{row.film.toFixed(1)}</td><td>{row.unloader}</td><td>{fmt(row.count)}</td><td className={row.cpk < 1.33 ? 'factory-amber' : ''}>{row.cpk.toFixed(2)}</td><td>{row.burr.toFixed(2)}%</td><td className={row.yieldRate < 98.5 ? 'factory-amber' : 'factory-mint'}>{row.yieldRate.toFixed(2)}%</td><td>{row.wear ? '磨损' : '正常'}</td></tr>)}</tbody></table></div>
    <div className="factory-between factory-pagination"><small>历史能力参考为合成稳态模型值；当前 Cpk 来自 32 件滚动样本。</small><div><button disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="上一页批次">←</button><span>{current + 1} / {pages}</span><button disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="下一页批次">→</button></div></div>
  </section>;
}

function DecisionPlan({ state, onExecute }: { state: FactoryState; onExecute: () => void }) {
  const plan = state.plan;
  if (!plan) return null;
  const changes = controls.filter(c => state.params[c.key] !== plan.next[c.key]);
  const reasons = plan.reason.split('。').map(text => text.trim()).filter(Boolean);
  return <section className="factory-plan" aria-label="AI决策建议">
    <div className="factory-plan-head"><div><span className="factory-eyebrow">AI DECISION / 待授权</span><h3>{plan.title}</h3></div><span className={`factory-tag ${plan.manual ? 'warn' : ''}`}>{plan.manual ? '需要人工' : '可执行'}</span></div>
    <div className="factory-decision-block"><strong>01 · 判断依据</strong><ul>{reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></div>
    <div className="factory-evidence-grid"><div><span>匹配批次</span><b>{plan.evidence.rows.length}</b><small>速度 ±8 SPM</small></div><div><span>参考样本</span><b>{fmt(plan.evidence.count)}</b><small>件</small></div><div><span>历史良率</span><b>{plan.evidence.yieldRate.toFixed(2)}%</b><small>按件数加权</small></div></div>
    <div className="factory-decision-block"><strong>02 · 建议动作</strong>{plan.manual ? <p>停线 → 隔离在制品 → 检查刃口与间隙 → 首件复测</p> : <div className="factory-action-list">{changes.map(c => <span key={c.key}><i>{c.label}</i><b>{state.params[c.key]} → {plan.next[c.key]}</b><small>{c.unit}</small></span>)}</div>}</div>
    {!plan.manual ? <div className="factory-decision-block"><strong>03 · 稳态预测</strong><div className="factory-predict"><span>CPK <b>{plan.predicted.capability.toFixed(2)}</b></span><span>YIELD <b>{plan.predicted.yieldRate.toFixed(2)}%</b></span><span>BURR <b>{plan.predicted.burr.toFixed(2)}%</b></span></div><small>模型预测，执行后由滚动窗口验证</small></div> : null}
    <button className="factory-primary" onClick={onExecute}>{plan.manual ? '停线并生成人工检查单' : '授权执行协同优化'}<Icon name="arrow" /></button>
  </section>;
}

function DecisionResult({ state }: { state: FactoryState }) {
  const decision = state.lastDecision;
  if (!decision) return null;
  const current = state.metrics;
  const metrics = [
    { label: '过程能力', before: decision.before.cpk, predicted: decision.predicted.capability, actual: current.cpk, suffix: '' },
    { label: '综合良率', before: decision.before.yieldRate, predicted: decision.predicted.yieldRate, actual: current.yieldRate, suffix: '%' },
    { label: '毛刺缺陷率', before: decision.before.burr, predicted: decision.predicted.burr, actual: current.burr, suffix: '%' },
  ];
  const settled = Math.abs(current.yieldRate - decision.predicted.yieldRate) < .35 && Math.abs(current.burr - decision.predicted.burr) < .25;
  return <section className="factory-glass factory-decision-result" aria-label="AI调参结果验证">
    <div className="factory-result-head"><div><span className="factory-eyebrow">CLOSED LOOP / {decision.executedAt}</span><h2>依据、动作、预测、实测</h2></div><span className={`factory-tag ${settled ? '' : 'warn'}`}>{settled ? '窗口已趋稳' : '窗口更新中'}</span></div>
    <div className="factory-result-grid"><div className="factory-result-summary"><strong>依据</strong><p>{decision.reason}</p><small>合成 MES {decision.evidence.rows.length} 批 / {fmt(decision.evidence.count)} 件</small></div><div className="factory-result-summary"><strong>已执行动作</strong><ul>{decision.changes.map(change => <li key={change}>{change}</li>)}</ul><small>{decision.automatic ? 'AI 自动接管' : '操作员授权执行'}</small></div><div className="factory-result-metrics"><div className="factory-result-labels"><span>指标</span><span>执行前</span><span>预测</span><span>当前实测</span></div>{metrics.map(metric => <div key={metric.label}><span>{metric.label}</span><span>{metric.before.toFixed(2)}{metric.suffix}</span><span>{metric.predicted.toFixed(2)}{metric.suffix}</span><strong>{metric.actual.toFixed(2)}{metric.suffix}</strong></div>)}</div></div>
  </section>;
}

export default function FactoryConsole() {
  const [state, dispatch] = useReducer(factoryReducer, undefined, initialState);
  const [selected, setSelected] = useState(5), [question, setQuestion] = useState('');
  const [tab, setTab] = useState<'mes' | 'audit'>('mes');
  const [demoElapsed, setDemoElapsed] = useState(0);
  const [demoActive, setDemoActive] = useState(false);
  const [demoPaused, setDemoPaused] = useState(false);
  const [demoFinished, setDemoFinished] = useState(false);
  const demoCues = useRef(new Set<number>());
  const demoElapsedRef = useRef(0);
  const chat = useRef<HTMLDivElement>(null);
  const lastMessage = state.messages.at(-1)?.id;
  useEffect(() => {
    const timer = window.setInterval(() => { if (!document.hidden) dispatch({ type: 'tick' }); }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { if (chat.current) chat.current.scrollTop = chat.current.scrollHeight; }, [lastMessage]);
  const runDemoCues = useCallback((elapsed: number) => {
    for (const step of demoSteps) {
      if (elapsed < step.at || demoCues.current.has(step.at)) continue;
      demoCues.current.add(step.at);
      if (step.at === 8) dispatch({ type: 'scenario', scenario: 'overspeed' });
      if (step.at === 25) setSelected(6);
      if (step.at === 34) dispatch({ type: 'ask', question: '为什么良率下降？请给出 MES 依据和可执行方案。' });
      if (step.at === 50) dispatch({ type: 'execute' });
      if (step.at === 72) setTab('audit');
      if (step.at === DEMO_DURATION) { setDemoActive(false); setDemoFinished(true); }
    }
  }, []);
  useEffect(() => {
    if (!demoActive || demoPaused) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const next = Math.min(DEMO_DURATION, demoElapsedRef.current + 1);
      demoElapsedRef.current = next;
      setDemoElapsed(next);
      runDemoCues(next);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [demoActive, demoPaused, runDemoCues]);
  const m = state.metrics, station = stations[selected];
  const warning = m.cpk < 1.33 || m.yieldRate < 98.5 || state.wear || state.buffer > 10;
  const ask = (q: string) => { dispatch({ type: 'ask', question: q }); setQuestion(''); };
  const currentDemoStep = [...demoSteps].reverse().find(step => demoElapsed >= step.at) ?? demoSteps[0];
  const nextDemoStep = demoSteps.find(step => step.at > demoElapsed);
  const startDemo = () => {
    dispatch({ type: 'reset' }); setSelected(5); setTab('mes'); setDemoElapsed(0); demoElapsedRef.current = 0; setDemoPaused(false); setDemoFinished(false); demoCues.current.clear(); demoCues.current.add(0); setDemoActive(true);
  };
  const stopDemo = () => { setDemoActive(false); setDemoPaused(false); setDemoFinished(false); };
  const toggleDemoPause = () => {
    setDemoPaused(value => !value);
    dispatch({ type: 'toggle-running' });
  };
  const skipDemoStep = () => { if (nextDemoStep) { demoElapsedRef.current = nextDemoStep.at; setDemoElapsed(nextDemoStep.at); runDemoCues(nextDemoStep.at); } };
  const resetAll = () => { stopDemo(); dispatch({ type: 'reset' }); setSelected(5); setTab('mes'); setDemoElapsed(0); demoElapsedRef.current = 0; };

  return <main className="factory-console">
    <div className="factory-topline"><div><span className="factory-brand-mark"><Icon name="cube" /></span><div><Link href="/">UNIVERSE TECH</Link><span>星玥阳 · 工业智能体验中心</span></div></div><div><span className="factory-demo-badge">交互仿真 DEMO</span><Link href="/solutions">返回行业方案 ↗</Link></div></div>
    <header className="factory-page-heading"><div><p className="factory-eyebrow">DIGITAL TWIN / STAMPING LINE 01</p><h1>让产线，看得见。<span>让决策，有依据。</span></h1></div><div className="factory-session"><span className="factory-dot" data-alert={!state.running} /><span>{state.running ? '仿真运行中' : '仿真已暂停'}</span><time>{formatTime(state.tick)}</time><small>X0.46</small></div></header>
    <div className="factory-scenario-bar"><div><span className="factory-eyebrow">演示场景</span><div className="factory-scenarios">{scenarios.map(s => <button key={s.key} disabled={demoActive} aria-pressed={state.scenario === s.key} title={s.summary} onClick={() => dispatch({ type: 'scenario', scenario: s.key })}>{s.name}</button>)}</div></div><div className="factory-demo-actions"><button className="factory-guided-start" onClick={demoActive ? stopDemo : startDemo}>{demoActive ? '■ 结束自动演示' : demoFinished ? '↻ 再演示一次' : '▶ 开始 90 秒客户演示'}</button><button className="factory-quiet" onClick={resetAll}>↺ 重置</button></div></div>
    {demoActive || demoFinished ? <section className={`factory-glass factory-demo-guide ${demoFinished ? 'is-complete' : ''}`} aria-live="polite"><div className="factory-demo-progress"><span style={{ width: `${demoElapsed / DEMO_DURATION * 100}%` }} /></div><div><span className="factory-demo-step">{String(demoSteps.indexOf(currentDemoStep) + 1).padStart(2, '0')} / {String(demoSteps.length).padStart(2, '0')}</span><div><h2>{currentDemoStep.title}</h2><p>{currentDemoStep.text}</p></div><time>{String(Math.floor(demoElapsed / 60)).padStart(2, '0')}:{String(demoElapsed % 60).padStart(2, '0')}</time>{demoFinished ? <button onClick={startDemo}>↻ 重播</button> : <button onClick={toggleDemoPause}>{demoPaused ? '▶ 继续' : 'Ⅱ 暂停'}</button>}<button onClick={demoFinished ? stopDemo : skipDemoStep} disabled={!demoFinished && !nextDemoStep}>{demoFinished ? '关闭' : '下一步 →'}</button></div></section> : null}

    <div className="factory-workspace">
      <Monitor state={state} />
      <div className="factory-center">
        <section className="factory-glass factory-world" aria-label="三维智慧冲压产线">
          <div className="factory-world-heading"><div><span className="factory-eyebrow">LIVE DIGITAL TWIN</span><h2>精密冲压 · 数字孪生</h2></div><span className={`factory-tag ${warning ? 'warn' : ''}`}>{warning ? '异常待处理' : '产线稳定'}</span></div>
          <div className="factory-world-meta"><span>SUS 精密结构件</span><span>7 道工序</span><span>MES · 模拟连接</span></div>
          <FactoryScene params={state.params} running={state.running} warning={warning} buffer={state.buffer} selected={selected} defects={{ burr: m.burr, surface: m.surface, handling: m.handling, filmError: m.filmError, wear: state.wear }} onSelect={setSelected} />
          <div className="factory-scene-caption"><span>拖动旋转 · 滚轮缩放 · 点击设备</span><span>● 正常 <i>● 关注</i></span></div>
          <div className="factory-stations" aria-label="选择工序">{stations.map((s, i) => <button key={s.name} aria-pressed={selected === i} onClick={() => setSelected(i)}><small>{String(i + 1).padStart(2, '0')}</small><span>{s.name}</span><i /></button>)}</div>
          <div className="factory-station-detail"><div><span className="factory-eyebrow">{station.en}</span><h3>{station.name}</h3><p>{station.detail}</p></div><div><strong>{state.params[station.key]}</strong><small>{controls.find(c => c.key === station.key)?.unit}</small></div></div>
        </section>

        <section className="factory-glass factory-controls">
          <div className="factory-panel-heading"><span><Icon name="sliders" />工艺控制</span><button disabled={demoActive} className={state.running ? 'factory-stop' : 'factory-start'} onClick={() => dispatch({ type: 'toggle-running' })}>{state.running ? 'Ⅱ 暂停仿真' : '▶ 恢复仿真'}</button></div>
          <div className="factory-master-control"><div><label htmlFor="factory-speed">冲压产线速度</label><p>送料节距 250 mm · 所需线速 {(state.params.speed * .25).toFixed(1)} m/min</p></div><div><strong>{state.params.speed}</strong><span>SPM</span></div></div>
          <input id="factory-speed" disabled={demoActive} type="range" min="30" max="100" step="1" value={state.params.speed} onChange={e => dispatch({ type: 'parameter', key: 'speed', value: Number(e.target.value) })} aria-valuetext={`${state.params.speed} 冲次每分钟`} />
          <div className="factory-range-labels"><span>30 SPM</span><span>演示稳定窗口 55–65 SPM</span><span>100 SPM</span></div>
          <div className="factory-control-grid">{controls.filter(c => c.key !== 'speed').map(c => <div className="factory-control" key={c.key}><div><label htmlFor={`factory-${c.key}`}>{c.label}</label><output htmlFor={`factory-${c.key}`}>{state.params[c.key]} <small>{c.unit}</small></output></div><input id={`factory-${c.key}`} disabled={demoActive} type="range" min={c.min} max={c.max} step={c.step} value={state.params[c.key]} onChange={e => dispatch({ type: 'parameter', key: c.key as keyof Parameters, value: Number(e.target.value) })} /></div>)}</div>
          <p className="factory-control-note">改变参数后，观察动画、缺陷率及 32 件滚动能力窗口。1 秒演示时间 = 10 秒产线时间；采样为加速展示。</p>
        </section>
      </div>

      <aside className="factory-glass factory-ai" aria-label="AI产线助手">
        <div className="factory-ai-header"><span className="factory-ai-avatar"><Icon name="ai" /></span><div><h2>产线 AI Copilot</h2><p>分析 · 决策 · 协同控制</p></div><span className="factory-tag">DEMO</span></div>
        <div className="factory-auto-control"><div><strong>AI 自动接管</strong><small>{state.auto ? '持续监测与协同调参' : '生成方案，由你执行'}</small></div><button className="factory-switch" role="switch" aria-label="AI自动接管，仅控制仿真" aria-checked={state.auto} onClick={() => dispatch({ type: 'auto' })}><span /></button></div>
        <div className="factory-chat" ref={chat} role="log" aria-label="AI对话记录" aria-live="polite" aria-relevant="additions">{state.messages.map(message => <article key={message.id} className={`factory-message ${message.role}`}><div><span>{message.role === 'ai' ? 'UNIVERSE AI' : message.role === 'operator' ? '操作员' : '产线事件'}</span><time>{message.time}</time></div><p>{message.text}</p></article>)}</div>
        <DecisionPlan state={state} onExecute={() => dispatch({ type: 'execute' })} />
        {state.wear || state.maintenance ? <div className="factory-maintenance"><strong>人工介入 · 模具检查</strong><p>检查刃口、冲裁间隙与首件质量。此按钮仅模拟维修完成。</p><button onClick={() => dispatch({ type: 'maintenance' })}>模拟完成检修</button></div> : null}
        <div className="factory-prompts"><button onClick={() => ask('为什么良率下降？')}>为什么良率下降？</button><button onClick={() => ask('查询 MES 历史批次')}>查询 MES 依据</button><button onClick={() => ask('解释 Cpk')}>解释 Cpk</button></div>
        <form className="factory-chat-form" onSubmit={e => { e.preventDefault(); ask(question); }}><label className="factory-sr-only" htmlFor="factory-question">向AI询问产线问题</label><textarea id="factory-question" maxLength={500} rows={2} value={question} onChange={e => setQuestion(e.target.value)} placeholder="问问 AI：如何稳定这条产线？" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); ask(question); } }} /><button type="submit" disabled={!question.trim()} aria-label="发送问题"><Icon name="arrow" /></button></form>
        <p className="factory-ai-disclosure">本地规则驱动的 AI 演示 · 未接入真实 MES / PLC</p>
      </aside>
    </div>

    <DecisionResult state={state} />

    <div className="factory-record-tabs" role="tablist" aria-label="数据与决策记录"><button id="factory-mes-tab" role="tab" aria-selected={tab === 'mes'} aria-controls="factory-mes-panel" tabIndex={tab === 'mes' ? 0 : -1} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setTab('audit'); document.getElementById('factory-audit-tab')?.focus(); } }} onClick={() => setTab('mes')}>MES 批次数据 <span>120</span></button><button id="factory-audit-tab" role="tab" aria-selected={tab === 'audit'} aria-controls="factory-audit-panel" tabIndex={tab === 'audit' ? 0 : -1} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setTab('mes'); document.getElementById('factory-mes-tab')?.focus(); } }} onClick={() => setTab('audit')}>决策与操作记录 <span>{state.audit.length}</span></button></div>
    <div id="factory-mes-panel" role="tabpanel" aria-labelledby="factory-mes-tab" hidden={tab !== 'mes'}><MesRecords state={state} /></div>
    <div id="factory-audit-panel" role="tabpanel" aria-labelledby="factory-audit-tab" hidden={tab !== 'audit'}><section className="factory-glass factory-audit"><h2>每次决策，都有记录。</h2><p className="factory-muted">本次演示最多保留 40 条操作事件；刷新或重置后清空。</p>{state.audit.length ? <ol>{state.audit.map(entry => <li key={entry.id}><time>{entry.time}</time><p>{entry.text}</p></li>)}</ol> : <p className="factory-empty">选择异常场景并执行 AI 方案后，这里会记录参数变化与处理步骤。</p>}</section></div>
    <details className="factory-method"><summary>关于数据、统计口径与演示边界</summary><div><p>参考上传 CPK 报告的结构：23 个尺寸特征、32 组样本、平面度单侧上限 0.600 mm；其平面度均值约 0.1906 mm、标准差约 0.0721 mm、单侧能力约 1.89。此页面使用匿名料号与重新生成的样本，未公开原始报告、客户标识或逐件测量值。</p><p>实时能力使用 Cpu = (USL − 样本均值) / (3 × 样本标准差)，在界面简称 Cpk（单侧）。32 件滚动窗口处于动态演示中，不代表完成稳定性检验的量产能力结论。历史能力参考使用合成模型的均值和标准差。</p><p>YIELD、BURR、膜面缺陷、功率和参数响应均为合成模型；良率独立包含多个缺陷机制，不能直接由平面度 Cpk 推导。MES 的 120 批数据与调参建议来自同一演示模型，相关记录不是因果验证。演示良率目标 98.5%、毛刺关注线 1%、能力目标 1.33 均不是客户验收标准。</p><p>原材假设为 SUS 卷料，送料节距 250 mm，每冲次 1 件；速度同步关系为 m/min = SPM × 0.25。仿真时间按 10 倍推进，32 件质量窗口采用加速采样，不等同于计件系统。AI 是离线规则演示，不调用真实设备、现有企业 Agent 或官网咨询助手。</p></div></details>
    <footer className="factory-footer"><span>UNIVERSE TECH · INDUSTRIAL INTELLIGENCE</span><span>从感知，到行动。</span><Link href="/inquiry">讨论你的工厂方案 ↗</Link></footer>
  </main>;
}
