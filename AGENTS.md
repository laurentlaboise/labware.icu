# Labware landing repository rules

- Work on feature branches; publish through draft pull requests.
- Preserve the boundary between `labware.icu` and `app.labware.icu`.
- Never add application secrets, databases, auth forms, API proxies, or shared cookies.
- Treat pricing, plan limits, agent counts, workflow counts, and skill counts as verified product facts with regression tests.
- Qualify workflows as simulated and approval-gated until production evidence changes.
- Do not invent testimonials, customer counts, results, providers, legal facts, certifications, or guarantees.
- Keep legal links canonical to the application and retain the draft/non-effective notice.
- Run `npm run check` and responsive browser QA before publishing.
- Do not change production DNS without explicit authorization.
