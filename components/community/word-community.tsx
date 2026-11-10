'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { communityFetch } from '@/lib/community/browser-id';
import { trackEvent } from '@/lib/analytics';
import { PostForm } from '@/components/community/post-form';
import { ReportButton } from '@/components/community/report-button';
import { dateLabel, type Tip, type WordComment } from '@/components/community/types';

function TipCard({tip}:{tip:Tip}){
  const [liked,setLiked]=useState(false);const [count,setCount]=useState(tip.likes_count);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{let live=true;communityFetch(`/api/tips/${tip.id}/like`).then(r=>r.json()).then(v=>{if(live)setLiked(Boolean(v.liked))}).catch(()=>{});return()=>{live=false}},[tip.id]);
  async function toggle(){setBusy(true);setError('');try{const response=await communityFetch(`/api/tips/${tip.id}/like`,{method:'POST',body:'{}'});const data=await response.json();if(!response.ok)throw new Error(data.error);setLiked(data.liked);setCount(data.likes_count);trackEvent('like_tip',{liked:data.liked})}catch(e){setError(e instanceof Error?e.message:'Không thể cập nhật lượt thích.')}finally{setBusy(false)}}
  return <article className="community-entry"><div className="entry-meta"><strong>{tip.display_name}</strong><span>{dateLabel(tip.created_at)}</span></div><p>{tip.body}</p><div className="entry-actions"><button type="button" className="like-button" aria-pressed={liked} disabled={busy} onClick={toggle}>{liked?'♥ Đã thích':'♡ Thích'} · {count}</button><ReportButton contentType="tip" contentId={tip.id}/></div>{error&&<p className="field-error" role="status">{error}</p>}</article>;
}

export function WordCommunity({wordId,compact=false}:{wordId:string;compact?:boolean}){
  const [tips,setTips]=useState<Tip[]>([]);const [comments,setComments]=useState<WordComment[]>([]);const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const reload=useCallback(async()=>{try{const [tipResponse,commentResponse]=await Promise.all([communityFetch(`/api/words/${wordId}/tips`),communityFetch(`/api/words/${wordId}/comments`)]);if(!tipResponse.ok||!commentResponse.ok)throw new Error('Chưa thể tải nội dung cộng đồng.');const [tipData,commentData]=await Promise.all([tipResponse.json(),commentResponse.json()]);setTips(tipData.tips??[]);setComments(commentData.comments??[]);setError('')}catch(e){setError(e instanceof Error?e.message:'Chưa thể tải nội dung cộng đồng.')}finally{setLoading(false)}},[wordId]);
  useEffect(()=>{void reload()},[reload]);
  return <div className={compact?'word-community is-compact':'word-community'}>
    {error&&<p className="field-error" role="status">{error} <button className="button button-outline" type="button" onClick={()=>{setLoading(true);void reload()}}>Thử lại</button></p>}
    <section className="community-section"><div className="section-title"><span className="kicker">MẸO NHỚ CHỮ</span><span>{tips.length} mẹo</span></div>{loading?<p role="status">Đang tải…</p>:error?null:tips.length?<div className="entry-list">{(compact?tips.slice(0,2):tips).map(tip=><TipCard key={tip.id} tip={tip}/>)}</div>:<p className="empty-state">Chưa có mẹo nhớ nào. Hãy chia sẻ cách bạn nhớ chữ này.</p>}{!compact&&<PostForm kind="tip" path={`/api/words/${wordId}/tips`} onCreated={()=>void reload()}/>}</section>
    <section className="community-section"><div className="section-title"><span className="kicker">BÌNH LUẬN</span><span>{comments.length} bình luận</span></div>{loading?<p role="status">Đang tải…</p>:error?null:comments.length?<div className="entry-list">{(compact?comments.slice(0,2):comments).map(comment=><article className="community-entry" key={comment.id}><div className="entry-meta"><strong>{comment.display_name}</strong><span>{dateLabel(comment.created_at)}</span></div><p>{comment.body}</p><ReportButton contentType="word_comment" contentId={comment.id}/></article>)}</div>:<p className="empty-state">Chưa có bình luận nào.</p>}{!compact&&<PostForm kind="comment" path={`/api/words/${wordId}/comments`} onCreated={()=>void reload()}/>}</section>
    {compact&&<Link className="text-link" href={`/tu/${wordId}`}>Chia sẻ mẹo nhớ hoặc bình luận →</Link>}
  </div>;
}
