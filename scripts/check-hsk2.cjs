const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.TEST_BASE_URL ?? 'http://localhost:3002';

async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label}: horizontal overflow`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));

      await page.goto(base);
      await page.getByRole('group', { name: 'Chọn cấp HSK 3.0' }).getByRole('button', { name: 'HSK 3.0 · HSK2' }).click();
      await page.getByRole('progressbar', { name: 'Tiến độ HSK2' }).waitFor();
      assert.equal(await page.getByRole('progressbar', { name: 'Tiến độ HSK2' }).getAttribute('aria-valuemax'), '200');
      assert.match(await page.locator('#tu-cua-ngay').innerText(), /TỪ CỦA NGÀY · HSK1/);
      assert.match(await page.locator('#tu-cua-ngay .badge').first().innerText(), /HSK1/);
      await noOverflow(page, `${width}px home`);

      await page.goto(`${base}/thu-vien`);
      await page.getByRole('group', { name: 'Chọn cấp HSK 3.0' }).getByRole('button', { name: 'HSK2' }).click();
      assert.equal(await page.locator('.library-grid .word-display').count(), 60);
      await noOverflow(page, `${width}px library`);

      await page.goto(`${base}/tu/hsk2-301`);
      assert.match(await page.locator('.word-note').innerText(), /ya, wa hoặc na/);
      assert.match(await page.locator('.example-hanzi').innerText(), /好啊/);
      await noOverflow(page, `${width}px word`);
      const og = await page.request.get(`${base}/tu/hsk2-301/opengraph-image`);
      assert.equal(og.status(), 200);
      assert.match(og.headers()['content-type'], /image\/png/);

      await page.goto(`${base}/hoc`);
      assert.match(await page.locator('.lesson-intro .badge').innerText(), /HSK2 · 200 mục/);
      await page.getByRole('button', { name: /Bắt đầu bài học/ }).click();
      assert.equal(await page.locator('.study-hanzi').first().innerText(), '啊');
      for (let index = 0; index < 10; index++) {
        await page.getByRole('button', { name: 'Lật thẻ xem nghĩa' }).click();
        await page.getByRole('button', { name: /Đã nhớ · Tiếp tục/ }).click();
      }
      for (let index = 0; index < 20; index++) {
        await page.locator('.quiz-options button').first().click();
        await page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả/ }).click();
      }
      await page.locator('.result-panel').waitFor();
      await noOverflow(page, `${width}px quiz`);

      await page.goto(base);
      await page.getByRole('group', { name: 'Chọn cấp HSK 3.0' }).getByRole('button', { name: 'HSK 3.0 · HSK1' }).click();
      assert.equal(await page.locator('.lesson-numbers strong').first().innerText(), '0', 'daily new-word limit must be shared across levels');
      await page.getByRole('group', { name: 'Chọn cấp HSK 3.0' }).getByRole('button', { name: 'HSK 3.0 · HSK2' }).click();

      await page.goto(`${base}/tien-do`);
      assert.equal(await page.getByRole('progressbar', { name: 'Tiến độ HSK1' }).getAttribute('aria-valuemax'), '300');
      assert.equal(await page.getByRole('progressbar', { name: 'Tiến độ HSK2' }).getAttribute('aria-valuemax'), '200');
      assert.equal(await page.getByRole('progressbar', { name: 'Tiến độ HSK2' }).getAttribute('aria-valuenow'), '10');
      assert.equal(await page.getByRole('progressbar', { name: 'Tiến độ HSK1' }).getAttribute('aria-valuenow'), '0');
      await noOverflow(page, `${width}px progress`);

      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Xuất tiến độ JSON' }).click();
      const download = await downloadPromise;
      const path = await download.path();
      const exported = JSON.parse(require('node:fs').readFileSync(path, 'utf8'));
      assert.equal(exported.level, 2);
      assert.equal(Object.keys(exported.records).filter(id => id.startsWith('hsk2-')).length, 10);
      assert.equal(exported.newByDay[Object.keys(exported.newByDay)[0]], 10);
      assert.deepEqual(errors, []);
      console.log(`PASS HSK2 ${width}px: level, library 60, lesson and quizzes, separate progress, daily HSK1, OG, export`);
      await context.close();
    }

    const sitemap = await browser.newPage();
    const xml = await (await sitemap.request.get(`${base}/sitemap.xml`)).text();
    assert.equal((xml.match(/\/tu\/hsk2-/g) ?? []).length, 60);
    await sitemap.close();
    console.log('PASS sitemap: 60 HSK2 detail URLs');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
