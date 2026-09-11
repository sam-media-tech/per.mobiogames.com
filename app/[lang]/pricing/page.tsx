import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand, LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary } from '@/lib/i18n';
import PageHead, { Panel, PanelGrid } from '@/components/PageHead';
import SubscribeCta from '@/components/SubscribeCta';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const c = {
  es: {
    title: 'Precios y suscripción',
    intro: `Un solo precio, escrito completo. Estas son las tarifas de ${brand.carrier} para ${brand.name}, cómo se cobran y cómo se cancela.`,
    plans: 'Planes',
    prepaid: 'Prepago',
    postpaid: 'Postpago',
    perDay: 'al día',
    perMonth: 'al mes',
    tax: 'IGV incluido',
    how: 'Cómo se cobra',
    howList: [
      'El cargo aparece en tu recibo Entel o se descuenta del saldo de tu recarga. No pedimos tarjeta.',
      'La suscripción es recurrente: se renueva automáticamente hasta que la canceles.',
      'Los usuarios prepago se cobran diariamente; los usuarios postpago, mensualmente.',
      'Todos los impuestos están incluidos en el precio mostrado. No hay cargos adicionales.',
    ],
    cancel: 'Cómo cancelar',
    steps: 'Cómo suscribirte',
    stepsList: [
      'Abre la página de suscripción e ingresa tu número móvil Entel.',
      'Recibirás un PIN por SMS. Escríbelo para confirmar.',
      'Con la suscripción activa entras al catálogo desde el navegador.',
    ],
    noTrial:
      'No ofrecemos periodo de prueba gratuito. El servicio es de pago desde el primer cargo.',
  },
  en: {
    title: 'Pricing and subscription',
    intro: `One price, written out in full. These are the ${brand.carrier} rates for ${brand.name}, how they are charged, and how to cancel.`,
    plans: 'Plans',
    prepaid: 'Prepaid',
    postpaid: 'Postpaid',
    perDay: 'per day',
    perMonth: 'per month',
    tax: 'VAT included',
    how: 'How you are charged',
    howList: [
      'The charge appears on your Entel bill or comes off your prepaid balance. We never ask for a card.',
      'The subscription is recurring: it renews automatically until you cancel.',
      'Prepaid users are charged daily; postpaid users are charged monthly.',
      'All taxes are included in the price shown. There are no additional fees.',
    ],
    cancel: 'How to cancel',
    steps: 'How to subscribe',
    stepsList: [
      'Open the subscription page and enter your Entel mobile number.',
      'A PIN arrives by SMS. Type it in to confirm.',
      'With an active subscription you enter the catalogue from your browser.',
    ],
    noTrial: 'There is no free trial. The service is paid from the first charge.',
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : 'es';
  const t = getDictionary(locale);
  return {
    title: c[locale].title,
    description: t.seo.pricing,
    alternates: {
      canonical: `/${locale}/pricing/`,
      languages: { es: '/es/pricing/', en: '/en/pricing/', 'x-default': '/es/pricing/' },
    },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = c[locale];
  const { sms, email } = brand.cancellation;
  const [prepaid, postpaid] = brand.price.plans;

  return (
    <>
      <PageHead title={t.title} intro={t.intro} />

      <PanelGrid>
        <Panel title={t.plans}>
          <p>
            <strong>{t.prepaid}</strong>: {prepaid.amount} {t.perDay} ({t.tax})
          </p>
          <p>
            <strong>{t.postpaid}</strong>: {postpaid.amount} {t.perMonth} ({t.tax})
          </p>
          <p>{t.noTrial}</p>
        </Panel>

        <Panel title={t.how}>
          <ul>
            {t.howList.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </Panel>

        <Panel title={t.cancel}>
          <ul>
            <li>
              {locale === 'es' ? 'Envía un SMS con el texto ' : 'Send an SMS with the text '}
              <strong>{sms.keyword}</strong> {locale === 'es' ? 'al' : 'to'}{' '}
              <strong>{sms.shortcode}</strong>.
            </li>
            <li>
              {locale === 'es' ? 'O escríbenos a ' : 'Or email us at '}
              <a href={`mailto:${email}`}>{email}</a>.
            </li>
            <li>
              {locale === 'es'
                ? 'La cancelación detiene los cobros futuros de inmediato.'
                : 'Cancelling stops all future charges immediately.'}
            </li>
          </ul>
        </Panel>
      </PanelGrid>

      <PanelGrid>
        <Panel title={t.steps}>
          <ol>
            {t.stepsList.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ol>
        </Panel>
      </PanelGrid>

      <div style={{ maxWidth: 'var(--shell)', margin: '2rem auto 0', padding: '0 var(--gutter)' }}>
        <SubscribeCta lang={locale} />
      </div>
    </>
  );
}
