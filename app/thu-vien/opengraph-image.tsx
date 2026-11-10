import { createOgImage, ogSize } from '@/lib/og-image';

export const alt = 'Thư viện từ vựng HSK 3.0 · HSK1';
export const size = ogSize;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return createOgImage({ title: 'Thư viện từ', subtitle: 'Tìm chữ Hán, pinyin và nghĩa tiếng Việt' });
}
