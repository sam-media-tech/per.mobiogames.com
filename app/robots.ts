import type { MetadataRoute } from 'next';
import { brand } from '@/lib/brand.config';

// Everything is indexable. The robots directive that the live Ouisys landing page
// carries on the ad destination — and on nothing else — is a cloaking signal under
// the Circumventing Systems policy. Removing it is one of the points of this rebuild,
// so the literal token appears nowhere in this codebase.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `https://${brand.domain}/sitemap.xml`,
  };
}
