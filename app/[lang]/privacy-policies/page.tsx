import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand, LOCALES, type Locale } from '@/lib/brand.config';
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
    title: locale === 'es' ? 'Política de privacidad' : 'Privacy Policy',
    description: t.seo.privacy,
    alternates: {
      canonical: `/${locale}/privacy-policies/`,
      languages: {
        es: '/es/privacy-policies/',
        en: '/en/privacy-policies/',
        'x-default': '/es/privacy-policies/',
      },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const es = locale === 'es';
  const { email } = brand.support;
  const updated = es ? '8 de septiembre de 2026' : '8 September 2026';

  return (
    <>
      <PageHead
        title={es ? 'Política de privacidad' : 'Privacy Policy'}
        intro={es ? `Última actualización: ${updated}` : `Last updated: ${updated}`}
      />

      <Prose>
        <h2>{es ? '1. Responsable del tratamiento' : '1. Data controller'}</h2>
        <p>
          <strong>{brand.entity.name}</strong>, {es ? 'número de registro' : 'registration number'}{' '}
          {brand.entity.registrationNumber}, {brand.entity.address[locale]}.{' '}
          {es ? 'Contacto: ' : 'Contact: '}
          <a href={`mailto:${email}`}>{email}</a>.
        </p>

        <h2>{es ? '2. Qué datos tratamos' : '2. What data we process'}</h2>
        <ul>
          <li>
            <strong>{es ? 'Número de móvil (MSISDN)' : 'Mobile number (MSISDN)'}</strong> —{' '}
            {es
              ? 'necesario para dar de alta la suscripción, identificarte y gestionar el cobro a través del operador.'
              : 'required to create the subscription, identify you and manage billing through the operator.'}
          </li>
          <li>
            <strong>{es ? 'Estado de la suscripción' : 'Subscription status'}</strong> —{' '}
            {es
              ? 'fecha de alta, renovaciones y baja, para prestar el servicio y atender reclamaciones.'
              : 'sign-up date, renewals and cancellation, in order to provide the service and handle complaints.'}
          </li>
          <li>
            <strong>{es ? 'Datos técnicos mínimos' : 'Minimal technical data'}</strong> —{' '}
            {es
              ? 'dirección IP y tipo de dispositivo, tratados por nuestro proveedor de facturación con fines de seguridad y prevención del fraude.'
              : 'IP address and device type, processed by our billing provider for security and fraud prevention.'}
          </li>
          <li>
            <strong>{es ? 'Correos que nos envías' : 'Emails you send us'}</strong> —{' '}
            {es
              ? 'el contenido de tu mensaje y tu dirección de correo, para responderte.'
              : 'the content of your message and your email address, so we can reply.'}
          </li>
        </ul>
        <p>
          {es
            ? 'No pedimos ni almacenamos datos de tarjetas bancarias: el cobro lo realiza tu operador móvil.'
            : 'We do not request or store payment card details: the charge is made by your mobile operator.'}
        </p>

        <h2>{es ? '3. Publicidad y analítica' : '3. Advertising and analytics'}</h2>
        <p>
          {es
            ? 'Este sitio no carga herramientas de analítica de terceros, píxeles publicitarios, grabadores de sesión ni redes sociales. Las únicas peticiones que realiza tu navegador son a este mismo dominio.'
            : 'This site loads no third-party analytics, advertising pixels, session recorders or social networks. The only requests your browser makes are to this same domain.'}
        </p>
        <p>
          {es
            ? 'Si esto cambiara en el futuro, actualizaríamos esta página y la política de cookies antes de activar cualquier herramienta.'
            : 'If that changes in future, we would update this page and the cookies policy before enabling any such tool.'}{' '}
          <a href={href(locale, 'cookies')}>
            {es ? 'Consulta la política de cookies' : 'See the cookies policy'}
          </a>
          .
        </p>

        <h2>{es ? '4. Con quién compartimos datos' : '4. Who we share data with'}</h2>
        <ul>
          <li>
            {es
              ? `Tu operador móvil (${brand.carrier}), para realizar el cobro y confirmar el alta o la baja.`
              : `Your mobile operator (${brand.carrier}), to take payment and confirm sign-up or cancellation.`}
          </li>
          <li>
            {es
              ? 'Nuestro proveedor técnico de facturación, que procesa el alta, el PIN de confirmación y el estado de la suscripción por cuenta nuestra.'
              : 'Our technical billing provider, which processes sign-up, the confirmation PIN and subscription status on our behalf.'}
          </li>
          <li>
            {es
              ? 'Autoridades competentes, cuando exista una obligación legal.'
              : 'Competent authorities, where there is a legal obligation.'}
          </li>
        </ul>
        <p>
          {es
            ? 'No vendemos ni cedemos tus datos con fines publicitarios.'
            : 'We do not sell or transfer your data for advertising purposes.'}
        </p>

        <h2>{es ? '5. Cuánto tiempo conservamos los datos' : '5. How long we keep data'}</h2>
        <p>
          {es
            ? 'Conservamos los datos de la suscripción mientras esta esté activa y, después, durante el plazo necesario para atender reclamaciones y cumplir obligaciones legales y contables. Los correos de atención al cliente se conservan mientras sean útiles para el seguimiento de tu consulta.'
            : 'We keep subscription data while the subscription is active and afterwards for as long as needed to handle complaints and meet legal and accounting obligations. Support emails are kept while they remain useful for following up your query.'}
        </p>

        <h2>{es ? '6. Tus derechos' : '6. Your rights'}</h2>
        <p>
          {es
            ? 'Puedes solicitar acceso, rectificación, supresión, oposición o portabilidad de tus datos escribiendo a '
            : 'You can request access, rectification, erasure, objection or portability of your data by writing to '}
          <a href={`mailto:${email}`}>{email}</a>
          {es
            ? '. Indica el número móvil asociado a la suscripción para que podamos localizar tu registro.'
            : '. Include the mobile number tied to the subscription so we can locate your record.'}
        </p>
        <p>
          {es
            ? 'También puedes presentar una reclamación ante la Autoridad Nacional de Protección de Datos Personales del Perú.'
            : 'You may also lodge a complaint with the Peruvian National Authority for the Protection of Personal Data.'}
        </p>

        <h2>{es ? '7. Menores de edad' : '7. Minors'}</h2>
        <p>
          {es
            ? 'El servicio está dirigido a personas mayores de 18 años, o a menores con el permiso expreso del titular de la línea. Si detectamos un alta sin ese permiso, la cancelamos y devolvemos los importes cobrados.'
            : 'The service is intended for people aged 18 or over, or for minors with the express permission of the line holder. If we detect a sign-up without that permission, we cancel it and refund the amounts charged.'}
        </p>

        <h2>{es ? '8. Contacto' : '8. Contact'}</h2>
        <p>
          <a href={`mailto:${email}`}>{email}</a> — {brand.entity.name}, {brand.entity.address[locale]}.
        </p>
      </Prose>
    </>
  );
}
