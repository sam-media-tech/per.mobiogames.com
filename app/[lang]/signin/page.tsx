import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand, LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, href, getDictionary } from '@/lib/i18n';
import PageHead, { Panel, PanelGrid } from '@/components/PageHead';
import AccessLinkForm from '@/components/account/AccessLinkForm';

// =============================================================================
// "Check my subscription" is a REQUEST for the access link, not a status lookup.
//
// Tallyman's check-subscription is keyed on rockman_id — the per-visit session
// key — not on a phone number, so "is THIS number subscribed?" has no supported
// answer. Asking for the link instead sidesteps that entirely, and answering the
// same way whether or not a subscription exists also stops the form from telling
// any stranger which numbers are subscribed.
// =============================================================================

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
    title: locale === 'es' ? 'Mi cuenta' : 'My account',
    description: t.seo.signin,
    alternates: {
      canonical: `/${locale}/signin/`,
      languages: { es: '/es/signin/', en: '/en/signin/', 'x-default': '/es/signin/' },
    },
  };
}

export default async function SignInPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const es = locale === 'es';
  const { sms, email } = brand.cancellation;

  return (
    <>
      <PageHead
        title={es ? 'Mi cuenta' : 'My account'}
        intro={
          es
            ? `${brand.name} no usa contraseñas ni registro. Tu suscripción está asociada a tu número móvil ${brand.carrier}, y se gestiona por SMS o por correo.`
            : `${brand.name} has no passwords and no sign-up. Your subscription is tied to your ${brand.carrier} mobile number, and is managed by SMS or email.`
        }
      />

      <div className={'accountFormSlot'} style={{ maxWidth: 'var(--shell)', margin: '2rem auto 0', padding: '0 var(--gutter)' }}>
        <AccessLinkForm lang={locale} />
      </div>

      <PanelGrid>
        <Panel title={es ? 'Cancelar' : 'Cancel'}>
          <p>
            {es ? 'Envía ' : 'Text '}
            <strong>{sms.keyword}</strong> {es ? 'al ' : 'to '}
            <strong>{sms.shortcode}</strong>
            {es ? ', o escríbenos a ' : ', or email '}
            <a href={`mailto:${email}`}>{email}</a>.{' '}
            {es
              ? 'La cancelación detiene los cobros futuros de inmediato.'
              : 'Cancelling stops future charges immediately.'}
          </p>
          <p>
            <a href={href(locale, 'unsubscribeRefund')}>
              {es ? 'Cancelación y reembolso' : 'Unsubscribe & refund'}
            </a>
          </p>
        </Panel>

        <Panel title={es ? 'Acceder al contenido' : 'Getting to the content'}>
          <p>
            {es
              ? 'Con la suscripción activa entras al catálogo desde el navegador, sin instalar nada.'
              : 'With an active subscription you enter the catalogue from your browser, with nothing to install.'}
          </p>
          <p>
            <a href={href(locale, 'games')}>{es ? 'Ir al catálogo' : 'Go to the catalogue'}</a>
          </p>
        </Panel>
      </PanelGrid>
    </>
  );
}
