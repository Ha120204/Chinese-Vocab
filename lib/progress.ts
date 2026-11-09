'use client';

import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { vietnamDate } from '@/lib/date';
import type { VocabWord } from '@/lib/vocab';
import { trackEvent } from '@/lib/analytics';

const recordSchema = z.object({box:z.number().int().min(1).max(6),due:z.string(),learnedAt:z.string()});
const schema = z.object({version:z.literal(1),level:z.number().int().min(1).max(9),records:z.record(z.string(),recordSchema),newByDay:z.record(z.string(),z.number().int().min(0).max(10)),activityDays:z.array(z.string()),quizCount:z.number().int().nonnegative()});
export type Progress = z.infer<typeof schema>;
const empty: Progress = {version:1,level:1,records:{},newByDay:{},activityDays:[],quizCount:0};
const key = 'hoc-han-progress-v1';
let cache:Progress = empty;
let loaded = false;
const listeners = new Set<()=>void>();
function emit(){for(const listener of listeners)listener();}
function read():Progress {
  if(!loaded && typeof window !== 'undefined') {
    loaded = true;
    try { const value=localStorage.getItem(key); cache=value ? schema.parse(JSON.parse(value)) : empty; }
    catch { cache=empty; }
  }
  return cache;
}
function subscribe(callback:()=>void){
  listeners.add(callback);
  const onStorage=(event:StorageEvent)=>{if(event.key===key){loaded=false;read();emit();}};
  window.addEventListener('storage',onStorage);
  return ()=>{listeners.delete(callback);window.removeEventListener('storage',onStorage);};
}
export function useProgress(){return useSyncExternalStore(subscribe,read,()=>empty);}
function save(next:Progress){cache=schema.parse(next);loaded=true;localStorage.setItem(key,JSON.stringify(cache));emit();}
function plusDays(date:string,n:number){const d=new Date(`${date}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function previousDate(date:string){return plusDays(date,-1);}
function withActivity(progress:Progress,today:string){
  if(progress.activityDays.includes(today)) return progress.activityDays;
  trackEvent('streak_day',{level:'HSK1'});
  return [...progress.activityDays,today].sort();
}
export function markLearned(word:VocabWord,today=vietnamDate()){
  const p=read(); if(p.records[word.id] || (p.newByDay[today]??0)>=10) return false;
  save({...p,records:{...p.records,[word.id]:{box:1,due:plusDays(today,1),learnedAt:today}},newByDay:{...p.newByDay,[today]:(p.newByDay[today]??0)+1},activityDays:withActivity(p,today)});
  trackEvent('learn_word',{word_id:word.id,level:'HSK1'});
  return true;
}
const intervals=[1,3,7,14,30,60];
export function reviewWord(wordId:string,correct:boolean,today=vietnamDate()){
  const p=read(); const old=p.records[wordId]; if(!old)return;
  const box=correct ? Math.min(6,old.box+1) : 1;
  save({...p,records:{...p.records,[wordId]:{...old,box,due:plusDays(today,intervals[box-1])}},activityDays:withActivity(p,today)});
}
export function addQuiz(){const p=read();save({...p,quizCount:p.quizCount+1});}
export function getLesson(words:VocabWord[],p:Progress,today=vietnamDate()){
  const remaining=Math.max(0,10-(p.newByDay[today]??0));
  const next=words.filter(w=>w.level===p.level && !p.records[w.id]).slice(0,remaining);
  const due=words.filter(w=>p.records[w.id] && p.records[w.id].due<=today);
  return {newWords:next,dueWords:due,remaining};
}
export function getStreak(days:string[],today=vietnamDate()){
  const set=new Set(days); let date=set.has(today)?today:previousDate(today); let streak=0;
  while(set.has(date)){streak++;date=previousDate(date);}return streak;
}
export function exportProgress(){
  const blob=new Blob([JSON.stringify(read(),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const link=document.createElement('a');link.href=url;link.download=`hoc-han-tien-do-${vietnamDate()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function importProgress(file:File){
  if(file.size>1024*1024) throw new Error('Tệp lớn hơn 1 MB.');
  let parsed:unknown;
  try {parsed=JSON.parse(await file.text());} catch {throw new Error('Tệp không phải JSON hợp lệ.');}
  const value=schema.safeParse(parsed);
  if(!value.success)throw new Error('Tệp tiến độ không đúng định dạng phiên bản 1.');
  save(value.data);
}
