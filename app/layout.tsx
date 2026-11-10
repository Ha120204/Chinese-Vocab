import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { siteConfig } from '@/lib/site-config';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileNav } from '@/components/mobile-nav';
import { AnalyticsLoader } from '@/components/analytics-loader';
import './fonts-vietnam.css';
import './globals.css';

const notoSerif=localFont({src:[{path:'../public/fonts/noto-serif-sc-0.woff2',weight:'600'},{path:'../public/fonts/noto-serif-sc-1.woff2',weight:'700'}],display:'swap',variable:'--font-hanzi-subset',preload:false});
export const metadata: Metadata = {
  metadataBase:new URL(siteConfig.url), title:{default:siteConfig.name,template:`%s | ${siteConfig.name}`},
  description:siteConfig.description,applicationName:siteConfig.name,
  openGraph:{type:'website',locale:'vi_VN',siteName:siteConfig.name,title:siteConfig.name,description:siteConfig.description,url:siteConfig.url,images:[{url:'/opengraph-image',width:1200,height:630,alt:siteConfig.name}]},
  twitter:{card:'summary_large_image',title:siteConfig.name,description:siteConfig.description,images:['/opengraph-image']},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){const gaId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;return <html lang="vi"><body className={notoSerif.variable}><SiteHeader/>{children}<SiteFooter/><MobileNav/>{gaId&&<AnalyticsLoader gaId={gaId}/>}</body></html>}
