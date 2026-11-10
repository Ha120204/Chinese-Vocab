import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWord,visibleWords,previewDrafts } from '@/lib/vocab';
import { WordDisplay } from '@/components/word-display';
import { WordCommunity } from '@/components/community/word-community';
type Props={params:Promise<{id:string}>};
export function generateStaticParams(){return visibleWords.map(w=>({id:w.id}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {id}=await params;const word=getWord(id);return word?{title:`${word.hanzi} (${word.pinyin})`,description:`${word.hanzi}: ${word.meaningVi}. Từ vựng HSK 3.0 · HSK1.`,openGraph:{title:`${word.hanzi} · ${word.pinyin}`,description:`${word.meaningVi} · HSK 3.0`},twitter:{card:'summary_large_image',title:`${word.hanzi} · ${word.pinyin}`,description:word.meaningVi,images:[`/tu/${id}/opengraph-image`]},robots:!word.reviewed&&previewDrafts?{index:false,follow:false}:undefined,alternates:{canonical:`/tu/${id}`}}:{title:'Không tìm thấy từ'};}
export default async function WordPage({params}:Props){const {id}=await params;const word=getWord(id);if(!word)notFound();const related=visibleWords.filter(w=>w.id!==id&&(w.topic===word.topic||w.hanzi.includes(word.hanzi))).slice(0,4);return <main className="site-container detail-page"><Link href="/thu-vien" className="back-link">← Trở lại thư viện</Link><div className="detail-grid"><div><WordDisplay word={word}/><section className="panel related-panel"><span className="kicker">CÙNG CHỦ ĐỀ · {word.topic.toUpperCase()}</span><h2>Từ liên quan</h2><div className="related-list">{related.map(w=><Link key={w.id} href={`/tu/${w.id}`}><strong className="hanzi-small">{w.hanzi}</strong><span>{w.pinyin}</span><span>{w.meaningVi}</span><b>→</b></Link>)}</div></section></div><aside className="panel detail-community"><span className="kicker">HỌC CÙNG CỘNG ĐỒNG</span><h2>Mẹo nhớ & bình luận</h2><WordCommunity wordId={id}/></aside></div></main>}
