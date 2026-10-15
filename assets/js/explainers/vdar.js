/* VDAR-Router explainer: verbalize difficulty -> retrieve similar records -> pick a model */
(function () {
  var root = document.getElementById('ex-vdar'); if (!root) return;
  var stage = root.querySelector('.ex-stage'), controls = root.querySelector('.ex-controls'), note = root.querySelector('.ex-note');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var QUERIES = [
    { q: 'What is the capital of France?', a: 'Factual recall. Single hop. Low ambiguity. Likely easy.', d: 0.12, tiers: [0, 0, 1] },
    { q: 'Summarize this paragraph in one sentence.', a: 'Compression task. Clear instruction. Moderate length. Medium.', d: 0.45, tiers: [0, 1, 2] },
    { q: 'Why does the proof of Fermat’s little theorem use Lagrange’s theorem?', a: 'Multi-step reasoning. Needs theorem knowledge and an explanation. Hard.', d: 0.86, tiers: [1, 2, 2] },
    { q: 'Debug this recursive function that overflows the stack.', a: 'Code reasoning. Needs an execution trace. Input is underspecified. Hard.', d: 0.72, tiers: [1, 2, 2] }
  ];
  var TIERS = ['Small', 'Medium', 'Large'];
  // 25 historical records: difficulty x and a deterministic y jitter
  var RECORDS = []; (function () { var s = 7; for (var i = 0; i < 25; i++) { s = (s * 9301 + 49297) % 233280; var r1 = s / 233280; s = (s * 9301 + 49297) % 233280; var r2 = s / 233280; RECORDS.push({ d: 0.05 + 0.9 * ((i + 0.5) / 25) * 0.6 + r1 * 0.36, y: 0.12 + r2 * 0.76 }); } })();

  function wrap(str, max) { var w = str.split(' '), lines = [], cur = ''; w.forEach(function (x) { if ((cur + ' ' + x).trim().length > max) { lines.push(cur.trim()); cur = x; } else cur += ' ' + x; }); if (cur.trim()) lines.push(cur.trim()); return lines; }
  function tspans(lines, x, y, lh) { return lines.map(function (l, i) { return '<tspan x="' + x + '" y="' + (y + i * lh) + '">' + l.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</tspan>'; }).join(''); }

  // geometry
  var PX = 240, PY = 40, PW = 180, PH = 230;           // retrieval panel
  var MX = 450, MW = 174, MH = 58, MY = [40, 118, 196];  // model boxes

  var svg = '<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" style="overflow:visible" role="img" aria-label="VDAR-Router: a query is analysed for difficulty, similar past records are retrieved, and a model tier is selected.">'
    + '<defs><radialGradient id="vdar-g1" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2F5BFF" stop-opacity=".25"/><stop offset="1" stop-color="#2F5BFF" stop-opacity="0"/></radialGradient>'
    + '<filter id="vdar-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs>'
    + '<circle cx="600" cy="20" r="150" fill="url(#vdar-g1)"/>'
    // column A
    + '<text class="vdar-eyebrow" x="16" y="30">QUERY</text>'
    + '<rect class="vdar-card" x="16" y="38" width="204" height="78" rx="10"/>'
    + '<text id="vdar-q" class="vdar-q" x="28" y="60"></text>'
    + '<text class="vdar-eyebrow" x="16" y="140">1 · VERBALIZED DIFFICULTY</text>'
    + '<rect class="vdar-card vdar-card-cyan" x="16" y="148" width="204" height="86" rx="10"/>'
    + '<text id="vdar-a" class="vdar-a" x="28" y="170"></text>'
    + '<text class="vdar-lbl" x="16" y="262">easy</text><text class="vdar-lbl" x="220" y="262" text-anchor="end">hard</text>'
    + '<rect x="16" y="268" width="204" height="5" rx="2.5" fill="rgba(255,255,255,.12)"/>'
    + '<rect id="vdar-meter" x="16" y="268" width="0" height="5" rx="2.5" fill="#22D3EE"/>'
    + '<circle id="vdar-mk" cx="16" cy="270.5" r="6" fill="#22D3EE" stroke="#0E1538" stroke-width="2"/>'
    // column B
    + '<text class="vdar-eyebrow" x="' + PX + '" y="30">2 · RETRIEVE SIMILAR DIFFICULTY</text>'
    + '<rect class="vdar-card" x="' + PX + '" y="' + PY + '" width="' + PW + '" height="' + PH + '" rx="10"/>'
    + '<text class="vdar-lbl" x="' + (PX + 10) + '" y="' + (PY + PH - 8) + '">easy</text><text class="vdar-lbl" x="' + (PX + PW - 10) + '" y="' + (PY + PH - 8) + '" text-anchor="end">hard</text>'
    + '<g id="vdar-links"></g><g id="vdar-dots">' + RECORDS.map(function (r, i) { return '<circle class="vdar-dot" data-i="' + i + '" cx="' + (PX + 14 + r.d * (PW - 28)).toFixed(1) + '" cy="' + (PY + 14 + r.y * (PH - 40)).toFixed(1) + '" r="3.5"/>'; }).join('') + '</g>'
    + '<path id="vdar-cur" d="M0 -7 L7 0 L0 7 L-7 0 Z" fill="#F3F5FF" opacity="0"/>'
    + '<text id="vdar-ret" class="vdar-lbl" x="' + (PX + PW / 2) + '" y="' + (PY + PH + 22) + '" text-anchor="middle"></text>'
    // column C
    + '<text class="vdar-eyebrow" x="' + MX + '" y="30">3 · SELECT A MODEL</text>'
    + TIERS.map(function (t, i) { var y = MY[i], coins = ''; for (var c = 0; c <= i; c++) coins += '<circle cx="' + (MX + MW - 18 - c * 13) + '" cy="' + (y + 18) + '" r="5" fill="#F59E0B" stroke="#0E1538" stroke-width="1.5"/>'; return '<g class="vdar-model" data-t="' + i + '"><rect class="vdar-mbox" x="' + MX + '" y="' + y + '" width="' + MW + '" height="' + MH + '" rx="10"/><rect class="vdar-mglow" x="' + MX + '" y="' + y + '" width="' + MW + '" height="' + MH + '" rx="10" filter="url(#vdar-blur)"/><text class="vdar-mname" x="' + (MX + 14) + '" y="' + (y + 23) + '">' + t + '</text><text class="vdar-lbl" x="' + (MX + 14) + '" y="' + (y + 43) + '">' + ['low cost', 'moderate cost', 'high cost'][i] + ' · ' + ['limited', 'balanced', 'strongest'][i] + '</text>' + coins + '</g>'; }).join('')
    + '<circle id="vdar-token" r="5" fill="#22D3EE" opacity="0"/>'
    + '<text id="vdar-out" class="vdar-out" x="' + MX + '" y="286"></text>'
    + '<text class="vdar-lbl" x="' + MX + '" y="306">reward balances cost and performance</text>'
    + '<text id="vdar-pref" class="vdar-pref" x="320" y="340" text-anchor="middle"></text>'
    + '</svg>';
  stage.innerHTML = svg;

  var css = document.createElement('style');
  css.textContent = '#ex-vdar svg{width:100%;height:auto;display:block;font-family:Inter,system-ui,sans-serif}'
    + '#ex-vdar .vdar-eyebrow{font-family:Sora,sans-serif;font-size:9.5px;font-weight:600;letter-spacing:.12em;fill:#A8B0D0}'
    + '#ex-vdar .vdar-card{fill:rgba(255,255,255,.04);stroke:rgba(255,255,255,.14);stroke-width:1}'
    + '#ex-vdar .vdar-card-cyan{stroke:rgba(34,211,238,.45)}'
    + '#ex-vdar .vdar-q{font-size:12px;fill:#F3F5FF;font-weight:500}'
    + '#ex-vdar .vdar-a{font-size:11px;fill:#22D3EE}'
    + '#ex-vdar .vdar-lbl{font-size:9.5px;fill:#A8B0D0}'
    + '#ex-vdar .vdar-dot{fill:rgba(168,176,208,.35);transition:fill .4s,r .4s}'
    + '#ex-vdar .vdar-dot.hot{fill:#8B5CF6;r:4.5}'
    + '#ex-vdar .vdar-link{stroke:#8B5CF6;stroke-width:1;opacity:0;stroke-dasharray:3 3;transition:opacity .5s}'
    + '#ex-vdar .vdar-link.in{opacity:.8}'
    + '#ex-vdar .vdar-mbox{fill:rgba(255,255,255,.04);stroke:rgba(255,255,255,.14);transition:stroke .4s,fill .4s}'
    + '#ex-vdar .vdar-mglow{fill:#2F5BFF;opacity:0;transition:opacity .5s}'
    + '#ex-vdar .vdar-model.on .vdar-mbox{stroke:#2F5BFF;fill:rgba(47,91,255,.18)}'
    + '#ex-vdar .vdar-model.on .vdar-mglow{opacity:.45}'
    + '#ex-vdar .vdar-mname{font-family:Sora,sans-serif;font-size:13px;font-weight:600;fill:#F3F5FF}'
    + '#ex-vdar .vdar-out{font-family:Sora,sans-serif;font-size:12.5px;font-weight:600;fill:#F3F5FF}'
    + '#ex-vdar .vdar-pref{font-size:10px;fill:#A8B0D0;font-style:italic}'
    + '#ex-vdar #vdar-meter,#ex-vdar #vdar-mk{transition:width .7s cubic-bezier(.2,.7,.2,1),cx .7s cubic-bezier(.2,.7,.2,1)}'
    + '#ex-vdar .vdar-slider{display:flex;align-items:center;gap:8px;font-size:.8rem;color:#A8B0D0;flex:1 1 260px}'
    + '@media(prefers-reduced-motion:reduce){#ex-vdar *{transition:none!important}}';
  root.appendChild(css);

  // controls
  controls.innerHTML = '<label class="vdar-slider">lower cost <input type="range" id="vdar-range" min="0" max="100" value="50" aria-label="Prefer lower cost or higher performance"> higher performance</label>'
    + '<button class="ex-btn" id="vdar-auto" aria-pressed="true">Auto-play</button><button class="ex-btn" id="vdar-next">Next query</button>';
  note.textContent = 'Routing shown here is illustrative. Benchmarks and numbers are in the paper.';

  var $ = function (id) { return root.querySelector('#' + id); };
  var qEl = $('vdar-q'), aEl = $('vdar-a'), meter = $('vdar-meter'), mk = $('vdar-mk'), links = $('vdar-links'), cur = $('vdar-cur'), ret = $('vdar-ret'), token = $('vdar-token'), out = $('vdar-out'), pref = $('vdar-pref');
  var dots = Array.prototype.slice.call(root.querySelectorAll('.vdar-dot')), models = Array.prototype.slice.call(root.querySelectorAll('.vdar-model'));
  var range = $('vdar-range'), autoBtn = $('vdar-auto'), nextBtn = $('vdar-next');
  var idx = 0, timers = [], raf = null, auto = true, shown = false, typing = null;
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearAll() { timers.forEach(clearTimeout); timers = []; if (raf) cancelAnimationFrame(raf); raf = null; if (typing) clearInterval(typing); typing = null; }
  function tierFor(q) { var p = +range.value; return p < 34 ? q.tiers[0] : p > 66 ? q.tiers[2] : q.tiers[1]; }
  function prefText() { var p = +range.value; return p < 34 ? 'preference: lower cost' : p > 66 ? 'preference: higher performance' : 'preference: balanced'; }

  function moveToken(from, via, to, ms, done) {
    token.setAttribute('opacity', '1');
    var t0 = performance.now();
    function step(now) {
      var k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var p = e < .5 ? lerp(from, via, e * 2) : lerp(via, to, (e - .5) * 2);
      token.setAttribute('cx', p[0]); token.setAttribute('cy', p[1]);
      if (k < 1) raf = requestAnimationFrame(step); else { token.setAttribute('opacity', '0'); done(); }
    }
    raf = requestAnimationFrame(step);
  }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  function render(i, animate) {
    clearAll();
    var q = QUERIES[i], tier = tierFor(q);
    qEl.innerHTML = tspans(wrap(q.q, 30), 28, 60, 15);
    pref.textContent = prefText();
    // reset
    aEl.innerHTML = ''; links.innerHTML = ''; dots.forEach(function (d) { d.classList.remove('hot'); }); models.forEach(function (m) { m.classList.remove('on'); });
    cur.setAttribute('opacity', '0'); ret.textContent = ''; out.textContent = ''; token.setAttribute('opacity', '0');
    meter.setAttribute('width', 0); mk.setAttribute('cx', 16);
    var near = RECORDS.map(function (r, k) { return { k: k, dd: Math.abs(r.d - q.d) }; }).sort(function (a, b) { return a.dd - b.dd; }).slice(0, 5);
    var cx = PX + 14 + q.d * (PW - 28), cy = PY + 14 + 0.5 * (PH - 40);
    var lines = wrap(q.a, 34);
    function showRetrieval() {
      cur.setAttribute('transform', 'translate(' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')'); cur.setAttribute('opacity', '1');
      near.forEach(function (n, j) {
        var d = dots[n.k]; d.classList.add('hot');
        var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('class', 'vdar-link'); l.setAttribute('x1', cx); l.setAttribute('y1', cy); l.setAttribute('x2', d.getAttribute('cx')); l.setAttribute('y2', d.getAttribute('cy'));
        links.appendChild(l); if (animate) later(function () { l.classList.add('in'); }, 80 * j); else l.classList.add('in');
      });
      ret.textContent = near.length + ' records with a similar difficulty profile';
    }
    function showModel() { models[tier].classList.add('on'); out.textContent = 'Routed to ' + TIERS[tier]; }
    if (!animate) { aEl.innerHTML = tspans(lines, 28, 170, 15); meter.setAttribute('width', 204 * q.d); mk.setAttribute('cx', 16 + 204 * q.d); showRetrieval(); showModel(); return; }
    // typed analysis
    var full = lines.join('\n'), n = 0;
    typing = setInterval(function () {
      n++; var part = full.slice(0, n).split('\n'); aEl.innerHTML = tspans(part, 28, 170, 15);
      if (n >= full.length) {
        clearInterval(typing); typing = null;
        later(function () { meter.setAttribute('width', 204 * q.d); mk.setAttribute('cx', 16 + 204 * q.d); }, 150);
        later(showRetrieval, 700);
        later(function () { moveToken([220, 77], [cx, cy], [MX, MY[tier] + MH / 2], 1000, function () { showModel(); if (auto) later(function () { idx = (idx + 1) % QUERIES.length; render(idx, true); }, 2200); }); }, 1500);
      }
    }, 22);
  }
  function start() { shown = true; idx = 0; if (REDUCED) { auto = false; autoBtn.setAttribute('aria-pressed', 'false'); render(0, false); } else render(0, true); }

  range.addEventListener('input', function () { if (!shown) return; render(idx, !REDUCED && auto); });
  autoBtn.addEventListener('click', function () { auto = !auto; autoBtn.setAttribute('aria-pressed', String(auto)); if (auto && shown && !REDUCED) render(idx, true); if (!auto) clearAll(); });
  nextBtn.addEventListener('click', function () { if (!shown) shown = true; idx = (idx + 1) % QUERIES.length; render(idx, !REDUCED); });
  window.addEventListener('explainer:show', function (e) { if (e.detail === 'vdar') start(); else clearAll(); });
})();
