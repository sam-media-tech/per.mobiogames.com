# per.mobiogames.com — deploy notes

This folder is the Next.js app for **per.mobiogames.com** (the product is BeyondVR).

**Deploy it exactly the way `elitegosu.com` is deployed.** That site runs the same
Next.js version (16.2.9) in production and works correctly — SSR, middleware and API
routes all live. Same setup here and we're done.

## It must run as a Next.js SERVER app, not a static export

Last time on Amplify, auto-detect served it in static mode. That silently breaks three
things, and the site still *looks* fine:

- `/api/tallyman` — the carrier billing endpoint. Without it nobody can subscribe.
- `middleware.ts` — the URL policy. Without it `/xkh55` stops resolving the way the
  ads expect, and the Google Ads account is suspended so that URL cannot change.
- the campaign parameters the landing page captures server-side

If Amplify's auto-detect gives trouble again, don't fight it — whatever was done for
elitegosu.com is the known-good path.

## Build settings

These now live in `amplify.yml` at the repo root, which Amplify uses in preference to
the build settings stored in the console. Edit the file, not the console, or your change
will be ignored.

```
Build command:  npm run build
Output dir:     .next          <- NOT `out`. There is no static export.
Node:           20, 22 or 24
```

## Environment variables

Ahmad will send the values separately. Set them in the hosting console
(Amplify: App settings -> Environment variables), not in a file in the repo.

**Setting them in the console is necessary but NOT sufficient on Amplify.** Amplify
injects console variables into the *build shell* only. Next.js server code — the
`/api/tallyman` route and `middleware.ts` — runs afterwards in a separate compute
runtime that does not inherit them, and AWS does this deliberately so build-time
secrets can't leak into the runtime. The build goes green and `TALLYMAN_BASE_URL` is
still empty when a request arrives, so the subscribe form silently stays in mock mode.

`amplify.yml` in the repo root is what closes that gap: it copies the variables into
`.env.production` before `next build`, which Next reads at build time *and* at runtime.
If you add a new variable, add its name to the `grep` in `amplify.yml` too — otherwise
it will not reach the server, no matter what the console says.

Variables this app reads:

| Variable | Reaches | Notes |
|---|---|---|
| `TALLYMAN_BASE_URL` | server, at runtime | Billing host. Empty = mock mode. |
| `NEXT_PUBLIC_EVINA_SCRIPT_URL` | browser, inlined at build | Antifraud script. |
| `NEXT_PUBLIC_EVINA_MERCHANT_ID` | browser, inlined at build | Antifraud merchant id. |
| `NEXT_PUBLIC_DEMO_MODE` | browser, inlined at build | **Do not set in production.** Turns off image optimisation and puts the access-link form in demo mode. It is for static preview builds only. |

Anything prefixed `NEXT_PUBLIC_` is readable by anyone in the browser, so never put a
credential behind that prefix.

Until `TALLYMAN_BASE_URL` is set, the subscribe form deliberately creates nothing and
says so on screen — it will not claim a subscription was made. That is intended.

## After deploying, run these four and send the results

```bash
# 1 - the ad destination. 200, and NO redirect.
curl -I https://per.mobiogames.com/xkh55

# 2 - portfolio URLs keep their trailing slash.
curl -I https://per.mobiogames.com/es/pricing        # expect 308 -> /es/pricing/

# 3 - proves SSR rather than static. Must return a header.
curl -sI https://per.mobiogames.com/es/ | grep -i x-nextjs

# 4 - proves the API route exists. Must return JSON, not 404.
curl -X POST https://per.mobiogames.com/api/tallyman \
     -H 'content-type: application/json' -d '{"action":"submit"}'
```

If **3** returns nothing or **4** returns 404, it has deployed static and we are back
to the July problem — stop there and tell Ahmad rather than adjusting the app.
