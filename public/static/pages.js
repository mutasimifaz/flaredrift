/* Progressive enhancement for /ventures/ and /vision/. Content is fully present without this script. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document;

  // mobile navigation
  var toggle = doc.querySelector('.menu-toggle');
  var nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    var set = function (open) {
      nav.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () { set(!nav.classList.contains('nav-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  // scroll reveals
  var reveals = [].slice.call(doc.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // vision page: hero pointer light
  var hero = doc.querySelector('.v-hero');
  if (hero && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  // vision page: manifesto words light up with scroll, reading progress, story steps
  var lit = doc.querySelector('[data-lit]');
  var words = lit ? [].slice.call(lit.querySelectorAll('.lw')) : [];
  var bar = doc.querySelector('.read-progress');
  var story = doc.querySelector('[data-story]');
  var steps = story ? [].slice.call(story.querySelectorAll('.s-step')) : [];
  var counter = doc.querySelector('[data-count]');

  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    if (words.length && !reduce) {
      var r = lit.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      var n = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
    }
    if (bar) {
      var max = doc.documentElement.scrollHeight - vh;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    }
    if (steps.length) {
      var mid = vh * 0.5, best = 0, bestD = Infinity;
      steps.forEach(function (s, i) {
        var b = s.getBoundingClientRect();
        var d = Math.abs((b.top + b.bottom) / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (story.getAttribute('data-active') !== String(best)) {
        story.setAttribute('data-active', String(best));
        if (counter) counter.textContent = '0' + (best + 1);
      }
      steps.forEach(function (s, i) { s.classList.toggle('active', i === best); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  if (words.length || bar || steps.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  }
})();
