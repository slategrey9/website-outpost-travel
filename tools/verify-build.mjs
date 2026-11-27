// npm run verify  (after npx @11ty/eleventy)
// Proves the Eleventy build ships the existing site unchanged:
//   1. every git-tracked file that should be copied through is in _site/
//      and byte-identical to the repo (sha256), and lists which of those
//      differ from the last commit (the deliberate head edits)
//   2. _redirects, _headers and the Netlify form markup are intact
//   3. robots.txt, sitemap.xml, llms.txt are valid and say what they should
//   4. the homepage JSON-LD matches src/_data/site.yaml
import fs from "node:fs";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import yaml from "js-yaml";

let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) fails++; };
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

// 1. Checksums ---------------------------------------------------------------
const COPY_FILES = ["index.html", "about.html", "faq.html", "privacy.html", "start-planning.html", "thanks.html", "404.html", "favicon.svg", "_redirects"];
const COPY_DIRS = ["assets/", "images/", "itineraries/", "presentations/", "journal/"];
const tracked = execSync("git ls-files", { encoding: "utf8", maxBuffer: 64 << 20 }).split("\n").filter(Boolean);
const shouldCopy = tracked.filter((f) => COPY_FILES.includes(f) || COPY_DIRS.some((d) => f.startsWith(d)));
let same = 0; const missing = [], differ = [];
for (const f of shouldCopy) {
  const out = `_site/${f}`;
  if (!fs.existsSync(out)) { missing.push(f); continue; }
  if (sha(f) === sha(out)) same++; else differ.push(f);
}
ok(missing.length === 0, `all ${shouldCopy.length} tracked copy-through files present in _site${missing.length ? ": missing " + missing.join(", ") : ""}`);
ok(differ.length === 0, `${same}/${shouldCopy.length} byte-identical to the repo${differ.length ? ": differ " + differ.join(", ") : ""}`);
const changedVsHead = execSync("git diff --name-only HEAD", { encoding: "utf8" }).split("\n").filter((f) => shouldCopy.includes(f));
console.log(`INFO  copied files edited since last commit (deliberate head edits): ${changedVsHead.join(", ") || "none"}`);
for (const f of changedVsHead) {
  const diff = execSync(`git diff -U0 HEAD -- "${f}"`, { encoding: "utf8" });
  const headEnd = fs.readFileSync(f, "utf8").split("\n").findIndex((l) => l.includes("</head>")) + 1;
  const hunks = [...diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)].map((m) => +m[1] + Math.max(+(m[2] ?? 1), 1) - 1);
  ok(hunks.every((last) => last < headEnd), `${f}: every change is inside <head> (ends line ${headEnd})`);
}

// 2. Netlify files and forms -------------------------------------------------
ok(fs.existsSync("_site/_redirects") && sha("_site/_redirects") === sha("_redirects"), "_redirects present and unchanged");
const headers = fs.readFileSync("_site/_headers", "utf8");
ok(/\/itineraries\/\*\n\s+X-Robots-Tag: noindex/.test(headers) && /\/presentations\/\*\n\s+X-Robots-Tag: noindex/.test(headers), "_headers sends noindex for /itineraries/* and /presentations/*");
const sp = fs.readFileSync("_site/start-planning.html", "utf8");
ok(/data-netlify="true"|\snetlify[\s>]/.test(sp) && sp.includes("netlify-honeypot"), "start-planning.html Netlify form markup intact (netlify + netlify-honeypot)");
ok(!fs.existsSync("_site/tools") && !fs.existsSync("_site/README.md") && !fs.existsSync("_site/travel_photos") && !fs.existsSync("_site/DESIGN.md"), "working files (tools/, README, DESIGN.md, travel_photos/) not in the build");

// 3. robots / sitemap / llms -------------------------------------------------
const robots = fs.readFileSync("_site/robots.txt", "utf8");
ok(robots.includes("Disallow: /journal/_drafts/") && robots.includes("Disallow: /tools/"), "robots.txt keeps /journal/_drafts/ and /tools/ disallowed");
ok(!robots.includes("/presentations"), "robots.txt no longer blocks /presentations/");
ok(/Sitemap: https:\/\/outposttravel\.co\/sitemap\.xml/.test(robots), "robots.txt points to the sitemap");
const groups = robots.split(/\n(?=User-agent)/);
ok(robots.split("\n").every((l) => !l.trim() || l.startsWith("#") || /^(User-agent|Disallow|Allow|Sitemap): /.test(l)), "robots.txt: every line is a valid directive or comment");
ok(/User-agent: GPTBot/.test(robots) && /User-agent: ClaudeBot/.test(robots) && /User-agent: Google-Extended/.test(robots), "robots.txt names the AI crawlers (all allowed)");
const sm = fs.readFileSync("_site/sitemap.xml", "utf8");
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok(sm.startsWith('<?xml version="1.0" encoding="UTF-8"?>') && sm.trim().endsWith("</urlset>") && (sm.match(/<url>/g) || []).length === locs.length, "sitemap.xml well formed");
const SIX = ["/", "/about", "/journal/", "/faq", "/start-planning", "/privacy"].map((u) => "https://outposttravel.co" + u);
ok(SIX.every((u, i) => locs[i] === u), "sitemap.xml lists the current six URLs exactly, in order");
ok(locs.every((u) => !/itineraries|presentations|_drafts|_test/.test(u)), "sitemap.xml has no itineraries, presentations, drafts or test pages");
ok([...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].every((m) => /^\d{4}-\d{2}-\d{2}$/.test(m[1])), "sitemap.xml lastmod dates are YYYY-MM-DD");
console.log("INFO  sitemap:\n" + sm.split("\n").filter((l) => l.includes("<url>")).map((l) => "      " + l.trim()).join("\n"));
const llms = fs.readFileSync("_site/llms.txt", "utf8");
const site = yaml.load(fs.readFileSync("src/_data/site.yaml", "utf8"));
ok(llms.startsWith(`# ${site.name}\n`) && llms.includes(`> ${site.description} ${site.affiliation}.`), "llms.txt starts with name and summary (with the affiliation line)");
ok(SIX.every((u) => llms.includes(`](${u})`)) && !/_test|itineraries/.test(llms), "llms.txt lists the six pages, no test pages or itineraries");

// 4. Homepage JSON-LD vs site.yaml -----------------------------------------
const home = fs.readFileSync("_site/index.html", "utf8");
const ld = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const checks = {
  name: ld.name === site.name, url: ld.url === site.url + "/", email: ld.email === site.email, telephone: ld.telephone === site.phone,
  description: ld.description === `${site.description} ${site.affiliation}.`, slogan: ld.slogan === site.tagline,
  founder: ld.founder?.name === site.founder.name && ld.founder?.url === site.founder.url,
  address: ld.address?.addressLocality === site.address.locality && ld.address?.addressCountry === site.address.country,
  sameAs: JSON.stringify(ld.sameAs) === JSON.stringify(site.sameAs), noMemberOf: !("memberOf" in ld),
  "@id": ld["@id"] === `${site.url}/#organization`,
};
const bad = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
ok(bad.length === 0, `homepage TravelAgency JSON-LD matches site.yaml${bad.length ? ": mismatched " + bad.join(", ") : ""}`);

console.log(fails ? `\n${fails} check(s) FAILED` : "\nAll checks passed");
process.exit(fails ? 1 : 0);
