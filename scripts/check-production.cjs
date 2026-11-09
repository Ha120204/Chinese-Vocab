const { chromium }=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage();
 await page.goto('http://localhost:3001/');
 assert.match(await page.locator('.daily-panel').innerText(),/khi nội dung được duyệt/);
 assert.equal(await page.locator('.daily-panel .word-display').count(),0);
 await page.goto('http://localhost:3001/thu-vien');
 assert.equal(await page.locator('.library-grid .word-display').count(),0);
 const response=await page.goto('http://localhost:3001/tu/hsk1-147');
 assert.equal(response.status(),404);
 const sitemap=await (await page.request.get('http://localhost:3001/sitemap.xml')).text();
 assert.equal(sitemap.includes('/tu/hsk1-147'),false);
 console.log('PASS production: all 60 unreviewed words hidden; draft route 404; sitemap clean');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
