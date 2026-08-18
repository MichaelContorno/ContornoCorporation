import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

function applyMigration(database, name) {
  const sql = readFileSync(`${projectRoot}/drizzle/${name}`, "utf8").replaceAll("--> statement-breakpoint", "");
  database.exec(sql);
}

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
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
        discovered.add(new URL(href, "http://localhost").pathname);
      }
    }
  }

  for (const pathname of discovered) {
    const response = await render(pathname);
    assert.equal(response.status, 200, `linked route ${pathname} should render successfully`);
  }
});

test("database migrations preserve subscriber state and install the required schema gate", () => {
  const database = new DatabaseSync(":memory:");
  applyMigration(database, "0000_narrow_ironclad.sql");
  applyMigration(database, "0001_empty_wolf_cub.sql");
  applyMigration(database, "0002_glossy_kang.sql");
  database.exec(`INSERT INTO subscribers (
    id, created_at, updated_at, first_name, email, active,
    consent_version, consented_at, source, client_hash, unsubscribed_at
  ) VALUES
    ('active', 1, 2, 'A', 'active@example.test', 1, 'legacy', 2, 'test', 'a', NULL),
    ('pending', 1, 2, 'P', 'pending@example.test', 0, 'legacy', 2, 'test', 'p', NULL),
    ('stopped', 1, 2, 'S', 'stopped@example.test', 0, 'legacy', 2, 'test', 's', 3)`);
  applyMigration(database, "0003_previous_aqueduct.sql");
  applyMigration(database, "0004_black_captain_universe.sql");

  assert.deepEqual(
    database.prepare("SELECT id, status FROM subscribers ORDER BY id").all().map((row) => ({ ...row })),
    [
      { id: "active", status: "active" },
      { id: "pending", status: "pending" },
      { id: "stopped", status: "unsubscribed" },
    ],
  );
  assert.equal(database.prepare("SELECT version FROM app_schema_state WHERE id = 1").get().version, 4);
  assert.ok(database.prepare("PRAGMA table_info(subscribers)").all().some((column) => column.name === "confirmation_token_hash"));
  assert.equal(database.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  database.close();
});
