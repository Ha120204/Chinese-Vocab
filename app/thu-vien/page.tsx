import type { Metadata } from 'next';
import { LibraryApp } from '@/components/library-app';
import { visibleWords, hsk2Available } from '@/lib/vocab';
export const metadata:Metadata={title:'Thư viện từ',openGraph:{title:'Thư viện từ',description:'Tìm chữ Hán, pinyin và nghĩa tiếng Việt theo HSK 3.0.'},twitter:{card:'summary_large_image',title:'Thư viện từ',images:['/thu-vien/opengraph-image']},alternates:{canonical:'/thu-vien'}};
export default function LibraryPage(){return <LibraryApp words={visibleWords} hsk2Available={hsk2Available}/>}
