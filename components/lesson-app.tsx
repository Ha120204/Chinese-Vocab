'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import type { VocabWord } from '@/lib/vocab';
import { vietnamDate } from '@/lib/date';
import { useProgress, getLesson, markLearned, reviewWord, addQuiz, setLevel } from '@/lib/progress';
import { trackEvent } from '@/lib/analytics';
import { SpeechButton } from '@/components/speech-button';
import { LevelSelector } from '@/components/level-selector';

type Stage = 'intro' | 'cards' | 'meaning' | 'listening' | 'result';

function choicesFor(target: VocabWord, words: VocabWord[], mode: 'meaning' | 'listening') {
  const pool = words.filter(word => word.level === target.level && word.id !== target.id && (mode === 'meaning' ? word.meaningVi !== target.meaningVi : word.pinyin.toLowerCase() !== target.pinyin.toLowerCase()));
  const start = (target.syllabusNo * 7) % Math.max(1, pool.length);
  const picked = Array.from({ length: Math.min(3, pool.length) }, (_, index) => pool[(start + index) % pool.length]);
  const choices = [target, ...picked];
  const shift = target.syllabusNo % choices.length;
  return [...choices.slice(shift), ...choices.slice(0, shift)];
}

export function LessonApp({ words, hsk2Available }: { words: VocabWord[]; hsk2Available: boolean }) {
  const progress = useProgress();
  const level=progress.level===2&&hsk2Available?2:1;
  const [stage, setStage] = useState<Stage>('intro');
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [dueIds, setDueIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState(false);
  const [cardError, setCardError] = useState('');
  const firstAction = useRef<HTMLButtonElement>(null);
  const secondAction = useRef<HTMLButtonElement>(null);
  const nextAction = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const mounted = useRef(false);
  const lesson = getLesson(words, {...progress,level}, vietnamDate());
  const levelWords = words.filter(item=>item.level===level);
  const word = queue[index];
  const mode = stage === 'meaning' ? 'meaning' : 'listening';
  const choices = word && (stage === 'meaning' || stage === 'listening') ? choicesFor(word, words, mode) : [];

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (stage === 'cards') firstAction.current?.focus();
    else if (stage === 'meaning' || stage === 'listening') {
      if (answer) nextAction.current?.focus();
      else options.current[0]?.focus();
    } else if (stage === 'result') nextAction.current?.focus();
    else firstAction.current?.focus();
  }, [stage, index, revealed, answer]);

  function begin() {
    const selected = [...lesson.dueWords, ...lesson.newWords];
    setQueue(selected);
    setDueIds(lesson.dueWords.map(item => item.id));
    setIndex(0); setScore(0); setRevealed(false); setAnswer(null); setCardError('');
    setStage(selected.length ? 'cards' : 'intro');
  }

  function nextCard(remembered: boolean) {
    if (!word) return;
    const today = vietnamDate();
    if (dueIds.includes(word.id)) reviewWord(word.id, remembered, today);
    else {
      if (!markLearned(word, today)) {
        setCardError('Đã đủ 10 từ mới trong ngày Việt Nam. Từ này sẽ chờ bạn vào ngày mai.');
        return;
      }
      if (!remembered) reviewWord(word.id, false, today);
    }
    setCardError(''); setRevealed(false);
    if (index + 1 < queue.length) setIndex(index + 1);
    else { setIndex(0); setStage('meaning'); }
  }

  function choose(id: string) {
    if (answer || !word) return;
    setAnswer(id);
    if (id === word.id) setScore(value => value + 1);
    else reviewWord(word.id, false, vietnamDate());
  }

  function nextQuestion() {
    setAnswer(null); setHint(false);
    if (index + 1 < queue.length) { setIndex(index + 1); return; }
    if (stage === 'meaning') { setStage('listening'); setIndex(0); return; }
    setStage('result');
    trackEvent('quiz_complete', { score, total: queue.length * 2, level: `HSK${level}` });
    addQuiz();
  }

  function onShortcut(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || /^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement).tagName)) return;
    if (stage === 'cards') {
      if (!revealed && event.key === '1') { event.preventDefault(); setRevealed(true); }
      else if (revealed && event.key === '1') { event.preventDefault(); nextCard(false); }
      else if (revealed && event.key === '2') { event.preventDefault(); nextCard(true); }
    } else if (stage === 'meaning' || stage === 'listening') {
      const number = Number(event.key);
      if (!answer && /^[1-4]$/.test(event.key) && choices[number - 1]) {
        event.preventDefault(); choose(choices[number - 1].id);
      }
    }
  }

  return <main className="site-container learning-page" onKeyDown={onShortcut}>
    <div className="page-heading"><div><span className="kicker">BÀI HỌC CỦA BẠN · HSK 3.0</span><h1>Học từ hôm nay</h1><p>Flashcard, hai bài quiz ngắn và một kết quả rõ ràng.</p></div><Link className="back-link" href="/">← Trang chủ</Link></div>
    {stage === 'intro' && <section className="panel lesson-intro"><span className="badge">HSK{level} · {level===2?200:300} mục</span><LevelSelector level={level} hsk2Available={hsk2Available} onChange={setLevel}/><h2>Sẵn sàng học cùng nhau?</h2><p>Hôm nay còn {lesson.remaining} lượt từ mới dùng chung cho HSK1 và HSK2. Bài học HSK{level} hiện có <strong>{lesson.newWords.length} từ mới</strong> và <strong>{lesson.dueWords.length} từ đến hạn ôn</strong>.</p>{levelWords.length === 0 ? <div className="empty-state">Nội dung đang được duyệt. Hãy quay lại sau.</div> : lesson.newWords.length + lesson.dueWords.length === 0 ? <div className="empty-state">Bạn đã hoàn tất phần hôm nay. Hẹn gặp lại vào ngày mai!</div> : <button ref={firstAction} className="button button-primary" onClick={begin}>Bắt đầu bài học →</button>}</section>}
    {stage === 'cards' && word && <section className="study-shell"><div className="study-meta"><span>FLASHCARD · {index + 1}/{queue.length}</span><span>{dueIds.includes(word.id) ? 'Ôn tập' : 'Từ mới'}</span></div><div className="study-progress" role="progressbar" aria-label="Tiến độ flashcard" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={index + 1}><span style={{ width: `${(index + 1) / queue.length * 100}%` }}/></div><div className="study-card"><span className="badge">HSK 3.0 · HSK{word.level}</span>{!word.reviewed && <span className="badge badge-draft">Nội dung đang rà soát</span>}<span className="study-hanzi">{word.hanzi}</span><div className="study-pronunciation"><span>{word.pinyin}</span><SpeechButton text={word.hanzi}/></div>{revealed ? <div className="card-answer"><strong>{word.meaningVi}</strong><p>{word.example.hanzi}</p><small>{word.example.pinyin}</small><p>{word.example.translationVi}</p>{word.note&&<p className="word-note">{word.note}</p>}</div> : <button ref={firstAction} className="button button-subtle" onClick={() => setRevealed(true)}>Lật thẻ xem nghĩa</button>}</div>{revealed && <div className="study-actions"><button ref={firstAction} className="button button-outline" onClick={() => nextCard(false)}>Cần ôn lại</button><button ref={secondAction} className="button button-primary" onClick={() => nextCard(true)}>Đã nhớ · Tiếp tục →</button></div>}{cardError && <p className="field-error" role="alert">{cardError}</p>}<p className="help-text">Phím 1: lật thẻ hoặc cần ôn lại; phím 2: đã nhớ. Từ mới chỉ được ghi nhận khi bạn hoàn thành thẻ.</p></section>}
    {(stage === 'meaning' || stage === 'listening') && word && <section className="study-shell"><div className="study-meta"><span>{stage === 'meaning' ? 'QUIZ · CHỮ → NGHĨA' : 'QUIZ · NGHE → CHỮ'} · {index + 1}/{queue.length}</span><span>Điểm {score}/{stage === 'meaning' ? queue.length : queue.length * 2}</span></div><div className="study-progress" role="progressbar" aria-label="Tiến độ quiz" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={index + 1}><span style={{ width: `${(index + 1) / queue.length * 100}%` }}/></div><div className="quiz-panel"><span className="kicker">CHỌN MỘT ĐÁP ÁN · PHÍM 1–4</span><h2>{stage === 'meaning' ? 'Chữ này có nghĩa là gì?' : 'Bạn nghe thấy chữ nào?'}</h2>{stage === 'meaning' ? <span className="quiz-hanzi">{word.hanzi}</span> : <div className="listening-prompt"><SpeechButton text={word.hanzi} label="Phát âm câu hỏi"/><button className="text-link" onClick={() => setHint(true)}>Không nghe được? Xem pinyin</button>{hint && <span>{word.pinyin}</span>}</div>}<div className="quiz-options">{choices.map((choice, optionIndex) => <button key={choice.id} ref={node => { options.current[optionIndex] = node; }} onClick={() => choose(choice.id)} disabled={!!answer} aria-label={`${optionIndex + 1}. ${stage === 'meaning' ? choice.meaningVi : choice.hanzi}`} className={`quiz-option ${answer === choice.id ? (choice.id === word.id ? 'correct' : 'incorrect') : answer && choice.id === word.id ? 'correct' : ''}`}><span>{stage === 'meaning' ? choice.meaningVi : choice.hanzi}</span>{answer === choice.id && <b>{choice.id === word.id ? '✓' : '×'}</b>}</button>)}</div>{answer && <div className="quiz-feedback" role="status"><strong>{answer === word.id ? 'Chính xác!' : 'Chưa đúng, mình sẽ gặp lại từ này sớm.'}</strong><span>{word.hanzi} · {word.pinyin} · {word.meaningVi}</span><button ref={nextAction} className="button button-primary" onClick={nextQuestion}>{stage === 'listening' && index + 1 === queue.length ? 'Xem kết quả' : 'Câu tiếp theo'} →</button></div>}</div></section>}
    {stage === 'result' && <section className="panel result-panel"><div className="result-symbol">✓</div><span className="kicker">HOÀN THÀNH BÀI HỌC</span><h2>Bạn đã học thêm một chút hôm nay!</h2><p>Kết quả quiz của bạn</p><div className="result-score"><strong>{score}</strong><span>/ {queue.length * 2} câu đúng</span></div><p>{queue.length} từ đã đi qua flashcard. Từ trả lời sai sẽ quay lại sớm trong lịch ôn.</p><div className="result-actions"><Link className="button button-primary" href="/tien-do">Xem tiến độ →</Link><button ref={nextAction} className="button button-outline" onClick={() => setStage('intro')}>Về bài học</button></div></section>}
  </main>;
}
