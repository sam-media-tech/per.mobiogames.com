import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand, priceLine, LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary } from '@/lib/i18n';
import PageHead, { Prose } from '@/components/PageHead';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : 'es';
  const t = getDictionary(locale);
  return {
    title: locale === 'es' ? 'Facturación por operador' : 'Carrier billing',
    description: t.seo.carrierBilling,
    alternates: {
      canonical: `/${locale}/carrier-billing/`,
      languages: {
        es: '/es/carrier-billing/',
        en: '/en/carrier-billing/',
        'x-default': '/es/carrier-billing/',
      },
    },
  };
}

export default async function CarrierBillingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const es = locale === 'es';
  const { sms, email } = brand.cancellation;

  return (
    <>
      <PageHead
        title={es ? 'Facturación por operador' : 'Carrier billing'}
        intro={
          es
            ? `${brand.name} se cobra a través de tu operador móvil. No usamos tarjetas de crédito ni débito.`
            : `${brand.name} is billed through your mobile operator. We do not use credit or debit cards.`
        }
      />

      <Prose>
        <h2>{es ? 'Qué es la facturación por operador' : 'What carrier billing is'}</h2>
        <p>
          {es
            ? `Es un método de pago en el que el importe de tu suscripción se añade a tu recibo mensual de ${brand.carrier} o se descuenta del saldo de tu recarga, según el tipo de línea que tengas. No necesitas tarjeta ni cuenta bancaria.`
            : `It is a payment method where your subscription amount is added to your monthly ${brand.carrier} bill, or deducted from your prepaid balance, depending on the type of line you have. No card or bank account is needed.`}
        </p>

        <h2>{es ? 'Operador y precio' : 'Operator and price'}</h2>
        <p>
          <strong>{brand.carrier}</strong> — {priceLine(locale)}.{' '}
          {es
            ? 'La suscripción se renueva automáticamente hasta que la canceles.'
            : 'The subscription renews automatically until you cancel it.'}
        </p>
        <p>
          {es
            ? 'Los usuarios prepago se cobran diariamente. Los usuarios postpago se cobran mensualmente. En ambos casos el precio mostrado ya incluye el IGV.'
            : 'Prepaid users are charged daily. Postpaid users are charged monthly. In both cases the price shown already includes VAT.'}
        </p>

        <h2>{es ? 'Quién te cobra' : 'Who charges you'}</h2>
        <p>
          {es ? 'El cargo lo realiza ' : 'The charge is made by '}
          <strong>{brand.entity.name}</strong> ({es ? 'número de registro' : 'registration number'}{' '}
          {brand.entity.registrationNumber}), {brand.entity.address[locale]}.{' '}
          {es
            ? `El servicio es promocionado por ${brand.entity.promotedBy}.`
            : `The service is promoted by ${brand.entity.promotedBy}.`}
        </p>

        <h2>{es ? 'Requisitos' : 'Requirements'}</h2>
        <ul>
          <li>
            {es
              ? `Una línea móvil ${brand.carrier} activa en Perú.`
              : `An active ${brand.carrier} mobile line in Peru.`}
          </li>
          <li>
            {es
              ? 'Ser mayor de 18 años, o contar con el permiso del titular de la línea.'
              : 'Being 18 or older, or having the permission of the line holder.'}
          </li>
          <li>
            {es
              ? 'Saldo suficiente (prepago) o una cuenta al día (postpago).'
              : 'Sufficient balance (prepaid) or an account in good standing (postpaid).'}
          </li>
        </ul>

        <h2>{es ? 'Cómo detener los cobros' : 'How to stop the charges'}</h2>
        <p>
          {es ? 'Envía ' : 'Text '}
          <strong>{sms.keyword}</strong> {es ? 'al ' : 'to '}
          <strong>{sms.shortcode}</strong>
          {es ? ', o escríbenos a ' : ', or email us at '}
          <a href={`mailto:${email}`}>{email}</a>.{' '}
          {es
            ? 'La cancelación detiene cualquier cobro futuro de forma inmediata.'
            : 'Cancelling stops any future charge immediately.'}
        </p>
      </Prose>
    </>
  );
}
