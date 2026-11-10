export type Tip = { id:string; word_id:string; display_name:string; body:string; likes_count:number; created_at:string };
export type WordComment = { id:string; word_id:string; display_name:string; body:string; created_at:string };
export type Question = { id:string; display_name:string; title:string; body:string; category:string; created_at:string };
export type Answer = { id:string; question_id:string; display_name:string; body:string; created_at:string };
export const categories: Record<string,string> = { hsk1:'HSK1', hanzi:'Chữ Hán', pronunciation:'Phát âm', grammar:'Ngữ pháp', other:'Khác' };
export const dateLabel = (value:string) => new Date(value).toLocaleDateString('vi-VN',{day:'numeric',month:'numeric',year:'numeric',timeZone:'Asia/Ho_Chi_Minh'});
