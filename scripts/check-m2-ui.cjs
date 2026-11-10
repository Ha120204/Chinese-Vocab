const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

(async()=>{
  const browser=await chromium.launch({headless:true});
  for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:900}});
    const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
    for(const route of ['/', '/tu/hsk1-147', '/hoi-dap', '/quy-dinh', '/rieng-tu']){
      const response=await page.goto(`${base}${route}`);assert.equal(response.status(),200,route);
      await page.waitForTimeout(500);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      assert.equal(overflow,false,`${route} overflows at ${width}px`);
      if(route==='/hoi-dap'){
        const toggle=page.getByRole('button',{name:/Đặt câu hỏi mới/});
        if(width===390){assert.equal(await toggle.isVisible(),true);assert.equal(await page.locator('.community-form').isVisible(),false);await toggle.click();assert.equal(await page.locator('.community-form').isVisible(),true)}
        else assert.equal(await page.locator('.community-form').isVisible(),true);
        await page.screenshot({path:`review/m2-questions-${width}.png`,fullPage:true});
      }
      if(route==='/tu/hsk1-147')await page.screenshot({path:`review/m2-word-${width}.png`,fullPage:true});
    }
    assert.deepEqual(pageErrors,[],`page errors at ${width}px`);
    console.log(`PASS M2 UI ${width}px: routes, no overflow, Q&A form state`);
    await page.close();
  }
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
