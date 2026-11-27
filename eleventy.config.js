// Eleventy config for outposttravel.co
//
// Two kinds of output end up in _site/:
//   1. COPIED THROUGH, byte for byte: the existing hand-written pages,
//      assets, images, itineraries, presentations and journal. Eleventy
//      never reads or changes these.
//   2. BUILT from src/: the new v4 pages (destinations, journeys), plus
//      robots.txt, sitemap.xml, llms.txt and _headers.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import yaml from "js-yaml";
import { imageShortcode, flushImages } from "./src/_lib/image.js";
import * as schema from "./src/_lib/schema.js";

// Netlify sets CONTEXT to production | deploy-preview | branch-deploy.
// The hidden block test pages build everywhere except production.
const IS_PRODUCTION = process.env.CONTEXT === "production";

// Files git ignores (old unpublished itinerary drafts, .DS_Store) are never
// deployed by Netlify, because Netlify builds from the git repo. Skip them
// locally too, so a local build matches what actually goes live.
function gitIgnoredSet() {
  try {
    const out = execSync(
      "git ls-files --others --ignored --exclude-standard -- itineraries images assets presentations journal",
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 }
    );
    return new Set(out.split("\n").filter(Boolean).map((p) => path.resolve(p)));
  } catch {
    return new Set();
  }
}
const IGNORED = gitIgnoredSet();
const copyFilter = (p) => {
  const base = path.basename(p);
  if (base === ".DS_Store") return false;
  return !IGNORED.has(path.resolve(p));
};

export default function (eleventyConfig) {
  // ---- YAML data files -------------------------------------------------
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));

  // ---- Copy through untouched -------------------------------------------
  // Top-level pages: listed by name so nothing new slips in by accident.
  for (const f of [
    "index.html", "about.html", "faq.html", "privacy.html",
    "start-planning.html", "thanks.html", "404.html",
    "favicon.svg", "_redirects",
  ]) {
    eleventyConfig.addPassthroughCopy({ [f]: f });
  }
  for (const dir of ["assets", "images", "itineraries", "presentations", "journal"]) {
    eleventyConfig.addPassthroughCopy({ [dir]: dir }, { filter: copyFilter });
  }
  // New-page assets (v4.css, self-hosted fonts) live in src/assets and
  // land in _site/assets alongside the old ones (no name clashes).
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });

  // Don't try to render the old .html pages or docs as templates.
  eleventyConfig.ignores.add("src/**/README.md");
  if (IS_PRODUCTION) eleventyConfig.ignores.add("src/_test/**");

  // ---- Images ------------------------------------------------------------
  eleventyConfig.addShortcode("image", imageShortcode);
  // Hero preload: the image shortcode records an eager image's preload
  // link per page; this fills the <!-- hero-preload --> slot in the head.
  eleventyConfig.addTransform("hero-preload", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) return content;
    const links = imageShortcode.preloads.get(this.page.inputPath) || [];
    return content.replace("<!-- hero-preload -->", links.join("\n  "));
  });
  eleventyConfig.on("eleventy.before", () => imageShortcode.preloads.clear());
  eleventyConfig.on("eleventy.after", async () => {
    await flushImages();
    // Generated images are cached in .cache/img (kept between Netlify
    // builds by netlify-plugin-cache) and copied into the site here.
    if (fs.existsSync(".cache/img")) {
      fs.cpSync(".cache/img", "_site/img", { recursive: true });
    }
  });

  // Empty defaults so the destination/journey page templates build (with
  // zero pages) before any destination or journey data file exists.
  eleventyConfig.addGlobalData("destinations", {});
  eleventyConfig.addGlobalData("journeys", {});
  eleventyConfig.addGlobalData("year", new Date().getUTCFullYear());

  // ---- Filters -------------------------------------------------------------
  eleventyConfig.addFilter("absUrl", (p, base) => new URL(p, base).href);
  eleventyConfig.addFilter("isoDate", (d) => {
    if (!d) return "";
    const date = d instanceof Date ? d : new Date(d);
    return date.toISOString().slice(0, 10);
  });
  eleventyConfig.addFilter("monthYear", (d) => {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  });
  eleventyConfig.addFilter("hotelsById", (ids, hotels) =>
    (ids || []).map((id) => {
      const h = (hotels || []).find((x) => x.id === id);
      if (!h) throw new Error(`hotels.yaml has no hotel with id "${id}"`);
      return h;
    })
  );
  eleventyConfig.addFilter("jsonld", (graph) =>
    // Escape "<" so a stray "</script>" in copy can never break the page.
    JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/</g, "\\u003c")
  );
  for (const [name, fn] of Object.entries(schema)) eleventyConfig.addFilter(`schema_${name}`, fn);

  // Other journeys in the destination, leaving out the current one.
  eleventyConfig.addFilter("exceptPage", (items, slug) => (items || []).filter((j) => j.page !== slug));
  // Cards whose `page` has a journey data file (i.e. a real page to link to).
  eleventyConfig.addFilter("withPages", (items, journeys) =>
    (items || []).filter((j) => j.page && journeys && journeys[j.page])
  );
  // Does a site URL point at a real page? Used so the journal teaser only
  // shows once its article exists. Checks the copied-through files and src/.
  eleventyConfig.addFilter("pageExists", (url) => {
    if (!url) return false;
    const p = url.replace(/^\//, "").replace(/[?#].*$/, "");
    const tries = p.endsWith("/") || p === ""
      ? [`${p}index.html`, `src/${p}index.njk`, `src/${p}index.md`]
      : [`${p}.html`, p, `${p}/index.html`, `src/${p}.njk`, `src/${p}.md`];
    return tries.some((t) => fs.existsSync(t));
  });
  // Stop the build with a clear message (bad data beats a broken page).
  eleventyConfig.addFilter("fail", (msg) => { throw new Error(msg); });

  // Journey page URL from its file: /<destination>/<slug>/
  eleventyConfig.addFilter("journeyUrl", (j) => `/${j.destination}/${j.slug}/`);

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "11ty.js"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
