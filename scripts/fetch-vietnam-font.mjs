import { mkdir,writeFile } from 'node:fs/promises';
const url='https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&display=swap';
const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}});
let css=await response.text();
if(!css.includes('@font-face'))throw new Error(`Không lấy được CSS Be Vietnam Pro: ${css.slice(0,400)}`);
const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\) format\('woff2'\)/g)].map(m=>m[1]))];
if(!urls.length)throw new Error(`Không tìm thấy WOFF2: ${css.slice(0,400)}`);
await mkdir('public/fonts',{recursive:true});
for(const [index,fontUrl] of urls.entries()){
  const font=await fetch(fontUrl);if(!font.ok)throw new Error(`Font HTTP ${font.status}`);
  const file=`be-vietnam-pro-${index}.woff2`;
  await writeFile(`public/fonts/${file}`,Buffer.from(await font.arrayBuffer()));
  css=css.replaceAll(fontUrl,`/fonts/${file}`);
}
await writeFile('app/fonts-vietnam.css',css);
console.log(`Saved ${urls.length} Be Vietnam Pro WOFF2 subsets and local CSS`);
