/* Flaredrift PWA client: service worker registration, update prompt, install prompt. */
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (document.querySelector('meta[name="flaredrift-dev"]')) return; // skip in `vite dev`

  var SVG = {
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + SVG[name] + '</svg>';
  }

  var css = document.createElement('style');
  css.textContent =
    '.fd-pwa{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:1000;display:flex;flex-direction:column;gap:8px;max-width:calc(100vw - 32px)}' +
    '.fd-pwa-card{display:flex;align-items:center;gap:12px;background:#0d0d0d;border:1px solid #514b46;color:#f2eee8;padding:10px 10px 10px 14px;font:11px "DM Mono",ui-monospace,monospace;letter-spacing:.06em;box-shadow:0 12px 40px rgba(0,0,0,.5)}' +
    '.fd-pwa-card button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;display:inline-flex;align-items:center;gap:7px;padding:8px 10px}' +
    '.fd-pwa-card .fd-act{background:#ff4322;color:#050505;font-weight:500}' +
    '.fd-pwa-card .fd-act:hover{background:#ff6848}' +
    '.fd-pwa-card .fd-x{padding:8px;color:#a29b93}.fd-pwa-card .fd-x:hover{color:#fff}' +
    '.fd-pwa-card button:focus-visible{outline:2px solid #45d8ff;outline-offset:2px}';
  document.head.appendChild(css);

  var host;
  function stack() {
    if (!host) {
      host = document.createElement('div');
      host.className = 'fd-pwa';
      host.setAttribute('role', 'status');
      document.body.appendChild(host);
    }
    return host;
  }
  function card(label, actionLabel, actionIcon, onAction, onDismiss) {
    var el = document.createElement('div');
    el.className = 'fd-pwa-card';
    el.innerHTML = '<span></span><button type="button" class="fd-act">' + icon(actionIcon) + '<span></span></button><button type="button" class="fd-x" aria-label="Dismiss">' + icon('x') + '</button>';
    el.firstChild.textContent = label;
    el.querySelector('.fd-act span').textContent = actionLabel;
    el.querySelector('.fd-act').addEventListener('click', onAction);
    el.querySelector('.fd-x').addEventListener('click', function () { el.remove(); if (onDismiss) onDismiss(); });
    stack().appendChild(el);
    return el;
  }

  // ---- update handling ----
  var reloading = false, userAsked = false, updateShown = false;
  function showUpdate(worker) {
    if (updateShown) return;
    updateShown = true;
    card('A new version is ready', 'Refresh', 'refresh', function () {
      userAsked = true;
      worker.postMessage({ type: 'SKIP_WAITING' });
    });
  }
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!userAsked || reloading) return;
    reloading = true;
    location.reload();
  });

  function register() {
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', function () {
          if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdate(w);
        });
      });
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') reg.update().catch(function () {});
      });
      setInterval(function () { reg.update().catch(function () {}); }, 60 * 60 * 1000);
    }).catch(function () {});
  }
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);

  // ---- install prompt ----
  var deferred, installCard;
  var dismissed = false;
  try { dismissed = sessionStorage.getItem('fd-install-dismissed') === '1'; } catch (e) {}
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    if (dismissed || installCard) return;
    var appName = document.querySelector('meta[name="application-name"]')?.content ||
      (document.title.toUpperCase().includes('MINDTRACE') ? 'MINDTRACE' : 'Flaredrift');
    installCard = card('Install ' + appName + ' as an app', 'Install', 'download', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; if (installCard) installCard.remove(); });
    }, function () {
      try { sessionStorage.setItem('fd-install-dismissed', '1'); } catch (e2) {}
    });
  });
  window.addEventListener('appinstalled', function () { if (installCard) installCard.remove(); deferred = null; });
})();
