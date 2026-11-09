# Học Hán Mỗi Ngày

Website cá nhân, phi thương mại để học từ vựng tiếng Trung theo **HSK 3.0**, dựa trên đề cương thi công bố tháng 11/2025. HSK1 có **300 mục**; bản M1b biên soạn 60 mục đầu theo thứ tự học đề xuất, đủ sáu ngày. HSK2 sẽ bổ sung sau.

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
```

`test:flow` cần Playwright Chromium và server dev đang chạy ở `http://localhost:3000`. Bài kiểm tra chạy cả viewport 390px và 1440px: tìm kiếm, học 10 thẻ, quiz hai kiểu, chuyển ngày Việt Nam, xuất/nhập tiến độ. Ảnh QA lưu tại `review/m1b-home-*.png` và không đưa vào Git.

## Nội dung và duyệt

- Nguồn đối chiếu **danh sách và số thứ tự**: [新版HSK考试大纲, HSK（一级）词汇](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf), được liên kết từ [ChineseTest](https://www.chinesetest.cn/hsk). Bản chuyển đổi JSON chỉ dùng để kiểm tra `syllabusNo` và pinyin; nghĩa tiếng Việt, ví dụ Hán, pinyin ví dụ và bản dịch được biên soạn cho dự án này.
- `data/vocab/hsk1-batch1.json`: 60 mục, tất cả khởi tạo `reviewed: false`.
- `review/hsk1-batch1.csv`: bản gửi người duyệt, gồm Hán, pinyin, nghĩa Việt, ví dụ Hán, pinyin và bản dịch.
- `npm run vocab:review`: kiểm tra mục thiếu/trùng `syllabusNo`, thiếu nội dung và liệt kê mục chưa duyệt.
- `npm run vocab:schedule`: sinh lịch Từ của ngày 90 ngày từ **các mục đã duyệt**. Có thể truyền số ngày: `npm run vocab:schedule -- 120`. Nếu ngày hiện tại chưa có trong lịch, website chọn một mục đã duyệt theo ngày Việt Nam một cách xác định.
- Sau khi người duyệt trả CSV, cập nhật nội dung JSON và chỉ đặt `reviewed: true` cho các dòng được duyệt; chạy lại lệnh kiểm tra và sinh lịch. Không chạy `vocab:seed` sau khi duyệt vì lệnh này tái tạo bản nháp ban đầu.

Production chỉ hiển thị mục `reviewed: true`. Môi trường dev xem được bản nháp. Để mở bản xem thử production trong thời gian duyệt, đặt `VOCAB_SHOW_UNREVIEWED=true` ở server và redeploy; các mục bản nháp có nhãn “Nội dung đang rà soát” và trang chi tiết đặt `noindex`. Tắt cờ sau khi duyệt.

## Tiến độ học

Mỗi trình duyệt được học tối đa 10 từ **mới** mỗi ngày theo `Asia/Ho_Chi_Minh`, lấy từ chưa học theo `order` cố định. Từ đến hạn ôn Leitner nằm ngoài giới hạn này. Tiến độ lưu trong `localStorage`; trang Tiến độ có xuất và nhập JSON. Không có đăng nhập hoặc máy chủ lưu tiến độ.

## Cấu hình

- `NEXT_PUBLIC_SITE_URL`: URL chính thức, mặc định `https://trongphong0110.id.vn`.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: GA4 Measurement ID.
- `VOCAB_SHOW_UNREVIEWED`: cờ xem thử bản nháp ở production, mặc định `false`.
- Tên site, điều hướng và footer: `lib/site-config.ts`.
- Font Be Vietnam Pro và Noto Serif SC dùng giấy phép SIL OFL; xem `licenses/`.

Phần mẹo nhớ/bình luận hiện là giao diện tĩnh. Supabase và tương tác cộng đồng thuộc M2.
