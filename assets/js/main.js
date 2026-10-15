/* NYCU NLP Lab — site behaviour: nav, hero canvas, reveal, stats, tabs, publications */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  const toggle = document.getElementById('navToggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  /* ---------- hero canvas: drifting token graph ---------- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], mouse = { x: -1e4, y: -1e4 }, raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const N = () => Math.round(Math.min(110, Math.max(45, (W * H) / 14000)));
    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = N();
      nodes = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        r: 1.2 + Math.random() * 2.2, hue: i % 3
      }));
    }
    const colors = ['47,91,255', '34,211,238', '139,92,246'];
    function frame() {
      ctx.clearRect(0, 0, W, H);
      // soft glow blobs
      const g1 = ctx.createRadialGradient(W * .78, H * .35, 0, W * .78, H * .35, Math.max(W, H) * .45);
      g1.addColorStop(0, 'rgba(47,91,255,.28)'); g1.addColorStop(1, 'rgba(47,91,255,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
      const g2 = ctx.createRadialGradient(W * .15, H * .85, 0, W * .15, H * .85, Math.max(W, H) * .35);
      g2.addColorStop(0, 'rgba(139,92,246,.18)'); g2.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
      const linkD = Math.min(170, W / 7);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!reduced) {
          a.x += a.vx; a.y += a.vy;
          const dx = a.x - mouse.x, dy = a.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 160 * 160) { const f = (1 - Math.sqrt(d2) / 160) * .18; a.x += dx / Math.sqrt(d2) * f * 6; a.y += dy / Math.sqrt(d2) * f * 6; }
          if (a.x < -20) a.x = W + 20; if (a.x > W + 20) a.x = -20; if (a.y < -20) a.y = H + 20; if (a.y > H + 20) a.y = -20;
        }
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
          if (d < linkD) {
            ctx.strokeStyle = `rgba(140,170,255,${(1 - d / linkD) * .32})`;
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const a of nodes) {
        ctx.fillStyle = `rgba(${colors[a.hue]},.9)`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    }
    resize(); frame();
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); frame(); });
    canvas.parentElement.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = -1e4; mouse.y = -1e4; });
    // pause when hero is off-screen
    new IntersectionObserver(([en]) => { if (reduced) return; if (en.isIntersecting) { cancelAnimationFrame(raf); frame(); } else cancelAnimationFrame(raf); }).observe(canvas);
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- stats (computed from data) ---------- */
  // lab site shows lab-era work only (PhD-era papers with Hen-Hsen Huang / Hsin-Hsi Chen stay on the personal page)
  const PUBS = (window.PUBS || []).filter(p => !/Hen-Hsen Huang|Hsin-Hsi Chen/.test(p.authors));
  window.LAB_PUBS = PUBS;
  const venueFamily = v => v.replace(/\s*(20\d\d|Findings|Demo)/g, '').trim();
  const stats = {
    statPubs: PUBS.filter(p => p.type !== 'preprint' && p.type !== 'chapter').length,
    statVenues: new Set(PUBS.filter(p => p.type !== 'preprint' && p.type !== 'chapter').map(p => venueFamily(p.venue))).size,
    stat2026: PUBS.filter(p => p.year === 2026).length
  };
  function countUp(el, to) {
    if (reduced) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  Object.entries(stats).forEach(([id, v]) => { const el = document.getElementById(id); if (el) countUp(el, v); });

  /* ---------- featured tabs ---------- */
  const tabs = document.querySelectorAll('#featTabs .tab');
  const showPanel = key => { const t = [...tabs].find(x => x.dataset.panel === key); if (t) t.click(); };
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === t));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + t.dataset.panel));
    window.dispatchEvent(new CustomEvent('explainer:show', { detail: t.dataset.panel }));
  }));

  /* ---------- featured tab strip arrows + rail ---------- */
  const strip = document.getElementById('featTabs'), prev = document.getElementById('tabPrev'), next = document.getElementById('tabNext'), rail = document.getElementById('tabRail');
  if (strip && prev && next) {
    const upd = () => { const max = strip.scrollWidth - strip.clientWidth; prev.disabled = strip.scrollLeft <= 2; next.disabled = strip.scrollLeft >= max - 2; if (rail) { rail.style.width = (strip.clientWidth / strip.scrollWidth * 100) + '%'; rail.style.left = (strip.scrollLeft / strip.scrollWidth * 100) + '%'; } };
    prev.addEventListener('click', () => strip.scrollBy({ left: -strip.clientWidth * .6, behavior: 'smooth' }));
    next.addEventListener('click', () => strip.scrollBy({ left: strip.clientWidth * .6, behavior: 'smooth' }));
    strip.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    tabs.forEach(t => t.addEventListener('click', () => t.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })));
  }

  /* ---------- publications ---------- */
  const TOP = /^(EMNLP|EACL|ACL|NAACL|SIGIR|WWW|AAAI|IJCAI|CIKM|COLING|LREC-COLING|ICLR|NeurIPS)/;
  const list = document.getElementById('pubList'), count = document.getElementById('pubCount');
  const search = document.getElementById('pubSearch'), fbtns = document.querySelectorAll('#pubFilters .fbtn');
  let filter = 'all';
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bold = a => esc(a).replace(/An-Zi Yen/g, '<b>An-Zi Yen</b>');
  function render() {
    const q = search.value.trim().toLowerCase();
    const rows = PUBS.filter(p => {
      if (filter === 'selected' && !p.selected) return false;
      if (filter === 'journal' && p.type !== 'journal') return false;
      if (!['all', 'selected', 'journal'].includes(filter) && !p.tags.includes(filter)) return false;
      if (q && !(p.title + ' ' + p.authors + ' ' + p.venue).toLowerCase().includes(q)) return false;
      return true;
    });
    count.textContent = rows.length + ' of ' + PUBS.length;
    const byYear = new Map();
    rows.forEach(p => { if (!byYear.has(p.year)) byYear.set(p.year, []); byYear.get(p.year).push(p); });
    list.innerHTML = [...byYear.entries()].map(([y, ps]) => `
      <div class="year-group"><div class="year-label">${y}</div><div class="pub-list">${ps.map(p => `
        <article class="pub">
          <span class="badge ${TOP.test(p.venue) ? 'top' : ''}">${esc(p.venue)}</span>
          <div>
            <div class="t">${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</div>
            <div class="a">${bold(p.authors)}</div>
            ${p.note ? `<div class="n">${esc(p.note)}</div>` : ''}
            ${p.link ? `<a class="ext" href="${esc(p.link)}" target="_blank" rel="noopener">Paper ↗</a>` : ''}
          </div>
        </article>`).join('')}</div></div>`).join('') || '<p class="lead">No publications match.</p>';
  }
  function setFilter(f) { filter = f; fbtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f)); render(); }
  if (list && search) {
    fbtns.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));
    search.addEventListener('input', render);
    document.querySelectorAll('[data-filter]').forEach(a => a.addEventListener('click', () => setFilter(a.dataset.filter)));
    render();
    // deep links: #featured-<panel>, #publications-<filter>
    const applyHash = () => {
      const h = location.hash.slice(1), mf = h.match(/^featured-(\w+)$/), mp = h.match(/^publications-(\w+)$/);
      if (mf) { showPanel(mf[1]); document.getElementById('featured').scrollIntoView(); }
      if (mp) { setFilter(mp[1]); document.getElementById('publications').scrollIntoView(); }
    };
    applyHash(); window.addEventListener('hashchange', applyHash);
  }
})();
