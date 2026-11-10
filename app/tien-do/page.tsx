import type { Metadata } from 'next';
import { ProgressApp } from '@/components/progress-app';
import { visibleWords, hsk2Available } from '@/lib/vocab';
export const metadata:Metadata={title:'Tiến độ cá nhân',alternates:{canonical:'/tien-do'}};
export default function ProgressPage(){return <ProgressApp words={visibleWords} hsk2Available={hsk2Available}/>}
