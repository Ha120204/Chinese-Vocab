import { notFound } from 'next/navigation';
import { createOgImage, ogSize } from '@/lib/og-image';
import { getWord, visibleWords } from '@/lib/vocab';

type Props = { params: Promise<{ id: string }> };
export const alt = 'Từ vựng HSK 3.0 với chữ Hán, pinyin và nghĩa tiếng Việt';
export const size = ogSize;
export const contentType = 'image/png';
export const dynamicParams = false;
export function generateStaticParams() { return visibleWords.map(word => ({ id: word.id })); }

export default async function OpenGraphImage({ params }: Props) {
  const { id } = await params;
  const word = getWord(id);
  if (!word) notFound();
  return createOgImage({ title: word.hanzi, subtitle: word.meaningVi, hanzi: word.hanzi, pinyin: word.pinyin, meaning: word.meaningVi });
}
