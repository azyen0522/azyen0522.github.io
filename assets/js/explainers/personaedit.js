/* PersonaEdit explainer: cluster a user's data in hidden space, sample representatives, edit the model */
(function () {
  var root = document.getElementById('ex-personaedit'); if (!root) return;
  var stage = root.querySelector('.ex-stage'), controls = root.querySelector('.ex-controls'), note = root.querySelector('.ex-note');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CL = [
    { name: 'Food & diet', n: 10, c: [92, 112], r: 34, col: '#8B5CF6', lx: 34, ly: 62 },
    { name: 'Travel', n: 8, c: [214, 104], r: 30, col: '#22D3EE', lx: 180, ly: 56 },
    { name: 'Work style', n: 6, c: [150, 206], r: 26, col: '#F59E0B', lx: 112, ly: 252 }
  ];
  var N = 24, PX = 16, PY = 40, PW = 284, PH = 232;
  var seed = 11; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  var dots = [];
  CL.forEach(function (c, ci) {
    for (var k = 0; k < c.n; k++) {
      var ang = rnd() * Math.PI * 2, rad = (k === 0 ? 0.15 : 0.35 + rnd() * 0.65) * c.r;
      dots.push({ ci: ci, k: k, scatter: [PX + 18 + rnd() * (PW - 36), PY + 18 + rnd() * (PH - 36)], clus: [c.c[0] + Math.cos(ang) * rad, c.c[1] + Math.sin(ang) * rad] });
    }
  });
  var MX = 330, MY = 56, MW = 294, MH = 124;

  var svg = '<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" style="overflow:visible" role="img" aria-label="PersonaEdit: a user\'s samples are clustered, representatives are sampled per cluster, and only those are written into the model.">'
    + '<defs><radialGradient id="pe-g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#8B5CF6" stop-opacity=".22"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient>'
    + '<filter id="pe-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter></defs>'
    + '<circle cx="40" cy="330" r="150" fill="url(#pe-g)"/>'
    + '<text class="pe-eyebrow" x="' + PX + '" y="30">A USER’S INTERACTION HISTORY · <tspan id="pe-count">24 samples</tspan></text>'
    + '<rect class="pe-card" x="' + PX + '" y="' + PY + '" width="' + PW + '" height="' + PH + '" rx="12"/>'
    + '<text id="pe-space" class="pe-lbl" x="' + (PX + PW - 10) + '" y="' + (PY + PH - 8) + '" text-anchor="end" opacity="0">hidden representation space</text>'
    + CL.map(function (c, i) { return '<g class="pe-cl" data-ci="' + i + '" opacity="0"><circle cx="' + c.c[0] + '" cy="' + c.c[1] + '" r="' + (c.r + 10) + '" fill="' + c.col + '" opacity=".08" stroke="' + c.col + '" stroke-opacity=".35" stroke-dasharray="3 3"/><text class="pe-cname" x="' + c.lx + '" y="' + c.ly + '" fill="' + c.col + '">' + c.name + ' · <tspan class="pe-alloc"></tspan></text></g>'; }).join('')
    + '<g id="pe-dots">' + dots.map(function (d, i) { return '<g class="pe-dot" data-i="' + i + '" style="transform:translate(' + d.scatter[0].toFixed(1) + 'px,' + d.scatter[1].toFixed(1) + 'px)"><circle class="pe-ring" r="7.5" fill="none" stroke="#F3F5FF" stroke-width="1.5" opacity="0"/><circle class="pe-core" r="4" fill="rgba(168,176,208,.55)"/></g>'; }).join('') + '</g>'
    // model
    + '<text class="pe-eyebrow" x="' + MX + '" y="30">THE MODEL</text>'
    + '<rect class="pe-card" x="' + MX + '" y="' + MY + '" width="' + MW + '" height="' + MH + '" rx="12"/>'
    + '<rect id="pe-mglow" x="' + MX + '" y="' + MY + '" width="' + MW + '" height="' + MH + '" rx="12" fill="#2F5BFF" opacity="0" filter="url(#pe-blur)"/>'
    + [0, 1, 2, 3].map(function (r) { return '<rect x="' + (MX + 16) + '" y="' + (MY + 20 + r * 20) + '" width="' + (MW - 32) + '" height="12" rx="3" fill="rgba(255,255,255,.06)"/>'; }).join('')
    + '<text class="pe-lbl" x="' + (MX + 16) + '" y="' + (MY + MH - 12) + '">parameters · <tspan id="pe-edits" fill="#F3F5FF">no edits yet</tspan></text>'
    + '<text id="pe-msg" class="pe-msg" x="' + MX + '" y="208"></text>'
    // compare strip
    + '<rect class="pe-card pe-muted" x="' + MX + '" y="226" width="140" height="62" rx="10"/><text class="pe-h" x="' + (MX + 12) + '" y="246">Retrieval-based</text><text class="pe-lbl" x="' + (MX + 12) + '" y="262"><tspan x="' + (MX + 12) + '">depends on retrieval quality,</tspan><tspan x="' + (MX + 12) + '" dy="13">degrades over long interactions</tspan></text>'
    + '<rect class="pe-card pe-blue" x="' + (MX + 154) + '" y="226" width="140" height="62" rx="10"/><text class="pe-h" x="' + (MX + 166) + '" y="246">Model editing</text><text class="pe-lbl" x="' + (MX + 166) + '" y="262"><tspan x="' + (MX + 166) + '">knowledge written into the</tspan><tspan x="' + (MX + 166) + '" dy="13">weights, no retrieval at run time</tspan></text>'
    + '<g id="pe-rail">' + ['Samples', 'Cluster', 'Select', 'Edit'].map(function (t, i) { var x = 16 + i * 72; return '<circle class="pe-rdot" data-s="' + i + '" cx="' + (x + 6) + '" cy="334" r="4"/><text class="pe-rlbl" data-s="' + i + '" x="' + (x + 16) + '" y="338">' + (i + 1) + ' · ' + t + '</text>'; }).join('') + '</g>'
    + '</svg>';
  stage.innerHTML = svg;

  var css = document.createElement('style');
  css.textContent = '#ex-personaedit svg{width:100%;height:auto;display:block;font-family:Inter,system-ui,sans-serif}'
    + '#ex-personaedit .pe-eyebrow{font-family:Sora,sans-serif;font-size:9.5px;font-weight:600;letter-spacing:.12em;fill:#A8B0D0}'
    + '#ex-personaedit .pe-card{fill:rgba(255,255,255,.04);stroke:rgba(255,255,255,.14)}'
    + '#ex-personaedit .pe-blue{stroke:rgba(47,91,255,.7);fill:rgba(47,91,255,.12)}'
    + '#ex-personaedit .pe-lbl{font-size:9.5px;fill:#A8B0D0}'
    + '#ex-personaedit .pe-h{font-family:Sora,sans-serif;font-size:11px;font-weight:600;fill:#F3F5FF}'
    + '#ex-personaedit .pe-cname{font-family:Sora,sans-serif;font-size:10px;font-weight:600}'
    + '#ex-personaedit .pe-msg{font-family:Sora,sans-serif;font-size:12.5px;font-weight:600;fill:#F3F5FF}'
    + '#ex-personaedit .pe-cl{transition:opacity .6s}'
    + '#ex-personaedit .pe-dot{transition:transform .9s cubic-bezier(.2,.7,.2,1),opacity .5s}'
    + '#ex-personaedit .pe-core{transition:fill .5s,r .4s}'
    + '#ex-personaedit .pe-ring{transition:opacity .4s}'
    + '#ex-personaedit .pe-dot.sel .pe-ring{opacity:1}#ex-personaedit .pe-dot.sel .pe-core{r:4.5}'
    + '#ex-personaedit .pe-dot.dim{opacity:.25}'
    + '#ex-personaedit #pe-mglow,#ex-personaedit #pe-space{transition:opacity .6s}'
    + '#ex-personaedit .pe-rdot{fill:rgba(255,255,255,.18);transition:fill .3s}#ex-personaedit .pe-rdot.on{fill:#22D3EE}'
    + '#ex-personaedit .pe-rlbl{font-size:9.5px;fill:#A8B0D0;transition:fill .3s}#ex-personaedit .pe-rlbl.on{fill:#F3F5FF;font-weight:600}'
    + '#ex-personaedit .pe-slider{display:flex;align-items:center;gap:8px;font-size:.8rem;color:#A8B0D0;flex:1 1 220px}'
    + '@media(prefers-reduced-motion:reduce){#ex-personaedit *{transition:none!important}}';
  root.appendChild(css);

  controls.innerHTML = ['Samples', 'Cluster', 'Select', 'Edit'].map(function (t, i) { return '<button class="ex-btn" data-s="' + i + '" aria-pressed="' + (i === 0) + '">' + (i + 1) + ' · ' + t + '</button>'; }).join('')
    + '<label class="pe-slider">edit budget <input type="range" id="pe-budget" min="3" max="12" value="6" aria-label="Edit budget"> <b id="pe-bval" style="color:#F3F5FF">6</b></label>'
    + '<button class="ex-btn" id="pe-auto" aria-pressed="true">Auto-play</button>';
  note.textContent = 'Illustrative user data and clusters. Dataset and results are in the paper.';

  var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var dotEls = $$('.pe-dot'), clEls = $$('.pe-cl'), budget = $('#pe-budget'), bval = $('#pe-bval'), autoBtn = $('#pe-auto');
  var step = 0, auto = true, shown = false, timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearAll() { timers.forEach(clearTimeout); timers = []; }
  function alloc(B) { // largest-remainder, each cluster at least 1
    var q = CL.map(function (c) { return c.n / N * B; }), f = q.map(Math.floor), rem = B - f.reduce(function (a, b) { return a + b; }, 0);
    var order = q.map(function (v, i) { return [v - f[i], i]; }).sort(function (a, b) { return b[0] - a[0]; });
    for (var i = 0; i < rem; i++) f[order[i][1]]++;
    for (var j = 0; j < f.length; j++) if (f[j] === 0) { f[j] = 1; var m = f.indexOf(Math.max.apply(null, f)); if (m !== j) f[m]--; }
    return f;
  }
  function setPos(i, p) { dotEls[i].style.transform = 'translate(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px)'; }
  function render(s) {
    step = s; var B = +budget.value, al = alloc(B);
    $$('.ex-controls .ex-btn[data-s]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.s === s)); });
    $$('.pe-rdot,.pe-rlbl').forEach(function (e) { e.classList.toggle('on', +e.dataset.s <= s); });
    bval.textContent = B;
    $('#pe-space').setAttribute('opacity', s >= 1 ? 1 : 0);
    clEls.forEach(function (g, ci) { g.setAttribute('opacity', s >= 1 ? 1 : 0); g.querySelector('.pe-alloc').textContent = s >= 2 ? al[ci] + ' of ' + CL[ci].n : CL[ci].n; });
    var editPos = 0;
    dots.forEach(function (d, i) {
      var el = dotEls[i], core = el.querySelector('.pe-core'), sel = s >= 2 && d.k < al[d.ci];
      el.classList.toggle('sel', sel && s < 3); el.classList.toggle('dim', s >= 2 && !sel);
      core.setAttribute('fill', s >= 1 ? CL[d.ci].col : 'rgba(168,176,208,.55)');
      if (s === 0) setPos(i, d.scatter);
      else if (s < 3 || !sel) setPos(i, d.clus);
      else { setPos(i, [MX + 24 + (editPos % 12) * 22, MY + 11 + Math.floor(editPos / 12) * 20]); editPos++; }
    });
    $('#pe-mglow').setAttribute('opacity', s >= 3 ? .45 : 0);
    $('#pe-count').textContent = s >= 2 ? B + ' selected of 24' : '24 samples';
    $('#pe-edits').textContent = s >= 3 ? B + ' edits instead of ' + N : 'no edits yet';
    $('#pe-msg').textContent = s === 0 ? 'Edit all 24? Costly, and edits interfere.' : s === 1 ? 'Cluster the hidden representations.' : s === 2 ? 'Sample in proportion to cluster size.' : 'Write ' + B + ' representative samples in.';
    if (auto && shown && !REDUCED) later(function () { render((s + 1) % 4); }, s === 3 ? 3000 : 2300);
  }
  function start() { shown = true; clearAll(); if (REDUCED) { auto = false; autoBtn.setAttribute('aria-pressed', 'false'); render(3); } else { render(0); } }
  $$('.ex-controls .ex-btn[data-s]').forEach(function (b) { b.addEventListener('click', function () { shown = true; auto = false; autoBtn.setAttribute('aria-pressed', 'false'); clearAll(); render(+b.dataset.s); }); });
  autoBtn.addEventListener('click', function () { auto = !auto; autoBtn.setAttribute('aria-pressed', String(auto)); clearAll(); if (auto) { shown = true; render(step); } });
  budget.addEventListener('input', function () { clearAll(); render(step); });
  window.addEventListener('explainer:show', function (e) { if (e.detail === 'personaedit') start(); else clearAll(); });
})();
