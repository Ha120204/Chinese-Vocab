import Link from 'next/link';
import type { VocabWord } from '@/lib/vocab';
import { SpeechButton } from '@/components/speech-button';

export function WordDisplay({ word, compact = false }: { word: VocabWord; compact?: boolean }) {
  return (
    <article className={`word-display ${compact ? 'word-compact' : ''}`}>
      <div className="word-top">
        <span className="badge">HSK 3.0 · HSK{word.level}</span>
        {!word.reviewed && <span className="badge badge-draft">Nội dung đang rà soát</span>}
      </div>
      <Link className="hanzi-link" href={`/tu/${word.id}`}><span className="hanzi">{word.hanzi}</span></Link>
      <div className="word-reading"><span>{word.pinyin}</span><SpeechButton text={word.hanzi} /></div>
      <strong className="word-meaning">{word.meaningVi}</strong>
      {!compact && word.note && <p className="word-note">{word.note}</p>}
      {!compact && (
        <div className="example">
          <div className="example-heading"><span>VÍ DỤ</span><SpeechButton text={word.example.hanzi} label="Nghe câu ví dụ" /></div>
          <p className="example-hanzi">{word.example.hanzi}</p>
          <p>{word.example.pinyin}</p>
          <p>{word.example.translationVi}</p>
        </div>
      )}
    </article>
  );
}
