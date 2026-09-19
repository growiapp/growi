/* =====================================================
   Growi — Shared behaviour
   Used by: index.html, app/index.html, web/index.html
   Nav, menú mobile, toggle de moneda, reveal y tracking de WhatsApp.
   ===================================================== */
(function () {
  // localStorage puede tirar error (modo privado / cookies bloqueadas): nunca debe romper la página
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  window.growiStore = store;

  // ── Nav ──
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
  }
  const norm = p => p.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.nav-links a, .mobile-menu-card a').forEach(a => {
    const href = a.getAttribute('href');
    if (href.startsWith('/') && norm(href) === norm(window.location.pathname)) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  // ── Menú mobile ──
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    const setMenu = open => {
      mobileMenu.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('menu-open', open);
    };
    setMenu(false);
    menuBtn.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu || e.target.closest('a')) setMenu(false);
    });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 881px)').matches) setMenu(false);
    });
  }

  // ── Toggle de moneda ──
  // Las páginas con lógica extra (planes de /app) escuchan el evento 'growi:currency'.
  function applyCurrency(c) {
    c = c === 'USD' ? 'USD' : 'ARS';
    store.set('growi_currency', c);
    document.documentElement.dataset.currency = c;
    document.querySelectorAll('[data-ars][data-usd]').forEach(el => {
      el.textContent = c === 'ARS' ? el.dataset.ars : el.dataset.usd;
    });
    [['btnARS', 'ARS'], ['btnUSD', 'USD']].forEach(([id, cur]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.classList.toggle('active', c === cur);
      btn.setAttribute('aria-pressed', String(c === cur));
    });
    document.dispatchEvent(new CustomEvent('growi:currency', { detail: c }));
  }
  applyCurrency(store.get('growi_currency'));
  [['btnARS', 'ARS'], ['btnUSD', 'USD']].forEach(([id, cur]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => applyCurrency(cur));
  });

  // ── Reveal ──
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 55);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ── Tracking de clics a WhatsApp (Plausible) ──
  document.addEventListener('click', e => {
    const link = e.target.closest ? e.target.closest('a[href*="wa.me/"]') : null;
    if (link && typeof window.plausible === 'function') {
      window.plausible('cta_whatsapp', { props: { location: link.getAttribute('data-track') || 'whatsapp' } });
    }
  });
})();
