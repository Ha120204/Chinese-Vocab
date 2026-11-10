import type { Metadata } from 'next';
import { QuestionThread } from '@/components/community/question-thread';
type Props={params:Promise<{id:string}>};
export const metadata:Metadata={title:'Thảo luận cộng đồng',robots:{index:false,follow:true}};
export default async function QuestionPage({params}:Props){const {id}=await params;return <QuestionThread id={id}/>}
