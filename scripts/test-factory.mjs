// No browser, environment variables, network, or production services required.
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/factory/simulation.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { initialState, factoryReducer: reduce, capability, mesBatches, mesEvidence } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const advance = (state, count) => { for (let i = 0; i < count; i++) state = reduce(state, { type: 'tick' }); return state; };

test('overspeed degrades quality; AI explains and restores production gradually', () => {
  let state = advance(reduce(initialState(), { type: 'scenario', scenario: 'overspeed' }), 18);
  const poor = state.metrics;
  assert.ok(poor.burr > 2);
  assert.ok(poor.yieldRate < 98);
  assert.ok(poor.cpk < 1.33);
  state = reduce(state, { type: 'ask', question: '为什么良率下降？' });
  assert.ok(state.plan.reason.includes('动态载荷'));
  assert.ok(state.plan.evidence.rows.length > 0);
  state = reduce(state, { type: 'execute' });
  assert.equal(state.params.speed, 60);
  assert.equal(state.metrics.yieldRate, poor.yieldRate, 'actuation must not instantly rewrite measured quality');
  state = advance(state, 20);
  assert.ok(state.metrics.yieldRate > 99);
  assert.ok(state.metrics.burr < 1);
  assert.ok(state.metrics.cpk > 1.33);
  assert.ok(state.baselineResult && state.audit.length);
});

test('film mismatch lowers yield independently of dimensional capability', () => {
  const normal = advance(initialState(), 20);
  const film = advance(reduce(initialState(), { type: 'scenario', scenario: 'film' }), 20);
  assert.equal(film.metrics.cpk, normal.metrics.cpk);
  assert.equal(film.metrics.burr, normal.metrics.burr);
  assert.ok(film.metrics.yieldRate < normal.metrics.yieldRate - 1);
});

test('robot bottleneck builds buffer and AI drains it through coordinated rates', () => {
  let state = advance(reduce(initialState(), { type: 'scenario', scenario: 'robot' }), 8);
  assert.ok(state.buffer > 10);
  assert.equal(state.metrics.throughput, 40);
  state = reduce(state, { type: 'execute' });
  state = advance(state, 25);
  assert.equal(state.buffer, 0);
  assert.equal(state.metrics.throughput, 60);
});

test('automatic control detects sustained abnormality and applies a traceable plan', () => {
  let state = reduce(initialState(), { type: 'auto' });
  state = reduce(state, { type: 'scenario', scenario: 'overspeed' });
  state = advance(state, 10);
  assert.equal(state.params.speed, 60);
  assert.ok(state.audit.some(entry => entry.text.startsWith('自动调参')));
});

test('wear cannot be cured by slowing down or switching scenes; maintenance is explicit', () => {
  let state = reduce(initialState(), { type: 'auto' });
  state = advance(reduce(state, { type: 'scenario', scenario: 'wear' }), 1);
  assert.equal(state.running, false);
  assert.equal(state.maintenance, true);
  state = reduce(state, { type: 'parameter', key: 'speed', value: 30 });
  state = reduce(state, { type: 'scenario', scenario: 'normal' });
  state = reduce(state, { type: 'toggle-running' });
  assert.equal(state.wear, true);
  assert.equal(state.running, false);
  state = reduce(state, { type: 'maintenance' });
  assert.equal(state.wear, false);
  assert.equal(state.running, false, 'maintenance must not silently restart the line');
  state = reduce(state, { type: 'toggle-running' });
  assert.equal(state.running, true);
});

test('pause freezes output, sampling, time and automatic execution', () => {
  let state = reduce(initialState(), { type: 'toggle-running' });
  const frozen = state;
  state = advance(state, 10);
  assert.equal(state, frozen);
});

test('parameter edits invalidate plans and execution checks the live wear fault', () => {
  let state = reduce(initialState(), { type: 'ask', question: '优化产线' });
  assert.ok(state.plan);
  state = reduce(state, { type: 'parameter', key: 'speed', value: 90 });
  assert.equal(state.plan, null);
  state = reduce(state, { type: 'scenario', scenario: 'wear' });
  state = reduce(state, { type: 'execute' });
  assert.equal(state.running, false);
  assert.equal(state.maintenance, true);
});

test('one-sided capability uses sample deviation, not a fictitious lower spec', () => {
  const samples = [.1, .2, .3];
  const result = capability(samples);
  assert.ok(Math.abs(result.sigma - .1) < 1e-12);
  assert.ok(Math.abs(result.cpk - 4 / 3) < 1e-12);
});

test('MES evidence is reproducible, traceable and correctly weighted', () => {
  assert.equal(mesBatches.length, 120);
  assert.equal(new Set(mesBatches.map(row => row.id)).size, 120);
  const evidence = mesEvidence(initialState().params, false);
  assert.ok(evidence.rows.every(row => Math.abs(row.speed - 60) <= 8 && !row.wear));
  const expected = evidence.rows.reduce((sum, row) => sum + row.yieldRate * row.count, 0) / evidence.count;
  assert.equal(evidence.yieldRate, expected);
});

test('invalid inputs are rejected; counters and windows stay bounded in long sessions', () => {
  let state = initialState();
  state = reduce(state, { type: 'parameter', key: 'speed', value: NaN });
  assert.equal(state.params.speed, 60);
  state = reduce(state, { type: 'parameter', key: 'speed', value: 1000 });
  assert.equal(state.params.speed, 100);
  state = advance(reduce(initialState(), { type: 'auto' }), 500);
  assert.equal(state.samples.length, 32);
  assert.ok(state.history.length <= 60 && state.messages.length <= 40 && state.audit.length <= 40);
  assert.ok(state.good >= 0 && state.good <= state.produced);
  assert.ok(state.buffer >= 0 && state.buffer <= 60);
});
