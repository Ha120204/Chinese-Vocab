import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import * as fontkit from 'fontkit';

const files = (await readdir('data/vocab')).filter(name => /^hsk\d+-batch\d+\.json$/.test(name));
const words = (await Promise.all(files.map(async name => JSON.parse(await readFile(`data/vocab/${name}`, 'utf8'))))).flat();
const unique = value => [...new Set([...value])].join('');
const hanzi = unique(words.map(word => `${word.hanzi}${word.example.hanzi}${word.pinyin}`).join('') + '汉字学问');
const copy = [
  'Sổ tay Chữ Hán', 'HSK 3.0 · HSK1', 'HSK 3.0 · HSK2', 'HSK 3.0 · HỌC MỖI NGÀY',
  'Học chữ Hán mỗi ngày', 'Mỗi ngày một chút, nhớ thật lâu',
  'Thư viện từ', 'Tìm chữ Hán, pinyin và nghĩa tiếng Việt',
  'Hỏi đáp cộng đồng', 'Cùng hỏi, cùng giải đáp, cùng tiến bộ',
].join(' ');
const vietnamese = unique(words.map(word => `${word.meaningVi} ${word.example.translationVi}`).join(' ') + copy + 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ·—:!?.,/()');

async function fetchSubset(family, text) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replaceAll('%20', '+')}:wght@700&text=${encodeURIComponent(text)}`;
  const cssResponse = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!cssResponse.ok) throw new Error(`${family} CSS: HTTP ${cssResponse.status}`);
  const css = await cssResponse.text();
  const match = css.match(/url\((https:[^)]+)\) format\('truetype'\)/);
  if (!match) throw new Error(`${family}: Google Fonts did not return a TTF subset`);
  const fontResponse = await fetch(match[1]);
  if (!fontResponse.ok) throw new Error(`${family} TTF: HTTP ${fontResponse.status}`);
  const buffer = Buffer.from(await fontResponse.arrayBuffer());
  const font = fontkit.create(buffer);
  const missing = [...text].filter(char => !font.hasGlyphForCodePoint(char.codePointAt(0)));
  if (missing.length) throw new Error(`${family} is missing glyphs: ${unique(missing)}`);
  return buffer;
}

const [hanziFont, vietnameseFont] = await Promise.all([
  fetchSubset('Noto Serif SC', hanzi),
  fetchSubset('Be Vietnam Pro', vietnamese),
]);
await mkdir('assets/og-fonts', { recursive: true });
await Promise.all([
  writeFile('assets/og-fonts/hanzi.ttf', hanziFont),
  writeFile('assets/og-fonts/vietnamese.ttf', vietnameseFont),
]);
console.log(`OG TTF subsets: ${hanzi.length} Hanzi glyphs (${hanziFont.length} bytes), ${vietnamese.length} Latin/Vietnamese glyphs (${vietnameseFont.length} bytes).`);
