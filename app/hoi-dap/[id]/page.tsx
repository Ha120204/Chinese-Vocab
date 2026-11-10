import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { QuestionThread } from '@/components/community/question-thread';
import { publicDb } from '@/lib/community/db';
import { uuid } from '@/lib/community/schemas';
type Props={params:Promise<{id:string}>};
export const dynamic = 'force-dynamic';
export const metadata:Metadata={title:'Thảo luận cộng đồng',robots:{index:false,follow:true}};
export default async function QuestionPage({params}:Props){
  const {id}=await params;
  if(!uuid.safeParse(id).success) notFound();
  const {data,error}=await publicDb().from('questions').select('id').eq('id',id).maybeSingle();
  if(error) throw new Error('Không thể tải câu hỏi.');
  if(!data) notFound();
  return <QuestionThread id={id}/>;
}
