import { createOgImage, ogSize } from '@/lib/og-image';
import { siteConfig } from '@/lib/site-config';

export const alt = `${siteConfig.name} — học từ vựng HSK 3.0 mỗi ngày`;
export const size = ogSize;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return createOgImage({ title: siteConfig.name, subtitle: '10 từ mới · Flashcard · Ôn tập đúng lúc' });
}
