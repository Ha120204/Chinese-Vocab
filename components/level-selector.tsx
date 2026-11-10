'use client';

export type HskLevel = 1 | 2;

export function LevelSelector({ level, hsk2Available, onChange, compact = false }: {
  level: HskLevel;
  hsk2Available: boolean;
  onChange: (level: HskLevel) => void;
  compact?: boolean;
}) {
  return <div className={compact ? 'filter-row' : 'level-selector'} role="group" aria-label="Chọn cấp HSK 3.0">
    {([1, 2] as const).map(value => <button
      key={value}
      type="button"
      className={level===value ? 'level-active' : 'level-option'}
      aria-pressed={level===value}
      disabled={value===2&&!hsk2Available}
      onClick={()=>onChange(value)}
    >{compact ? `HSK${value}` : `HSK 3.0 · HSK${value}`}{value===2&&!hsk2Available&&<b> Sắp có</b>}</button>)}
  </div>;
}
