# MINDTRACE merge + Flaredrift SEO update

This archive is based on the newer Flaredrift project upload. Its PWA, Ventures, Vision, current homepage components, styles, and assets are retained.

## MINDTRACE integration
- Adds the standalone `/mindtrace/` Vite HTML entry and the existing MINDTRACE application.
- Adds MINDTRACE to the homepage navigation and hero links, plus the shared Ventures/Vision navigation.
- Lists MINDTRACE under Ventures as **In Development**, rather than misrepresenting it as a finished launched product.
- Uses route-based lazy loading so the homepage and MINDTRACE app are not both eagerly loaded.
- Adds a dedicated canonical URL, page title/description, Open Graph and Twitter metadata, WebApplication structured data, and a breadcrumb.
- Adds `/mindtrace/` to the sitemap, service-worker known navigation routes, and generated offline precache list.

## Flaredrift SEO improvements
- Refines the homepage title and meta description around the site's actual identity: an independent creative playground and experimental digital lab.
- Adds consistent Open Graph/Twitter metadata and Organization, WebSite and WebPage structured data.
- Improves Ventures and Vision page titles/descriptions and adds shared Organization/WebSite entities to their structured data.
- Adds contextual internal links to MINDTRACE.
- Updates sitemap `lastmod` values and keeps the existing robots.txt sitemap reference.

## Stability and security review
- Preserves the existing Flaredrift pages, PWA files, current site components, and dependency versions; no new package dependency is required.
- MINDTRACE user text remains rendered as React text; no `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write`, or app-level `fetch()` was found in its source.
- Local project loading now validates and bounds persisted project/node data before rendering, in addition to the existing bounded JSON import checks.
- MINDTRACE project content remains in browser localStorage; it is not uploaded to a server by this patch. Export backups before clearing browser data or changing devices.

## Verification
Passed:
- JavaScript module syntax checks for the site generator and Vite configuration.
- JSX syntax/transpile checks for the homepage, MINDTRACE app, and existing interactive components.
- JSON-LD JSON parsing for homepage and MINDTRACE.
- Sitemap XML parsing.
- Static Ventures/Vision HTML rendering and internal MINDTRACE link checks.
- Simulated build-plugin output check: static pages generated, MINDTRACE page retained, PWA script versioned, and `/mindtrace/` included in the service-worker precache.

Not completed:
- A full `vite build` and dependency audit were not completed in this environment because `npm ci` did not finish. Run `npm ci` and `npm run build` locally before pushing. This archive is not represented as a production-build-certified release.

## Deploy
1. Extract this archive and merge the `flaredrift/` folder contents into the root of the GitHub repository connected to Vercel.
2. Run `npm ci`.
3. Run `npm run build`; fix any environment-specific errors before deployment.
4. Commit and push to GitHub. Vercel should redeploy automatically.
5. In Google Search Console, resubmit `https://flaredrift.vercel.app/sitemap.xml`, inspect each canonical route, and request indexing if needed.

SEO metadata and sitemaps help discovery and interpretation, but they cannot guarantee rankings, sitelinks, or an immediate recrawl.
