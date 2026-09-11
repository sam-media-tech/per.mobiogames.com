import Link from 'next/link';
import LegalLink from '@/components/LegalLink';
import { brand, priceLine, type Locale } from '@/lib/brand.config';
import { getDictionary, href } from '@/lib/i18n';
import styles from './SiteFooter.module.css';

// Full legal presence in one place: operating entity, registration number,
// registered address, promoter, support channel, BOTH cancellation methods,
// and every legal document as a real crawlable URL (never a modal).

export default function SiteFooter({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const L = t.footer.links;
  const { sms, email } = brand.cancellation;
  const year = 2026;

  const explore = [
    { label: L.home, to: href(lang, 'home') },
    { label: L.games, to: href(lang, 'games') },
    { label: L.videos, to: href(lang, 'videos') },
    { label: L.pricing, to: href(lang, 'pricing') },
    { label: L.about, to: href(lang, 'about') },
  ];

  const help = [
    { label: L.contact, to: href(lang, 'contact') },
    { label: L.signin, to: href(lang, 'signin') },
    { label: L.carrierBilling, to: href(lang, 'carrierBilling') },
    { label: L.unsubscribeRefund, to: href(lang, 'unsubscribeRefund') },
  ];

  const legal = [
    { label: L.terms, to: href(lang, 'terms') },
    { label: L.privacy, to: href(lang, 'privacy') },
    { label: L.cookies, to: href(lang, 'cookies') },
  ];

  return (
    <footer className={styles.foot} lang={lang}>
      <div className={styles.top}>
        <div className={styles.about}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logo} alt={brand.name} width={196} height={20} className={styles.logo} />
          <p className={styles.tagline}>{t.footer.tagline}</p>
          <p className={styles.priceNote}>{priceLine(lang)}</p>
        </div>

        <nav className={styles.col} aria-label={t.footer.explore}>
          <h2 className={styles.colTitle}>{t.footer.explore}</h2>
          <ul>
            {explore.map((l) => (
              <li key={l.to}>
                <Link href={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.col} aria-label={t.footer.help}>
          <h2 className={styles.colTitle}>{t.footer.help}</h2>
          <ul>
            {help.map((l) => (
              <li key={l.to}>
                <Link href={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.col} aria-label={t.footer.legal}>
          <h2 className={styles.colTitle}>{t.footer.legal}</h2>
          <ul>
            {legal.map((l) => (
              <li key={l.to}>
                <LegalLink href={l.to} lang={lang}>
                  {l.label}
                </LegalLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.legalBlock}>
        <p className={styles.entity}>
          {t.footer.partOf(brand.platform.domain, brand.officialDomain)}
        </p>

        <p className={styles.entity}>{brand.entity.statement[lang]}</p>

        <p className={styles.channels}>
          <span>
            {lang === 'es' ? 'Atención al cliente' : 'Customer support'}:{' '}
            <a href={`mailto:${email}`}>{email}</a>
          </span>
          <span>
            {lang === 'es' ? 'Cancelación' : 'Cancellation'}: {lang === 'es' ? 'envía' : 'text'}{' '}
            <strong>{sms.keyword}</strong> {lang === 'es' ? 'al' : 'to'}{' '}
            <strong>{sms.shortcode}</strong>{' '}
            {lang === 'es' ? 'o escribe a' : 'or email'} <a href={`mailto:${email}`}>{email}</a>
          </span>
        </p>

        <p className={styles.copy}>
          © {year} {brand.name}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
