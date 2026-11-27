// {% image "photos/china/li-river.jpg", "Fisherman on the Li River at dusk", "(min-width: 1024px) 50vw, 100vw", { eager: true, class: "hero-img" } %}
//
// Makes AVIF + WebP + JPEG at 640/1024/1600/2400px (never upscaled) and
// returns a <picture> with srcset/sizes. Lazy + async decoding by default.
// eager: true  -> loading="eager", fetchpriority="high", and a matching
//                 <link rel="preload"> is put in the page head.
// Heights are set in CSS with clamp(); never aspect-ratio on <img> (Safari).
//
// The shortcode is SYNCHRONOUS on purpose. An async shortcode inside a
// Nunjucks {% for %} loop renders out of order (tested 27 Nov 2026: photos
// and names landed on the wrong cards). So it reads the image size up front
// (statsSync, eleventy-img v6) and the resizing finishes before the build
// ends (flushImages). Sizes already in .cache/img are reused.

import path from "node:path";
import Image from "@11ty/eleventy-img";

const OPTIONS = {
  widths: [640, 1024, 1600, 2400],
  formats: ["avif", "webp", "jpeg"],
  outputDir: ".cache/img/",
  urlPath: "/img/",
  sharpAvifOptions: { quality: 55 },
  sharpWebpOptions: { quality: 72 },
  sharpJpegOptions: { quality: 78, progressive: true, mozjpeg: true },
  filenameFormat(id, src, width, format) {
    const name = path.basename(src, path.extname(src));
    return `${name}-${id.slice(0, 6)}-${width}.${format}`;
  },
};

const pending = [];

function resolveSrc(src) {
  // Paths are relative to the repo root, or to src/ (src/photos/...).
  return src.startsWith("photos/") ? path.join("src", src) : src.replace(/^\//, "");
}

export function imageShortcode(src, alt, sizes = "100vw", opts = {}) {
  if (alt === undefined) throw new Error(`image "${src}" needs alt text`);
  const file = resolveSrc(src);
  pending.push(Image(file, OPTIONS));
  const metadata = Image.statsSync(file, OPTIONS);

  const attrs = {
    alt,
    sizes,
    loading: opts.eager ? "eager" : "lazy",
    decoding: "async",
  };
  if (opts.eager) attrs.fetchpriority = "high";
  if (opts.class) attrs.class = opts.class;

  if (opts.eager) {
    const avif = metadata.avif || metadata.webp;
    const srcset = avif.map((m) => m.srcset).join(", ");
    const link = `<link rel="preload" as="image" type="${avif[0].sourceType}" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high">`;
    const key = this && this.page ? this.page.inputPath : "";
    const list = imageShortcode.preloads.get(key) || [];
    if (!list.includes(link)) list.push(link);
    imageShortcode.preloads.set(key, list);
  }

  return Image.generateHTML(metadata, attrs);
}
imageShortcode.preloads = new Map();

export async function flushImages() {
  await Promise.all(pending.splice(0));
}
