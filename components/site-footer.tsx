import Link from 'next/link';
import { siteConfig, type FooterConfig, type FooterContact, type FooterLink } from '@/lib/site-config';
import { BrandMark } from '@/components/brand-mark';

const hasText = (value: string | undefined) => Boolean(value?.trim());

function FooterLinkItem({ item }: { item: FooterLink }) {
  const external = item.external || /^https?:\/\//.test(item.href);
  return external
    ? <a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}</a>
    : <Link href={item.href}>{item.label}</Link>;
}

function ContactIcon({ kind }: { kind: FooterContact['kind'] }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === 'email' && <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>}
    {kind === 'zalo' && <><path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-3.5-.7L4 20l1.2-4.1A8 8 0 1 1 20 11.5Z"/><path d="M9 9h6l-6 6h6"/></>}
    {kind === 'facebook' && <><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M14.5 20v-7h2l.3-2.5h-2.3V9c0-.8.3-1.2 1.3-1.2h1V5.5a13 13 0 0 0-1.7-.1c-2.2 0-3.4 1.3-3.4 3.5v1.6H10V13h1.7v7"/></>}
    {kind === 'phone' && <path d="M7.2 3.5 5 5.8c-.8.8-.9 1.9-.5 3C6.3 14 10 17.7 15.2 19.5c1.1.4 2.2.3 3-.5l2.3-2.2-4.2-3.3-2 1.5a13.2 13.2 0 0 1-5.3-5.3l1.5-2-3.3-4.2Z"/>}
  </svg>;
}

function ContactRow({ item }: { item: FooterContact }) {
  const content = <><span className="footer-contact-icon"><ContactIcon kind={item.kind}/></span><span className="footer-contact-copy">{hasText(item.label) && <small>{item.label}</small>}<span>{item.value}</span></span></>;
  const href = item.href?.trim();
  if (!href) return <div className="footer-contact-row" key={item.kind}>{content}</div>;
  const external = item.external || /^https?:\/\//.test(href);
  return <a className="footer-contact-row" href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{content}</a>;
}

export function SiteFooter({ footer = siteConfig.footer }: { footer?: FooterConfig } = {}) {
  const name = siteConfig.name.trim();
  const subtitle = siteConfig.curriculum.trim();
  const description = footer.brand.description.trim();
  const homeHref = footer.brand.homeHref.trim();
  const exploreLinks = footer.explore.links.filter(item => hasText(item.label) && hasText(item.href));
  const contactItems = footer.contact.items.filter(item => hasText(item.value));
  const infoLinks = footer.info.links.filter(item => hasText(item.label) && hasText(item.href));
  const showBrand = Boolean(name || subtitle || description);
  const leftNote = footer.bottom.leftNote.trim();
  const rightNote = footer.bottom.right.trim();

  return <footer className="site-footer">
    {(showBrand || exploreLinks.length > 0 || contactItems.length > 0 || infoLinks.length > 0) && <div className="site-container footer-main">
      {showBrand && <div className="footer-column footer-brand">
        {name && (homeHref
          ? <Link className="brand footer-brand-link" href={homeHref}><BrandMark/><span className="brand-copy"><strong>{name}</strong>{subtitle && <small>{subtitle}</small>}</span></Link>
          : <div className="brand footer-brand-link"><BrandMark/><span className="brand-copy"><strong>{name}</strong>{subtitle && <small>{subtitle}</small>}</span></div>)}
        {!name && subtitle && <span className="footer-brand-subtitle">{subtitle}</span>}
        {description && <p className="footer-brand-description">{description}</p>}
      </div>}
      {exploreLinks.length > 0 && <nav className="footer-column footer-explore" aria-label={hasText(footer.explore.title) ? footer.explore.title : undefined}>
        {hasText(footer.explore.title) && <h2>{footer.explore.title}</h2>}
        <div className="footer-link-list">{exploreLinks.map(item => <FooterLinkItem key={`${item.href}:${item.label}`} item={item}/>)}</div>
      </nav>}
      {contactItems.length > 0 && <section className="footer-column footer-contact" aria-label={hasText(footer.contact.title) ? footer.contact.title : undefined}>
        {hasText(footer.contact.title) && <h2>{footer.contact.title}</h2>}
        <div className="footer-contact-list">{contactItems.map(item => <ContactRow key={`${item.kind}:${item.value}`} item={item}/>)}</div>
      </section>}
      {infoLinks.length > 0 && <nav className="footer-column footer-info" aria-label={hasText(footer.info.title) ? footer.info.title : undefined}>
        {hasText(footer.info.title) && <h2>{footer.info.title}</h2>}
        <div className="footer-link-list">{infoLinks.map(item => <FooterLinkItem key={`${item.href}:${item.label}`} item={item}/>)}</div>
      </nav>}
    </div>}
    {(name || leftNote || rightNote) && <div className="footer-bottom-wrap"><div className="site-container footer-bottom">
      {(name || leftNote) && <span>© {new Date().getFullYear()} {name}{name && leftNote ? ' · ' : ''}{leftNote}</span>}
      {rightNote && <span>{rightNote}</span>}
    </div></div>}
  </footer>;
}
