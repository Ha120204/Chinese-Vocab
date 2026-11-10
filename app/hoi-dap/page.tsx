import type { Metadata } from 'next';
import { QuestionBoard } from '@/components/community/question-board';
export const metadata:Metadata={title:'Hỏi đáp cộng đồng',description:'Đặt câu hỏi và cùng trao đổi về từ vựng HSK 3.0, chữ Hán và phát âm.',alternates:{canonical:'/hoi-dap'}};
export default function QuestionsPage(){return <QuestionBoard/>}
