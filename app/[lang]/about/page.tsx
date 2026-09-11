import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand, priceLine, LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale, getDictionary } from '@/lib/i18n';
import { games, categories } from '@/content/games.generated';
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
    title: locale === 'es' ? 'Nosotros' : 'About',
    description: t.seo.about,
    alternates: {
      canonical: `/${locale}/about/`,
      languages: { es: '/es/about/', en: '/en/about/', 'x-default': '/es/about/' },
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const es = locale === 'es';
  const { email } = brand.support;

  return (
    <>
      <PageHead
        title={es ? `Sobre ${brand.name}` : `About ${brand.name}`}
        intro={
          es
            ? `${brand.name} es un servicio de suscripción de juegos móviles para usuarios ${brand.carrier} en Perú.`
            : `${brand.name} is a mobile games subscription service for ${brand.carrier} users in Peru.`
        }
      />

      <Prose>
        <h2>{es ? 'Qué ofrecemos' : 'What we offer'}</h2>
        <p>
          {es
            ? `Un catálogo de ${games.length} juegos repartidos en ${categories.length} categorías: ${categories
                .map((c) => c.label.es)
                .join(', ')}. Todos son juegos HTML5 que se abren directamente en el navegador de tu celular, tableta o PC compatible: no hay aplicaciones que instalar ni archivos APK que descargar.`
            : `A catalogue of ${games.length} games across ${categories.length} categories: ${categories
                .map((c) => c.label.en)
                .join(', ')}. They are all HTML5 games that open directly in the browser on your phone, tablet or compatible PC: there is no app to install and no APK to download.`}
        </p>
        <p>
          {es
            ? 'El acceso al catálogo está incluido en la suscripción mientras esta se mantenga activa.'
            : 'Access to the catalogue is included in the subscription for as long as it stays active.'}
        </p>

        <h2>{es ? 'Precio y cobro' : 'Price and billing'}</h2>
        <p>
          {priceLine(locale)}.{' '}
          {es
            ? `El cargo se realiza a través de ${brand.carrier}, en tu recibo o descontado de tu saldo. La suscripción se renueva automáticamente hasta que la canceles.`
            : `The charge is made through ${brand.carrier}, on your bill or deducted from your balance. The subscription renews automatically until you cancel it.`}
        </p>

        <h2>{es ? 'BeyondVR y Mobio Games' : 'BeyondVR and Mobio Games'}</h2>
        <p>
          {es
            ? `${brand.name} es el servicio de juegos por suscripción de ${brand.platform.name}, la plataforma publicada en ${brand.platform.domain}. Por eso encontrarás el nombre ${brand.platform.name} en la dirección web y en el correo de atención al cliente, y ${brand.name} como el nombre del servicio al que te suscribes. Ambos corresponden al mismo servicio y al mismo responsable legal.`
            : `${brand.name} is the subscription games service of ${brand.platform.name}, the platform published at ${brand.platform.domain}. That is why you will see the ${brand.platform.name} name in the web address and in the support email, and ${brand.name} as the name of the service you subscribe to. Both refer to the same service and the same legal operator.`}
        </p>

        <h2>{es ? 'Quién opera el servicio' : 'Who operates the service'}</h2>
        <p>
          {brand.name} {es ? 'es operado por' : 'is operated by'} <strong>{brand.entity.name}</strong>,{' '}
          {es ? 'número de registro' : 'registration number'} {brand.entity.registrationNumber},{' '}
          {es ? 'con domicilio social en' : 'with its registered office at'} {brand.entity.address[locale]}.{' '}
          {es ? 'El servicio es promocionado por' : 'The service is promoted by'}{' '}
          {brand.entity.promotedBy}.
        </p>

        <h2>{es ? 'Contacto' : 'Contact'}</h2>
        <p>
          {es ? 'Atención al cliente: ' : 'Customer support: '}
          <a href={`mailto:${email}`}>{email}</a>
        </p>
      </Prose>
    </>
  );
}
