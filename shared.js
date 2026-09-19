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
  // Activo también en subpáginas: /app/cafeterias/ marca "GrowiApp"
  const here = window.location.pathname.replace(/\/*$/, '/');
  document.querySelectorAll('.nav-links a, .mobile-menu-card a').forEach(a => {
    const href = a.getAttribute('href');
    if (href.startsWith('/') && href !== '/' && here.startsWith(href.replace(/\/*$/, '/'))) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  // Aviso para lectores de pantalla en los links que abren otra pestaña
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    a.insertAdjacentHTML('beforeend', '<span class="sr-only"> (abre en una pestaña nueva)</span>');
  });

  // ── Menú mobile ──
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    const setMenu = (open, moveFocus) => {
      mobileMenu.classList.toggle('open', open);
      // modal real: el fondo queda fuera del teclado y del lector de pantalla, y el foco entra y vuelve
      document.querySelectorAll('main, footer, .sticky-cta, .wa-float').forEach(el => { el.inert = open; });
      if (moveFocus) requestAnimationFrame(() => (open ? mobileMenu.querySelector('a') : menuBtn).focus());
      mobileMenu.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('menu-open', open);
    };
    setMenu(false);
    menuBtn.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open'), true));
    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu || e.target.closest('a')) setMenu(false);
    });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) setMenu(false, true);
    });
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 881px)').matches) setMenu(false);
    });
  }

  // ── Precios ──
  // La fuente de verdad es USD (data-price="15"). El ARS se deriva del tipo de cambio de shared.fx.js,
  // redondeado al millar desde $100.000 y a la centena por debajo (mismo criterio que actualizar-cambio.mjs).
  const venta = (window.GROWI_FX && window.GROWI_FX.venta) || 0;
  function formatPrice(usd, cur, short) {
    if (cur === 'ARS' && venta) {
      const v = usd * venta, paso = v >= 100000 ? 1000 : 100;
      return '$' + (Math.round(v / paso) * paso).toLocaleString('es-AR') + (short ? '' : ' ARS');
    }
    const r = Math.round(usd * 100) / 100;
    return 'USD ' + (Number.isInteger(r) ? String(r) : r.toFixed(2).replace('.', ','));
  }
  window.growiPrice = formatPrice;

  // ── Toggle de moneda ──
  // Las páginas con lógica extra (planes de /app) escuchan el evento 'growi:currency'.
  function applyCurrency(c) {
    c = c === 'USD' ? 'USD' : 'ARS';
    store.set('growi_currency', c);
    document.documentElement.dataset.currency = c;
    document.querySelectorAll('[data-price]').forEach(el => {
      el.textContent = formatPrice(Number(el.dataset.price), c, el.hasAttribute('data-price-short'));
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

  // ── Botón fijo mobile de las landings ──
  // Aparece cuando ya no hay otro CTA a la vista: se esconde mientras se ve el hero, el cierre o el footer.
  const sticky = document.querySelector('.sticky-cta');
  if (sticky && 'IntersectionObserver' in window) {
    const visibles = new Set();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target));
      sticky.classList.toggle('show', visibles.size === 0);
    });
    document.querySelectorAll('[data-sticky-hide], footer').forEach(el => io.observe(el));
  }

  // ── Reveal ──
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), Math.min(i, 5) * 55); // tope: del sexto en adelante entran juntos
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
