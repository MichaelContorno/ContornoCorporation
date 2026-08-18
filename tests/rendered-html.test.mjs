import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const port = 31_000 + Math.floor(Math.random() * 1_000);
const origin = `http://127.0.0.1:${port}`;
let server;
let serverOutput = "";

async function waitForServer() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/`);
      if (response.ok) return;
    } catch {
      // The process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`The production server did not start.\n${serverOutput}`);
}

before(async () => {
  server = spawn(process.execPath, [".next/standalone/server.js"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      APP_ORIGIN: origin,
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });
  await waitForServer();
});

after(() => {
  if (server && !server.killed) server.kill("SIGTERM");
});

async function render(pathname) {
  return fetch(`${origin}${pathname}`, { redirect: "manual" });
}

test("server-renders the branded homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>The Contorno Corporation<\/title>/i);
  assert.match(html, /contorno-homepage\.png/);
  assert.match(html, /Start your confidential case review/);
  assert.match(html, /Contact The Contorno Corporation/);
  assert.match(html, /Private Investigations/);
  assert.match(html, /Ratchet Bail Bonds/);
  assert.match(html, />Community Association Management</);
  assert.match(html, />Attorney Case Intake</);
  assert.match(html, /About Us/);
  assert.match(html, /Media Gallery/);
  assert.match(html, /Q&amp;A/);
  assert.match(html, /Request a consultation/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders detailed branded service routes", async () => {
  const investigation = await render("/services/investigations");
  assert.equal(investigation.status, 200);
  const investigationHtml = await investigation.text();
  assert.match(investigationHtml, /Private investigations built for the defense/);
  assert.match(investigationHtml, /Case-file analysis/);
  assert.match(investigationHtml, /Defense-ready reporting/);

  const bonds = await render("/services/bail-bonds");
  assert.equal(bonds.status, 200);
  const bondsHtml = await bonds.text();
  assert.match(bondsHtml, /Coming soon/);
  assert.match(bondsHtml, /not currently accepting or posting bonds/i);
  assert.match(bondsHtml, /href="\/contact\?service=bail-bonds"/);

  const community = await render("/services/community-management");
  assert.equal(community.status, 200);
  const communityHtml = await community.text();
  assert.match(communityHtml, /href="\/contact\?service=community-management"/);
});

test("server-renders About Us and Questions & Answers routes", async () => {
  const about = await render("/about");
  assert.equal(about.status, 200);
  const aboutHtml = await about.text();
  assert.match(aboutHtml, /Focused services\. One standard of accountability\./);
  assert.match(aboutHtml, /Three distinct service lines/);

  const faq = await render("/faq");
  assert.equal(faq.status, 200);
  const faqHtml = await faq.text();
  assert.match(faqHtml, /Clear answers before you get started/);
  assert.match(faqHtml, /What does The Contorno Corporation do\?/);
  assert.match(faqHtml, /application\/ld\+json/);
});

test("server-renders Services and the Media Gallery", async () => {
  const services = await render("/services");
  assert.equal(services.status, 200);
  const servicesHtml = await services.text();
  assert.match(servicesHtml, /One organization\. Three distinct lines of service\./);
  assert.match(servicesHtml, /href="\/services\/investigations"/);
  assert.match(servicesHtml, /href="\/services\/bail-bonds"/);
  assert.match(servicesHtml, /href="\/services\/community-management"/);

  const gallery = await render("/media-gallery");
  assert.equal(gallery.status, 200);
  const galleryHtml = await gallery.text();
  assert.match(galleryHtml, /The visual world of The Contorno Corporation/);
  assert.match(galleryHtml, /Official visual library/);
  assert.match(galleryHtml, /og\.png/);
});

test("server-renders the structured attorney intake workflow", async () => {
  const response = await render("/attorney-intake");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Attorney case intake/);
  assert.match(html, /Conflict-screening information/);
  assert.match(html, /Requested services/);
  assert.match(html, /Investigative objective/);
  assert.match(html, /does not create a professional engagement/i);
  assert.doesNotMatch(html, /type="file"/i);

  const investigation = await render("/services/investigations");
  const investigationHtml = await investigation.text();
  assert.match(investigationHtml, /href="\/attorney-intake"/);
  assert.match(investigationHtml, /Start attorney case intake/);
});

test("keeps service, contact, and policy links discoverable", async () => {
  const contact = await render("/contact");
  assert.equal(contact.status, 200);
  const contactHtml = await contact.text();
  assert.match(contactHtml, /href="\/privacy"/);
  assert.match(contactHtml, /href="\/terms"/);

  const about = await render("/about");
  const aboutHtml = await about.text();
  assert.match(aboutHtml, /aria-label="Service links"/);
  assert.match(aboutHtml, /href="\/services\/investigations"/);
  assert.match(aboutHtml, /href="\/services\/bail-bonds"/);
  assert.match(aboutHtml, /href="\/services\/community-management"/);
  assert.match(aboutHtml, /href="\/contact"/);
});

test("publishes a public sitemap while keeping private routes out of search", async () => {
  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const sitemapXml = await sitemap.text();
  assert.match(sitemapXml, /https:\/\/contornocorporation\.com\/services\/investigations/);
  assert.doesNotMatch(sitemapXml, /\/admin|\/api\//);

  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  const robotsText = await robots.text();
  assert.match(robotsText, /Disallow: \/api\//);
  assert.doesNotMatch(robotsText, /Disallow: \/admin/);
  assert.match(robotsText, /Sitemap: https:\/\/contornocorporation\.com\/sitemap\.xml/);

  const confirmation = await render("/updates/confirm");
  assert.equal(confirmation.status, 200);
  const confirmationHtml = await confirmation.text();
  assert.match(confirmationHtml, /opening this page does not subscribe you/i);
  assert.match(confirmationHtml, /name="robots" content="noindex, nofollow, nocache"/i);
  assert.match(confirmationHtml, /name="referrer" content="no-referrer"/i);
});

test("every public internal link resolves without carrying over legacy vendor promotions", async () => {
  const entryRoutes = [
    "/",
    "/about",
    "/services",
    "/media-gallery",
    "/attorney-intake",
    "/contact",
    "/faq",
    "/privacy",
    "/services/bail-bonds",
    "/services/community-management",
    "/services/investigations",
    "/terms",
  ];
  const discovered = new Set();

  for (const pathname of entryRoutes) {
    const response = await render(pathname);
    assert.equal(response.status, 200, `${pathname} should render successfully`);
    const html = await response.text();
    assert.doesNotMatch(html, /(?:ms\.)?godaddy\.com|website-builder\?isc=pwugc/i);
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const href = match[1].replaceAll("&amp;", "&");
      if (href.startsWith("/") && !href.startsWith("/admin") && !href.startsWith("/api/")) {
        discovered.add(new URL(href, origin).pathname);
      }
    }
  }

  for (const pathname of discovered) {
    const response = await render(pathname);
    assert.equal(response.status, 200, `linked route ${pathname} should render successfully`);
  }
});

test("keeps the standalone Railway build and secure admin login available", async () => {
  const login = await render("/admin/login");
  assert.equal(login.status, 200);
  const loginHtml = await login.text();
  assert.match(loginHtml, /Continue with GitHub/);

  const health = await render("/api/health");
  assert.equal(health.status, 503, "health should fail closed before a database is configured");

  const packageJson = readFileSync(`${projectRoot}/package.json`, "utf8");
  assert.match(packageJson, /"next"/);
  assert.doesNotMatch(packageJson, /"vinext"|"wrangler"|"@openai\/sites-vite-plugin"/);

  const railwayConfig = JSON.parse(readFileSync(`${projectRoot}/railway.json`, "utf8"));
  assert.equal(railwayConfig.deploy.healthcheckPath, "/api/health");
  assert.deepEqual(railwayConfig.deploy.preDeployCommand, ["pnpm run db:migrate"]);

  const migration = readFileSync(`${projectRoot}/scripts/migrate-postgres.mjs`, "utf8");
  assert.match(migration, /created_at BIGINT/);
  assert.match(migration, /app_schema_state/);
});
