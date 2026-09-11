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
    title: locale === 'es' ? 'Política de cookies' : 'Cookies Policy',
    description: t.seo.cookies,
    alternates: {
      canonical: `/${locale}/cookies/`,
      languages: { es: '/es/cookies/', en: '/en/cookies/', 'x-default': '/es/cookies/' },
    },
  };
}

export default async function CookiesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const es = locale === 'es';
  const { email } = brand.support;
  const updated = es ? '8 de septiembre de 2026' : '8 September 2026';

  return (
    <>
      <PageHead
        title={es ? 'Política de cookies' : 'Cookies Policy'}
        intro={es ? `Última actualización: ${updated}` : `Last updated: ${updated}`}
      />

      <Prose>
        <h2>{es ? '1. Resumen' : '1. In short'}</h2>
        <p>
          {es
            ? `${brand.name} no utiliza cookies publicitarias, ni cookies de analítica, ni cookies de terceros. No hay píxeles de seguimiento, ni grabadores de sesión, ni botones de redes sociales incrustados. Por eso este sitio no muestra un banner de consentimiento: no hay nada que consentir.`
            : `${brand.name} uses no advertising cookies, no analytics cookies and no third-party cookies. There are no tracking pixels, no session recorders and no embedded social buttons. That is why this site shows no consent banner: there is nothing to consent to.`}
        </p>

        <h2>{es ? '2. Qué son las cookies' : '2. What cookies are'}</h2>
        <p>
          {es
            ? 'Una cookie es un pequeño archivo que un sitio web guarda en tu navegador. Puede servir para recordar una preferencia o, en el caso de las cookies publicitarias, para seguir tu actividad entre distintos sitios.'
            : 'A cookie is a small file that a website stores in your browser. It can be used to remember a preference or, in the case of advertising cookies, to follow your activity across different sites.'}
        </p>

        <h2>{es ? '3. Qué usa este sitio' : '3. What this site uses'}</h2>
        <p>
          {es
            ? 'Solo almacenamiento estrictamente necesario para que el proceso de alta funcione: durante la suscripción, el navegador conserva de forma temporal el estado del proceso (por ejemplo, que ya has introducido tu número y estás en el paso del PIN). Ese dato se descarta al terminar y no se usa para perfilarte.'
            : 'Only storage strictly necessary for the sign-up process to work: during subscription, the browser temporarily holds the state of the process (for example, that you have already entered your number and are on the PIN step). That data is discarded when you finish and is never used to profile you.'}
        </p>
        <p>
          {es
            ? 'La preferencia de idioma se determina a partir de la configuración de tu navegador o del enlace que hayas seguido, no de una cookie.'
            : 'The language preference is determined from your browser settings or the link you followed, not from a cookie.'}
        </p>

        <h2>{es ? '4. Cookies de terceros' : '4. Third-party cookies'}</h2>
        <p>
          {es
            ? 'Ninguna. Las fuentes tipográficas, las imágenes y los scripts se sirven desde este mismo dominio.'
            : 'None. Fonts, images and scripts are all served from this same domain.'}
        </p>

        <h2>{es ? '5. Cómo controlar el almacenamiento' : '5. How to control storage'}</h2>
        <p>
          {es
            ? 'Puedes borrar o bloquear el almacenamiento local desde la configuración de tu navegador. Si lo bloqueas por completo, el proceso de alta puede no completarse correctamente, pero la navegación por el catálogo y las páginas legales seguirá funcionando.'
            : 'You can clear or block local storage from your browser settings. If you block it entirely the sign-up process may not complete correctly, but browsing the catalogue and the legal pages will keep working.'}
        </p>

        <h2>{es ? '6. Cambios' : '6. Changes'}</h2>
        <p>
          {es
            ? 'Si en el futuro incorporáramos cualquier herramienta de medición, actualizaríamos esta página y la '
            : 'If we ever add any measurement tool, we would update this page and the '}
          <a href={href(locale, 'privacy')}>
            {es ? 'política de privacidad' : 'privacy policy'}
          </a>
          {es
            ? ' antes de activarla, e implantaríamos el mecanismo de consentimiento que correspondiera.'
            : ' before enabling it, and would put in place whatever consent mechanism is required.'}
        </p>

        <h2>{es ? '7. Contacto' : '7. Contact'}</h2>
        <p>
          <a href={`mailto:${email}`}>{email}</a> — {brand.entity.name}, {brand.entity.address[locale]}.
        </p>
      </Prose>
    </>
  );
}
