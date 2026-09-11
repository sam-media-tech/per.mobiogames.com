import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand, LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary } from '@/lib/i18n';
import PageHead, { Panel, PanelGrid, Prose } from '@/components/PageHead';

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
    title: locale === 'es' ? 'Cancelación y reembolso' : 'Unsubscribe & refund',
    description: t.seo.unsubscribeRefund,
    alternates: {
      canonical: `/${locale}/unsubscribe-refund/`,
      languages: {
        es: '/es/unsubscribe-refund/',
        en: '/en/unsubscribe-refund/',
        'x-default': '/es/unsubscribe-refund/',
      },
    },
  };
}

export default async function UnsubscribePage({
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
        title={es ? 'Cancelación y reembolso' : 'Unsubscribe & refund'}
        intro={
          es
            ? 'Cancelar es inmediato y no requiere hablar con nadie. Aquí están los dos métodos y cómo pedir un reembolso.'
            : 'Cancelling is immediate and requires talking to no one. Here are both methods, and how to request a refund.'
        }
      />

      <PanelGrid>
        <Panel title={es ? 'Por SMS' : 'By SMS'}>
          <p>
            {es ? 'Envía un mensaje con el texto ' : 'Send a message with the text '}
            <strong>{sms.keyword}</strong> {es ? 'al número ' : 'to '}
            <strong>{sms.shortcode}</strong>
            {es ? ' desde tu línea Entel.' : ' from your Entel line.'}
          </p>
          <p>
            {es
              ? 'Recibirás una confirmación por SMS y no se generarán más cobros.'
              : 'You will get an SMS confirmation and no further charges will be made.'}
          </p>
        </Panel>

        <Panel title={es ? 'Por correo' : 'By email'}>
          <p>
            {es ? 'Escríbenos a ' : 'Write to us at '}
            <a href={`mailto:${email}`}>{email}</a>
            {es
              ? ' indicando tu número móvil. Te confirmamos la baja por el mismo medio.'
              : ' including your mobile number. We confirm the cancellation by the same channel.'}
          </p>
        </Panel>

        <Panel title={es ? 'Después de cancelar' : 'After cancelling'}>
          <p>
            {es
              ? 'El acceso al catálogo permanece activo hasta el final del periodo ya pagado. No se realizan cobros posteriores.'
              : 'Catalogue access stays active until the end of the period already paid for. No further charges are made.'}
          </p>
        </Panel>
      </PanelGrid>

      <Prose>
        <h2>{es ? 'Política de reembolso' : 'Refund policy'}</h2>
        <p>
          {es
            ? `Si se cobró una tarifa por los servicios de ${brand.name} dentro de los ${brand.refund.days} días anteriores a tu solicitud, puedes pedir el reembolso escribiendo a `
            : `If a charge for ${brand.name} services was made within ${brand.refund.days} days before your request, you can ask for a refund by writing to `}
          <a href={`mailto:${email}`}>{email}</a>.
        </p>

        <h3>{es ? 'Qué incluir en tu solicitud' : 'What to include in your request'}</h3>
        <ul>
          <li>{es ? 'Nombre y apellido.' : 'First and last name.'}</li>
          <li>{es ? 'Número de móvil suscrito.' : 'The subscribed mobile number.'}</li>
          <li>{es ? 'Correo electrónico de contacto.' : 'A contact email address.'}</li>
          <li>
            {es
              ? `El nombre del servicio (${brand.name}) y el método de pago utilizado.`
              : `The service name (${brand.name}) and the payment method used.`}
          </li>
        </ul>

        <p>
          {es
            ? 'Enviamos un acuse de recibo por correo cuando recibimos tu solicitud. Si procede el reembolso, devolveremos los pagos recibidos por el medio de pago original.'
            : 'We send an acknowledgement by email when we receive your request. Where a refund applies, we return the payments received through the original payment method.'}
        </p>

        <h2>{es ? 'Atención al cliente' : 'Customer support'}</h2>
        <p>
          <a href={`mailto:${email}`}>{email}</a> —{' '}
          {es
            ? `${brand.entity.name}, ${brand.entity.address[locale]}.`
            : `${brand.entity.name}, ${brand.entity.address[locale]}.`}
        </p>
      </Prose>
    </>
  );
}
