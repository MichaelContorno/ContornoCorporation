import assert from "node:assert/strict";
import test from "node:test";

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
