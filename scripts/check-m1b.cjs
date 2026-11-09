const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});
  async function noOverflow(route){const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,`horizontal overflow on ${route} at ${width}`)}
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3000/');await page.waitForLoadState('networkidle');
  assert.match(await page.locator('h1').innerText(),/Chào bạn/);
  await noOverflow('/');
  await page.screenshot({path:`review/m1b-home-${width}.png`,fullPage:true});
  await page.goto('http://localhost:3000/thu-vien');await page.waitForLoadState('networkidle');
  await page.locator('#search-words').fill('nihao');
  assert.equal(await page.locator('.library-grid .word-display').count(),1);
  await noOverflow('/thu-vien');
  await page.goto('http://localhost:3000/tu/hsk1-147');
  assert.match(await page.locator('.word-display').innerText(),/你好/);
  await noOverflow('/tu/hsk1-147');
  await page.goto('http://localhost:3000/hoc');await page.getByRole('button',{name:/Bắt đầu bài học/}).click();
  await noOverflow('/hoc cards');
  for(let i=0;i<10;i++){await page.getByRole('button',{name:'Lật thẻ xem nghĩa'}).click();await page.getByRole('button',{name:/Đã nhớ/}).click();}
  for(let i=0;i<20;i++){
   if(i===0){await noOverflow('/hoc quiz');await page.screenshot({path:`review/m1b-quiz-${width}.png`,fullPage:true});}
   const choice=page.locator('.quiz-option').first();await choice.click();await page.getByRole('button',{name:i===19?'Xem kết quả':'Câu tiếp theo'}).click();
  }
  assert.match(await page.locator('.result-panel').innerText(),/HOÀN THÀNH BÀI HỌC/);
  await page.goto('http://localhost:3000/tien-do');
  await page.locator('.metric-grid').getByText('10',{exact:true}).waitFor();
  await noOverflow('/tien-do');
  await page.screenshot({path:`review/m1b-progress-${width}.png`,fullPage:true});
  assert.match(await page.locator('.metric-grid').innerText(),/10/);
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất tiến độ JSON'}).click();const download=await downloadPromise;
  const path=await download.path();await page.locator('#progress-file').setInputFiles(path);
  assert.match(await page.locator('.field-success').innerText(),/thành công/);
  await page.clock.install({time:new Date('2026-11-11T12:00:00Z')});
  await page.goto('http://localhost:3000/hoc');
  await page.waitForTimeout(200);
  assert.match(await page.locator('.lesson-intro').innerText(),/10 từ mới.*10 từ đến hạn ôn/s);
  assert.equal(errors.length,0,errors.join('\n'));
  console.log(`PASS viewport ${width}: no overflow, search, 10 cards, 20 quiz, export/import, next Vietnam day`);
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
