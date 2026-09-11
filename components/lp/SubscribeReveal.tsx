'use client';

import { useRef, useState } from 'react';
import type { Locale } from '@/lib/brand.config';
import { getDictionary } from '@/lib/i18n';
import BillingTerms from '@/components/BillingTerms';
import SubscribeCard from './SubscribeCard';
import styles from './SubscribeReveal.module.css';

// =============================================================================
// The form is hidden until the visitor presses Subscribe, then it opens IN PLACE.
//
// Not a floating dialog: no overlay, no scrolled-locked background, nothing to
// dismiss. The account manager's guidance is to avoid pop-ups, and the live
// Ouisys page uses exactly the overlay pattern that guidance is about. Opening
// in place gets the same behaviour — nothing on screen until you ask for it —
// without the parts a reviewer reads as a pop-up.
//
// It also keeps the Back button honest: no history entry is pushed, so Back
// leaves the page, which is what a visitor expects.
//
// The price disclosure renders on BOTH states, from the same <BillingTerms>, so
// the cost is visible before the form is opened and again once it is.
// =============================================================================

export default function SubscribeReveal({
  lang,
  tracking,
  label,
  tone = 'page',
  live = false,
}: {
  lang: Locale;
  tracking?: Record<string, string>;
  label?: string;
  tone?: 'page' | 'art';
  /** Server-resolved: is carrier billing configured? See SubscribeCard. */
  live?: boolean;
}) {
  const t = getDictionary(lang);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  function reveal() {
    setOpen(true);
    // Move focus to the number field so keyboard and screen-reader users land
    // where the sighted user is already looking. No scrolling — the panel opens
    // where the button was.
    window.requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLInputElement>('#phone-input')?.focus();
    });
  }

  if (!open) {
    return (
      <div className={styles.wrap} data-tone={tone}>
        <button type="button" className={styles.trigger} onClick={reveal}>
          {label ?? t.nav.subscribe}
        </button>
        <BillingTerms lang={lang} tone={tone} />
      </div>
    );
  }

  return (
    <div className={styles.wrap} data-tone={tone} ref={formRef}>
      <SubscribeCard lang={lang} tracking={tracking} live={live} />
      <button type="button" className={styles.close} onClick={() => setOpen(false)}>
        {lang === 'es' ? 'Cerrar' : 'Close'}
      </button>
    </div>
  );
}
