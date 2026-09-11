import type { Metadata } from 'next';
import Landing from '@/components/lp/Landing';
import { captureTracking } from '../page';

// The English rendering of the landing page, at a REAL path (/xkh55/en/) rather
// than a ?lang= parameter — see components/lp/Landing.tsx for why. The Spanish
// route at /xkh55 is the ad destination and is unaffected by this file.

export const metadata: Metadata = {
  title: 'Subscribe and play',
  description:
    'Activate your BeyondVR subscription with your Entel number and play in the browser. Price, renewal and cancellation are visible before you subscribe.',
};

export default async function LandingPageEn({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <Landing lang="en" tracking={captureTracking(await searchParams)} />;
}
