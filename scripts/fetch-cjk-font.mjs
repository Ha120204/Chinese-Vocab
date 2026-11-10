import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
const files=(await readdir('data/vocab')).filter(name=>/^hsk\d+-batch\d+\.json$/.test(name));
const words=(await Promise.all(files.map(async file=>JSON.parse(await readFile(`data/vocab/${file}`,'utf8'))))).flat().filter(word=>word.reviewed);
const characters=[...new Set([...words.flatMap(w=>[...w.hanzi,...w.example.hanzi]),...'学文字日进'])].join('');
const url=`https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&text=${encodeURIComponent(characters)}`;
const css=await (await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}})).text();
const urls=[...css.matchAll(/url\((https:[^)]+)\) format\('woff2'\)/g)].map(m=>m[1]);
if(!urls.length)throw new Error(`Không lấy được WOFF2 từ Google Fonts: ${css.slice(0,500)}`);
await mkdir('public/fonts',{recursive:true});
for(const [i,fontUrl] of urls.entries()){
  const res=await fetch(fontUrl); if(!res.ok)throw new Error(`Font HTTP ${res.status}`);
  await writeFile(`public/fonts/noto-serif-sc-${i}.woff2`,Buffer.from(await res.arrayBuffer()));
}
console.log(`Saved ${urls.length} subset WOFF2 files; ${characters.length} CJK characters`);
