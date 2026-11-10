import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Giới thiệu dự án",
  description: `Tìm hiểu về dự án cá nhân, phi thương mại ${siteConfig.name} và lộ trình nội dung HSK 3.0.`,
  alternates: { canonical: "/gioi-thieu" },
};

export default function AboutPage() {
  return <main className="info-page site-container"><Link className="back-link" href="/">← Trang chủ</Link><div className="info-header"><span className="kicker">VỀ DỰ ÁN</span><h1>{siteConfig.name}</h1><p>Một dự án học tập cá nhân, phi thương mại dành cho cộng đồng người Việt học từ vựng tiếng Trung.</p></div><div className="info-content"><section><h2>Vì sao có website này?</h2><p>Chúng tôi muốn tạo một nơi học từ vựng có nhịp độ vừa sức: mỗi ngày một ít từ mới, có cơ hội ôn lại và chia sẻ cách nhớ chữ với người học khác. Bài học và thư viện đã mở 60 mục HSK1 đầu tiên.</p></section><section><h2>Lộ trình HSK 3.0</h2><p>HSK1 có 300 mục theo đề cương HSK 2025. Chúng tôi đã biên soạn và duyệt 60 mục đầu cho sáu ngày học; HSK2 sẽ bổ sung sau. Nghĩa tiếng Việt và câu ví dụ do dự án tự viết. Chỉ nội dung đã duyệt mới hiển thị công khai.</p><p><a href="https://www.chinesetest.cn/hsk" target="_blank" rel="noreferrer">Nguồn đối chiếu: đề cương HSK chính thức</a>.</p></section><section><h2>Cách học</h2><p>Trên mỗi thiết bị, bạn gặp tối đa 10 từ mới tiếp theo mỗi ngày theo giờ Việt Nam. Từ chưa học vẫn chờ ở lần sau. Từ đến hạn ôn được tách riêng, cùng với một “Từ của ngày” chung cho mọi người.</p></section><section><h2>Quyền riêng tư</h2><p>Website không bán khóa học, không có quảng cáo và không yêu cầu tài khoản. Bạn có thể đọc thêm trên <Link href="/rieng-tu">trang Chính sách riêng tư</Link>.</p></section></div></main>;
}
