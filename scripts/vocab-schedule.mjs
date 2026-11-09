import { readFile, writeFile } from 'node:fs/promises';

const words = JSON.parse(await readFile('data/vocab/hsk1-batch1.json','utf8')).filter(w => w.reviewed);
const count = Number(process.argv[2] ?? 90);
if (!Number.isInteger(count) || count < 1 || count > 365) throw new Error('Số ngày phải từ 1 đến 365');
const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const start = new Date(`${today}T00:00:00Z`);
const schedule = Object.fromEntries(words.length ? Array.from({length:count},(_,i) => {
  const date = new Date(start.getTime() + i * 86400000).toISOString().slice(0,10);
  return [date,words[i % words.length].id];
}) : []);
await writeFile('data/vocab/daily-schedule.json',JSON.stringify(schedule,null,2)+'\n');
console.log(`Lịch ${Object.keys(schedule).length} ngày từ ${today}; ${words.length} từ đã duyệt.`);
