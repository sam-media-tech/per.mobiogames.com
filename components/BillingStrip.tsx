import { brand, priceLine, type Locale } from '@/lib/brand.config';
import { getDictionary } from '@/lib/i18n';
import styles from './BillingStrip.module.css';

// Sits under the header on EVERY page: the cost is visible before the visitor
// reaches any CTA, and without scrolling.
//
// On a phone it shortens to price + renewal + the SMS cancellation keyword.
// The email address and the billing entity drop out there because both appear
// again next to the subscribe button and in the footer — repeating the whole
// paragraph three times on one small screen buries the price rather than
// disclosing it, which defeats the point of the strip.

export default function BillingStrip({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const { sms, email } = brand.cancellation;

  return (
    <div className={styles.strip} lang={lang}>
      <p className={styles.inner}>
        <strong className={styles.price}>{priceLine(lang)}</strong>

        <span className={styles.item}>{t.billing.renews}</span>

        <span className={styles.item}>
          {t.billing.cancelShort} <strong>{sms.keyword}</strong> → <strong>{sms.shortcode}</strong>
        </span>

        <span className={styles.wide}>
          {t.billing.orEmail}{' '}
          <a href={`mailto:${email}`} className={styles.link}>
            {email}
          </a>
        </span>

        <span className={styles.wide}>
          {t.billing.charged} {brand.entity.billedBy}
        </span>
      </p>
    </div>
  );
}
