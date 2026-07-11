# Labware public website

Static, multilingual marketing website for `labware.icu`. The product application remains isolated at `app.labware.icu`.

## Local verification

```sh
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/en` or `/lo`.

## Architecture

- Zero runtime dependencies.
- Static English and Lao locale pages.
- Local Labware SVG assets.
- No application API, database, session, billing, provider, analytics, or secret access.
- All authentication and billing navigation ends at `https://app.labware.icu`.
- Strict headers are defined in `vercel.json`.

## Content maintenance

- Public plan facts: update both locale pages and `tests/site.test.mjs` from the application tier source.
- Product counts: verify against the application configuration before changing.
- Workflows: describe current execution as simulated and approval-gated until independently verified otherwise.
- Providers: never name a provider as active without current production evidence.
- Lao: keep the beta notice until a fluent human has reviewed and approved the entire locale.
- Testimonials: add none without a source record and written permission.
- Legal: link to the application’s authoritative draft routes; do not fork legal identity or policy text.

## Deployment runbook

1. Create a dedicated GitHub repository named `labware.icu`.
2. Push a feature branch and open a draft pull request.
3. Connect the repository to a dedicated Vercel project.
4. Set Framework Preset to `Other`, Build Command to `npm run build`, and Output Directory to `dist` if Vercel does not read `vercel.json` automatically.
5. Verify the preview build, security headers, responsive layouts, locale routes, legal links, and CTAs.
6. Merge after review.
7. Add `labware.icu` and `www.labware.icu` to the landing Vercel project. Keep `www.labware.icu` as the primary production host and permanently redirect the apex to `www` so it matches canonical, Open Graph, robots, and sitemap URLs.
8. Follow Vercel’s displayed DNS records at the domain provider. Do not alter the existing `app.labware.icu` record.
9. Confirm HTTPS, root redirect to `/en`, `/lo`, login/demo/legal links, and the app subdomain.
10. Roll back by promoting the preceding successful Vercel deployment or restoring the previous apex DNS record.

## Legal status

Labware legal documents remain drafts pending counsel review and are not yet effective.
