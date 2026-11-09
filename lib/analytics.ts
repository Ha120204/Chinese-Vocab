'use client';

export function trackEvent(name:string,params:Record<string,string|number|boolean>={}){
  if(typeof window==='undefined')return;
  const w=window as typeof window & {gtag?: (...args:unknown[])=>void};
  w.gtag?.('event',name,params);
}
