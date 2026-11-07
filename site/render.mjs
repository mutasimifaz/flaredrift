import { SITE, CONTACT_URL, nav, pages, launched, statusLegend, experiments, explores, principles, manifesto } from './content.mjs';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const svg = (inner, size = 16, cls = '') =>
  `<svg${cls ? ` class="${cls}"` : ''} xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

const I = {
  up: (s) => svg(
    '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    s
  ),

  down: (s) => svg(
    '<path d="m7 7 10 10"/><path d="M17 7v10H7"/>',
    s
  ),

  menu: (s) => svg(
    '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
    s,
    'i-menu'
  ),

  close: (s) => svg(
    '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    s,
    'i-close'
  ),

  external: (s) => svg(
    '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    s,
    'i-external'
  ),
};

function header(active) {
  const links = nav
    .map((n) => {
      const cur = n.route && n.route === active;
      return `<a href="${n.href}"${cur ? ' aria-current="page" class="nav-active"' : ''}>${esc(n.label)}</a>`;
    })
    .join('\n        ');
  return `<header class="header">
      <a class="wordmark" href="/">FLAREDRIFT<span>.</span></a>
      <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">${I.menu(24)}${I.close(24)}</button>
      <nav class="nav" id="site-nav" aria-label="Primary">
        ${links}
        <a class="nav-contact" href="/#contact">Get in touch ${I.up(14)}</a>
      </nav>
    </header>`;
}

function footer() {
  return `<footer class="footer">
      <a class="wordmark" href="/">FLAREDRIFT<span>.</span></a>
      <span>Interactive Ideas in Motion — © 2026</span>
      <span>BUILT TO DRIFT.</span>
    </footer>`;
}

const words = (text, cls) =>
  text
    .split(/\s+/)
    .map((w) => `<span class="${cls}">${esc(w)}</span>`)
    .join(' ');

const statusClass = (s) => 'status-' + s.toLowerCase().replace(/\s+/g, '-');
const chip = (s) => `<span class="chip ${statusClass(s)}"><i></i>${esc(s)}</span>`;

const art = {
  write: `<svg class="v-art" viewBox="0 0 400 280" role="img" aria-label="Abstract illustration of a writing window with a blinking cursor"><rect width="400" height="280" fill="#15110f"/><circle cx="300" cy="90" r="120" fill="none" stroke="#3a322d"/><circle cx="300" cy="90" r="70" fill="none" stroke="#ff4322" opacity=".55"/><rect x="62" y="64" width="210" height="150" fill="#0b0b0b" stroke="#514b46"/><g stroke="#6e6760" stroke-width="3" stroke-linecap="round"><path d="M86 106h140"/><path d="M86 130h162"/><path d="M86 154h110"/></g><rect class="v-cursor" x="204" y="146" width="3" height="18" fill="#ff4322"/></svg>`,
  flare: `<svg class="v-art" viewBox="0 0 400 280" role="img" aria-label="Abstract illustration of a lens flare with rings and a light streak"><defs><radialGradient id="fl-g"><stop offset="0" stop-color="#fff4dc"/><stop offset=".25" stop-color="#ffb52e" stop-opacity=".9"/><stop offset="1" stop-color="#ff4322" stop-opacity="0"/></radialGradient></defs><rect width="400" height="280" fill="#0d1018"/><circle cx="130" cy="110" r="92" fill="url(#fl-g)"/><path d="M20 110h340" stroke="#45d8ff" stroke-opacity=".6"/><circle cx="230" cy="150" r="34" fill="none" stroke="#287dff" stroke-opacity=".8"/><circle cx="290" cy="178" r="16" fill="#287dff" fill-opacity=".35"/><circle cx="330" cy="196" r="46" fill="none" stroke="#ff4322" stroke-opacity=".5"/></svg>`,
  bhashora: `<svg class="v-art" viewBox="0 0 400 280" role="img" aria-label="Abstract Bengali letterforms and orbiting learning paths"><defs><radialGradient id="bha-glow"><stop offset="0" stop-color="#e8bd76" stop-opacity=".8"/><stop offset="1" stop-color="#e8bd76" stop-opacity="0"/></radialGradient></defs><rect width="400" height="280" fill="#111713"/><circle cx="286" cy="92" r="118" fill="url(#bha-glow)" opacity=".6"/><circle cx="205" cy="140" r="108" fill="none" stroke="#667b68" stroke-width="1"/><circle cx="205" cy="140" r="76" fill="none" stroke="#d4b47a" stroke-opacity=".55" stroke-dasharray="3 8"/><path d="M48 210C100 42 288 34 352 165" fill="none" stroke="#9db59b" stroke-opacity=".6"/><circle cx="352" cy="165" r="5" fill="#e8bd76"/><rect x="104" y="76" width="194" height="130" rx="2" fill="#18221b" stroke="#83957d"/><text x="201" y="145" fill="#f1e5ca" font-size="38" text-anchor="middle" font-family="sans-serif">ভাষোরা</text><path d="M135 164h132" stroke="#d4b47a" stroke-opacity=".65"/><text x="201" y="184" fill="#a9b9a3" font-size="8" letter-spacing="2" text-anchor="middle">LEARN / GROW / CONNECT</text></svg>`,
};

function venturesBody() {
  const rows = launched
    .map(
      (v) => `<article class="v-row" data-reveal>
        <div class="v-visual">${art[v.art]}<span class="v-num">${v.number} / ${String(launched.length).padStart(2, '0')}</span></div>
        <div class="v-info">
          <div class="v-meta"><span class="eyebrow">${esc(v.kind)}</span>${chip(v.status)}</div>
          <h3>${esc(v.name)}</h3>
          <p>${esc(v.description)}</p>
          <dl class="v-facts">${v.facts.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>
          <a class="text-link" href="${v.cta.href}"${v.cta.external ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${esc(v.cta.label)}${v.cta.external ? ' (opens in a new tab)' : ''}">${esc(v.cta.label)} ${I.up(15)}</a>
        </div>
      </article>`
    )
    .join('\n      ');

  const exps = experiments
    .map(
      (e) => `<li class="x-item" data-reveal>
          <span class="x-num">${esc(e.number)}</span>
          <div class="x-main"><h3>${esc(e.name)}</h3><p>${esc(e.description)}</p>${
            e.cta ? `<a class="text-link text-link-sm" href="${e.cta.href}">${esc(e.cta.label)} ${I.up(13)}</a>` : ''
          }</div>
          ${chip(e.status)}
        </li>`
    )
    .join('\n        ');

  const legend = statusLegend
    .map(([s, d]) => `<li>${chip(s)}<span>${esc(d)}</span></li>`)
    .join('');

  return `<main id="main" class="page page-ventures">
      <section class="p-hero">
        <div class="p-hero-inner">
          <div class="eyebrow hero-kicker"><span class="status-dot"></span>FLAREDRIFT / VENTURES<span class="kicker-line"></span></div>
          <h1>Launched,<br /><em>and still drifting<span class="hero-period">.</span></em></h1>
          <p class="p-lede">Flaredrift is an independent creative playground. This page keeps what is ready to use apart from what is still being explored, and states the status of everything plainly.</p>
          <div class="p-jump"><a class="text-link" href="#launched">Launched ventures ${I.down(16)}</a><a class="text-link" href="#experiments">Experiments and concepts ${I.down(16)}</a></div>
        </div>
        <div class="p-geo" aria-hidden="true"><i class="g-ring"></i><i class="g-sq"></i><i class="g-dot"></i></div>
      </section>

      <section class="p-section" id="launched" aria-labelledby="launched-h">
        <div class="section-heading" data-reveal>
          <div><span class="eyebrow">01 — LAUNCHED</span><h2 id="launched-h">Launched <em>ventures.</em></h2></div>
          <p>Live today and open to use.</p>
        </div>
        ${rows}
      </section>

      <section class="p-section p-alt" id="experiments" aria-labelledby="exp-h">
        <div class="section-heading" data-reveal>
          <div><span class="eyebrow">02 — IN THE LAB</span><h2 id="exp-h">Experiments <em>and concepts.</em></h2></div>
          <p>Not launched. The status on each item means exactly what it says.</p>
        </div>
        <ul class="legend" data-reveal aria-label="Status key">${legend}</ul>
        <ul class="x-list">
        ${exps}
        </ul>
      </section>

      <section class="p-cta" data-reveal>
        <span class="eyebrow">03 — NEXT</span>
        <div class="p-cta-row">
          <h2>Curious why<br /><em>these exist?</em></h2>
          <div class="p-cta-links">
            <a class="text-link" href="/vision/">Read the vision ${I.up(15)}</a>
            <a class="text-link" href="${CONTACT_URL}" target="_blank" rel="noopener noreferrer">Get in touch ${I.up(15)}</a>
          </div>
        </div>
      </section>
    </main>`;
}

const figure = `<svg class="s-fig" viewBox="0 0 320 320" role="img" aria-label="Geometric illustration that changes with each principle">
        <g class="f f1"><path d="M30 250H290M30 210H290M30 170H290" stroke="#3a322d"/><path d="M30 130H290" stroke="#3a322d"/><path d="M40 250C100 250 120 90 180 90S250 70 280 40" fill="none" stroke="#ff4322" stroke-width="2"/><circle cx="280" cy="40" r="12" fill="#ff4322"/><circle cx="40" cy="250" r="5" fill="#a29b93"/></g>
        <g class="f f2"><rect x="70" y="90" width="160" height="150" fill="none" stroke="#a29b93"/><path d="M70 240A80 80 0 0 1 150 160V240Z" fill="#287dff"/><circle cx="196" cy="128" r="22" fill="#ff4322"/><path d="M110 270H250" stroke="#514b46"/></g>
        <g class="f f3"><circle cx="160" cy="170" r="110" fill="none" stroke="#3a322d"/><circle cx="160" cy="170" r="70" fill="none" stroke="#514b46"/><circle cx="160" cy="170" r="30" fill="none" stroke="#287dff" stroke-width="2"/><path d="M40 270 160 170" stroke="#ff4322" stroke-dasharray="6 6"/><path d="M40 270h40v-40Z" fill="#ff4322"/><circle cx="160" cy="170" r="5" fill="#45d8ff"/></g>
        <g class="f f4"><g class="orbit"><circle cx="160" cy="160" r="110" fill="none" stroke="#3a322d"/><circle cx="160" cy="160" r="72" fill="none" stroke="#514b46"/><circle cx="160" cy="160" r="34" fill="none" stroke="#a29b93"/><circle cx="270" cy="160" r="9" fill="#ff4322"/><circle cx="160" cy="88" r="6" fill="#287dff"/></g><circle cx="160" cy="160" r="4" fill="#f2eee8"/></g>
      </svg>`;

function visionBody() {
  const ex = explores
    .map(
      ([t, d], i) => `<li class="e-item" data-reveal style="--d:${i * 70}ms"><span class="e-n">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`
    )
    .join('\n        ');
  const pr = principles
    .map(
      (p, i) => `<article class="s-step" data-step="${i}"${i === 0 ? ' data-first' : ''}>
          <span class="s-n">${p.n}</span>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.body)}</p>
        </article>`
    )
    .join('\n        ');

  return `<main id="main" class="page page-vision">
      <div class="read-progress" aria-hidden="true"><span></span></div>
      <section class="p-hero v-hero">
        <div class="p-hero-inner">
          <div class="eyebrow hero-kicker"><span class="status-dot"></span>FLAREDRIFT / VISION<span class="kicker-line"></span></div>
          <h1 class="manifest-title">${words('Curiosity over convention.', 'mw')}</h1>
          <p class="p-lede">Flaredrift is an independent creative playground and laboratory.</p>
          <a class="text-link" href="#manifesto">Read the manifesto ${I.down(16)}</a>
        </div>
        <div class="p-geo" aria-hidden="true"><i class="g-ring"></i><i class="g-sq"></i><i class="g-dot"></i></div>
      </section>

      <section class="p-section manifesto" id="manifesto" aria-labelledby="man-h">
        <span class="eyebrow" data-reveal>01 — MANIFESTO</span>
        <h2 id="man-h" class="sr-only">Manifesto</h2>
        <p class="lit" data-lit>${words(manifesto, 'lw')}</p>
      </section>

      <section class="p-section p-alt" id="explores" aria-labelledby="ex-h">
        <div class="section-heading" data-reveal>
          <div><span class="eyebrow">02 — WHAT IT EXPLORES</span><h2 id="ex-h">Five <em>areas of play.</em></h2></div>
          <p>The territory Flaredrift keeps returning to.</p>
        </div>
        <ul class="e-list">
        ${ex}
        </ul>
      </section>

      <section class="p-section story" id="principles" aria-labelledby="pr-h">
        <div class="section-heading" data-reveal>
          <div><span class="eyebrow">03 — PRINCIPLES</span><h2 id="pr-h">How things <em>get made.</em></h2></div>
          <p>Four ideas that decide what is worth making.</p>
        </div>
        <div class="s-grid" data-story data-active="0">
          <div class="s-sticky">${figure}<div class="s-count" aria-hidden="true"><b data-count>01</b> / 04</div></div>
          <div class="s-steps">
        ${pr}
          </div>
        </div>
      </section>

      <section class="p-section ecosystem-section" id="in-the-world" aria-labelledby="world-h">
        <div class="section-heading" data-reveal>
          <div><span class="eyebrow">04 — IDEAS IN THE WORLD</span><h2 id="world-h">Curiosity, <em>made tangible.</em></h2></div>
          <p>Not every idea stays an experiment. Some become places to learn, create or spend time.</p>
        </div>
        <div class="ecosystem-orbit" data-reveal>
          <div class="ecosystem-core"><span>FLAREDRIFT</span><b>IDEAS<br/>IN MOTION</b><small>THE CREATIVE HOME</small></div>
          <a class="eco-node eco-bhashora"
   href="https://bhashora-learn.web.app/"
   target="_blank"
   rel="noopener noreferrer">
  <span class="eco-index">01 / LEARN</span>
  <b>Bhashora</b>
  <small>Language &amp; digital confidence</small>
  ${I.external(16)}
</a>

<a class="eco-node eco-iwrite"
   href="https://iwrite-here.web.app/"
   target="_blank"
   rel="noopener noreferrer">
  <span class="eco-index">02 / WRITE</span>
  <b>iwritehere</b>
  <small>A shared writing café</small>
  ${I.external(16)}
</a>

<a class="eco-node eco-flare" href="/#flare-lab">
  <span class="eco-index">03 / PLAY</span>
  <b>Flare Lab</b>
  <small>Light as a creative material</small>
  ${I.external(16)}
</a>
          <span class="eco-orbit-line orbit-line-one"></span><span class="eco-orbit-line orbit-line-two"></span>
        </div>
        <p class="ecosystem-footnote" data-reveal>Different outcomes. One instinct: make the digital world feel more human.</p>
      </section>

      <section class="p-cta" data-reveal>
        <span class="eyebrow">05 — IN PRACTICE</span>
        <div class="p-cta-row">
          <h2>See what<br /><em>that looks like.</em></h2>
          <div class="p-cta-links">
            <a class="text-link" href="/ventures/">Browse ventures ${I.up(15)}</a>
            <a class="text-link" href="/#playground">Visit the Playground ${I.up(15)}</a>
          </div>
        </div>
      </section>
    </main>`;
}

function jsonLd(route) {
  const p = pages[route];
  const url = SITE + p.path;
  const label = route === 'ventures' ? 'Ventures' : 'Vision';
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': route === 'ventures' ? 'CollectionPage' : 'AboutPage',
        '@id': url + '#webpage',
        url,
        name: p.title,
        description: p.description,
        inLanguage: 'en',
        isPartOf: { '@type': 'WebSite', name: 'Flaredrift', url: SITE + '/' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Flaredrift', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: label, item: url },
        ],
      },
    ],
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// Pull shared head tags from the real index.html so favicon, verification, stylesheet etc. stay in sync.
function carryOver(template) {
  const keep = [
    /<meta name="theme-color"[^>]*>/,
    /<meta name="google-site-verification"[^>]*>/,
    /<meta name="author"[^>]*>/,
    /<meta name="robots"[^>]*>/,
    /<link rel="icon"[^>]*>/,
    /<link rel="manifest"[^>]*>/,
    /<link rel="apple-touch-icon"[^>]*>/,
    /<meta property="og:site_name"[^>]*>/,
  ];
  const lines = keep.map((re) => (template.match(re) || [])[0]).filter(Boolean);
  const css = template.match(/<link rel="stylesheet"[^>]*>/g) || [];
  return { lines, css };
}

export function renderPage(route, { template, dev = false, version = '' }) {
  const p = pages[route];
  const url = SITE + p.path;
  const { lines, css } = carryOver(template);
  const v = version ? `?v=${version}` : '';
  const styles = css.length ? css.join('\n    ') : '<link rel="stylesheet" href="/src/styles.css?direct" />';
  const body = route === 'ventures' ? venturesBody() : visionBody();
  const image = SITE + '/icons/icon-512.png';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${lines.join('\n    ')}
    ${dev ? '<meta name="flaredrift-dev" content="1" />' : ''}
    <script>document.documentElement.className+=' js'</script>
    <title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <meta name="keywords" content="${esc(p.keywords)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${esc(p.ogTitle)}" />
    <meta property="og:description" content="${esc(p.ogDescription)}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${esc(p.ogTitle)}" />
    <meta name="twitter:description" content="${esc(p.ogDescription)}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json">${jsonLd(route)}</script>
    ${styles}
    <link rel="stylesheet" href="/static/pages.css${v}" />
  </head>
  <body class="static-page">
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="site-shell">
    ${header(route)}
    ${body}
    ${footer()}
    </div>
    <script src="/static/pages.js${v}" defer></script>
    <script src="/pwa.js${v}" defer></script>
  </body>
</html>
`;
}

export const routes = Object.keys(pages);
