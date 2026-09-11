import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand, priceLine, LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, href, getDictionary } from '@/lib/i18n';
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
    title: locale === 'es' ? 'Términos y condiciones' : 'Terms of Service',
    description: t.seo.terms,
    alternates: {
      canonical: `/${locale}/terms/`,
      languages: { es: '/es/terms/', en: '/en/terms/', 'x-default': '/es/terms/' },
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const es = locale === 'es';
  const { sms, email } = brand.cancellation;
  const updated = es ? '8 de septiembre de 2026' : '8 September 2026';

  return (
    <>
      <PageHead
        title={es ? 'Términos y condiciones' : 'Terms of Service'}
        intro={es ? `Última actualización: ${updated}` : `Last updated: ${updated}`}
      />

      <Prose>
        <h2>{es ? '1. Quiénes somos' : '1. Who we are'}</h2>
        <p>
          {brand.name} {es ? 'es un servicio operado por' : 'is a service operated by'}{' '}
          <strong>{brand.entity.name}</strong>, {es ? 'número de registro' : 'registration number'}{' '}
          {brand.entity.registrationNumber}, {es ? 'con domicilio social en' : 'registered at'}{' '}
          {brand.entity.address[locale]}
          {es ? ', y promocionado por ' : ', and promoted by '}
          {brand.entity.promotedBy}.{' '}
          {es
            ? 'Estos términos regulan el uso del servicio y la relación contractual entre tú y nosotros.'
            : 'These terms govern your use of the service and the contractual relationship between you and us.'}
        </p>

        <h2>{es ? '2. El servicio' : '2. The service'}</h2>
        <p>
          {es
            ? `${brand.name} es un servicio de suscripción que da acceso a un catálogo de juegos HTML5 que se ejecutan en el navegador de un dispositivo compatible (celular, tableta o PC). El servicio no requiere descargar ni instalar aplicaciones ni archivos APK.`
            : `${brand.name} is a subscription service giving access to a catalogue of HTML5 games that run in the browser of a compatible device (phone, tablet or PC). The service requires no app or APK download or installation.`}
        </p>
        <p>
          {es
            ? 'El contenido del catálogo puede variar con el tiempo. No garantizamos la disponibilidad permanente de un título concreto.'
            : 'The catalogue may change over time. We do not guarantee the permanent availability of any particular title.'}
        </p>

        <h2>{es ? '3. Requisitos de acceso' : '3. Eligibility'}</h2>
        <ul>
          <li>
            {es
              ? `Debes tener una línea móvil ${brand.carrier} activa en Perú.`
              : `You must have an active ${brand.carrier} mobile line in Peru.`}
          </li>
          <li>
            {es
              ? 'Debes tener 18 años o más, o contar con el permiso expreso del titular de la línea y del pagador de la factura.'
              : 'You must be 18 or older, or have the express permission of the line holder and the bill payer.'}
          </li>
          <li>
            {es
              ? 'Debes disponer de saldo suficiente (prepago) o de una cuenta al día (postpago).'
              : 'You must have sufficient balance (prepaid) or an account in good standing (postpaid).'}
          </li>
        </ul>

        <h2>{es ? '4. Precio, facturación y renovación' : '4. Price, billing and renewal'}</h2>
        <p>
          <strong>{priceLine(locale)}.</strong>{' '}
          {es
            ? `El importe se carga a través de ${brand.carrier}: aparece en tu recibo mensual o se descuenta del saldo de tu recarga, según el tipo de línea. No solicitamos ni procesamos datos de tarjetas de crédito o débito.`
            : `The amount is charged through ${brand.carrier}: it appears on your monthly bill or is deducted from your prepaid balance, depending on your line type. We neither request nor process credit or debit card details.`}
        </p>
        <p>
          {es
            ? 'La suscripción es de renovación automática. Se renueva de forma continuada —diariamente para prepago y mensualmente para postpago— hasta que la canceles. No existe periodo de prueba gratuito ni permanencia mínima.'
            : 'The subscription renews automatically. It continues to renew — daily for prepaid and monthly for postpaid — until you cancel. There is no free trial and no minimum term.'}
        </p>
        <p>
          {es
            ? 'Todos los precios mostrados incluyen el IGV. Si el precio cambiara, te lo comunicaríamos antes de que el nuevo importe se aplique.'
            : 'All prices shown include VAT. If the price changes, we will tell you before the new amount applies.'}
        </p>

        <h2>{es ? '5. Cancelación' : '5. Cancellation'}</h2>
        <p>
          {es ? 'Puedes cancelar en cualquier momento, por cualquiera de estos dos medios: enviando un SMS con el texto ' : 'You may cancel at any time, by either of these two methods: send an SMS with the text '}
          <strong>{sms.keyword}</strong> {es ? 'al ' : 'to '}
          <strong>{sms.shortcode}</strong>
          {es ? ', o escribiendo a ' : ', or email '}
          <a href={`mailto:${email}`}>{email}</a>.{' '}
          {es
            ? 'La cancelación detiene todos los cobros futuros. El acceso continúa hasta el final del periodo ya pagado.'
            : 'Cancelling stops all future charges. Access continues until the end of the period already paid for.'}
        </p>
        <p>
          <a href={href(locale, 'unsubscribeRefund')}>
            {es
              ? 'Consulta la política de cancelación y reembolso'
              : 'See the cancellation and refund policy'}
          </a>
          .
        </p>

        <h2>{es ? '6. Reembolsos' : '6. Refunds'}</h2>
        <p>
          {es
            ? `Puedes solicitar el reembolso de un cargo realizado dentro de los ${brand.refund.days} días anteriores a tu solicitud, escribiendo a `
            : `You may request a refund for a charge made within ${brand.refund.days} days before your request, by writing to `}
          <a href={`mailto:${email}`}>{email}</a>
          {es
            ? ' con tu nombre, número móvil, correo de contacto, el nombre del servicio y el método de pago.'
            : ' with your name, mobile number, contact email, the service name and the payment method.'}
        </p>

        <h2>{es ? '7. Uso aceptable' : '7. Acceptable use'}</h2>
        <p>
          {es
            ? 'El acceso al servicio es personal. No está permitido revender el acceso, extraer el contenido de forma automatizada, ni intentar eludir los controles técnicos del servicio.'
            : 'Access to the service is personal. Reselling access, scraping the content by automated means, or attempting to circumvent the technical controls of the service is not permitted.'}
        </p>

        <h2>{es ? '8. Propiedad intelectual' : '8. Intellectual property'}</h2>
        <p>
          {es
            ? 'Los juegos del catálogo y sus elementos gráficos pertenecen a sus respectivos titulares y se ofrecen bajo licencia. La suscripción te concede un derecho de acceso mientras esté activa, no la titularidad de ningún contenido.'
            : 'The games in the catalogue and their graphical assets belong to their respective owners and are offered under licence. The subscription grants you a right of access while it is active, not ownership of any content.'}
        </p>

        <h2>{es ? '9. Responsabilidad' : '9. Liability'}</h2>
        <p>
          {es
            ? 'El servicio se presta tal cual. No respondemos de interrupciones causadas por la red del operador, por el dispositivo del usuario o por causas fuera de nuestro control razonable. Nada en estos términos limita los derechos que la legislación peruana de protección al consumidor te reconoce.'
            : 'The service is provided as is. We are not responsible for interruptions caused by the operator network, by the user device, or by causes beyond our reasonable control. Nothing in these terms limits the rights granted to you by Peruvian consumer protection law.'}
        </p>

        <h2>{es ? '10. Cambios en estos términos' : '10. Changes to these terms'}</h2>
        <p>
          {es
            ? 'Podemos actualizar estos términos. La fecha de la última actualización figura al principio de esta página. Si un cambio afecta de forma sustancial al precio o a la forma de cancelar, te lo comunicaremos antes de que entre en vigor.'
            : 'We may update these terms. The date of the last update appears at the top of this page. If a change materially affects the price or the way to cancel, we will tell you before it takes effect.'}
        </p>

        <h2>{es ? '11. Contacto' : '11. Contact'}</h2>
        <p>
          <a href={`mailto:${email}`}>{email}</a> — {brand.entity.name}, {brand.entity.address[locale]}.
        </p>
      </Prose>
    </>
  );
}
