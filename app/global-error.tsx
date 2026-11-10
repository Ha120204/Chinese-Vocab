'use client';
import './fonts-vietnam.css';
import './globals.css';

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return <html lang="vi"><body><main className="state-page site-container"><div className="panel state-panel"><span className="state-symbol" aria-hidden="true">!</span><h1>Website chưa tải được</h1><p>Vui lòng thử lại sau ít phút.</p><div className="state-actions"><button className="button button-primary" onClick={retry}>Thử lại</button><a className="button button-outline" href="/">Về trang chủ</a></div></div></main></body></html>;
}
