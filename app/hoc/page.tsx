import type { Metadata } from 'next';
import { LessonApp } from '@/components/lesson-app';
import { visibleWords, hsk2Available } from '@/lib/vocab';
export const metadata:Metadata={title:'Bài học của bạn',alternates:{canonical:'/hoc'}};
export default function LearnPage(){return <LessonApp words={visibleWords} hsk2Available={hsk2Available}/>}
