import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

export const alt = `${siteConfig.name} — học từ vựng HSK 3.0 mỗi ngày`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), 'public/icon-192.png'));
  const logoDataUrl = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#00288e', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: 280, background: '#1e40af', top: -190, right: -120 }} />
      <div style={{ position: 'absolute', width: 440, height: 440, borderRadius: 220, background: '#006a61', bottom: -300, right: 100 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <img src={logoDataUrl} alt="" style={{ width: 94, height: 94 }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 26, color: '#86f2e4', letterSpacing: 3 }}>HSK 3.0 · HỌC MỖI NGÀY</span>
          <span style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.2, marginTop: 18 }}>{siteConfig.name}</span>
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 29, marginTop: 44, color: '#e9edff' }}>10 từ mới · Flashcard · Ôn tập đúng lúc</div>
    </div>,
    size,
  );
}
