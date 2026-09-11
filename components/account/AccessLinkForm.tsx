'use client';

import { useState } from 'react';
import { brand, type Locale } from '@/lib/brand.config';
import styles from './AccessLinkForm.module.css';

// =============================================================================
// "Check my subscription" — one field that takes either an email or an Entel
// number, and requests the access link.
//
// It deliberately does NOT report whether a subscription exists. Two reasons:
// Tallyman offers no lookup by phone number (its check is keyed on the per-visit
// rockman_id), and answering that question for any stranger who types digits
// would leak who is subscribed. So the reply is the same either way.
//
// The result text is driven by the API's `delivered` flag. While no sender is
// wired, it says nothing was sent and points at support — a form that claimed
// "we've sent your link" without sending one is the kind of feature that only
// pretends to work.
// =============================================================================

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === '1';

const copy = {
  es: {
    label: 'Correo electrónico o número de móvil Entel',
    placeholder: 'tucorreo@ejemplo.com  ·  9XX XXX XXX',
    hint: 'Escribe el correo o el número que usaste al suscribirte.',
    submit: 'Enviarme el enlace de acceso',
    working: 'Enviando…',
    invalid: 'Escribe un correo válido o un número Entel de 9 dígitos que empiece por 9.',
    failed: 'No pudimos procesar la solicitud. Inténtalo de nuevo en unos minutos.',
    sentTitle: 'Solicitud recibida',
    sentBody: (m: string) =>
      `Si hay una suscripción activa asociada a ${m}, recibirás allí el enlace de acceso. Por seguridad no confirmamos si existe una suscripción.`,
    pendingTitle: 'Solicitud recibida',
    pendingBody: (m: string, s: string) =>
      `Todavía no enviamos nada a ${m}: el envío automático del enlace aún no está habilitado. Escríbenos a ${s} y te lo damos nosotros.`,
    demoTitle: 'Vista previa',
    demoBody: (m: string) =>
      `En producción, si hubiera una suscripción activa asociada a ${m}, el enlace de acceso se enviaría allí. Esta es una vista previa: no se envió nada.`,
  },
  en: {
    label: 'Email address or Entel mobile number',
    placeholder: 'you@example.com  ·  9XX XXX XXX',
    hint: 'Use the email or the number you subscribed with.',
    submit: 'Send me the access link',
    working: 'Sending…',
    invalid: 'Enter a valid email, or a 9-digit Entel number starting with 9.',
    failed: 'We could not process the request. Please try again in a few minutes.',
    sentTitle: 'Request received',
    sentBody: (m: string) =>
      `If there is an active subscription for ${m}, the access link is on its way there. For privacy we do not confirm whether a subscription exists.`,
    pendingTitle: 'Request received',
    pendingBody: (m: string, s: string) =>
      `Nothing has been sent to ${m} yet — automatic delivery of the link is not enabled. Email ${s} and we will send it to you.`,
    demoTitle: 'Preview',
    demoBody: (m: string) =>
      `In production, if there were an active subscription for ${m}, the access link would be sent there. This is a preview: nothing was sent.`,
  },
} as const;

type Result = { channel: string; masked: string; delivered: boolean } | null;

export default function AccessLinkForm({ lang }: { lang: Locale }) {
  const t = copy[lang];
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result>(null);

  function mask(raw: string) {
    const d = raw.replace(/\D/g, '');
    return raw.includes('@')
      ? raw.replace(/^(.).*(@.*)$/, (_m, a, b) => `${a}•••${b}`)
      : `${brand.billing.countryCode} •••••${d.slice(-3)}`;
  }

  function valid(raw: string) {
    const d = raw.replace(/\D/g, '').replace(/^51/, '');
    return raw.includes('@')
      ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim())
      : /^9\d{8}$/.test(d);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setResult(null);

    if (!valid(contact)) {
      setError(t.invalid);
      return;
    }

    setLoading(true);
    if (DEMO) {
      setLoading(false);
      setResult({ channel: contact.includes('@') ? 'email' : 'sms', masked: mask(contact), delivered: false });
      return;
    }

    try {
      const res = await fetch('/api/account/access-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error('failed');
      setResult({ channel: data.channel, masked: data.masked, delivered: data.delivered });
    } catch {
      setError(t.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.box}>
      <form onSubmit={onSubmit} noValidate>
        <label className={styles.label} htmlFor="account-contact">
          {t.label}
        </label>
        <input
          id="account-contact"
          className={styles.input}
          inputMode="email"
          autoComplete="email"
          placeholder={t.placeholder}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <p className={styles.hint}>{t.hint}</p>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? t.working : t.submit}
        </button>
      </form>

      {result ? (
        <div className={styles.result} data-tone={result.delivered ? 'ok' : 'pending'}>
          <p className={styles.resultTitle}>
            {DEMO ? t.demoTitle : result.delivered ? t.sentTitle : t.pendingTitle}
          </p>
          <p>
            {DEMO
              ? t.demoBody(result.masked)
              : result.delivered
                ? t.sentBody(result.masked)
                : t.pendingBody(result.masked, brand.support.email)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
