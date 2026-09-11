import type { Locale } from '@/lib/brand.config';
import styles from './LegalLink.module.css';

// =============================================================================
// The only way to link to Terms, Privacy or Cookies.
//
// A legal link that navigates the visitor AWAY from the subscription page loses
// the consent context they were in, and the checklist treats that as a critical
// failure unless a warning is shown first. Opening in a new tab is the cleaner
// answer: the form stays exactly as they left it.
//
// target/rel are hard-coded here rather than passed in, so no caller can forget
// them. A bare <a href="/es/terms/"> is a bug — use this instead.
// =============================================================================

export default function LegalLink({
  href,
  lang,
  className,
  children,
}: {
  href: string;
  lang: Locale;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span className={styles.hint}>
        {lang === 'es' ? ' (se abre en una pestaña nueva)' : ' (opens in a new tab)'}
      </span>
    </a>
  );
}
