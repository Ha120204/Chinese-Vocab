import type { Metadata } from 'next';
import { HomeDashboard } from '@/components/home-dashboard';
import { visibleWords, wordOfDay } from '@/lib/vocab';
import { vietnamDate } from '@/lib/date';
export const metadata:Metadata={alternates:{canonical:'/'}};
export const dynamic='force-dynamic';
export default function HomePage(){const today=vietnamDate();return <HomeDashboard words={visibleWords} daily={wordOfDay(today)} initialDate={today}/>}
