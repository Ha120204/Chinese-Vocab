import { readFile } from 'node:fs/promises';

const words = JSON.parse(await readFile('data/vocab/hsk1-batch1.json','utf8'));
const seen = new Set();
const errors = [];
for (const word of words) {
  if (!Number.isInteger(word.syllabusNo) || word.syllabusNo < 1 || word.syllabusNo > 300) errors.push(`${word.hanzi}: thiếu hoặc sai syllabusNo`);
  if (seen.has(word.syllabusNo)) errors.push(`${word.hanzi}: trùng syllabusNo ${word.syllabusNo}`);
  seen.add(word.syllabusNo);
  if (!word.id || !word.hanzi || !word.pinyin || !word.meaningVi || !word.example?.hanzi || !word.example?.pinyin || !word.example?.translationVi) errors.push(`${word.hanzi ?? '?'}: thiếu nội dung`);
}
if (words.length !== 60) errors.push(`Batch 1 phải có 60 mục, hiện có ${words.length}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  const pending = words.filter(word => !word.reviewed);
  console.log(`HSK1 batch 1: ${words.length} mục; ${pending.length} chưa duyệt.`);
  for (const word of pending) console.log(`${String(word.order).padStart(2,'0')}. #${word.syllabusNo} ${word.hanzi} — ${word.pinyin} — ${word.meaningVi}`);
}
