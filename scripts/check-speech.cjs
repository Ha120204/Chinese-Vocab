const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.TEST_BASE_URL ?? 'http://localhost:3002';

async function speechPage(browser, voices, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.addInitScript(initialVoices => {
    const listeners = new Set();
    const state = { voices: initialVoices, spoken: [], cancelled: 0 };
    window.__speechTest = state;
    window.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text; }
    };
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => state.voices,
        addEventListener: (name, listener) => { if (name === 'voiceschanged') listeners.add(listener); },
        speak: utterance => {
          state.spoken.push({ text: utterance.text, lang: utterance.lang, rate: utterance.rate, voice: utterance.voice.name });
          setTimeout(() => utterance.onstart?.(), 10);
        },
        cancel: () => { state.cancelled++; },
      },
    });
    state.setVoices = next => { state.voices = next; for (const listener of listeners) listener(); };
  }, voices);
  await page.goto(`${base}/tu/hsk1-147`);
  return page;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [390, 1440]) {
      const page = await speechPage(browser, [
        { name: 'Taiwan', lang: 'zh-TW' },
        { name: 'Basic Chinese', lang: 'zh-CN' },
        { name: 'Xiaoxiao Natural', lang: 'zh-CN' },
      ], width);
      await page.getByRole('button', { name: 'Nghe phát âm' }).first().click();
      await page.getByText('Đang phát', { exact: true }).waitFor();
      let spoken = await page.evaluate(() => window.__speechTest.spoken);
      assert.equal(spoken[0].lang, 'zh-CN');
      assert.equal(spoken[0].voice, 'Xiaoxiao Natural');
      assert.equal(spoken[0].rate, 0.9);
      await page.getByRole('button', { name: 'Dừng phát âm' }).click();
      await page.getByText('Đã dừng', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Nghe câu ví dụ' }).click();
      await page.getByText('Đang phát', { exact: true }).waitFor();
      spoken = await page.evaluate(() => window.__speechTest.spoken);
      assert.equal(spoken[1].text, await page.locator('.example-hanzi').innerText());
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.close();
      console.log(`PASS speech ${width}px: preferred voice, playback, stop, example`);
    }

    const late = await speechPage(browser, [], 390);
    await late.getByRole('button', { name: 'Nghe phát âm' }).first().click();
    await late.getByText('Đang chuẩn bị…').waitFor();
    await late.evaluate(() => window.__speechTest.setVoices([{ name: 'Taiwan Online', lang: 'zh-TW' }]));
    await late.getByText('Đang phát', { exact: true }).waitFor();
    assert.equal((await late.evaluate(() => window.__speechTest.spoken))[0].lang, 'zh-TW');
    await late.close();
    console.log('PASS delayed voiceschanged and zh-TW fallback');

    const absent = await speechPage(browser, [], 390);
    await absent.getByRole('button', { name: 'Nghe phát âm' }).first().click();
    await absent.getByText('Hãy thử Chrome, Edge hoặc điện thoại để nghe phát âm').waitFor({ timeout: 4000 });
    assert.equal((await absent.evaluate(() => window.__speechTest.spoken)).length, 0);
    assert.equal(await absent.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await absent.close();
    console.log('PASS missing voice guidance after timeout');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
