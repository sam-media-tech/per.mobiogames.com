import { brand, priceLine, type Locale } from '@/lib/brand.config';
import { getDictionary } from '@/lib/i18n';
import styles from './BillingTerms.module.css';

// =============================================================================
// The price disclosure: amount, billing frequency, auto-renewal, and BOTH
// cancellation methods, in one block.
//
// It lives in its own component so that every way of starting a subscription —
// the link on portfolio pages and the reveal trigger on the landing page — shows
// the identical text from the identical source. Nobody can build a third kind of
// CTA that quietly omits it.
// =============================================================================

export default function BillingTerms({
  lang,
  tone = 'page',
  compact = false,
}: {
  lang: Locale;
  /** 'art' = sitting on hero artwork, so the text inverts to white. */
  tone?: 'page' | 'art';
  /** One line. Only where the billing entity is already stated above the fold.
   *  Compact OMITS the carrier sentence rather than hiding it with CSS — text
   *  that is rendered and then set to display:none is read by a compliance scan
   *  (and by Google) as concealed disclosure, which is a worse finding than the
   *  duplication it was avoiding. */
  compact?: boolean;
}) {
  const t = getDictionary(lang);
  const { sms, email } = brand.cancellation;

  return (
    <p
      className={styles.terms}
      data-tone={tone}
      data-compact={compact ? 'true' : undefined}
    >
      <strong className={styles.price}>{priceLine(lang)}</strong>
      <span className={styles.sep} aria-hidden="true">
        ·
      </span>
      {t.billing.renews}
      <span className={styles.sep} aria-hidden="true">
        ·
      </span>
      {t.billing.cancel}{' '}
      <a className={styles.mail} href={`mailto:${email}`}>
        {email}
      </a>
      {compact ? null : (
        <span className={styles.carrier}>
          {t.billing.charged} {brand.entity.billedBy} · SMS: {sms.keyword} → {sms.shortcode}.
        </span>
      )}
    </p>
  );
}
