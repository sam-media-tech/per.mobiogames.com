import Link from 'next/link';
import type { Locale } from '@/lib/brand.config';
import { getDictionary, lpHref } from '@/lib/i18n';
import BillingTerms from './BillingTerms';
import styles from './SubscribeCta.module.css';

// =============================================================================
// SubscribeCta — the CTA and its price disclosure are ONE component on purpose.
//
// Google's most common finding against carrier-billing pages is a call-to-action
// with the price somewhere else (or in small print further down). Because there is
// no way to render this button without also rendering the price, the billing
// frequency, the auto-renewal and both cancellation methods, that failure mode is
// structurally impossible rather than a thing someone has to remember.
// =============================================================================

export default function SubscribeCta({
  lang,
  label,
  variant = 'solid',
  align = 'start',
  tone = 'page',
  compact = false,
  secondary,
}: {
  lang: Locale;
  label?: string;
  /** Rendered beside the primary button, inside this component, so the price
   *  disclosure below stays attached to BOTH actions. */
  secondary?: React.ReactNode;
  variant?: 'solid' | 'outline';
  align?: 'start' | 'center';
  /** 'art' = sitting on top of hero artwork, so the disclosure inverts to white. */
  tone?: 'page' | 'art';
  /** One-line disclosure. Only for surfaces where the billing entity is already
   *  stated above the fold (the BillingStrip) — the price, the frequency, the
   *  renewal and both cancellation methods are still rendered here, always. */
  compact?: boolean;
}) {
  const t = getDictionary(lang);

  return (
    <div className={styles.wrap} data-align={align} data-tone={tone} data-compact={compact ? 'true' : undefined}>
      <div className={styles.row}>
        <Link
          href={lpHref(lang)}
          className={styles.button}
          data-variant={variant}
          prefetch={false}
        >
          {label ?? t.nav.subscribe}
        </Link>
        {secondary}
      </div>

      <BillingTerms lang={lang} tone={tone} compact={compact} />
    </div>
  );
}
