import type { Metadata } from 'next';
import { QuestionBoard } from '@/components/community/question-board';
export const metadata:Metadata={title:'Hỏi đáp cộng đồng',description:'Đặt câu hỏi và cùng trao đổi về từ vựng HSK 3.0, chữ Hán và phát âm.',openGraph:{title:'Hỏi đáp cộng đồng',description:'Cùng hỏi, cùng giải đáp về tiếng Trung HSK 3.0.'},twitter:{card:'summary_large_image',title:'Hỏi đáp cộng đồng',images:['/hoi-dap/opengraph-image']},alternates:{canonical:'/hoi-dap'}};
export default function QuestionsPage(){return <QuestionBoard/>}
