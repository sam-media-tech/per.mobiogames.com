import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/brand.config';
import { isLocale } from '@/lib/i18n';
import SiteHeader from '@/components/SiteHeader';
import BillingStrip from '@/components/BillingStrip';
import SiteFooter from '@/components/SiteFooter';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  return (
    <>
      <SiteHeader lang={locale} />
      <BillingStrip lang={locale} />
      {/* <html lang> is set once in the root layout, to the DEFAULT locale —
          a nested layout cannot change it, and making the root layout read the
          request would cost every page its static prerender. So each region
          that carries text declares its own language instead: the header, the
          billing strip and the footer do it themselves, and <main> does it here.
          On /en/ pages that is the difference between "Spanish page with English
          content" and a page a screen reader pronounces correctly. */}
      <main lang={locale}>{children}</main>
      <SiteFooter lang={locale} />
    </>
  );
}
