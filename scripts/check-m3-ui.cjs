const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

async function checkPage(page, route, width) {
  const response = await page.goto(`${base}${route}`);
  assert.equal(response.status(), route === '/khong-co-trang-nay' || route === '/hoi-dap/not-a-uuid' ? 404 : 200, route);
  await page.locator('main').first().waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route} overflows at ${width}px`);
  const smallTargets = await page.evaluate(() => [...document.querySelectorAll('a,button,input,select,textarea')]
    .filter(element => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && rect.height < 44 && style.visibility !== 'hidden'
        && style.display !== 'none' && !element.closest('.info-content p,.community-form .help-text')
        && !element.matches('input.visually-hidden');
    })
    .map(element => `${element.tagName} ${(element.textContent || element.getAttribute('aria-label') || '').trim().slice(0, 25)}`));
  assert.deepEqual(smallTargets, [], `small touch targets on ${route} at ${width}px`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, acceptDownloads: true });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const route of ['/', '/thu-vien', '/tu/hsk1-147', '/hoi-dap', '/tien-do', '/gioi-thieu', '/quy-dinh', '/rieng-tu', '/khong-co-trang-nay', '/hoi-dap/not-a-uuid']) {
        await checkPage(page, route, width);
        if (route === '/khong-co-trang-nay' || route === '/hoi-dap/not-a-uuid') assert.match(await page.locator('h1').innerText(), /Trang này không có/);
      }
      await checkPage(page, '/hoc', width);
      await page.getByRole('button', { name: /Bắt đầu bài học/ }).click();
      assert.match(await page.evaluate(() => document.activeElement?.textContent), /Lật thẻ xem nghĩa/);
      for (let card = 0; card < 10; card++) {
        await page.keyboard.press('1');
        assert.equal(await page.locator('.card-answer').count(), 1);
        await page.keyboard.press('2');
      }
      for (let question = 0; question < 20; question++) {
        assert.equal(await page.locator('.quiz-options button').count(), 4);
        assert.equal(await page.locator('.quiz-options button').first().evaluate(node => node === document.activeElement), true);
        await page.keyboard.press('1');
        assert.equal(await page.locator('.quiz-feedback').count(), 1);
        assert.match(await page.evaluate(() => document.activeElement?.textContent), /Câu tiếp theo|Xem kết quả/);
        await page.keyboard.press('Enter');
      }
      assert.match(await page.locator('.result-panel').innerText(), /HOÀN THÀNH BÀI HỌC/);
      assert.equal(await page.locator('.study-progress[role="progressbar"]').count(), 0);
      await page.screenshot({ path: `review/m3-result-${width}.png`, fullPage: true });
      await checkPage(page, '/thu-vien', width);
      const meta = await page.locator('meta[property="og:image"]').getAttribute('content');
      assert.match(meta, /\/thu-vien\/opengraph-image/);
      await checkPage(page, '/tu/hsk1-147', width);
      const wordMeta = await page.locator('meta[property="og:image"]').getAttribute('content');
      assert.match(wordMeta, /\/tu\/hsk1-147\/opengraph-image/);
      assert.deepEqual(errors, [], `page errors at ${width}px`);
      console.log(`PASS M3 ${width}px: routes, 404, OG metadata, no overflow, keyboard cards and quiz`);
      await page.close();
    }
    const page = await browser.newPage();
    await page.goto(base);
    const cdp = await page.context().newCDPSession(page);
    const manifest = await cdp.send('Page.getAppManifest');
    assert.match(manifest.url, /manifest\.webmanifest/);
    assert.deepEqual(manifest.errors, []);
    const data = JSON.parse(manifest.data);
    assert.equal(data.display, 'standalone');
    assert.equal(data.icons.some(icon => icon.sizes === '192x192'), true);
    assert.equal(data.icons.some(icon => icon.sizes === '512x512'), true);
    const installability = await cdp.send('Page.getInstallabilityErrors');
    assert.deepEqual(installability.installabilityErrors, []);
    console.log('PASS PWA: valid manifest, 192/512 icons, no Chrome installability errors');
    await page.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
