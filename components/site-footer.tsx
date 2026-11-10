import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { BrandMark } from '@/components/brand-mark';

export function SiteFooter(){return <footer className="site-footer"><div className="site-container footer-main"><div><Link className="brand" href="/"><BrandMark/><span className="brand-copy"><strong>{siteConfig.name}</strong><small>{siteConfig.curriculum}</small></span></Link><p>{siteConfig.footer.note}</p></div><nav aria-label="Thông tin dự án"><strong>Thông tin</strong>{siteConfig.footer.links.map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}</nav></div><div className="site-container footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}</span><span>{siteConfig.footer.legalLine}</span></div></footer>}
