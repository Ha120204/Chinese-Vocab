import { z } from 'zod';
import batch1 from '@/data/vocab/hsk1-batch1.json';
import batch2 from '@/data/vocab/hsk1-batch2.json';
import hsk2batch1 from '@/data/vocab/hsk2-batch1.json';
import dailySchedule from '@/data/vocab/daily-schedule.json';
import { vietnamDate } from '@/lib/date';
import { normalizeSearch } from '@/lib/search';

const wordSchema = z.object({
  id: z.string().min(1), level: z.number().int().min(1).max(9), order: z.number().int().positive(),
  syllabusNo: z.number().int().min(1).max(11000), hanzi: z.string().min(1), pinyin: z.string().min(1),
  meaningVi: z.string().min(1), topic: z.string().min(1),
  example: z.object({hanzi:z.string().min(1),pinyin:z.string().min(1),translationVi:z.string().min(1)}),
  reviewed: z.boolean(), note: z.string().min(1).optional(),
});
export type VocabWord = z.infer<typeof wordSchema>;
const allWords = z.array(wordSchema).parse([...batch1,...batch2,...hsk2batch1]).sort((a,b)=>a.level-b.level||a.order-b.order);
const ids = new Set<string>();
const numbers = new Set<string>();
for (const word of allWords) {
  const key = `${word.level}:${word.syllabusNo}`;
  if (ids.has(word.id) || numbers.has(key)) throw new Error(`Trùng id hoặc syllabusNo: ${word.id}`);
  ids.add(word.id); numbers.add(key);
}
export const HSK1_TOTAL = 300;
export const HSK2_TOTAL = 200;
export const previewDrafts = process.env.NODE_ENV !== 'production' || process.env.VOCAB_SHOW_UNREVIEWED === 'true';
export const visibleWords: VocabWord[] = allWords.filter(w => w.reviewed || previewDrafts);
export const reviewedWords: VocabWord[] = allWords.filter(w => w.reviewed);
export const hsk2Available = reviewedWords.filter(word=>word.level===2).length>=10;
export const levelTotal = (level:number) => level===2 ? HSK2_TOTAL : HSK1_TOTAL;
export const getWord = (id:string) => visibleWords.find(w=>w.id===id);
export { normalizeSearch } from '@/lib/search';
export function findWords(query:string, topic?:string) {
  const normalized = normalizeSearch(query);
  return visibleWords.filter(w => (!topic || w.topic===topic) && (!normalized || [w.hanzi,w.pinyin,w.meaningVi].some(v=>normalizeSearch(v).includes(normalized))));
}
export { vietnamDate } from '@/lib/date';
function dateHash(date:string) { let n=0; for(const ch of date) n = (n * 31 + ch.charCodeAt(0)) >>> 0; return n; }
export function wordOfDay(date=vietnamDate()) {
  const scheduled = (dailySchedule as Record<string,string>)[date];
  const scheduledWord = visibleWords.find(w=>w.level===1&&w.id===scheduled);
  if (scheduledWord) return scheduledWord;
  const hsk1Reviewed = reviewedWords.filter(w=>w.level===1);
  const pool = hsk1Reviewed.length ? hsk1Reviewed : (previewDrafts ? visibleWords.filter(w=>w.level===1) : []);
  return pool.length ? pool[dateHash(date)%pool.length] : undefined;
}
