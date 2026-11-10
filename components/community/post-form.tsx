'use client';
import { useState, type FormEvent } from 'react';
import { communityFetch } from '@/lib/community/browser-id';
import { trackEvent } from '@/lib/analytics';
import { categories } from '@/components/community/types';

type Kind = 'tip'|'comment'|'question'|'answer';
const labels: Record<Kind,{button:string;title:string;body:string}> = {
  tip:{button:'Gửi mẹo nhớ',title:'Chia sẻ mẹo nhớ',body:'Mẹo nhớ của bạn'},
  comment:{button:'Gửi bình luận',title:'Viết bình luận',body:'Bình luận của bạn'},
  question:{button:'Đặt câu hỏi',title:'Đặt câu hỏi mới',body:'Nội dung câu hỏi'},
  answer:{button:'Gửi câu trả lời',title:'Trả lời câu hỏi',body:'Câu trả lời của bạn'},
};

export function PostForm({kind,path,onCreated}:{kind:Kind;path:string;onCreated:()=>void}){
  const [expanded,setExpanded]=useState(false);
  const [busy,setBusy]=useState(false);
  const [errors,setErrors]=useState<Record<string,string[]>>({});
  const [message,setMessage]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setBusy(true); setErrors({}); setMessage('');
    const form=event.currentTarget;
    const values=Object.fromEntries(new FormData(form).entries());
    try {
      const response=await communityFetch(path,{method:'POST',body:JSON.stringify(values)});
      const payload=await response.json();
      if(!response.ok){setErrors(payload.fields ?? {});setMessage(payload.error ?? 'Không thể gửi. Vui lòng thử lại.');return;}
      if(response.status!==202){form.reset();onCreated();if(kind==='tip')trackEvent('post_tip');if(kind==='question')trackEvent('ask_question');}
      setMessage('Đã gửi thành công. Nội dung sẽ hiển thị ngay.');
    } catch {setMessage('Không thể kết nối. Vui lòng thử lại.');}
    finally {setBusy(false);}
  }
  const meta=labels[kind];
  return <section className="community-compose panel"><button type="button" className="community-compose-toggle" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{meta.title} <span aria-hidden="true">{expanded?'−':'+'}</span></button><form className={expanded?'community-form is-open':'community-form'} onSubmit={submit} noValidate>
    <h2 className="community-form-title">{meta.title}</h2>
    <label htmlFor={`${kind}-name`}>Tên hiển thị</label><input id={`${kind}-name`} name="displayName" minLength={1} maxLength={40} required placeholder="Tên của bạn" aria-invalid={Boolean(errors.displayName)}/>{errors.displayName&&<p className="field-error">{errors.displayName[0]}</p>}
    {kind==='question'&&<><label htmlFor="question-title">Tiêu đề</label><input id="question-title" name="title" minLength={10} maxLength={160} required placeholder="Bạn đang thắc mắc điều gì?" aria-invalid={Boolean(errors.title)}/>{errors.title&&<p className="field-error">{errors.title[0]}</p>}<label htmlFor="question-category">Chủ đề</label><select id="question-category" name="category">{Object.entries(categories).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></>}
    <label htmlFor={`${kind}-body`}>{meta.body}</label><textarea id={`${kind}-body`} name="body" rows={kind==='question'?6:4} required minLength={kind==='question'?10:kind==='tip'?5:2} maxLength={kind==='question'||kind==='answer'?3000:1000} placeholder={kind==='tip'?'Viết cách bạn liên tưởng để nhớ chữ này…':'Viết nội dung rõ ràng, lịch sự…'} aria-invalid={Boolean(errors.body)}/>{errors.body&&<p className="field-error">{errors.body[0]}</p>}
    <input className="visually-hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true"/>
    <p className="help-text">Nội dung hiển thị ngay và được hậu kiểm. Vui lòng đọc <a href="/quy-dinh">Quy định cộng đồng</a>.</p>
    {message&&<p className={Object.keys(errors).length?'field-error':'form-message'} role="status">{message}</p>}
    <button className="button button-primary" type="submit" disabled={busy}>{busy?'Đang gửi…':meta.button}</button>
  </form></section>;
}
