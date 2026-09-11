// Optional browser regression check: requires playwright and its Chromium browser.
// Uses only local navigation/UI; does not submit inquiries or AI requests.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const port = process.env.TEST_PORT || '3101';
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', port], { stdio: 'ignore' });
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch(`${base}/about`)).ok; } catch { /* wait for startup */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'Build the app before running the browser check.');
  browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__factoryFrames = 0;
    const clear = WebGL2RenderingContext.prototype.clear;
    WebGL2RenderingContext.prototype.clear = function (...args) {
      if (this.getParameter(this.FRAMEBUFFER_BINDING) === null) window.__factoryFrames++;
      return clear.apply(this, args);
    };
  });
  await page.goto(`${base}/about`);
  assert.equal(await page.locator('header a[href="/workspace"], footer a[href="/workspace"]').count(), 0);
  assert.equal(await page.locator('a[href="/workspace"]').isVisible(), false);
  await page.getByText('内部访问', { exact: true }).click();
  await page.locator('a[href="/workspace"]').click();
  await page.waitForURL('**/workspace');
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
  await page.goto(`${base}/about`);
  await page.getByRole('button', { name: '打开星玥阳 AI 智能顾问' }).click();
  await page.locator('#xingyueyang-ai-dialog').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '打开星玥阳 AI 智能顾问' }).click();
  await page.locator('#xingyueyang-ai-dialog').waitFor({ state: 'visible' });
  await page.goto(`${base}/smart-factory`);
  await page.locator('.factory-scene-canvas canvas').waitFor();
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.factory-scene-fallback').count(), 0, 'WebGL must be available for frame checks.');
  const measure = async () => {
    await page.evaluate(() => { window.__factoryFrames = 0; });
    await page.waitForTimeout(3000);
    return page.evaluate(() => window.__factoryFrames);
  };
  const running = await measure();
  assert.ok(running > 0 && running <= 92, `Expected rendering capped at 30 FPS; got ${running} frames/3s.`);
  await page.getByRole('button', { name: 'Ⅱ 暂停仿真', exact: true }).click();
  await page.locator('.factory-scene-shell').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  assert.equal(await measure(), 0, 'Paused scene should stop rendering.');
  await page.getByRole('button', { name: '俯视', exact: true }).click();
  await page.waitForTimeout(400);
  assert.ok(await page.evaluate(() => window.__factoryFrames > 0), 'Camera should still work when paused.');
  await page.getByRole('button', { name: '▶ 恢复仿真', exact: true }).click();
  await page.locator('.factory-footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  assert.equal(await measure(), 0, 'Offscreen scene should stop rendering.');
  await page.locator('.factory-scene-shell').scrollIntoViewIfNeeded();
  assert.ok(await measure() > 0, 'Scene should resume when visible.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(500);
  assert.ok(await measure() <= 4, 'Reduced motion should redraw only for data changes.');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  console.log('PASS: workspace entry, AI reopening, render cap, pause, camera, offscreen/resume, reduced motion, mobile.');
} finally {
  await browser?.close();
  server.kill();
}
