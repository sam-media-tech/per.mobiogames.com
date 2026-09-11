import type { Metadata } from 'next';
import { Poppins, Plus_Jakarta_Sans } from 'next/font/google';
import { brand, DEFAULT_LOCALE } from '@/lib/brand.config';
import { GtmHead, GtmBody } from '@/components/Gtm';
import './globals.css';

// Type pairing chosen so it collides with none of the sibling SAM sites.
const display = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${brand.domain}`),
  // The site-wide fallback, in the DEFAULT locale. Every page under [lang]/
  // sets its own localised title and description, so this is what shows only
  // where a page sets none — it must not be the wrong language for the market.
  title: {
    default: `${brand.name} | Juegos móviles por suscripción`,
    template: `%s · ${brand.name}`,
  },
  description:
    'Juegos HTML5 por suscripción, para jugar en el navegador de tu celular. Precio, renovación y cancelación siempre a la vista.',
  icons: { icon: '/images/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <GtmHead />
      </head>
      <body>
        <GtmBody />
        {children}
      </body>
    </html>
  );
}
