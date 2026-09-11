/** X0.46: deterministic, browser-only demonstration. No MES or machine writes. */
export type Parameters = {
  speed: number; leveler: number; cleaning: number; film: number;
  marking: number; loader: number; unloader: number;
};
export type Scenario = 'normal' | 'overspeed' | 'film' | 'robot' | 'wear';
export const controls: { key: keyof Parameters; label: string; unit: string; min: number; max: number; step: number }[] = [
  { key: 'speed', label: '冲压节拍', unit: 'SPM', min: 30, max: 100, step: 1 },
  { key: 'leveler', label: '原材 / 整平', unit: 'm/min', min: 8, max: 28, step: .5 },
  { key: 'cleaning', label: '无纺布更新', unit: 'mm/min', min: 5, max: 25, step: 1 },
  { key: 'film', label: '覆膜速度', unit: 'm/min', min: 8, max: 28, step: .5 },
  { key: 'marking', label: '打码能力', unit: '件/min', min: 40, max: 120, step: 1 },
  { key: 'loader', label: '上料机械手', unit: '次/min', min: 35, max: 110, step: 1 },
  { key: 'unloader', label: '下料机械手', unit: '次/min', min: 35, max: 110, step: 1 },
];
export const baseline: Parameters = { speed: 60, leveler: 15, cleaning: 15, film: 15, marking: 75, loader: 68, unloader: 68 };
export const stations = [
  { name: '原材上卷', en: 'RAW MATERIAL', detail: 'SUS 卷料 · 节距 250 mm · 单出件', key: 'leveler' },
  { name: '精密整平', en: 'LEVELING', detail: '整平送料与冲压节拍保持匹配，避免张力和残余应力波动。', key: 'leveler' },
  { name: '无纺布擦洁', en: 'CLEANING', detail: '无纺布连续更新，去除表面颗粒；更新不足会增加表面缺陷。', key: 'cleaning' },
  { name: '保护膜覆合', en: 'LAMINATION', detail: '覆膜线速跟随送料线速；差速过大会增加起皱和偏移风险。', key: 'film' },
  { name: '激光打码', en: 'TRACEABILITY', detail: '赋予工件追溯码；打码能力不足会限制有效产能。', key: 'marking' },
  { name: '伺服冲压', en: 'STAMPING', detail: '上下料机械手协同冲压。过快节拍可能放大振动、送料波动和毛刺风险。', key: 'speed' },
  { name: '智能 AOI', en: 'AOI + 3D', detail: '演示配置：外观 AOI + 3D 平面度测量；综合良率包含多个缺陷类别。', key: 'unloader' },
] as const;
export const scenarios: { key: Scenario; name: string; summary: string }[] = [
  { key: 'normal', name: '稳定生产', summary: '观察基准产线与质量窗口' },
  { key: 'overspeed', name: '超速冲压', summary: '节拍提升，毛刺与尺寸波动上升' },
  { key: 'film', name: '覆膜失配', summary: '差速引起膜皱与表面缺陷' },
  { key: 'robot', name: '下料积料', summary: '机械手能力不足，缓冲区积料' },
  { key: 'wear', name: '模具磨损', summary: '需要停线并由人工检查刃口' },
];
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
export const formatTime = (tick: number) => {
  const seconds = tick * 10;
  return `${String(Math.floor(seconds / 3600) + 9).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};
function random(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}
function normal(seed: number) {
  return Math.sqrt(-2 * Math.log(Math.max(.00001, random(seed)))) * Math.cos(2 * Math.PI * random(seed + 19));
}
export function processModel(p: Parameters, wear = false) {
  const feed = p.speed * .25;
  const stress = Math.max(0, p.speed - 65) / 35;
  const levelError = Math.abs(p.leveler - feed) / feed;
  const filmError = Math.abs(p.film - feed) / feed;
  const cleanRisk = Math.max(0, p.speed / 4 - p.cleaning) / 15;
  const robotRisk = Math.max(0, p.speed - p.unloader) / 30;
  const burr = clamp(.18 + 3.8 * stress ** 2 + (wear ? 5.8 : 0) + .4 * levelError, .1, 14);
  const surface = clamp(.16 + 5 * filmError + 2 * cleanRisk, .1, 18);
  const handling = clamp(.08 + 1.2 * robotRisk, .05, 5);
  const mean = .1906 + .12 * stress + .10 * levelError + (wear ? .09 : 0);
  const sigma = .0721 + .026 * stress + .025 * levelError + (wear ? .014 : 0);
  // Dimension nonconformance and appearance defects are separate demo mechanisms.
  const z = (0.6 - mean) / sigma;
  const dimension = 100 * .5 * Math.exp(-.717 * Math.max(0, z) - .416 * Math.max(0, z) ** 2);
  const yieldRate = 100 * (1 - burr / 100) * (1 - surface / 100) * (1 - handling / 100) * (1 - dimension / 100);
  const throughput = Math.min(p.speed, p.leveler / .25, p.marking, p.loader, p.unloader);
  return { mean, sigma, burr, surface, handling, yieldRate, throughput, filmError, levelError,
    capability: (.6 - mean) / (3 * sigma), power: 8 + p.speed * .22 };
}
export function capability(samples: number[]) {
  if (samples.length < 2) return { mean: 0, sigma: 0, cpk: 0 };
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const sigma = Math.sqrt(samples.reduce((a, b) => a + (b - mean) ** 2, 0) / (samples.length - 1));
  return { mean, sigma, cpk: sigma > 0 ? (.6 - mean) / (3 * sigma) : 0 };
}
export type Metrics = ReturnType<typeof processModel> & { cpk: number; measuredMean: number; measuredSigma: number };
export type MesBatch = { id: string; speed: number; film: number; cleaning: number; loader: number; unloader: number; wear: boolean; count: number; yieldRate: number; cpk: number; burr: number };
export const mesBatches: MesBatch[] = Array.from({ length: 120 }, (_, i) => {
  const speed = 48 + (i * 7 % 48);
  const p = { ...baseline, speed, leveler: speed * .25, film: speed * .25 + (i % 5 === 0 ? 4 : 0), loader: speed + 8, unloader: speed + (i % 7 === 0 ? -14 : 8) };
  const wear = i % 13 === 0;
  const m = processModel(p, wear);
  return { id: `DEMO-MES-${String(i + 1).padStart(4, '0')}`, ...p, wear, count: 800 + (i * 173 % 2200), yieldRate: m.yieldRate, cpk: m.capability, burr: m.burr };
});
export function mesEvidence(p: Parameters, wear: boolean) {
  const rows = mesBatches.filter(b => b.wear === wear && Math.abs(b.speed - p.speed) <= 8);
  const count = rows.reduce((a, b) => a + b.count, 0);
  const avg = (key: 'yieldRate' | 'cpk' | 'burr') => rows.length ? rows.reduce((a, b) => a + b[key] * b.count, 0) / count : 0;
  return { rows, count, yieldRate: avg('yieldRate'), cpk: avg('cpk'), burr: avg('burr') };
}
export type Plan = { title: string; reason: string; next: Parameters; manual: boolean; evidence: ReturnType<typeof mesEvidence>; predicted: ReturnType<typeof processModel> };
export function diagnose(p: Parameters, wear: boolean, metrics: Metrics): Plan {
  const evidence = mesEvidence(p, wear);
  const next = { ...baseline };
  const causes: string[] = [];
  if (wear) causes.push('模具磨损信号已触发，毛刺风险无法通过调速消除；停线隔离在制品，检查刃口、间隙并复测首件');
  if (p.speed > 65) causes.push(`冲压 ${p.speed} SPM 超出演示稳定窗口 55–65 SPM，先回落到 60 SPM 降低动态载荷`);
  if (metrics.levelError > .08) causes.push(`整平与所需送料线速 ${Number((p.speed * .25).toFixed(1))} m/min 失配，需同步送料`);
  if (metrics.filmError > .08) causes.push('覆膜差速超过 8%，需与送料同步，减少起皱和膜面损伤');
  if (p.unloader < p.speed || p.loader < p.speed) causes.push('机械手低于冲压节拍；上下料设为 68 次/min，为 60 SPM 预留约 13% 能力余量');
  if (p.cleaning < p.speed / 4) causes.push('无纺布更新不足，增加更新速度以降低颗粒残留风险');
  if (p.marking < p.speed) causes.push('打码能力限制产出，提升至 75 件/min');
  if (!causes.length) causes.push(metrics.cpk < 1.33 ? '平面度窗口能力低于演示阈值 1.33，使用 60 SPM 基准配方并继续采样；持续异常需人工复测' : '当前没有显著质量报警，可使用 60 SPM 基准配方统一整平、覆膜和机械手节拍，并继续观察；若已在基准配方则不重复调参');
  return { title: wear ? '转交人工 · 停线检查模具' : '协同优化 · 稳定质量窗口', reason: causes.join('。') + '。', next, manual: wear, evidence, predicted: processModel(next, wear) };
}
export type Entry = { id: number; time: string; role: 'ai' | 'operator' | 'system'; text: string };
export type Audit = { id: number; time: string; text: string };
export type FactoryState = {
  params: Parameters; wear: boolean; running: boolean; auto: boolean; tick: number;
  samples: number[]; metrics: Metrics; history: { cpk: number; yieldRate: number; burr: number }[];
  produced: number; good: number; buffer: number; scenario: Scenario;
  messages: Entry[]; audit: Audit[]; plan: Plan | null; revision: number;
  baselineResult: { cpk: number; yieldRate: number; burr: number } | null;
  badTicks: number; cooldown: number; maintenance: boolean;
};
function metricsFor(p: Parameters, wear: boolean, samples: number[]): Metrics {
  const m = processModel(p, wear), stats = capability(samples);
  return { ...m, cpk: stats.cpk, measuredMean: stats.mean, measuredSigma: stats.sigma };
}
export function initialState(): FactoryState {
  const m = processModel(baseline);
  const samples = Array.from({ length: 32 }, (_, i) => Math.max(.001, m.mean + normal(i + 41) * m.sigma));
  const metrics = metricsFor(baseline, false, samples);
  return { params: { ...baseline }, wear: false, running: true, auto: false, tick: 0, samples, metrics,
    history: [{ cpk: metrics.cpk, yieldRate: metrics.yieldRate, burr: metrics.burr }], produced: 0, good: 0, buffer: 0, scenario: 'normal',
    messages: [{ id: 0, time: '09:00:00', role: 'ai', text: '我是产线 AI 演示助手。选择一个异常场景，或提高冲压节拍，然后问我“为什么良率下降？”。我会查询合成 MES 批次，解释原因，并给出可执行的协同调参方案。' }],
    audit: [], plan: null, revision: 0, baselineResult: null, badTicks: 0, cooldown: 0, maintenance: false };
}
function append(s: FactoryState, role: Entry['role'], text: string): FactoryState {
  return { ...s, revision: s.revision + 1, messages: [...s.messages, { id: s.revision + 1, time: formatTime(s.tick), role, text }].slice(-40) };
}
function log(s: FactoryState, text: string): FactoryState {
  return { ...s, revision: s.revision + 1, audit: [{ id: s.revision + 1, time: formatTime(s.tick), text }, ...s.audit].slice(0, 40) };
}
function execute(s: FactoryState, automatic = false): FactoryState {
  // Recalculate from current state; never execute a stale chat snapshot.
  const plan = diagnose(s.params, s.wear, s.metrics);
  if (plan.manual) return log(append({ ...s, running: false, auto: false, plan: null, maintenance: true }, 'ai', `${plan.reason} 已暂停仿真。请由操作员完成检查后点击“模拟完成检修”，再手动复产。`), 'AI 停线 → 模具检查 / 在制品隔离 / 首件复测（演示工单）');
  if (!s.running) return append(s, 'ai', '产线已暂停。请先恢复仿真，再执行协同优化。');
  const changes = controls.filter(c => s.params[c.key] !== plan.next[c.key]).map(c => `${c.label} ${s.params[c.key]}→${plan.next[c.key]} ${c.unit}`);
  if (!changes.length) return append({ ...s, plan: null, cooldown: 12 }, 'ai', '当前已处于基准配方，继续观察 32 件滚动窗口；无需重复调参。若持续不达标，请停线人工复测。');
  const before = { cpk: s.metrics.cpk, yieldRate: s.metrics.yieldRate, burr: s.metrics.burr };
  return log(append({ ...s, params: plan.next, plan: null, baselineResult: before, cooldown: 12, badTicks: 0 }, 'ai', `${automatic ? '自动接管' : '已执行'}：${changes.join('；')}。依据：${plan.reason} 合成 MES 匹配 ${plan.evidence.rows.length} 批 / ${plan.evidence.count} 件（速度 ±8 SPM、同磨损状态）。预计稳定后良率约 ${plan.predicted.yieldRate.toFixed(2)}%；接下来观察窗口逐步更新，预测不是实测承诺。`), `${automatic ? '自动' : '操作员授权'}调参：${changes.join('；')}`);
}
export type Action = { type: 'tick' } | { type: 'parameter'; key: keyof Parameters; value: number } | { type: 'scenario'; scenario: Scenario } | { type: 'ask'; question: string } | { type: 'execute' } | { type: 'toggle-running' } | { type: 'auto' } | { type: 'maintenance' } | { type: 'reset' };
export function factoryReducer(s: FactoryState, action: Action): FactoryState {
  if (action.type === 'reset') return initialState();
  if (action.type === 'toggle-running') {
    if (s.maintenance || s.wear && !s.running) return append(s, 'ai', '模具检查尚未完成。请先模拟完成检修，再恢复运行。');
    return log({ ...s, running: !s.running, plan: null }, s.running ? '操作员暂停仿真' : '操作员恢复仿真');
  }
  if (action.type === 'auto') return log(append({ ...s, auto: !s.auto }, 'system', s.auto ? '已关闭自动接管。' : '自动接管已开启：连续异常后协同调参；磨损报警会停线并要求人工介入。'), s.auto ? '自动接管关闭' : '自动接管开启（仅仿真）');
  if (action.type === 'maintenance') {
    if (!s.wear && !s.maintenance) return s;
    return log(append({ ...s, wear: false, maintenance: false, running: false, params: { ...baseline }, plan: null, scenario: 'normal' }, 'system', '模拟检修完成：已检查刃口 / 间隙并复测首件。请手动恢复仿真，质量窗口仍需重新采样。'), '人工模拟完成检修，等待手动复产');
  }
  if (action.type === 'parameter') {
    const c = controls.find(c => c.key === action.key)!;
    if (!Number.isFinite(action.value)) return s;
    const value = clamp(Math.round(action.value / c.step) * c.step, c.min, c.max);
    if (s.params[action.key] === value) return s;
    return log({ ...s, params: { ...s.params, [action.key]: value }, plan: null }, `手动调参：${c.label} ${s.params[action.key]}→${value} ${c.unit}`);
  }
  if (action.type === 'scenario') {
    // Scenario switching cannot clear an outstanding physical-fault simulation.
    if (s.wear || s.maintenance) return append(s, 'ai', '当前存在模具磨损，请先完成模拟检修。');
    const p = { ...baseline };
    if (action.scenario === 'overspeed') Object.assign(p, { speed: 94, leveler: 23.5, film: 23.5, cleaning: 23, loader: 102, unloader: 102, marking: 110 });
    if (action.scenario === 'film') p.film = 22;
    if (action.scenario === 'robot') p.unloader = 40;
    return log(append({ ...s, params: p, scenario: action.scenario, wear: action.scenario === 'wear', running: true, plan: null, baselineResult: null, cooldown: 0 }, 'system', `载入场景：${scenarios.find(x => x.key === action.scenario)!.name}。参数已改变，工件将在后续采样中反映变化。`), `演示场景：${action.scenario}`);
  }
  if (action.type === 'execute') return execute(s);
  if (action.type === 'ask') {
    const q = action.question.trim().slice(0, 500);
    if (!q) return s;
    let next = append(s, 'operator', q);
    const plan = diagnose(s.params, s.wear, s.metrics);
    if (/MES|批次|历史|数据依据/i.test(q)) {
      const e = plan.evidence;
      return append(next, 'ai', `已查询本地合成 MES：120 批、${mesBatches.reduce((a, b) => a + b.count, 0).toLocaleString('en-US')} 件。按当前速度 ±8 SPM 与同磨损状态匹配 ${e.rows.length} 批 / ${e.count} 件；加权良率 ${e.yieldRate.toFixed(2)}%、毛刺率 ${e.burr.toFixed(2)}%。这些是同一演示模型生成的参考记录，不是生产证据或因果验证。可在下方 MES 批次表查看。`);
    }
    if (/CPK|能力|平面度/i.test(q) && !/优化|接管|调整/.test(q)) return append(next, 'ai', `平面度采用单侧 USL=0.600 mm，Cpu=(USL−均值)/(3s)。当前32件窗口：均值 ${s.metrics.measuredMean.toFixed(4)} mm，s=${s.metrics.measuredSigma.toFixed(4)} mm，Cpu=${s.metrics.cpk.toFixed(2)}。界面简称 Cpk（单侧）。综合 YIELD 还受毛刺、膜皱、表面颗粒和搬运缺陷影响，不能从这个指数直接换算。阈值1.33仅为演示目标；非稳定过程中的滚动能力仅供观察。`);
    if (/良率|毛刺|BURR|YIELD|为什么|异常|优化|接管|调整|积料|膜|模具|停线|速度|怎么办/i.test(q)) {
      next = append({ ...next, plan }, 'ai', `${plan.reason} 当前毛刺率 ${s.metrics.burr.toFixed(2)}%，良率 ${s.metrics.yieldRate.toFixed(2)}%。已生成${plan.manual ? '人工检查' : '协同调参'}方案，请查看下面的执行卡片。`);
      return next;
    }
    return append(next, 'ai', `当前 ${s.running ? '运行' : '暂停'}，冲压 ${s.params.speed} SPM，缓冲 ${s.buffer.toFixed(0)} 件。我是本地规则驱动的演示助手，可分析良率/毛刺、解释 Cpk、查询 MES 或生成调参方案。试试“为什么良率下降？”或“优化这条产线”。`);
  }
  if (!s.running) return s;
  const tick = s.tick + 1, model = processModel(s.params, s.wear);
  const samples = [...s.samples.slice(8), ...Array.from({ length: 8 }, (_, i) => Math.max(.001, model.mean + normal(tick * 8 + i + 41) * model.sigma))];
  const calculated = metricsFor(s.params, s.wear, samples);
  // Appearance rates settle gradually as work in progress reaches the AOI.
  const metrics = { ...calculated, burr: s.metrics.burr + (calculated.burr - s.metrics.burr) * .3, yieldRate: s.metrics.yieldRate + (calculated.yieldRate - s.metrics.yieldRate) * .3, surface: s.metrics.surface + (calculated.surface - s.metrics.surface) * .3 };
  const buffer = clamp(s.buffer + (Math.min(s.params.speed, s.params.loader, s.params.marking, s.params.leveler / .25) - s.params.unloader) / 6, 0, 60);
  const produced = model.throughput / 6;
  const bad = metrics.cpk < 1.33 || metrics.yieldRate < 98.5 || buffer > 10;
  let next: FactoryState = { ...s, tick, samples, metrics, buffer, produced: s.produced + produced, good: s.good + produced * metrics.yieldRate / 100,
    history: [...s.history, { cpk: metrics.cpk, yieldRate: metrics.yieldRate, burr: metrics.burr }].slice(-60), badTicks: bad ? s.badTicks + 1 : 0, cooldown: Math.max(0, s.cooldown - 1) };
  if (s.auto && (s.wear || next.badTicks >= 3 && next.cooldown === 0)) next = execute(next, true);
  if (buffer >= 60) next = log(append({ ...next, running: false, auto: false }, 'system', '缓冲区已满，演示联锁暂停。提高下料能力后手动恢复。'), '缓冲满载联锁暂停');
  return next;
}
