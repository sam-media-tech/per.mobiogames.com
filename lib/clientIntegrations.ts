// Client-side integration helpers:
//  - Evina (carrier-required antifraud) — loads from Evina's CDN when configured.
//  - trackEvent — pushes conversion events into YOUR OWN GTM dataLayer (replaces Pacman).
// All no-op gracefully when not configured, so the flow works in dev.

import { evina } from './integrations';

const loaded = new Set<string>();

function loadScript(src: string): Promise<void> {
  if (typeof document === 'undefined' || !src) return Promise.resolve();
  if (loaded.has(src)) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => { loaded.add(src); resolve(); };
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

// ---- Evina / DCBprotect (carrier-required antifraud) ----
export async function initEvina(): Promise<void> {
  if (!evina.enabled) return;
  await loadScript(evina.scriptUrl);
}

// Returns the antifraud token to send with the Tallyman call. Empty in mock mode.
export async function getAntifraudToken(): Promise<string> {
  if (!evina.enabled || typeof window === 'undefined') return '';
  const w = window as unknown as { DCBProtect?: { getToken?: () => string | Promise<string> } };
  try {
    if (w.DCBProtect?.getToken) return await w.DCBProtect.getToken();
  } catch { /* fall through */ }
  return '';
}

// ---- Conversion tracking via YOUR OWN GTM (dataLayer) — the clean Pacman replacement ----
// Fires an event into the GTM dataLayer; set up the tag/trigger inside your GTM container.
// No-op if GTM isn't loaded. NO shared fingerprint, no pacman.
export function trackEvent(event: string, data: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
  try {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...data });
  } catch { /* ignore */ }
}
