import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Be_Vietnam_Pro } from 'next/font/google';
import localFont from 'next/font/local';
import { siteConfig } from '@/lib/site-config';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { MobileNav } from '@/components/mobile-nav';
import './globals.css';

const beVietnam=Be_Vietnam_Pro({weight:['400','500','600','700','800'],subsets:['latin','vietnamese'],display:'swap',variable:'--font-be-vietnam'});
const notoSerif=localFont({src:[{path:'../public/fonts/noto-serif-sc-0.woff2',weight:'600'},{path:'../public/fonts/noto-serif-sc-1.woff2',weight:'700'}],display:'swap',variable:'--font-hanzi-subset',preload:false});
export const metadata: Metadata = {
  metadataBase:new URL(siteConfig.url), title:{default:siteConfig.name,template:`%s | ${siteConfig.name}`},
  description:siteConfig.description,applicationName:siteConfig.name,
  openGraph:{type:'website',locale:'vi_VN',siteName:siteConfig.name,title:siteConfig.name,description:siteConfig.description,url:siteConfig.url},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){const gaId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;return <html lang="vi"><body className={`${beVietnam.variable} ${notoSerif.variable}`}><SiteHeader/>{children}<SiteFooter/><MobileNav/>{gaId&&<GoogleAnalytics gaId={gaId}/>}</body></html>}
