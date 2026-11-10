'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import type { VocabWord } from '@/lib/vocab';
import { vietnamDate } from '@/lib/date';
import { useProgress,getStreak,exportProgress,importProgress,setLevel } from '@/lib/progress';
import { LevelSelector } from '@/components/level-selector';

export function ProgressApp({words,hsk2Available}:{words:VocabWord[];hsk2Available:boolean}){
  const progress=useProgress();
  const input=useRef<HTMLInputElement>(null);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [fileName,setFileName]=useState('');
  const today=vietnamDate();
  const level=progress.level===2&&hsk2Available?2:1;
  const stats=([1,2] as const).map(value=>({
    level:value,
    total:value===1?300:200,
    learned:words.filter(word=>word.level===value&&progress.records[word.id]).length,
  }));
  const learned=stats.reduce((sum,stat)=>sum+stat.learned,0);
  const levelIds=new Set(words.filter(word=>word.level===level).map(word=>word.id));
  const due=words.filter(word=>word.level===level&&progress.records[word.id]&&progress.records[word.id].due<=today).length;
  const boxes=Array.from({length:6},(_,index)=>Object.entries(progress.records).filter(([id,record])=>levelIds.has(id)&&record.box===index+1).length);
  const selectedLearned=stats.find(stat=>stat.level===level)?.learned??0;

  async function load(file?:File){
    setError('');setMessage('');
    if(!file){setError('Hãy chọn một tệp JSON.');return;}
    setFileName(file.name);
    try{await importProgress(file);setMessage('Đã nhập tiến độ thành công.');if(input.current)input.current.value='';}
    catch(cause){setError(cause instanceof Error?cause.message:'Không đọc được tệp tiến độ.');}
  }

  return <main className="site-container progress-page"><div className="page-heading"><div><span className="kicker">HÀNH TRÌNH CỦA BẠN · HSK 3.0</span><h1>Tiến độ cá nhân</h1><p>Mỗi từ đã học là một bước nhỏ đáng ghi nhận.</p></div><Link href="/hoc" className="button button-primary">Tiếp tục học →</Link></div><div className="metric-grid"><div className="panel metric-card"><span>CHUỖI NGÀY HỌC</span><strong>{getStreak(progress.activityDays,today)}</strong><small>ngày liên tiếp</small></div><div className="panel metric-card"><span>TỪ ĐÃ HỌC</span><strong>{learned}</strong><small>cả HSK1 và HSK2</small></div><div className="panel metric-card"><span>ĐẾN HẠN ÔN</span><strong>{due}</strong><small>từ HSK{level} cần gặp lại</small></div><div className="panel metric-card"><span>BÀI QUIZ</span><strong>{progress.quizCount}</strong><small>lần hoàn thành</small></div></div><div className="progress-grid"><section className="panel"><div className="section-title"><span className="badge">LỘ TRÌNH HSK 3.0</span><span>10 từ mới/ngày dùng chung</span></div><h2>Tiến độ từng cấp</h2><LevelSelector level={level} hsk2Available={hsk2Available} onChange={setLevel}/><div className="level-progress-list">{stats.map(stat=><div key={stat.level}><div className="section-title"><strong>HSK{stat.level} · {stat.total} mục</strong><span>{stat.learned}/{stat.total}</span></div><div className="progress-track" role="progressbar" aria-label={`Tiến độ HSK${stat.level}`} aria-valuenow={stat.learned} aria-valuemin={0} aria-valuemax={stat.total}><span style={{width:`${Math.min(100,stat.learned/stat.total*100)}%`}}/></div><p>{Math.round(stat.learned/stat.total*100)}% đã học</p></div>)}</div></section><section className="panel"><span className="kicker">ÔN TẬP NGẮT QUÃNG · HSK{level}</span><h2>Hộp Leitner</h2><p>Nhớ đúng thì từ chuyển sang hộp có khoảng ôn dài hơn. Trả lời sai đưa từ về hộp 1 để gặp lại sớm.</p><div className="leitner-list">{boxes.map((count,index)=><div key={index}><span>Hộp {index+1}</span><div><span style={{width:`${selectedLearned?Math.max(4,count/selectedLearned*100):0}%`}}/></div><strong>{count}</strong></div>)}</div></section></div><section className="panel backup-panel"><span className="kicker">DỮ LIỆU CỦA BẠN</span><h2>Giữ tiến độ khi đổi máy</h2><p>Tiến độ chỉ lưu trong trình duyệt hiện tại. Hãy xuất tệp JSON để tự giữ bản sao và nhập lại trên thiết bị khác. Nhập tệp sẽ thay thế tiến độ đang có.</p><div className="backup-actions"><button className="button button-primary" onClick={exportProgress}>Xuất tiến độ JSON</button><div><label className="button button-outline file-picker" htmlFor="progress-file">Chọn tệp JSON để nhập</label><input className="visually-hidden" id="progress-file" ref={input} type="file" accept="application/json,.json" aria-describedby={error?'file-error':undefined} onChange={event=>load(event.target.files?.[0])}/>{fileName&&<p className="file-name">{fileName}</p>}{error&&<p className="field-error" id="file-error" role="alert">{error}</p>}{message&&<p className="field-success" role="status">{message}</p>}</div></div></section></main>;
}
