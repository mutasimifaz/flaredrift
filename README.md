# Flaredrift

Flaredrift is an independent creative playground and lab for interactive experiences, experimental digital tools and independent projects.

## Routes

- `/` — Flaredrift homepage
- `/ventures/` — build-generated, crawlable ventures page
- `/vision/` — build-generated, crawlable vision page
- `/mindtrace/` — standalone MINDTRACE local-first decision workspace

## Build and local development

```bash
npm install
npm run dev
npm run build
npm run preview
```

The Vite build creates the homepage and MINDTRACE as separate HTML entries. `site/vite-plugin.mjs` generates static HTML for Ventures and Vision and injects the complete offline precache list into the service worker.

## SEO

- Each indexable route has a self-referencing canonical URL, unique title and description, social metadata and structured data.
- `public/sitemap.xml` lists the homepage, Ventures, Vision and MINDTRACE.
- `public/robots.txt` allows crawling and points to the sitemap.
- Homepage and static pages link to MINDTRACE for discovery.
- Structured data describes Flaredrift as the publisher and MINDTRACE as a free web application. Structured data does not guarantee rich results or rankings.

## PWA

The existing manifest, offline page, install/update prompt and service worker are retained. MINDTRACE is included in the service worker's known navigation pages and offline precache.

## MINDTRACE local-first data

MINDTRACE stores decision workspaces in the current browser profile. Clearing site data or changing devices can remove access to that local data. Use Export backup regularly and store the JSON file somewhere safe. This foundation does not add accounts, cloud sync, an AI API or a server-side project database.

## Deploy

Run `npm run build`, review the generated `dist/` output, then commit and push to the GitHub repository connected to Vercel. Vercel redeploys automatically.

## Verification

The patch includes source-level SEO and routing updates. Run the build and test all four routes after applying it. Search engines decide when and whether to recrawl or display sitelinks; metadata and sitemap updates cannot guarantee a ranking or sitelink result.


## MINDTRACE deployment and PWA refresh (2026-11-10)

- `/mindtrace/` now uses its own Vite entry (`src/mindtrace/main.jsx`). Its main stylesheet and responsive overrides are imported statically so the production HTML receives the MINDTRACE CSS with the entry bundle.
- The MINDTRACE route now uses `public/mindtrace.webmanifest` and its own brain/circuit app icons. The Flaredrift homepage keeps the separate Flaredrift manifest and the updated `public/Logo.svg` icon artwork.
- Manifest and icon URLs are versioned to prevent the previous install metadata from being reused.
- The MINDTRACE responsive scrollbar overrides are now actually imported by the MINDTRACE entry.

### Deploy

1. Replace the project with the contents of this ZIP (keep your Git repository history; do not upload the ZIP itself as the website).
2. Run `npm install` and `npm run build`.
3. Commit and push to GitHub. Vercel should deploy automatically from the connected repository.
4. After deployment, open `https://flaredrift.vercel.app/mindtrace/` and hard-refresh once.

### Refresh an already-installed mobile PWA

Browsers may retain the icon of an app that was installed before the manifest changed. After the new deployment, remove the old installed Flaredrift/MINDTRACE shortcut from the phone, open the correct page in the browser, and install it again. Install from `/mindtrace/` to get the MINDTRACE icon; install from `/` to get the Flaredrift icon.
