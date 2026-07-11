import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
const [english, lao, css, js, vercel, sitemap, robots] = await Promise.all([
  read("public/en/index.html"),
  read("public/lo/index.html"),
  read("public/assets/site.css"),
  read("public/assets/site.js"),
  read("vercel.json"),
  read("public/sitemap.xml"),
  read("public/robots.txt")
]);

test("ships complete English and Lao locale routes", () => {
  assert.match(english, /<html lang="en"/);
  assert.match(lao, /<html lang="lo"/);
  for (const page of [english, lao]) {
    assert.match(page, /rel="canonical"/);
    assert.match(page, /hreflang="en"/);
    assert.match(page, /hreflang="lo"/);
    assert.match(page, /hreflang="x-default"/);
    assert.equal((page.match(/<h1\b/g) || []).length, 1);
    assert.match(page, /class="skip-link"/);
    assert.match(page, /prefers-reduced-motion|site\.css/);
    assert.match(page, /site\.css\?v=20260712b/);
    assert.match(page, /site\.js\?v=20260712b/);
  }
  assert.match(lao, /ສະບັບພາສາລາວແບບທົດລອງ/);
});

test("public pricing exactly matches the approved acquisition tiers", () => {
  const facts = [
    ["Free", "$0", "8 AI colleagues", "50 messages per day"],
    ["Starter", "$19", "16 AI colleagues", "250 messages per day"],
    ["Pro", "$79", "33 AI colleagues", "1,000 messages per day"],
    ["Agency", "$249", "64 AI colleagues", "5,000 messages per day"],
    ["Enterprise", "Custom", "Custom usage limits"]
  ];
  for (const group of facts) for (const value of group) assert.ok(english.includes(value), "missing pricing fact: " + value);
  assert.doesNotMatch(english, /Tower \(legacy\)|Starter \(legacy|Pro \(legacy|God Mode|Most popular/i);
  assert.match(english, /Recommended/);
  assert.match(english, /approval-gated workflow simulation/);
});

test("claims remain truthful about providers, workflows, and evidence", () => {
  assert.match(english, /Current runs are simulated and approval-gated/i);
  assert.match(english, /does not promise a particular provider or model/i);
  assert.match(english, /not invented praise/i);
  assert.doesNotMatch(english, /powered by (Claude|OpenAI|Gemini)|real brains|autonomous employees|most popular|trusted by \d+/i);
  assert.doesNotMatch(english, /GDPR compliant|certified|guaranteed uptime|money-back guarantee/i);
  assert.doesNotMatch(english, /wordsthatsells|Tax ID|Registration ID/i);
});

test("all account and demo links stay on the approved application boundary", () => {
  for (const page of [english, lao]) {
    const appUrls = [...page.matchAll(/href="(https:\/\/app\.labware\.icu[^\"]*)"/g)].map((match) => match[1]);
    assert.ok(appUrls.length >= 10);
    assert.ok(appUrls.every((url) => url === "https://app.labware.icu/" || url === "https://app.labware.icu/login" || url === "https://app.labware.icu/login?mode=register" || url.startsWith("https://app.labware.icu/legal/")));
    assert.match(page, /href="https:\/\/app\.labware\.icu\/login\?mode=register"[^>]*>(?:<[^>]+>)*[^<]*(?:Create|ເລີ່ມ|ສ້າງ)/i);
    assert.doesNotMatch(page, /fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
  }
});

test("six authoritative legal drafts are linked and visibly non-effective", () => {
  for (const slug of ["terms", "privacy", "cookies", "refunds", "ai-disclosure", "dpa"]) {
    assert.ok(english.includes("https://app.labware.icu/legal/" + slug), "missing legal link: " + slug);
  }
  assert.match(english, /drafts pending counsel review and are not yet effective/i);
  assert.match(lao, /ຍັງບໍ່ມີຜົນບັງຄັບໃຊ້/);
});

test("brand assets are complete and local", async () => {
  const assets = await readdir(new URL("../public/assets/brand", import.meta.url));
  for (const file of ["labware-mark.svg", "labware-wordmark.svg", "labware-lockup-dark.svg", "labware-lockup-light.svg", "labware-agent-badge.svg", "labware-social-card.png"]) {
    assert.ok(assets.includes(file), "missing brand asset: " + file);
  }
  const socialCard = await readFile(new URL("../public/assets/brand/labware-social-card.png", import.meta.url));
  assert.equal(socialCard.readUInt32BE(16), 1200);
  assert.equal(socialCard.readUInt32BE(20), 630);
  for (const page of [english, lao]) {
    assert.match(page, /og:image" content="https:\/\/www\.labware\.icu\/assets\/brand\/labware-social-card\.png"/);
    assert.match(page, /og:image:width" content="1200"/);
    assert.match(page, /og:image:height" content="630"/);
  }
  assert.doesNotMatch(english + lao + css, /wordsthatsells\.website|fonts\.googleapis|googletagmanager|cdn\./i);
});

test("security headers deny third-party execution and framing", () => {
  for (const directive of ["default-src 'self'", "script-src 'self'", "connect-src 'none'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) {
    assert.ok(vercel.includes(directive), "missing CSP directive: " + directive);
  }
  for (const header of ["Strict-Transport-Security", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Cross-Origin-Opener-Policy"]) {
    assert.ok(vercel.includes(header), "missing security header: " + header);
  }
  assert.doesNotMatch(vercel, /unsafe-inline|unsafe-eval/i);
});

test("source contains no application secret names or client data integration", () => {
  const source = english + lao + css + js + vercel;
  for (const forbidden of ["SESSION_SECRET", "OFFICE_KEY", "BRIDGE_INGRESS_SECRET", "BRIDGE_RUNNER_TOKEN", "UPSTASH_REDIS_REST_TOKEN", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "ANTHROPIC_API_KEY", "OPENROUTER_API_KEY"]) {
    assert.ok(!source.includes(forbidden), "secret name leaked: " + forbidden);
  }
  assert.doesNotMatch(source, /\/api\/(admin|health|billing|workflows|bridge|agents)/);
});

test("responsive, motion, sitemap, and robots contracts are present", () => {
  for (const width of ["1080px", "760px", "480px"]) assert.ok(css.includes(width));
  assert.match(css, /@media \(max-width: 1080px\)[\s\S]*?\.menu-toggle \{ display: grid; \}/);
  assert.match(css, /\.card \{[\s\S]*?color: var\(--ink\)/);
  assert.match(css, /box-shadow: 0 0 0 6px var\(--ink\) !important/);
  assert.match(js, /matchMedia\("\(max-width: 1080px\)"\)/);
  assert.match(js, /addEventListener\("change", resetMenuForViewport\)/);
  assert.match(js, /addEventListener\("resize"/);
  assert.match(js, /new ResizeObserver/);
  assert.match(css, /body\.menu-open \{ overflow-x: hidden; \}/);
  assert.doesNotMatch(css, /body\.menu-open \{ overflow: hidden; \}/);
  assert.match(english, /class="artifact-status">Human review/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /forced-colors: active/);
  assert.match(sitemap, /https:\/\/www\.labware\.icu\/en/);
  assert.match(sitemap, /https:\/\/www\.labware\.icu\/lo/);
  assert.match(robots, /Sitemap: https:\/\/www\.labware\.icu\/sitemap\.xml/);
  assert.doesNotMatch(english + lao + sitemap + robots, /https:\/\/labware\.icu/);
  assert.match(vercel, /"source": "\/", "destination": "\/en", "permanent": true/);
  assert.doesNotMatch(vercel, /immutable/);
});

test("Lao beta discloses localization limits and preserves pricing parity", () => {
  assert.match(lao, /ສະບັບຫຍໍ້/);
  assert.match(lao, /ເອກະສານກົດໝາຍ[^<]*ພາສາອັງກິດ/);
  assert.ok((lao.match(/10 ທັກສະທີ່ລູກຄ້ານຳໃຊ້ໄດ້/g) || []).length >= 2);
  assert.ok((lao.match(/\(English\)/g) || []).length >= 7);
});
