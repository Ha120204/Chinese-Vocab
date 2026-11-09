'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { VocabWord } from '@/lib/vocab';
import { useProgress, getLesson, getStreak } from '@/lib/progress';
import { vietnamDate } from '@/lib/date';
import { WordDisplay } from '@/components/word-display';

export function HomeDashboard({words,daily,initialDate}:{words:VocabWord[];daily?:VocabWord;initialDate:string}){
  const progress=useProgress(); const [today,setToday]=useState(initialDate);
  useEffect(()=>{const tick=()=>{const next=vietnamDate();if(next!==initialDate) window.location.reload(); else setToday(next);};tick();const id=setInterval(tick,60000);return()=>clearInterval(id)},[initialDate]);
  const lesson=getLesson(words,progress,today); const learned=Object.keys(progress.records).length;
  return <main className="site-container dashboard-page">
    <div className="welcome-row"><div><span className="kicker">MỘT CHÚT MỖI NGÀY</span><h1>Chào bạn, cùng học Hán nhé!</h1><p>Lộ trình của bạn bắt đầu từ HSK 3.0 · HSK1.</p></div><div className="date-pill">{new Date(`${today}T12:00:00Z`).toLocaleDateString('vi-VN',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Ho_Chi_Minh'})}</div></div>
    <div className="dashboard-grid"><div className="dashboard-main"><section className="panel lesson-panel"><div className="section-title"><span className="badge">BÀI HỌC CỦA BẠN</span><span>HSK 3.0 · HSK1</span></div><h2>Học tiếp theo nhịp của bạn</h2><p>10 từ mới tiếp theo theo thứ tự cố định. Từ chưa học vẫn chờ bạn; từ đến hạn ôn có danh sách riêng.</p><div className="lesson-numbers"><div><strong>{lesson.newWords.length}</strong><span>từ mới hôm nay</span></div><div><strong>{lesson.dueWords.length}</strong><span>đến hạn ôn</span></div><div><strong>{getStreak(progress.activityDays,today)}</strong><span>ngày liên tiếp</span></div></div>{words.length?<Link className="button button-primary" href="/hoc">{lesson.newWords.length||lesson.dueWords.length?'Bắt đầu học':'Xem bài học'} <span aria-hidden="true">→</span></Link>:<div className="empty-state">Nội dung HSK1 đang được duyệt. Bài học sẽ mở khi có từ đã duyệt.</div>}</section>
    <section className="panel"><div className="section-title"><span className="badge">LỘ TRÌNH HSK</span><span>{learned}/300 mục</span></div><h2>HSK1 · 300 mục</h2><div className="progress-track" role="progressbar" aria-valuenow={learned} aria-valuemin={0} aria-valuemax={300} aria-label="Tiến độ HSK1"><span style={{width:`${Math.min(100,learned/300*100)}%`}}/></div><p>Mỗi mục đã học đều được lưu trên thiết bị này.</p><div className="level-selector"><span className="level-active">HSK 3.0 · HSK1</span><span className="level-soon">HSK 3.0 · HSK2 <b>Sắp có</b></span></div></section></div>
    <aside className="dashboard-side"><section className="panel daily-panel"><span className="kicker">TỪ CỦA NGÀY</span><h2>Một từ, cùng khám phá</h2>{daily?<><WordDisplay word={daily} compact/><Link className="text-link" href={`/tu/${daily.id}`}>Xem chi tiết từ →</Link></>:<p className="empty-state">Từ của ngày sẽ xuất hiện khi nội dung được duyệt.</p>}</section><section className="panel community-panel"><span className="kicker">GÓC CỘNG ĐỒNG</span><h2>Cùng nhau nhớ lâu hơn</h2><p>Mẹo nhớ chữ và bình luận cho Từ của ngày sẽ mở ở giai đoạn cộng đồng.</p><div className="empty-state">Chưa có bài góp ý nào.</div></section></aside></div>
    <section className="home-links"><Link href="/thu-vien">Khám phá thư viện từ <span>→</span></Link><Link href="/tien-do">Xem tiến độ của bạn <span>→</span></Link></section>
  </main>
}
