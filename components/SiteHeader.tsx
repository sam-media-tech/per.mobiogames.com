import Link from 'next/link';
import { brand, LOCALES, type Locale } from '@/lib/brand.config';
import { getDictionary, href, lpHref } from '@/lib/i18n';
import styles from './SiteHeader.module.css';

// Server component. The mobile menu is a native <details>, so it works with
// JavaScript disabled and there is no decorative button anywhere — reviewers
// click every control, and every control here does something.

export default function SiteHeader({
  lang,
  langHref,
}: {
  lang: Locale;
  /** Override for the language pill. The landing page passes its own URL so the
   *  switch never navigates away from /xkh55 — the ad destination must not move. */
  langHref?: string;
}) {
  const t = getDictionary(lang);
  const other = LOCALES.find((l) => l !== lang) as Locale;

  const links = [
    { label: t.nav.games, to: href(lang, 'games') },
    { label: t.nav.videos, to: href(lang, 'videos') },
    { label: t.nav.pricing, to: href(lang, 'pricing') },
    { label: t.nav.about, to: href(lang, 'about') },
    { label: t.nav.contact, to: href(lang, 'contact') },
    { label: t.nav.signin, to: href(lang, 'signin') },
  ];

  return (
    <header className={styles.bar} lang={lang}>
      <div className={styles.inner}>
        <Link href={href(lang, 'home')} className={styles.brand} aria-label={brand.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logo} alt={brand.name} width={176} height={18} />
        </Link>

        <nav className={styles.desktopNav} aria-label={t.nav.menu}>
          {links.map((l) => (
            <Link key={l.to} href={l.to} className={styles.navLink}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href={langHref ?? href(other, 'home')} className={styles.lang} hrefLang={other}>
            {other.toUpperCase()}
          </Link>
          <Link href={lpHref(lang)} className={styles.cta} prefetch={false}>
            {t.nav.subscribe}
          </Link>
        </div>

        <details className={styles.mobile}>
          <summary className={styles.burger} aria-label={t.nav.menu}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </summary>
          <nav className={styles.mobileNav} aria-label={t.nav.menu}>
            {links.map((l) => (
              <Link key={l.to} href={l.to} className={styles.mobileLink}>
                {l.label}
              </Link>
            ))}
            <Link href={langHref ?? href(other, 'home')} className={styles.mobileLink} hrefLang={other}>
              {other.toUpperCase()}
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
