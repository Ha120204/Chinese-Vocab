import { createOgImage, ogSize } from '@/lib/og-image';

export const alt = 'Hỏi đáp cộng đồng học chữ Hán';
export const size = ogSize;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return createOgImage({ title: 'Hỏi đáp cộng đồng', subtitle: 'Cùng hỏi, cùng giải đáp, cùng tiến bộ' });
}
