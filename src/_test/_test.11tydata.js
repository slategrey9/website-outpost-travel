// Hidden block test pages: noindex, out of the sitemap/llms.txt, and not
// built at all on the production site (see eleventy.config.js).
import fs from "node:fs";
import yaml from "js-yaml";
const fx = yaml.load(fs.readFileSync("src/_test/fixtures.yaml", "utf8"));
export default {
  noindex: true,
  eleventyExcludeFromCollections: true,
  fx,
  // The journey card on the test destination links only if this exists.
  journeys: { "test-journey": fx.journey },
  hotels: fx.hotels,
  d: fx.destination,
  jr: fx.journey,
  dest: fx.destination,
};
