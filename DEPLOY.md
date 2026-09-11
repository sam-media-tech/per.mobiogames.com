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

```
Build command:  npm run build
Output dir:     .next          <- NOT `out`. There is no static export.
Node:           20, 22 or 24
```

## Environment variables

Ahmad will send these separately. Set them in the hosting console
(Amplify: App settings -> Environment variables), not in a file in the repo.

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
