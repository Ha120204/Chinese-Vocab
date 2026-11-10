# Sổ tay Chữ Hán

Website cá nhân, phi thương mại để học từ vựng tiếng Trung theo **HSK 3.0**, dựa trên đề cương thi công bố tháng 11/2025. HSK1 có **300 mục**; 120 mục đầu đã được biên soạn và duyệt theo thứ tự học đề xuất, đủ 12 ngày. HSK2 sẽ bổ sung sau.

## Chạy và kiểm tra

Yêu cầu Node.js 22. Sao chép `.env.example` sang `.env.local`, rồi chạy:

```sh
npm install
npm run dev
npm run typecheck
npm run build
npm run vocab:review
npm run test:date
npm run test:flow
npm run check:m3:ui
```

`test:flow` cần Playwright Chromium và server dev đang chạy ở `http://localhost:3000`. Bài kiểm tra chạy cả viewport 390px và 1440px: tìm kiếm, học 10 thẻ, quiz hai kiểu, chuyển ngày Việt Nam, xuất/nhập tiến độ. Ảnh QA lưu tại `review/m1b-home-*.png` và không đưa vào Git.

## Nội dung và duyệt

- Nguồn đối chiếu **danh sách và số thứ tự**: [新版HSK考试大纲, HSK（一级）词汇](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf), được liên kết từ [ChineseTest](https://www.chinesetest.cn/hsk). Bản chuyển đổi JSON chỉ dùng để kiểm tra `syllabusNo` và pinyin; nghĩa tiếng Việt, ví dụ Hán, pinyin ví dụ và bản dịch được biên soạn cho dự án này.
- `data/vocab/hsk1-batch1.json`: 60 mục đã được người phụ trách đối chiếu và đặt `reviewed: true`.
- `data/vocab/hsk1-batch2.json`: 60 mục tiếp theo theo thứ tự học 61–120, đã đối chiếu và đặt `reviewed: true`; bản CSV ở `review/hsk1-batch2.csv`.
- `review/hsk1-batch1.csv`: bản gửi người duyệt, gồm Hán, pinyin, nghĩa Việt, ví dụ Hán, pinyin và bản dịch.
- `npm run vocab:review`: kiểm tra mục thiếu/trùng `syllabusNo`, thiếu nội dung và liệt kê mục chưa duyệt.
- `npm run vocab:schedule`: sinh lịch Từ của ngày từ **các mục đã duyệt**. Có thể truyền số ngày và thứ tự học bắt đầu: `npm run vocab:schedule -- 60 61`. Nếu ngày hiện tại chưa có trong lịch, website chọn một mục đã duyệt theo ngày Việt Nam một cách xác định.
- Khi sửa đợt 1, cập nhật `scripts/seed-vocab.mjs` rồi chạy `npm run vocab:seed`. Với đợt 2, cập nhật `scripts/seed-vocab-batch2.mjs` rồi chạy `npm run vocab:seed:batch2`. Mỗi lệnh seed ghi đè JSON và CSV tương ứng; sau đó chạy `npm run vocab:review`. Chỉ sinh lại lịch khi có thay đổi ở mục đã duyệt.

Production chỉ hiển thị mục `reviewed: true`. Môi trường dev xem được bản nháp. Cờ `VOCAB_SHOW_UNREVIEWED=true` chỉ dành cho bản xem thử nội dung chưa duyệt, cần redeploy để có hiệu lực. Với 120 mục hiện tại, cờ này không cần bật.

## Tiến độ học

Mỗi trình duyệt được học tối đa 10 từ **mới** mỗi ngày theo `Asia/Ho_Chi_Minh`, lấy từ chưa học theo `order` cố định. Từ đến hạn ôn Leitner nằm ngoài giới hạn này. Tiến độ lưu trong `localStorage`; trang Tiến độ có xuất và nhập JSON. Không có đăng nhập hoặc máy chủ lưu tiến độ.

## Cấu hình

- `NEXT_PUBLIC_SITE_URL`: URL chính thức, mặc định `https://trongphong0110.id.vn`.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: GA4 Measurement ID.
- `VOCAB_SHOW_UNREVIEWED`: cờ xem thử bản nháp ở production, mặc định `false`.
- Tên site, điều hướng và footer: `lib/site-config.ts`.
- Font Be Vietnam Pro và Noto Serif SC dùng giấy phép SIL OFL; xem `licenses/`.

## Ảnh chia sẻ và PWA

Các trang chủ, Thư viện từ, Hỏi đáp và từng trang từ có ảnh OG riêng. Ảnh từ dùng chữ Hán, pinyin và nghĩa Việt. Font OG là bản TTF rút gọn tại `assets/og-fonts/`; mỗi khi thêm hoặc sửa đợt từ, chạy `npm run og:fonts` để tạo lại font và kiểm tra đủ glyph. Script cần mạng để tải font từ Google Fonts. Font giao diện vẫn dùng WOFF2 riêng.

Manifest tại `/manifest.webmanifest` dùng logo 192/512px và apple-icon; trang chạy HTTPS để có thể thêm vào màn hình chính. `npm run check:m3:ui` kiểm tra viewport 390/1440px, vùng chạm, 404, OG metadata, phím tắt bài học và điều kiện cài PWA qua Chrome. Chạy Lighthouse mobile cho `/`, `/hoc` và `/tu/hsk1-147` bằng `npx lighthouse <URL> --only-categories=performance,accessibility,seo --output=json --output=html --output-path=reports/lighthouse/<tên> --chrome-flags="--headless --no-sandbox"`. Báo cáo lưu tại `reports/lighthouse/` và không đưa vào Git.

## Cộng đồng M2

1. Chạy `supabase/migrations/20261110_community.sql` trong Supabase SQL Editor.
2. Chạy `supabase/tests/rls.sql` trong SQL Editor. File này kiểm tra quyền anon, trạng thái `published` và rollback dữ liệu thử.
3. Trong Supabase **API Settings → Exposed schemas**, chỉ giữ `public` (không thêm `private`). RPC nằm ở `public` nhưng chỉ `service_role` được gọi; các bảng `private.*` không có quyền truy cập trực tiếp.
4. Cấu hình `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `BROWSER_HMAC_SECRET`, `IP_HMAC_SECRET`, `CRON_SECRET`. Hai HMAC secret nên là chuỗi ngẫu nhiên độc lập, ít nhất 32 ký tự. Không đưa secret vào biến `NEXT_PUBLIC_`.
5. Chạy `npm run check:m2` khi migration đã hoàn tất. Cron Vercel gọi `/api/health` mỗi ngày với `Authorization: Bearer <CRON_SECRET>` để truy vấn DB và dọn rate bucket hết hạn.

Để hậu kiểm, mở **Supabase Table Editor**, chọn schema **private**, rồi xem bảng `reports` mới nhất. Mỗi hàng có `content_type` và `content_id`; tìm hàng tương ứng trong schema **public** (`tips`, `word_comments`, `questions`, `answers`). Nếu vi phạm, đổi cột `status` của nội dung đó từ `published` sang `hidden` và lưu. RLS sẽ ngừng hiển thị bài; câu trả lời của câu hỏi bị ẩn cũng không còn hiển thị. Báo cáo chỉ lưu vào bảng `private.reports`, không gửi email.

Nội dung mới hiển thị ngay và được hậu kiểm. Không có đăng nhập hoặc trang admin. Anon chỉ được đọc các hàng `published`; mọi thao tác ghi đi qua Route Handler với zod, honeypot, HMAC và giới hạn lượt gửi bằng RPC nguyên tử.
