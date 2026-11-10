import Link from 'next/link';

export default function NotFound() {
  return <main className="state-page site-container"><div className="panel state-panel"><span className="state-symbol" aria-hidden="true">?</span><span className="kicker">KHÔNG TÌM THẤY · 404</span><h1>Trang này không có ở đây</h1><p>Đường dẫn có thể đã thay đổi, hoặc nội dung đã được ẩn sau khi hậu kiểm.</p><div className="state-actions"><Link className="button button-primary" href="/">Về trang chủ</Link><Link className="button button-outline" href="/thu-vien">Mở thư viện từ</Link></div></div></main>;
}
