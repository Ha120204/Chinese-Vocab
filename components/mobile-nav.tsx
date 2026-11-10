'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/site-config';

export function MobileNav(){const path=usePathname();return <nav className="mobile-nav" aria-label="Điều hướng di động">{siteConfig.navigation.map((item,i)=><Link key={item.href} href={item.href} aria-current={path===item.href?'page':undefined}><span aria-hidden="true">{['⌂','▣','▦','?','◉'][i]}</span><small>{item.label}</small></Link>)}</nav>}
