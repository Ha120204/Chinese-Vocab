import { readFile, readdir } from 'node:fs/promises';
import { z } from 'zod';

const wordSchema = z.object({
  id:z.string().min(1), level:z.number().int().min(1).max(9), order:z.number().int().positive(),
  syllabusNo:z.number().int().positive(), hanzi:z.string().min(1), pinyin:z.string().min(1),
  meaningVi:z.string().min(1), topic:z.string().min(1),
  example:z.object({hanzi:z.string().min(1),pinyin:z.string().min(1),translationVi:z.string().min(1)}),
  reviewed:z.boolean(),
});
const files=(await readdir('data/vocab')).filter(name=>/^hsk\d+-batch\d+\.json$/.test(name)).sort((a,b)=>{
  const [,levelA,batchA]=a.match(/^hsk(\d+)-batch(\d+)/).map(Number);
  const [,levelB,batchB]=b.match(/^hsk(\d+)-batch(\d+)/).map(Number);
  return levelA-levelB || batchA-batchB;
});
const errors=[];const all=[];const ids=new Set();const syllabusNumbers=new Set();const orders=new Set();
for(const file of files){
  let words;
  try {words=z.array(wordSchema).parse(JSON.parse(await readFile(`data/vocab/${file}`,'utf8')));}
  catch(error){errors.push(`${file}: ${error.message}`);continue;}
  if(words.length!==60)errors.push(`${file}: cần 60 mục, hiện có ${words.length}`);
  const level=Number(file.match(/^hsk(\d+)/)[1]);
  for(const word of words){
    if(word.level!==level)errors.push(`${file}: ${word.hanzi} sai cấp HSK`);
    if(level===1&&word.syllabusNo>300)errors.push(`${file}: ${word.hanzi} có syllabusNo ngoài 1–300`);
    if(word.id!==`hsk${word.level}-${word.syllabusNo}`)errors.push(`${file}: ${word.hanzi} sai id`);
    if(ids.has(word.id))errors.push(`${file}: trùng id ${word.id}`);
    if(syllabusNumbers.has(`${word.level}:${word.syllabusNo}`))errors.push(`${file}: trùng syllabusNo ${word.syllabusNo}`);
    if(orders.has(`${word.level}:${word.order}`))errors.push(`${file}: trùng thứ tự học ${word.order}`);
    ids.add(word.id);syllabusNumbers.add(`${word.level}:${word.syllabusNo}`);orders.add(`${word.level}:${word.order}`);
    all.push(word);
  }
}
for(const level of new Set(all.map(word=>word.level))){
  const count=all.filter(word=>word.level===level).length;
  for(let i=1;i<=count;i++)if(!orders.has(`${level}:${i}`))errors.push(`Thiếu thứ tự học HSK${level}: ${i}`);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else{
  const pending=all.filter(word=>!word.reviewed).sort((a,b)=>a.order-b.order);
  console.log(`HSK1: ${all.length} mục; ${pending.length} chưa duyệt; syllabusNo và thứ tự học không trùng.`);
  for(const word of pending)console.log(`${String(word.order).padStart(3,'0')}. #${word.syllabusNo} ${word.hanzi} — ${word.pinyin} — ${word.meaningVi}`);
}
