'use client';
import Link from 'next/link';

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return <main className="state-page site-container"><div className="panel state-panel"><span className="state-symbol" aria-hidden="true">!</span><span className="kicker">CÓ SỰ CỐ</span><h1>Trang chưa tải được</h1><p>Bạn có thể thử lại. Tiến độ học đã lưu trên thiết bị vẫn ở đó.</p><div className="state-actions"><button className="button button-primary" onClick={retry}>Thử lại</button><Link className="button button-outline" href="/">Về trang chủ</Link></div></div></main>;
}
