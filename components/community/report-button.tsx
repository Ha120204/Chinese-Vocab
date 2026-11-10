'use client';
import { useState, type FormEvent } from 'react';
import { communityFetch } from '@/lib/community/browser-id';

export function ReportButton({contentType,contentId}:{contentType:'tip'|'word_comment'|'question'|'answer';contentId:string}){
  const [open,setOpen]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage('');const form=event.currentTarget;const values=Object.fromEntries(new FormData(form).entries());try{const response=await communityFetch('/api/reports',{method:'POST',body:JSON.stringify({contentType,contentId,...values})});const data=await response.json();if(response.ok){setMessage('Đã nhận báo cáo. Cảm ơn bạn.');setOpen(false)}else setMessage(data.error??'Không thể gửi báo cáo.')}catch{setMessage('Không thể kết nối. Vui lòng thử lại.')}finally{setBusy(false)}}
  return <div className="report-control"><button className="report-link" type="button" onClick={()=>setOpen(v=>!v)}>Báo cáo</button>{open&&<form className="report-form" onSubmit={submit}><label>Lý do<select name="reason"><option value="spam">Spam</option><option value="abuse">Ngôn từ không phù hợp</option><option value="copyright">Bản quyền</option><option value="other">Khác</option></select></label><label>Chi tiết (không bắt buộc)<textarea name="details" rows={2} maxLength={1000}/></label><input className="visually-hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true"/><button type="submit" className="button button-outline" disabled={busy}>{busy?'Đang gửi…':'Gửi báo cáo'}</button></form>}{message&&<p className="form-message" role="status">{message}</p>}</div>;
}
