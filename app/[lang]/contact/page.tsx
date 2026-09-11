import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand, LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, href, getDictionary } from '@/lib/i18n';
import PageHead, { Panel, PanelGrid } from '@/components/PageHead';

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
    title: locale === 'es' ? 'Contacto' : 'Contact',
    description: t.seo.contact,
    alternates: {
      canonical: `/${locale}/contact/`,
      languages: { es: '/es/contact/', en: '/en/contact/', 'x-default': '/es/contact/' },
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const es = locale === 'es';
  const { email } = brand.support;
  const { sms } = brand.cancellation;

  return (
    <>
      <PageHead
        title={es ? 'Contacto' : 'Contact'}
        intro={
          es
            ? 'Escríbenos por correo y te respondemos. Esta página no usa formularios: el correo llega directamente a nuestro equipo de atención.'
            : 'Email us and we will reply. This page uses no forms: your message reaches our support team directly.'
        }
      />

      <PanelGrid>
        <Panel title={es ? 'Atención al cliente' : 'Customer support'}>
          <p>
            <a href={`mailto:${email}`}>{email}</a>
          </p>
          <p>
            {es
              ? 'Para dudas sobre tu suscripción, cobros o acceso al catálogo. Incluye tu número móvil para que podamos ayudarte más rápido.'
              : 'For questions about your subscription, charges or catalogue access. Include your mobile number so we can help you faster.'}
          </p>
        </Panel>

        <Panel title={es ? 'Cancelar la suscripción' : 'Cancel your subscription'}>
          <p>
            {es ? 'Envía ' : 'Text '}
            <strong>{sms.keyword}</strong> {es ? 'al ' : 'to '}
            <strong>{sms.shortcode}</strong>
            {es ? ', o escríbenos a ' : ', or email '}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>
          <p>
            <a href={href(locale, 'unsubscribeRefund')}>
              {es ? 'Cancelación y reembolso' : 'Unsubscribe & refund'}
            </a>
          </p>
        </Panel>

        <Panel title={es ? 'Datos de la empresa' : 'Company details'}>
          <p>
            <strong>{brand.entity.name}</strong>
          </p>
          <p>
            {es ? 'Número de registro' : 'Registration number'} {brand.entity.registrationNumber}
            <br />
            {brand.entity.address[locale]}
          </p>
          <p>
            {es ? 'Servicio promocionado por' : 'Service promoted by'} {brand.entity.promotedBy}.
          </p>
        </Panel>
      </PanelGrid>
    </>
  );
}
