'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VocabWord } from '@/lib/vocab';
import { normalizeSearch } from '@/lib/search';
import { trackEvent } from '@/lib/analytics';
import { WordDisplay } from '@/components/word-display';
import { LevelSelector, type HskLevel } from '@/components/level-selector';
import { useProgress, setLevel } from '@/lib/progress';

export function LibraryApp({words,hsk2Available}:{words:VocabWord[];hsk2Available:boolean}){
  const [query,setQuery]=useState('');
  const [topic,setTopic]=useState('Tất cả');
  const progress=useProgress();
  const level=progress.level===2&&hsk2Available?2:1;
  const levelWords=useMemo(()=>words.filter(word=>word.level===level),[words,level]);
  const topics=useMemo(()=>['Tất cả',...new Set(levelWords.map(word=>word.topic))],[levelWords]);
  const results=useMemo(()=>{
    const q=normalizeSearch(query);
    return levelWords.filter(word=>(topic==='Tất cả'||word.topic===topic)&&(!q||[word.hanzi,word.pinyin,word.meaningVi].some(value=>normalizeSearch(value).includes(q))));
  },[query,topic,levelWords]);
  useEffect(()=>{
    if(!query.trim())return;
    const timer=setTimeout(()=>trackEvent('search',{query_length:query.trim().length,result_count:results.length,level:`HSK${level}`}),700);
    return()=>clearTimeout(timer);
  },[query,results.length,level]);
  function chooseLevel(value:HskLevel){setLevel(value);setTopic('Tất cả');}

  return <main className="site-container library-page"><div className="page-heading"><div><span className="kicker">KHÁM PHÁ THEO CÁCH CỦA BẠN</span><h1>Thư viện từ</h1><p>Tìm chữ Hán, pinyin không dấu hoặc nghĩa tiếng Việt. HSK 3.0 · HSK1 có 300 mục, HSK2 có 200 mục; hiện có {levelWords.length} mục HSK{level} đã sẵn sàng.</p></div><div className="date-pill">HSK 3.0</div></div><div className="panel library-controls"><label htmlFor="search-words">Tìm một từ bạn muốn học</label><input id="search-words" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Ví dụ: 你好, nihao, xin chao..."/><LevelSelector level={level} hsk2Available={hsk2Available} onChange={chooseLevel} compact/><div className="topic-list" aria-label="Lọc chủ đề">{topics.map(value=><button type="button" aria-pressed={topic===value} onClick={()=>setTopic(value)} key={value}>{value}</button>)}</div></div><div className="library-count">{results.length} mục HSK{level} đang hiển thị</div>{results.length?<div className="library-grid">{results.map(word=><WordDisplay key={word.id} word={word} compact/>)}</div>:<div className="panel empty-state">{levelWords.length?'Không tìm thấy từ phù hợp. Hãy thử cách viết khác.':'Chưa có từ đã duyệt để hiển thị.'}</div>}</main>;
}
