'use client';
import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export function SpeechButton({text,label='Nghe phát âm'}:{text:string;label?:string}){
  const [message,setMessage]=useState('');
  function play(){
    if(!('speechSynthesis' in window)){setMessage('Thiết bị này chưa hỗ trợ phát âm. Hãy đọc theo pinyin.');return;}
    const voices=window.speechSynthesis.getVoices();
    const voice=voices.find(v=>v.lang.toLowerCase().startsWith('zh-cn')) ?? voices.find(v=>v.lang.toLowerCase().startsWith('zh'));
    if(!voice){setMessage('Máy chưa có giọng tiếng Trung. Hãy đọc theo pinyin hoặc cài giọng zh-CN.');return;}
    window.speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(text);utterance.lang='zh-CN';utterance.voice=voice;utterance.rate=.85;
    utterance.onerror=()=>setMessage('Không phát được âm thanh. Hãy đọc theo pinyin.');
    window.speechSynthesis.speak(utterance);setMessage('');trackEvent('play_audio',{word:text});
  }
  return <span className="speech-wrap"><button type="button" className="icon-button" aria-label={label} onClick={play}>◖))</button>{message&&<span className="speech-error" role="status">{message}</span>}</span>;
}
