import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import localFont from 'next/font/local';
import { siteConfig } from '@/lib/site-config';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileNav } from '@/components/mobile-nav';
import './fonts-vietnam.css';
import './globals.css';

const notoSerif=localFont({src:[{path:'../public/fonts/noto-serif-sc-0.woff2',weight:'600'},{path:'../public/fonts/noto-serif-sc-1.woff2',weight:'700'}],display:'swap',variable:'--font-hanzi-subset',preload:false});
export const metadata: Metadata = {
  metadataBase:new URL(siteConfig.url), title:{default:siteConfig.name,template:`%s | ${siteConfig.name}`},
  description:siteConfig.description,applicationName:siteConfig.name,
  openGraph:{type:'website',locale:'vi_VN',siteName:siteConfig.name,title:siteConfig.name,description:siteConfig.description,url:siteConfig.url},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){const gaId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;return <html lang="vi"><body className={notoSerif.variable}><SiteHeader/>{children}<SiteFooter/><MobileNav/>{gaId&&<GoogleAnalytics gaId={gaId}/>}</body></html>}
