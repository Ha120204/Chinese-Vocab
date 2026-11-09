import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Chính sách riêng tư",
  description: `Thông tin về việc sử dụng Google Analytics 4 trên trang ${siteConfig.name}.`,
  alternates: { canonical: "/rieng-tu" },
};

export default function PrivacyPage() {
  return <main className="info-page site-container"><Link className="back-link" href="/">← Trang chủ</Link><div className="info-header"><span className="kicker">MINH BẠCH DỮ LIỆU</span><h1>Chính sách riêng tư</h1><p>Thông tin về dữ liệu được xử lý trên {siteConfig.name}.</p></div><div className="info-content"><section><h2>Google Analytics 4</h2><p>Website sử dụng Google Analytics 4 (GA4) để đo lượt truy cập, số người quay lại và cách các trang được sử dụng. GA4 có thể đặt cookie hoặc dùng mã nhận diện trình duyệt phục vụ đo lường; dữ liệu kỹ thuật được gửi tới Google. Theo tài liệu của Google, GA4 dùng địa chỉ IP khi thu thập để suy ra vị trí gần đúng rồi loại bỏ trước khi ghi vào hệ thống Analytics.</p><p>Chúng tôi gửi các sự kiện học và tìm kiếm ở dạng số lượng hoặc mã từ, không gửi nội dung tiến độ cá nhân, tên hoặc email vào GA4. Bạn có thể quản lý hoặc xóa cookie trong cài đặt trình duyệt.</p></section><section><h2>Dữ liệu học tập</h2><p>Tiến độ cá nhân được lưu trong localStorage của trình duyệt, không đồng bộ lên máy chủ. Bạn có thể xuất tệp JSON để giữ bản sao và nhập trên thiết bị khác. Việc xóa dữ liệu trình duyệt có thể xóa tiến độ nếu bạn chưa xuất bản sao.</p></section><section><h2>Nội dung cộng đồng</h2><p>Giai đoạn hiện tại chưa cho gửi mẹo nhớ, bình luận hoặc câu hỏi. Trước khi mở tính năng cộng đồng, chính sách này sẽ được cập nhật để giải thích cách xử lý nội dung và dữ liệu chống lạm dụng.</p></section><section><h2>Thông tin thêm</h2><p>Đây là dự án cá nhân, phi thương mại. <Link href="/gioi-thieu">Tìm hiểu thêm về dự án</Link>.</p></section></div></main>;
}
