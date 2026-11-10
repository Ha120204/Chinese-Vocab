import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

export const ogSize = { width: 1200, height: 630 };
const assets = Promise.all([
  readFile(join(process.cwd(), 'assets/og-fonts/vietnamese.ttf')),
  readFile(join(process.cwd(), 'assets/og-fonts/hanzi.ttf')),
  readFile(join(process.cwd(), 'public/icon-192.png')),
]);

type OgCard = { title: string; subtitle: string; hanzi?: string; pinyin?: string; meaning?: string; level?: number };

export async function createOgImage({ title, subtitle, hanzi, pinyin, meaning, level }: OgCard) {
  const [vietnameseFont, hanziFont, logo] = await assets;
  const logoUrl = `data:image/png;base64,${logo.toString('base64')}`;
  const wordCard = Boolean(hanzi);
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 68, position: 'relative', overflow: 'hidden', background: wordCard ? '#faf8ff' : '#00288e', color: wordCard ? '#131b2e' : '#ffffff', fontFamily: 'Be Vietnam Pro' }}>
      {!wordCard && <><div style={{ position: 'absolute', width: 530, height: 530, borderRadius: 265, background: '#1e40af', top: -180, right: -120 }}/><div style={{ position: 'absolute', width: 410, height: 410, borderRadius: 205, background: '#006a61', bottom: -285, right: 90 }}/></>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}><img src={logoUrl} alt="" style={{ width: 78, height: 78 }}/><span style={{ fontSize: 26, color: wordCard ? '#00288e' : '#e9edff' }}>{siteConfig.name}</span></div>
      {wordCard ? <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, paddingLeft: 14 }}>
        <span style={{ color: '#006a61', fontSize: 26, letterSpacing: 3 }}>HSK 3.0 · HSK{level??1}</span>
        <span style={{ fontFamily: 'Noto Serif SC', color: '#00288e', fontSize: hanzi && [...hanzi].length > 3 ? 132 : 174, lineHeight: 1.15, marginTop: 6 }}>{hanzi}</span>
        <span style={{ fontFamily: 'Noto Serif SC', color: '#006a61', fontSize: 42, marginTop: 6 }}>{pinyin}</span>
        <span style={{ fontSize: meaning && meaning.length > 34 ? 38 : 48, marginTop: 18 }}>{meaning}</span>
      </div> : <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, paddingLeft: 16 }}>
        <span style={{ fontSize: 26, color: '#86f2e4', letterSpacing: 3 }}>HSK 3.0 · HỌC MỖI NGÀY</span>
        <span style={{ fontSize: title.length > 21 ? 65 : 76, lineHeight: 1.2, marginTop: 20 }}>{title}</span>
        <span style={{ fontSize: 30, color: '#e9edff', marginTop: 30 }}>{subtitle}</span>
      </div>}
    </div>,
    { ...ogSize, fonts: [
      { name: 'Be Vietnam Pro', data: vietnameseFont, style: 'normal', weight: 700 },
      { name: 'Noto Serif SC', data: hanziFont, style: 'normal', weight: 700 },
    ] },
  );
}
