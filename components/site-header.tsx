import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export function SiteHeader(){return <header className="site-header"><div className="site-container header-inner">
  <Link className="brand" href="/" aria-label={`${siteConfig.name} - Trang chủ`}><span className="brand-mark" aria-hidden="true">学</span><span className="brand-copy"><strong>{siteConfig.name}</strong><small>Học một chút, nhớ thật lâu</small></span></Link>
  <nav className="desktop-nav" aria-label="Điều hướng chính">{siteConfig.navigation.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
  <span className="header-badge">HSK 3.0</span>
  </div></header>}
