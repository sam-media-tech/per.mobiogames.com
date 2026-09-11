import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { brand } from '@/lib/brand.config';
import { tallyman } from '@/lib/integrations';

// =============================================================================
// /api/tallyman — server-side proxy to the real Tallyman PIN flow.
//
// The parameter shapes below are taken from the engine source, not guessed:
//   ouisys-engine/src/flows/pinFlow/api.ts     → trigger-pin, verify-pin, mcp-shield
//   ouisys-engine/src/flows/pinFlow/main.ts    → the call order and what feeds it
//   ouisys-engine/src/sharedApi/checkSubscription.ts
// and the identifiers from the suspended page's own config:
//   video-beyondvr-gent7251-email/config.json  → slug, device, country, service
//   the live page's window.pac_analytics       → offer: 1, cid: 13822
//
// THREE THINGS OUISYS USED TO PROVIDE, AND WHAT WE DO INSTEAD
//
// 1. rockman_id — the session key threading the whole flow. ouisys-server-2 minted
//    it per page view as `newRockmanId() = uuidv1().replaceAll('-','')` and reported
//    an impression to Pacman with it. We mint the same SHAPE here (32 lowercase hex,
//    no dashes) but nothing registers it with Pacman, because Pacman is the shared
//    fingerprint we are removing. ⚠️ Whether Tallyman accepts an id it has not seen
//    from Pacman is THE open question — it is what the first controlled test must
//    answer, and it is why this route ships in mock mode.
//
// 2. offer — was `window.pac_analytics.visitor.offer`, i.e. the campaign's affiliate
//    offerId. Read off the live page: 1. Now a constant in brand.config.
//
// 3. mcp-shield — the engine calls this at PAGE LOAD, separately from submit, and
//    injects the antifraud script it returns. Server-side we cannot execute that
//    script, and the engine itself treats a shield failure as non-fatal (it warns
//    and carries on). So we skip it and pass no mcpUniqid. If the carrier later
//    requires the shield, it belongs in the browser next to Evina, not here.
//
// ⚠️ LIVE: with TALLYMAN_BASE_URL set, `submit` sends a REAL SMS to an Entel line
// and `verify` makes a REAL charge. Test only with a number you control.
// =============================================================================

type Action = 'submit' | 'verify';

const HOST = () => tallyman.baseUrl.replace(/\/$/, '');

// Same shape ouisys-server-2 produced: a UUID with the dashes stripped.
const newRockmanId = () => randomUUID().replaceAll('-', '');

// Tallyman wants the international MSISDN, digits only — "51987654321", never
// "+51 987 654 321" and never the bare national number.
function toInternational(raw: string): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  const cc = brand.billing.countryCode.replace(/\D/g, '');
  return digits.startsWith(cc) ? digits : `${cc}${digits}`;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for') ?? '';
  return fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || '';
}

function base(action: string): Record<string, string> {
  return {
    action,
    country: brand.billing.country,
    slug: brand.billing.slug,
    device: brand.billing.device,
    offerId: brand.billing.offerId,
  };
}

async function call(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, String(v));
  }
  const res = await fetch(`${HOST()}/tallyman/v1/?${usp.toString()}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store',
  });
  return res.json().catch(() => ({}));
}

export async function POST(req: NextRequest) {
  let body: {
    action?: Action;
    msisdn?: string;
    pin?: string;
    rockman_id?: string;
    page?: string;
    antifraud?: string;
    tracking?: Record<string, string>;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const { action, msisdn, pin, page, antifraud, tracking } = body;
  if (action !== 'submit' && action !== 'verify') {
    return NextResponse.json({ ok: false, error: 'invalid_action' }, { status: 400 });
  }

  // Mock mode — no TALLYMAN_BASE_URL configured. Says so plainly rather than
  // pretending a subscription happened.
  if (!tallyman.enabled) {
    // `ok: true` only means the request was well-formed. Nothing was sent and
    // nothing was created, so the state must not read "subscribed" — the UI
    // branches on `live` and says so, and the API should not contradict it.
    return NextResponse.json({
      ok: true,
      mock: true,
      live: false,
      rockman_id: 'mock-rockman',
      state: action === 'submit' ? 'not-sent' : 'not-subscribed',
      note: 'TALLYMAN_BASE_URL is not set — no SMS was sent and no subscription was created.',
    });
  }

  try {
    if (action === 'submit') {
      const rockman_id = newRockmanId();

      const res = await call({
        ...base('trigger-pin'),
        rockman_id,
        msisdn: toInternational(msisdn ?? ''),
        page: page ? encodeURIComponent(page) : undefined,
        sam_evina_tid: antifraud,
        ip_address: clientIp(req),
        // Campaign attribution, captured server-side on the LP and passed straight
        // through — never used to decide what the page renders.
        ...tracking,
      });

      // The session key goes back to the browser so `verify` can send the same one.
      return NextResponse.json({ ok: res?.success === true, rockman_id, ...res });
    }

    const res = await call({
      ...base('verify-pin'),
      rockman_id: body.rockman_id,
      pin: (pin ?? '').replace(/\D/g, ''),
      page: page ? encodeURIComponent(page) : undefined,
      sam_evina_tid: antifraud,
    });

    return NextResponse.json({ ok: res?.success === true, ...res });
  } catch {
    return NextResponse.json({ ok: false, error: 'tallyman_unreachable' }, { status: 502 });
  }
}
