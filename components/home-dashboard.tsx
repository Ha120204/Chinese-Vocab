'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { VocabWord } from '@/lib/vocab';
import { useProgress, getLesson, getStreak, setLevel } from '@/lib/progress';
import { vietnamDate } from '@/lib/date';
import { WordDisplay } from '@/components/word-display';
import { WordCommunity } from '@/components/community/word-community';
import { LevelSelector } from '@/components/level-selector';

export function HomeDashboard({ words, daily, initialDate, hsk2Available }: {
  words: VocabWord[];
  daily?: VocabWord;
  initialDate: string;
  hsk2Available: boolean;
}) {
  const progress=useProgress();
  const [today,setToday]=useState(initialDate);
  useEffect(()=>{
    const tick=()=>{const next=vietnamDate();if(next!==initialDate) window.location.reload(); else setToday(next);};
    tick(); const id=setInterval(tick,60000); return()=>clearInterval(id);
  },[initialDate]);
  const level=progress.level===2&&hsk2Available?2:1;
  const levelWords=words.filter(word=>word.level===level);
  const lesson=getLesson(words,{...progress,level},today);
  const learned=levelWords.filter(word=>progress.records[word.id]).length;
  const total=level===2?200:300;

  return <main className="site-container dashboard-page">
    <div className="welcome-row"><div><span className="kicker">MỘT CHÚT MỖI NGÀY</span><h1>Chào bạn, cùng học Hán nhé!</h1><p>Lộ trình của bạn đang ở HSK 3.0 · HSK{level}.</p></div><div className="date-pill">{new Date(`${today}T12:00:00Z`).toLocaleDateString('vi-VN',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Ho_Chi_Minh'})}</div></div>
    <div className="dashboard-grid"><div className="dashboard-main"><section className="panel lesson-panel"><div className="section-title"><span className="badge">BÀI HỌC CỦA BẠN</span><span>HSK 3.0 · HSK{level}</span></div><h2>Học tiếp theo nhịp của bạn</h2><p>10 từ mới tiếp theo theo thứ tự cố định. Từ chưa học vẫn chờ bạn; từ đến hạn ôn có danh sách riêng.</p><div className="lesson-numbers"><div><strong>{lesson.newWords.length}</strong><span>từ mới hôm nay</span></div><div><strong>{lesson.dueWords.length}</strong><span>đến hạn ôn</span></div><div><strong>{getStreak(progress.activityDays,today)}</strong><span>ngày liên tiếp</span></div></div>{levelWords.length?<Link className="button button-primary" href="/hoc">{lesson.newWords.length||lesson.dueWords.length?'Bắt đầu học':'Xem bài học'} <span aria-hidden="true">→</span></Link>:<div className="empty-state">Nội dung HSK{level} đang được duyệt. Bài học sẽ mở khi có từ đã duyệt.</div>}</section>
    <section className="panel"><div className="section-title"><span className="badge">LỘ TRÌNH HSK</span><span>{learned}/{total} mục</span></div><h2>HSK{level} · {total} mục</h2><div className="progress-track" role="progressbar" aria-valuenow={learned} aria-valuemin={0} aria-valuemax={total} aria-label={`Tiến độ HSK${level}`}><span style={{width:`${Math.min(100,learned/total*100)}%`}}/></div><p>Mỗi mục đã học đều được lưu trên thiết bị này. Giới hạn 10 từ mới mỗi ngày áp dụng chung cho cả hai cấp.</p><LevelSelector level={level} hsk2Available={hsk2Available} onChange={setLevel}/></section></div>
    <aside className="dashboard-side"><section id="tu-cua-ngay" className="panel daily-panel"><span className="kicker">TỪ CỦA NGÀY · HSK1</span><h2>Một từ, cùng khám phá</h2>{daily?<><WordDisplay word={daily} compact/><Link className="text-link" href={`/tu/${daily.id}`}>Xem chi tiết từ →</Link></>:<p className="empty-state">Từ của ngày sẽ xuất hiện khi nội dung được duyệt.</p>}</section><section className="panel community-panel"><span className="kicker">GÓC CỘNG ĐỒNG</span><h2>Cùng nhau nhớ lâu hơn</h2>{daily?<WordCommunity wordId={daily.id} compact/>:<div className="empty-state">Chưa có từ để cùng thảo luận.</div>}</section></aside></div>
    <section className="home-links"><Link href="/thu-vien">Khám phá thư viện từ <span>→</span></Link><Link href="/hoi-dap">Hỏi đáp cộng đồng <span>→</span></Link><Link href="/tien-do">Xem tiến độ của bạn <span>→</span></Link></section>
  </main>;
}
