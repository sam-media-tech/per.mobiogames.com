import Link from 'next/link';
import { brand, DEFAULT_LOCALE } from '@/lib/brand.config';
import { getDictionary, href } from '@/lib/i18n';
import SiteHeader from '@/components/SiteHeader';
import BillingStrip from '@/components/BillingStrip';
import SiteFooter from '@/components/SiteFooter';
import PageHead, { Panel, PanelGrid } from '@/components/PageHead';

// =============================================================================
// A real 404, not Next's system-font default.
//
// Reviewers land on 404s — from an old ad URL, a stale link, a typo — and the
// stock page carries no header, no navigation, no support address and no legal
// entity. That reads as an abandoned site at exactly the moment someone is
// checking whether the business is real. This one carries the full chrome, so a
// wrong URL still shows who operates the service and how to reach them.
//
// Next marks this route noindex automatically. That is correct for an error page
// and is the one place the directive appears in the build — it hides nothing
// from anyone, since there is no content here to hide.
// =============================================================================

export default function NotFound() {
  const lang = DEFAULT_LOCALE;
  const t = getDictionary(lang);
  const es = lang === 'es';

  return (
    <>
      <SiteHeader lang={lang} />
      <BillingStrip lang={lang} />

      <main>
        <PageHead
          title={es ? 'Página no encontrada' : 'Page not found'}
          intro={
            es
              ? 'El enlace que seguiste no existe o cambió de dirección. Desde aquí puedes volver al catálogo o escribirnos.'
              : 'The link you followed does not exist, or it moved. From here you can get back to the catalogue or write to us.'
          }
        />

        <PanelGrid>
          <Panel title={es ? 'Catálogo de juegos' : 'Game catalogue'}>
            <p>
              <Link href={href(lang, 'games')}>
                {es ? 'Ver todos los juegos' : 'Browse all the games'}
              </Link>
            </p>
          </Panel>

          <Panel title={t.video.title}>
            <p>
              <Link href={href(lang, 'videos')}>
                {es ? 'Ver los videos 360°' : 'Browse the 360° videos'}
              </Link>
            </p>
          </Panel>

          <Panel title={es ? 'Ayuda' : 'Help'}>
            <p>
              <a href={`mailto:${brand.support.email}`}>{brand.support.email}</a>
            </p>
            <p>
              <Link href={href(lang, 'unsubscribeRefund')}>
                {es ? 'Cancelación y reembolso' : 'Unsubscribe & refund'}
              </Link>
            </p>
          </Panel>
        </PanelGrid>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
