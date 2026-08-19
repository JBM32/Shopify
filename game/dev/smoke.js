// dev/smoke.js — headless end-to-end smoke test of Pixel Dash.
// Usage: node game/dev/smoke.js        (needs Node + Playwright + Chromium)
// Drives the real game in a browser via the window.PD debug handle and
// asserts the whole loop: intro → menu → play → powerups → both boss fights
// → win screen, with zero console errors. Run it after any gameplay change.
const path = require('path');

function loadPlaywright(){
  try { return require('playwright'); } catch (e) {}
  try { return require('/opt/node22/lib/node_modules/playwright'); } catch (e) {}
  console.error('playwright not found — npm i -g playwright');
  process.exit(2);
}

(async () => {
  const { chromium } = loadPlaywright();
  const file = path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  const checks = {};
  await page.goto('file://' + file);
  await page.waitForTimeout(900);
  checks.introRuns = await page.evaluate(() => PD.G.state === 'intro' && PD.G.introMs > 100);

  await page.keyboard.press('Space');                                  // skip intro
  await page.waitForTimeout(200);
  checks.menuAfterSkip = await page.evaluate(() => PD.G.state === 'menu');

  await page.keyboard.press('Enter');                                  // start
  await page.waitForTimeout(300);
  checks.playState = await page.evaluate(() => PD.G.state === 'play');

  await page.keyboard.down('ArrowRight');                              // physics
  await page.waitForTimeout(500);
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');
  checks.movedRight = await page.evaluate(() => PD.G.player.x > 80);

  // grab the speed powerup (teleport next to it)
  await page.evaluate(() => { const p = PD.G.player; p.x = 18*24; p.y = 6*24; p.vy = 0; });
  await page.waitForTimeout(500);
  checks.speedPowerup = await page.evaluate(() => PD.G.player.speedT > 0);

  // enter the zerox arena, land one stomp
  await page.evaluate(() => { const p = PD.G.player; p.x = 95*24; p.y = 8*24; });
  await page.waitForTimeout(400);
  checks.zeroxStarted = await page.evaluate(() => PD.G.bossStarted && PD.G.boss.kind === 'zerox');
  checks.zeroxStompable = await page.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 20 && PD.G.boss.hits === 0; i++){
      const b = PD.G.boss, p = PD.G.player;
      p.x = b.x + b.w/2; p.y = b.y - p.h - 2; p.vy = 6;
      await sleep(100);
    }
    return PD.G.boss.hits > 0;
  });

  await page.keyboard.press('KeyO');                                   // cheat → level 2
  await page.waitForTimeout(200);
  checks.level2Skeleton = await page.evaluate(() =>
    PD.G.levelIndex === 1 && PD.G.boss && PD.G.boss.kind === 'skeleton');

  checks.fireBreath = await page.evaluate(async () => {                // spend a charge
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    PD.POWERUPS.fire.apply(PD.G.player);
    const before = PD.G.player.fireCharges;
    PD.keys.fire = true; await sleep(150); PD.keys.fire = false;
    return PD.G.player.fireCharges < before && before > 0;
  });

  checks.skeletonDiesToFire = await page.evaluate(async () => {        // full fight
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const p = PD.G.player;
    p.x = PD.G.boss.arenaL + 30; p.y = 8*24; p.fireCharges = 50;
    await sleep(300);
    for (let i = 0; i < 40 && PD.G.boss.alive; i++){
      p.x = PD.G.boss.x - 60; p.y = PD.G.boss.y + 30; p.face = 1; p.hurtT = 30;
      PD.keys.fire = true; await sleep(60); PD.keys.fire = false; await sleep(60);
    }
    return !PD.G.boss.alive && PD.G.barriers.length === 0;
  });

  checks.winScreen = await page.evaluate(async () => {                 // touch the flag
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const p = PD.G.player;
    p.x = PD.G.flag.x - 4; p.y = PD.G.flag.y + 10; p.vy = 0;
    await sleep(300);
    return PD.G.state === 'win';
  });

  await browser.close();
  const failed = Object.entries(checks).filter(([,v]) => !v).map(([k]) => k);
  console.log(JSON.stringify({ checks, errors }, null, 2));
  if (errors.length || failed.length){
    console.error('SMOKE FAILED:', failed.join(', ') || '(console errors)');
    process.exit(1);
  }
  console.log('SMOKE OK — full gameplay loop verified, no console errors.');
})();
