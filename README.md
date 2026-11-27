# website-outpost-travel
Outpost Travel — luxury travel concierge website. Deploys to outposttravel.co via Netlify (from GitHub: slategrey9/outpost-travel). Local-only client work lives elsewhere; see `~/Outpost/`.

## Building the site (since the site-foundation branch, Nov 2026)

Netlify runs Eleventy on every push (`netlify.toml`). Locally: `nvm use` (Node 22), `npm install` once, then `npm run build` (output in `_site/`) or `npm run serve` (local preview with live reload). `npm run verify` proves the existing pages are copied through unchanged.

- Existing pages, `assets/`, `images/`, `itineraries/`, `presentations/`, `journal/` are copied through byte for byte. Edit them exactly as before.
- New pages are built from `src/`: data in `src/_data/` (`site.yaml` = the facts about Outpost, `hotels.yaml`, `destinations/<slug>.yaml`, `journeys/<slug>.yaml`), layouts and blocks in `src/_includes/`, styles in `src/assets/v4.css`.
- `robots.txt`, `sitemap.xml`, `llms.txt` and `_headers` are generated from `src/`. Don't hand-edit copies at the repo root.
- Hidden block test pages (`/_test/...`) build on deploy previews only, never on the live site.
