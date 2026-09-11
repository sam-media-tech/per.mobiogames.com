import { NextRequest, NextResponse } from 'next/server';
import { brand } from '@/lib/brand.config';
import { tallyman } from '@/lib/integrations';

// =============================================================================
// /api/account/access-link — "send me my access link".
//
// WHY THIS SHAPE, and not a status lookup:
// Tallyman's check-subscription is keyed on rockman_id, the per-visit session
// key — there is no supported way to ask "is THIS number subscribed?" (see
// ouisys-engine/src/sharedApi/checkSubscription.ts). So the page does not claim
// to answer that. It takes a contact point and requests the access link.
//
// It also answers identically whether or not a subscription exists. That is
// deliberate: telling a stranger which phone numbers are subscribed would leak
// subscriber data to anyone who can type digits.
//
// ⚠️ NOT YET WIRED TO A SENDER. There is no delivery endpoint for the link, so
// this route accepts and validates the request and reports `delivered: false`.
// The UI reads that flag and says plainly that nothing was sent — it must never
// claim a message went out that did not. Wire a real sender, flip the flag.
// =============================================================================

const PE_MOBILE = /^9\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  let body: { contact?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const raw = (body.contact ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  const isEmail = raw.includes('@');

  if (isEmail ? !EMAIL.test(raw) : !PE_MOBILE.test(digits.replace(/^51/, ''))) {
    return NextResponse.json({ ok: false, error: 'invalid_contact' }, { status: 400 });
  }

  const channel = isEmail ? 'email' : 'sms';
  const masked = isEmail
    ? raw.replace(/^(.).*(@.*)$/, (_m, a, b) => `${a}•••${b}`)
    : `${brand.billing.countryCode} •••••${digits.slice(-3)}`;

  return NextResponse.json({
    ok: true,
    channel,
    masked,
    // Honest about the current state of the world.
    delivered: false,
    backendConfigured: tallyman.enabled,
    support: brand.support.email,
  });
}
