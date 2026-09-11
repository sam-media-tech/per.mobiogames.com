'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LegalLink from '@/components/LegalLink';
import BillingTerms from '@/components/BillingTerms';
import { brand, priceLine, type Locale } from '@/lib/brand.config';
import { href } from '@/lib/i18n';
import { initEvina, getAntifraudToken, trackEvent } from '@/lib/clientIntegrations';
import styles from './SubscribeCard.module.css';

// =============================================================================
// The subscription form, INLINE on the page — not a modal.
//
// The live Ouisys page opens this in a pop-up dialog; the Google account manager's
// guidance is explicitly to avoid pop-ups, so the form sits in the page flow.
// Steps are component state, never history entries, so the browser Back button
// keeps doing what the visitor expects at every point.
//
// Both consent checkboxes start UNTICKED and the submit button stays disabled
// until they are ticked — pre-ticked consent is a documented suspension trigger.
// =============================================================================

const copy = {
  es: {
    needNine: 'Los números Entel empiezan por 9.',
    needMore: (n: number) => `Falta${n === 1 ? '' : 'n'} ${n} dígito${n === 1 ? '' : 's'}.`,
    blockNumber: 'Escribe un número móvil Entel válido.',
    blockPrice: 'Marca la casilla del precio y la renovación.',
    blockAge: 'Marca la casilla de edad y condiciones.',
    blockIntro: 'Para continuar:',
    title: 'Activa tu suscripción',
    step1: 'Ingresa tu número de móvil',
    step2: 'Ingresa el código PIN para verificar tu número',
    phoneLabel: 'Número de móvil Entel',
    phonePlaceholder: '9XX XXX XXX',
    continue: 'Afiliarme',
    pinLabel: 'Escribe el PIN que recibiste por SMS',
    pinPlaceholder: 'PIN',
    confirm: 'Confirmar',
    consentPrice: (p: string) =>
      `Acepto suscribirme a ${brand.name} y que mi suscripción se renueve automáticamente (${p}) hasta que la cancele enviando ${brand.cancellation.sms.keyword} al ${brand.cancellation.sms.shortcode}.`,
    consentAge: 'Confirmo que tengo 18 años o más y acepto los',
    terms: 'Términos y condiciones',
    and: 'y la',
    privacy: 'Política de privacidad',
    retry: (p: string) => `Si ${p} no es tu número, toca aquí para volver a empezar.`,
    error: 'No pudimos completar el paso. Revisa los datos e inténtalo de nuevo.',
    doneTitle: '¡Listo!',
    doneBody: 'Tu suscripción quedó activa. Ya puedes entrar al catálogo.',
    // Shown when carrier billing is NOT configured. It must never say a
    // subscription was created, because none was.
    notLiveTitle: 'No se creó ninguna suscripción',
    notLiveBody:
      'Esta versión del formulario todavía no está conectada al operador: no se envió ningún SMS, no se creó ninguna suscripción y no se cobró nada. Si querías suscribirte, escríbenos y te ayudamos.',
    doneCta: 'Ir al catálogo',
    working: 'Procesando…',
  },
  en: {
    needNine: 'Entel numbers start with 9.',
    needMore: (n: number) => `${n} more digit${n === 1 ? '' : 's'} to go.`,
    blockNumber: 'Enter a valid Entel mobile number.',
    blockPrice: 'Tick the price and renewal box.',
    blockAge: 'Tick the age and terms box.',
    blockIntro: 'To continue:',
    title: 'Activate your subscription',
    step1: 'Enter your mobile number',
    step2: 'Enter the PIN code to verify your number',
    phoneLabel: 'Entel mobile number',
    phonePlaceholder: '9XX XXX XXX',
    continue: 'Subscribe',
    pinLabel: 'Type the PIN you received by SMS',
    pinPlaceholder: 'PIN',
    confirm: 'Confirm',
    consentPrice: (p: string) =>
      `I agree to subscribe to ${brand.name} and to my subscription renewing automatically (${p}) until I cancel it by texting ${brand.cancellation.sms.keyword} to ${brand.cancellation.sms.shortcode}.`,
    consentAge: 'I confirm I am 18 or older and I accept the',
    terms: 'Terms of Service',
    and: 'and the',
    privacy: 'Privacy Policy',
    retry: (p: string) => `If ${p} is not your number, tap here to start again.`,
    error: 'We could not complete that step. Check the details and try again.',
    doneTitle: 'All set!',
    doneBody: 'Your subscription is active. You can open the catalogue now.',
    // Shown when carrier billing is NOT configured. It must never say a
    // subscription was created, because none was.
    notLiveTitle: 'No subscription was created',
    notLiveBody:
      'This version of the form is not connected to the carrier yet: no SMS was sent, no subscription was created and nothing was charged. If you meant to subscribe, write to us and we will help.',
    doneCta: 'Go to the catalogue',
    working: 'Working…',
  },
} as const;

type Step = 'phone' | 'pin' | 'done';

// WHETHER THIS FORM ACTUALLY SUBSCRIBES ANYONE IS DECIDED BY THE SERVER.
//
// `live` comes from `tallyman.enabled` — i.e. from whether TALLYMAN_BASE_URL is
// configured on the server that rendered this page. It used to be a separate
// build flag (NEXT_PUBLIC_DEMO_MODE), which could disagree with the server: a
// build with the flag off but no Tallyman endpoint would drop the "preview"
// notice while /api/tallyman still answered `mock: true`, leaving a form that
// looks like it charges you and does not. Now the two cannot diverge — the
// notice appears exactly when, and only when, no subscription can be created.
//
//   live === true   → real /api/tallyman calls: a real SMS, and a real charge.
//   live === false  → the steps are walked client-side, nothing is sent, and the
//                     card says so on its face. Also the only mode that works on
//                     the static preview, which has no server to call.

export default function SubscribeCard({
  lang,
  tracking,
  live = false,
}: {
  lang: Locale;
  tracking?: Record<string, string>;
  /** Server-resolved: is carrier billing actually configured? */
  live?: boolean;
}) {
  const t = copy[lang];
  const [step, setStep] = useState<Step>('phone');
  const [msisdn, setMsisdn] = useState('');
  const [pin, setPin] = useState('');
  const [okPrice, setOkPrice] = useState(false);
  const [okAge, setOkAge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rockmanId, setRockmanId] = useState('');

  // Digits only, a typed or pasted country code dropped, capped at nine. The
  // field already shows +51, so people type it again — that made an eleven-digit
  // value that could never validate, and the button just sat there dead.
  const digits = msisdn.replace(/\D/g, '').replace(/^51/, '').slice(0, 9);
  const pinDigits = pin.replace(/\D/g, '');
  const fullNumber = `${brand.billing.countryCode} ${digits}`;

  // Peru mobile numbers are 9 digits and start with 9.
  const phoneOk = digits.length === 9 && digits.startsWith('9');
  const canSubmitPhone = phoneOk && okPrice && okAge && !loading;

  // A disabled button that will not say why is a dead end. These say why, live.
  const phoneHint =
    digits.length === 0
      ? ''
      : digits[0] !== '9'
        ? t.needNine
        : digits.length < 9
          ? t.needMore(9 - digits.length)
          : '';

  const blocking = [
    !phoneOk ? t.blockNumber : null,
    !okPrice ? t.blockPrice : null,
    !okAge ? t.blockAge : null,
  ].filter(Boolean) as string[];
  const canSubmitPin = pinDigits.length >= 4 && !loading;

  useEffect(() => {
    initEvina();
  }, []);

  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitPhone) return;
    setLoading(true);
    setError('');
    if (!live) {
      setLoading(false);
      setStep('pin');
      return;
    }
    try {
      const antifraud = await getAntifraudToken();
      const res = await fetch('/api/tallyman', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          msisdn: digits,
          antifraud,
          tracking,
          page: window.location.href,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error('submit_failed');
      if (data.rockman_id) setRockmanId(data.rockman_id);
      trackEvent('msisdn_submit', { service: brand.billing.service, xcid: tracking?.xcid });
      setStep('pin');
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  async function submitPin(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitPin) return;
    setLoading(true);
    setError('');
    if (!live) {
      setLoading(false);
      setStep('done');
      return;
    }
    try {
      const res = await fetch('/api/tallyman', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          msisdn: digits,
          pin: pinDigits,
          rockman_id: rockmanId,
          tracking,
          page: window.location.href,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error('verify_failed');
      trackEvent('pin_verified', { service: brand.billing.service, xcid: tracking?.xcid });
      if (typeof data.finalUrl === 'string' && data.finalUrl.startsWith('http')) {
        window.location.href = data.finalUrl;
        return;
      }
      setStep('done');
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'done') {
    // WITHOUT a configured gateway nothing happened, so this screen must not
    // claim otherwise. A form that answers "your subscription is active" to a
    // random number and a random PIN is worse than one that does nothing — it
    // is a false statement about a charge, on a page under review.
    if (!live) {
      return (
        <div className={styles.card}>
          <h2 className={styles.title}>{t.notLiveTitle}</h2>
          <p className={styles.lede}>{t.notLiveBody}</p>
          <a href={`mailto:${brand.support.email}`} className={styles.submit}>
            {brand.support.email}
          </a>
        </div>
      );
    }

    return (
      <div className={styles.card}>
        <div className={styles.doneMark} aria-hidden="true">
          ✓
        </div>
        <h2 className={styles.title}>{t.doneTitle}</h2>
        <p className={styles.lede}>{t.doneBody}</p>
        <Link href={href(lang, 'games')} className={styles.submit}>
          {t.doneCta}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{t.title}</h2>

      <ol className={styles.steps}>
        <li className={styles.stepItem} data-on={step === 'phone' ? 'true' : undefined}>
          <span className={styles.stepNum}>1</span>
          {t.step1}
        </li>
        <li className={styles.stepItem} data-on={step === 'pin' ? 'true' : undefined}>
          <span className={styles.stepNum}>2</span>
          {t.step2}
        </li>
      </ol>

      {step === 'phone' ? (
        <form onSubmit={submitPhone} noValidate>
          <label className={styles.label} htmlFor="phone-input">
            {t.phoneLabel}
          </label>
          <div className={styles.phoneRow}>
            <span className={styles.dial}>{brand.billing.countryCode}</span>
            <input
              id="phone-input"
              className={styles.input}
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder={t.phonePlaceholder}
              value={digits}
              onChange={(e) => setMsisdn(e.target.value)}
              maxLength={12}
              aria-describedby="phone-hint"
              aria-invalid={phoneHint ? true : undefined}
            />
          </div>

          {phoneHint ? (
            <p id="phone-hint" className={styles.fieldError}>
              {phoneHint}
            </p>
          ) : null}

          <label className={styles.check}>
            <input type="checkbox" checked={okPrice} onChange={(e) => setOkPrice(e.target.checked)} />
            <span>{t.consentPrice(priceLine(lang))}</span>
          </label>

          <label className={styles.check}>
            <input type="checkbox" checked={okAge} onChange={(e) => setOkAge(e.target.checked)} />
            <span>
              {t.consentAge}{' '}
              <LegalLink href={href(lang, 'terms')} lang={lang} className={styles.inlineLink}>
                {t.terms}
              </LegalLink>{' '}
              {t.and}{' '}
              <LegalLink href={href(lang, 'privacy')} lang={lang} className={styles.inlineLink}>
                {t.privacy}
              </LegalLink>
              .
            </span>
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          {blocking.length ? (
            <p className={styles.blocked}>
              {t.blockIntro} {blocking.join(' ')}
            </p>
          ) : null}

          <button type="submit" className={styles.submit} disabled={!canSubmitPhone}>
            {loading ? t.working : t.continue}
          </button>

          {/* The real conversion point is this button, so the price, the billing
              frequency, the renewal and both cancellation methods sit directly
              under it — not only on the trigger that opened the card. */}
          <div className={styles.terms}>
            <BillingTerms lang={lang} />
          </div>
        </form>
      ) : (
        <form onSubmit={submitPin} noValidate>
          <label className={styles.label} htmlFor="pin-input">
            {t.pinLabel}
          </label>
          <input
            id="pin-input"
            className={styles.input}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t.pinPlaceholder}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={8}
          />

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.submit} disabled={!canSubmitPin}>
            {loading ? t.working : t.confirm}
          </button>

          <div className={styles.terms}>
            <BillingTerms lang={lang} />
          </div>

          <button
            type="button"
            className={styles.retry}
            onClick={() => {
              setStep('phone');
              setPin('');
              setError('');
            }}
          >
            {t.retry(fullNumber)}
          </button>
        </form>
      )}
    </div>
  );
}
