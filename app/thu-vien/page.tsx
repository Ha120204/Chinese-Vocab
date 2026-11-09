import type { Metadata } from 'next';
import { LibraryApp } from '@/components/library-app';
import { visibleWords } from '@/lib/vocab';
export const metadata:Metadata={title:'Thư viện từ',alternates:{canonical:'/thu-vien'}};
export default function LibraryPage(){return <LibraryApp words={visibleWords}/>}
