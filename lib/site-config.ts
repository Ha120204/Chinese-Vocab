export const siteConfig = {
  name: 'Học Hán Mỗi Ngày',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trongphong0110.id.vn',
  description: 'Học từ vựng HSK 3.0 mỗi ngày: bài học cá nhân, flashcard, quiz và ôn tập đúng lúc.',
  curriculum: 'HSK 3.0',
  navigation: [
    {label:'Trang chủ',href:'/'}, {label:'Bài học',href:'/hoc'}, {label:'Thư viện',href:'/thu-vien'}, {label:'Tiến độ',href:'/tien-do'},
  ],
  footer: {
    note:'Dự án cá nhân, phi thương mại dành cho cộng đồng người Việt học tiếng Trung.',
    links:[{label:'Giới thiệu',href:'/gioi-thieu'},{label:'Chính sách riêng tư',href:'/rieng-tu'}],
    legalLine:'HSK 3.0 · HSK1: 300 mục · HSK2 sắp có',
  },
} as const;
