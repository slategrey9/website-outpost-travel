// The six existing hand-written pages that belong in the sitemap and
// llms.txt, exactly as listed in the old sitemap.xml. Their title and
// description are read from the page itself, and "last modified" from git,
// so nothing here can drift from the real page.
import fs from "node:fs";
import { execSync } from "node:child_process";

const PAGES = [
  { url: "/", file: "index.html", fallback: "2026-10-09" },
  { url: "/about", file: "about.html", fallback: "2026-10-09" },
  { url: "/journal/", file: "journal/index.html", fallback: "2026-10-09" },
  { url: "/faq", file: "faq.html", fallback: "2026-10-09" },
  { url: "/start-planning", file: "start-planning.html", fallback: "2026-10-09" },
  { url: "/privacy", file: "privacy.html", fallback: "2026-10-09" },
];

function gitDate(file) {
  try {
    const d = execSync(`git log -1 --format=%cs -- "${file}"`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return d || null;
  } catch {
    return null;
  }
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"');

export default function () {
  return PAGES.map((p) => {
    const html = fs.readFileSync(p.file, "utf8");
    const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "").trim();
    const description = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "").trim();
    return { ...p, title, description, lastmod: gitDate(p.file) || p.fallback };
  });
}
