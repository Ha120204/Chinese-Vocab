export type FooterLink = { label: string; href: string; external?: boolean };
export type FooterContact = { kind: 'email' | 'zalo' | 'facebook' | 'phone'; label: string; value: string; href?: string; external?: boolean };
export type FooterConfig = {
  brand: { homeHref: string; description: string };
  explore: { title: string; links: readonly FooterLink[] };
  contact: { title: string; items: readonly FooterContact[] };
  info: { title: string; links: readonly FooterLink[] };
  bottom: { leftNote: string; right: string };
};

export const siteConfig = {
  name: 'Sổ tay Chữ Hán',
  shortName: 'Sổ tay Hán',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trongphong0110.id.vn',
  description: 'Học từ vựng HSK 3.0 mỗi ngày: bài học cá nhân, flashcard, quiz và ôn tập đúng lúc.',
  curriculum: 'HSK 3.0',
  navigation: [
    {label:'Trang chủ',href:'/'}, {label:'Bài học',href:'/hoc'}, {label:'Thư viện',href:'/thu-vien'}, {label:'Hỏi đáp',href:'/hoi-dap'}, {label:'Tiến độ',href:'/tien-do'},
  ],
  footer: {
    brand: {
      homeHref: '/',
      description: 'Dự án cá nhân, phi thương mại dành cho cộng đồng người Việt học tiếng Trung.',
    },
    explore: {
      title: 'Khám phá',
      links: [
        { label: 'Học hôm nay', href: '/hoc' },
        { label: 'Từ của ngày', href: '/#tu-cua-ngay' },
        { label: 'Thư viện từ', href: '/thu-vien' },
        { label: 'Tiến độ', href: '/tien-do' },
        { label: 'Hỏi đáp', href: '/hoi-dap' },
      ],
    },
    contact: {
      title: 'Liên hệ',
      items: [
        { kind: 'email', label: 'Email', value: 'phogengr8@gmail.com', href: 'mailto:phogengr8@gmail.com' },
        { kind: 'zalo', label: 'Zalo', value: 'Hạ Trọng Phong' },
        { kind: 'facebook', label: 'Fanpage', value: 'Hạ Trọng Phong', href: 'https://www.facebook.com/ha.trong.phong.2004', external: true },
        { kind: 'phone', label: 'Hotline', value: '0888887236', href: 'tel:0888887236' },
      ],
    },
    info: {
      title: 'Thông tin',
      links: [
        { label: 'Giới thiệu', href: '/gioi-thieu' },
        { label: 'Quy định cộng đồng', href: '/quy-dinh' },
        { label: 'Chính sách riêng tư', href: '/rieng-tu' },
        { label: 'Đề cương HSK 3.0', href: 'https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf', external: true },
      ],
    },
    bottom: {
      leftNote: 'Dự án cá nhân, phi thương mại',
      right: 'HSK 3.0 · HSK1: 300 mục · HSK2: 200 mục · Số liệu truy cập đo bằng Google Analytics',
    },
  } satisfies FooterConfig,
} as const;
