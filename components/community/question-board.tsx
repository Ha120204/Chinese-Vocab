'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { communityFetch } from '@/lib/community/browser-id';
import { PostForm } from '@/components/community/post-form';
import { categories, dateLabel, type Question } from '@/components/community/types';

export function QuestionBoard() {
  const [category,setCategory] = useState('');
  const [searchDraft,setSearchDraft] = useState('');
  const [search,setSearch] = useState('');
  const [page,setPage] = useState(0);
  const [version,setVersion] = useState(0);
  const [questions,setQuestions] = useState<Question[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page:String(page) });
      if (category) query.set('category',category);
      if (search) query.set('search',search);
      const response = await communityFetch(`/api/questions?${query}`);
      if (!response.ok) throw new Error('Chưa thể tải câu hỏi.');
      const data = await response.json();
      setQuestions(data.questions ?? []);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chưa thể tải câu hỏi.');
    } finally { setLoading(false); }
  }, [category,search,page,version]);
  useEffect(() => { void reload(); }, [reload]);
  function submitSearch(event:FormEvent<HTMLFormElement>) { event.preventDefault(); setPage(0); setSearch(searchDraft.trim()); }

  return <main className="site-container qa-page">
    <div className="page-heading"><div><span className="kicker">CỘNG ĐỒNG TỰ HỌC</span><h1>Hỏi đáp cộng đồng</h1><p>Chia sẻ thắc mắc về HSK 3.0, chữ Hán và phát âm. Cùng nhau học mỗi ngày.</p></div><span className="header-badge">HSK 3.0</span></div>
    <div className="qa-grid"><div className="qa-list">
      <div className="panel"><div className="section-title"><span className="kicker">THẢO LUẬN GẦN ĐÂY</span><span>Mới nhất</span></div>
        <form className="qa-search" onSubmit={submitSearch}><label className="visually-hidden" htmlFor="question-search">Tìm câu hỏi</label><input id="question-search" value={searchDraft} onChange={event=>setSearchDraft(event.target.value)} maxLength={80} placeholder="Tìm theo tiêu đề câu hỏi"/><button type="submit" className="button button-outline">Tìm</button></form>
        <div className="topic-list qa-filters"><button type="button" aria-pressed={!category} onClick={()=>{setCategory('');setPage(0)}}>Tất cả</button>{Object.entries(categories).map(([key,label])=><button type="button" key={key} aria-pressed={category===key} onClick={()=>{setCategory(key);setPage(0)}}>{label}</button>)}</div>
      </div>
      {error&&<p className="field-error" role="status">{error} <button className="button button-outline" type="button" onClick={()=>void reload()}>Thử lại</button></p>}
      {loading?<p className="empty-state" role="status">Đang tải câu hỏi…</p>:error?null:questions.length?<div className="question-list">{questions.map(question=><article className="panel question-card" key={question.id}><div className="entry-meta"><span className="badge">{categories[question.category]}</span><span>{dateLabel(question.created_at)}</span></div><h2><Link href={`/hoi-dap/${question.id}`}>{question.title}</Link></h2><p>{question.body}</p><div className="entry-actions"><span>{question.display_name}</span><Link className="text-link" href={`/hoi-dap/${question.id}`}>Xem thảo luận →</Link></div></article>)}</div>:<p className="empty-state">Chưa có câu hỏi nào phù hợp.</p>}
      {!error&&<div className="qa-pagination"><button type="button" className="button button-outline" disabled={page===0||loading} onClick={()=>setPage(p=>p-1)}>Trang trước</button><span>Trang {page+1}</span><button type="button" className="button button-outline" disabled={loading||questions.length<20||page===20} onClick={()=>setPage(p=>p+1)}>Trang sau</button></div>}
    </div><aside className="qa-sidebar"><PostForm kind="question" path="/api/questions" onCreated={()=>{setCategory('');setSearch('');setSearchDraft('');setPage(0);setVersion(v=>v+1)}}/><div className="panel"><h2>Học cùng nhau</h2><p>Đặt câu hỏi cụ thể, trình bày điều đã thử và trao đổi lịch sự. Nội dung hiển thị ngay, được hậu kiểm.</p><Link className="text-link" href="/quy-dinh">Xem quy định cộng đồng →</Link></div></aside></div>
  </main>;
}
