import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { renderPage, routes } from './render.mjs';
import { pages } from './content.mjs';

const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 10);

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else out.push('/' + path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

/**
 * - dev: serves /ventures/ and /vision/ using the same generator as the build
 * - build: writes dist/ventures/index.html and dist/vision/index.html (static, crawlable HTML),
 *   stamps asset versions, and injects the build id + precache list into dist/sw.js
 */
export default function flaredriftSite() {
  let outDir = 'dist';
  let root = process.cwd();
  let isBuild = false;

  return {
    name: 'flaredrift-site',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
      isBuild = config.command === 'build';
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0].replace(/\/+$/, '');
        const route = routes.find((r) => pages[r].path.replace(/\/+$/, '') === url);
        if (!route) return next();
        const template = await fs.readFile(path.join(root, 'index.html'), 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(renderPage(route, { template, dev: true, sharedCss: ['/src/styles.css?direct'] }));
      });
    },

    async closeBundle() {
      if (!isBuild) return;
      const indexPath = path.join(outDir, 'index.html');
      let index = await fs.readFile(indexPath, 'utf8');

      // version stamps for the unhashed public scripts/styles
      const stamp = async (file) => hash(await fs.readFile(path.join(outDir, file)));
      const version = hash([await stamp('static/pages.css'), await stamp('static/pages.js'), await stamp('pwa.js')].join('|'));
      const pwaV = await stamp('pwa.js');
      index = index.replace(/src="\/pwa\.js"/, `src="/pwa.js?v=${pwaV}"`);
      await fs.writeFile(indexPath, index);

      // Keep the standalone MINDTRACE entry on the same versioned PWA client.
      const mindtracePath = path.join(outDir, 'mindtrace/index.html');
      let mindtraceHtml = await fs.readFile(mindtracePath, 'utf8');
      mindtraceHtml = mindtraceHtml.replace(/src="\/pwa\.js"/, `src="/pwa.js?v=${pwaV}"`);
      await fs.writeFile(mindtracePath, mindtraceHtml);

      // React-imported CSS is emitted as an asset and is not guaranteed to appear as a
      // stylesheet link in the HTML template. Static HTML pages need it explicitly.
      const assetDir = path.join(outDir, 'assets');
      let sharedCss = [];
      try {
        const cssFiles = (await fs.readdir(assetDir)).filter((name) => name.endsWith('.css')).sort();
        sharedCss = cssFiles.map((name) => `/assets/${name}`);
      } catch { /* keep building; renderPage retains any stylesheet links from index.html */ }

      const generated = [];
      for (const route of routes) {
        const dir = path.join(outDir, pages[route].path);
        await fs.mkdir(dir, { recursive: true });
        // pass the same version to every page so the precache list matches exactly
        const html = renderPage(route, { template: index, version, sharedCss });
        await fs.writeFile(path.join(dir, 'index.html'), html);
        generated.push(pages[route].path);
      }
      // pwa.js is stamped per file on the home page; static pages use the shared stamp. Precache both.
      const files = (await walk(outDir)).filter(
        (f) => !f.endsWith('.map') && f !== '/sw.js' && !f.endsWith('/index.html') && f !== '/robots.txt' && f !== '/sitemap.xml' && f !== '/icons.svg'
      );
      const urls = new Set(['/', ...generated, '/mindtrace/', '/offline.html']);
      for (const f of files) {
        if (f === '/static/pages.css' || f === '/static/pages.js') urls.add(`${f}?v=${version}`);
        else if (f === '/pwa.js') { urls.add(`/pwa.js?v=${pwaV}`); urls.add(`/pwa.js?v=${version}`); }
        else urls.add(f);
      }
      const list = [...urls].sort();

      const htmlStamp = [];
      for (const u of ['/', ...generated, '/mindtrace/']) {
        const p = u === '/' ? 'index.html' : path.join(u, 'index.html');
        htmlStamp.push(await fs.readFile(path.join(outDir, p), 'utf8'));
      }
      const build = hash(list.join('\n') + htmlStamp.join('\n'));

      const swPath = path.join(outDir, 'sw.js');
      let sw = await fs.readFile(swPath, 'utf8');
      sw = sw
        .replace(/^const BUILD = .*$/m, `const BUILD = ${JSON.stringify(build)};`)
        .replace(/^const PRECACHE = .*$/m, `const PRECACHE = ${JSON.stringify(list)};`);
      await fs.writeFile(swPath, sw);
      this.info?.(`flaredrift-site: ${generated.join(', ')} generated, ${list.length} URLs precached (build ${build})`);
    },
  };
}
