'use client';

type EventParams = Record<string,string|number|boolean>;
const pending: Array<{name:string;params:EventParams}> = [];

export function flushQueuedEvents(){
  if(typeof window==='undefined') return false;
  const w=window as typeof window & {gtag?: (...args:unknown[])=>void};
  if(!w.gtag) return false;
  for(const event of pending.splice(0)) w.gtag('event',event.name,event.params);
  return true;
}

export function trackEvent(name:string,params:EventParams={}){
  if(typeof window==='undefined')return;
  const w=window as typeof window & {gtag?: (...args:unknown[])=>void};
  if(flushQueuedEvents()) w.gtag?.('event',name,params);
  else if(pending.length<100) pending.push({name,params});
}
