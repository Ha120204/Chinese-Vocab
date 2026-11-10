'use client';
import { useEffect, useMemo, useState } from 'react';
import type { VocabWord } from '@/lib/vocab';
import { normalizeSearch } from '@/lib/search';
import { trackEvent } from '@/lib/analytics';
import { WordDisplay } from '@/components/word-display';

export function LibraryApp({words}:{words:VocabWord[]}){
  const [query,setQuery]=useState('');const [topic,setTopic]=useState('Tất cả');
  const topics=['Tất cả',...new Set(words.map(w=>w.topic))];
  const results=useMemo(()=>{const q=normalizeSearch(query);return words.filter(w=>(topic==='Tất cả'||w.topic===topic)&&(!q||[w.hanzi,w.pinyin,w.meaningVi].some(value=>normalizeSearch(value).includes(q))))},[query,topic,words]);
  useEffect(()=>{if(!query.trim())return;const timer=setTimeout(()=>trackEvent('search',{query_length:query.trim().length,result_count:results.length}),700);return()=>clearTimeout(timer)},[query,results.length]);
  return <main className="site-container library-page"><div className="page-heading"><div><span className="kicker">KHÁM PHÁ THEO CÁCH CỦA BẠN</span><h1>Thư viện từ</h1><p>Tìm chữ Hán, pinyin không dấu hoặc nghĩa tiếng Việt. HSK 3.0 · HSK1 có tổng 300 mục; 60 mục đầu đã sẵn sàng để học.</p></div><div className="date-pill">HSK 3.0</div></div><div className="panel library-controls"><label htmlFor="search-words">Tìm một từ bạn muốn học</label><input id="search-words" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ví dụ: 你好, nihao, xin chao..."/><div className="filter-row" aria-label="Lọc cấp HSK"><span className="level-active">HSK1</span><span className="level-soon">HSK2 · Sắp có</span></div><div className="topic-list" aria-label="Lọc chủ đề">{topics.map(value=><button type="button" aria-pressed={topic===value} onClick={()=>setTopic(value)} key={value}>{value}</button>)}</div></div><div className="library-count">{results.length} mục đang hiển thị</div>{results.length?<div className="library-grid">{results.map(word=><WordDisplay key={word.id} word={word} compact/>)}</div>:<div className="panel empty-state">{words.length?'Không tìm thấy từ phù hợp. Hãy thử cách viết khác.':'Chưa có từ đã duyệt để hiển thị.'}</div>}</main>
}
