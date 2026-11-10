import { readFile, readdir, writeFile } from 'node:fs/promises';

const files=(await readdir('data/vocab')).filter(name=>/^hsk\d+-batch\d+\.json$/.test(name));
const words=(await Promise.all(files.map(async file=>JSON.parse(await readFile(`data/vocab/${file}`,'utf8'))))).flat().filter(w=>w.reviewed).sort((a,b)=>a.order-b.order);
const count = Number(process.argv[2] ?? 90);
if (!Number.isInteger(count) || count < 1 || count > 365) throw new Error('Số ngày phải từ 1 đến 365');
const startOrder=Number(process.argv[3]??1);
const startIndex=words.findIndex(word=>word.order===startOrder);
if(words.length&&startIndex<0)throw new Error(`Không tìm thấy từ đã duyệt ở thứ tự học ${startOrder}`);
const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const start = new Date(`${today}T00:00:00Z`);
const schedule = Object.fromEntries(words.length ? Array.from({length:count},(_,i) => {
  const date = new Date(start.getTime() + i * 86400000).toISOString().slice(0,10);
  return [date,words[(startIndex+i) % words.length].id];
}) : []);
await writeFile('data/vocab/daily-schedule.json',JSON.stringify(schedule,null,2)+'\n');
console.log(`Lịch ${Object.keys(schedule).length} ngày từ ${today}; bắt đầu ở thứ tự học ${startOrder}; ${words.length} từ đã duyệt.`);
