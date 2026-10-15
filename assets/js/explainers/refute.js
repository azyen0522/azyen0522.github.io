/* RefuteClaim (WWW 2024) interactive explainer. Self-contained, no deps, no network. */
(function () {
  var root = document.getElementById('ex-refute');
  if (!root) return;
  var stage = root.querySelector('.ex-stage');
  var controls = root.querySelector('.ex-controls');
  var note = root.querySelector('.ex-note');
  if (!stage || !controls || !note) return;

  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var STYLE = [
    '#ex-refute svg{width:100%;height:auto;display:block;overflow:visible}',
    '#ex-refute svg text{font-family:"Inter",system-ui,sans-serif;fill:#F3F5FF}',
    '#ex-refute .rf-header,#ex-refute .rf-label,#ex-refute .rf-chip-label,#ex-refute .rf-pill-label{font-family:"Sora",system-ui,sans-serif}',
    '#ex-refute .rf-header{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}',
    '#ex-refute .rf-body{font-size:11px;fill:#F3F5FF}',
    '#ex-refute .rf-chip-label{font-size:10.5px;font-weight:600;fill:#F3F5FF}',
    '#ex-refute .rf-flaw-label{font-size:10px;fill:#F472B6;font-weight:500}',
    '#ex-refute .rf-explain{font-size:11.5px;fill:#F3F5FF}',
    '#ex-refute .rf-pill-label{font-size:16px;font-weight:700;fill:#2A0B1C}',
    '#ex-refute .rf-card{fill:#121B45;stroke:#2F5BFF;stroke-width:1.5}',
    '#ex-refute .rf-chip{fill:#121B45;stroke:#8B5CF6;stroke-width:1.5}',
    '#ex-refute .rf-flaw{fill:#171030;stroke:#F472B6;stroke-width:1.5}',
    '#ex-refute .rf-pill{fill:#F472B6;stroke:#F472B6}',
    '#ex-refute .rf-tick{stroke:#8B5CF6;stroke-width:1.5}',
    '#ex-refute .rf-link{fill:none;stroke:#2F5BFF;stroke-width:1.5}',
    '#ex-refute .rf-link-rose{stroke:#F472B6}',
    '#ex-refute .rf-blob{opacity:.12}',
    '#ex-refute .rf-glow{opacity:.35}',
    '#ex-refute [data-step]{opacity:0;transform:translateY(8px);transition:opacity .5s ease, transform .5s ease;transform-box:fill-box;transform-origin:center}',
    '#ex-refute [data-step].in{opacity:1;transform:translateY(0)}',
    '#ex-refute .rf-rail-fill{transform:scaleX(0);transform-origin:0 0;transition:transform .5s ease}',
    '#ex-refute .rf-dot{fill:#0E1538;stroke:#3A4270;stroke-width:1.5;transition:fill .3s ease,stroke .3s ease}',
    '#ex-refute .rf-label{font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;fill:#A8B0D0;opacity:.7;transition:fill .3s ease,opacity .3s ease}',
    '#ex-refute .rf-step.is-active .rf-dot{fill:#22D3EE;stroke:#22D3EE}',
    '#ex-refute .rf-step.is-active .rf-label{fill:#F3F5FF;opacity:1;font-weight:600}',
    '#ex-refute .rf-step.is-done .rf-dot{fill:#2F5BFF;stroke:#2F5BFF}',
    '#ex-refute .rf-step.is-done .rf-label{fill:#A8B0D0;opacity:.85}',
    '#ex-refute svg.rf-reduced *{transition:none!important}'
  ].join('');

  var SVG = ''
    + '<svg viewBox="0 0 640 360" role="img" aria-label="RefuteClaim pipeline: claim, aspects, flaws, verdict">'
    + '<defs>'
    + '<filter id="rf-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>'
    + '<filter id="rf-blur-sm" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>'
    + '<marker id="rf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
    + '<path d="M0,0 L10,5 L0,10 Z" fill="#A8B0D0"/></marker>'
    + '</defs>'
    + '<rect x="0" y="0" width="640" height="360" rx="18" fill="#0E1538"/>'
    + '<circle class="rf-blob" cx="70" cy="330" r="90" fill="#2F5BFF" filter="url(#rf-blur)"/>'
    + '<circle class="rf-blob" cx="590" cy="46" r="80" fill="#8B5CF6" filter="url(#rf-blur)"/>'

    + '<g class="rf-rail">'
    + '<line x1="30" y1="34" x2="610" y2="34" stroke="rgba(255,255,255,.14)" stroke-width="2" stroke-linecap="round"/>'
    + '<g transform="translate(30,33)"><rect class="rf-rail-fill" x="0" y="0" width="580" height="2" rx="1" fill="#22D3EE"/></g>'
    + '<g class="rf-step" data-i="0"><circle class="rf-dot" cx="103" cy="34" r="5"/><text class="rf-label" x="103" y="20" text-anchor="middle">Claim</text></g>'
    + '<g class="rf-step" data-i="1"><circle class="rf-dot" cx="248" cy="34" r="5"/><text class="rf-label" x="248" y="20" text-anchor="middle">Aspects</text></g>'
    + '<g class="rf-step" data-i="2"><circle class="rf-dot" cx="393" cy="34" r="5"/><text class="rf-label" x="393" y="20" text-anchor="middle">Flaws</text></g>'
    + '<g class="rf-step" data-i="3"><circle class="rf-dot" cx="538" cy="34" r="5"/><text class="rf-label" x="538" y="20" text-anchor="middle">Verdict</text></g>'
    + '</g>'

    + '<g data-step="0">'
    + '<text class="rf-header" x="103" y="58" text-anchor="middle" fill="#22D3EE">Claim</text>'
    + '<rect class="rf-card" x="18" y="66" width="170" height="108" rx="14"/>'
    + '<text class="rf-body" x="33" y="96">'
    + '<tspan x="33" dy="0">A viral photo shows</tspan>'
    + '<tspan x="33" dy="14">a shark swimming</tspan>'
    + '<tspan x="33" dy="14">down a flooded</tspan>'
    + '<tspan x="33" dy="14">highway after this</tspan>'
    + '<tspan x="33" dy="14">week\'s hurricane.</tspan>'
    + '</text>'
    + '</g>'

    + '<g data-step="1">'
    + '<text class="rf-header" x="280" y="58" text-anchor="middle" fill="#8B5CF6">Aspects</text>'
    + '<path class="rf-link" d="M188,120 Q198,96 205,84" marker-end="url(#rf-arrow)"/>'
    + '<path class="rf-link" d="M188,120 Q198,150 205,182" marker-end="url(#rf-arrow)"/>'
    + '<path class="rf-link" d="M188,120 Q198,210 205,280" marker-end="url(#rf-arrow)"/>'
    + '<rect class="rf-chip" x="205" y="70" width="150" height="28" rx="14"/>'
    + '<text class="rf-chip-label" x="280" y="88" text-anchor="middle">Image origin</text>'
    + '<rect class="rf-chip" x="205" y="168" width="150" height="28" rx="14"/>'
    + '<text class="rf-chip-label" x="280" y="186" text-anchor="middle">Time &amp; place</text>'
    + '<rect class="rf-chip" x="205" y="266" width="150" height="28" rx="14"/>'
    + '<text class="rf-chip-label" x="280" y="284" text-anchor="middle">Source credibility</text>'
    + '</g>'

    + '<g data-step="2">'
    + '<line class="rf-tick" x1="280" y1="98" x2="280" y2="108"/>'
    + '<line class="rf-tick" x1="280" y1="196" x2="280" y2="206"/>'
    + '<line class="rf-tick" x1="280" y1="294" x2="280" y2="304"/>'
    + '<rect class="rf-flaw" x="195" y="108" width="170" height="48" rx="12"/>'
    + '<text class="rf-flaw-label" x="280" y="124" text-anchor="middle">'
    + '<tspan x="280" dy="0">Image is a known</tspan>'
    + '<tspan x="280" dy="12">composite reused</tspan>'
    + '<tspan x="280" dy="12">since 2011</tspan>'
    + '</text>'
    + '<rect class="rf-flaw" x="195" y="206" width="170" height="38" rx="12"/>'
    + '<text class="rf-flaw-label" x="280" y="222" text-anchor="middle">'
    + '<tspan x="280" dy="0">Date/location do not</tspan>'
    + '<tspan x="280" dy="14">match the storm</tspan>'
    + '</text>'
    + '<rect class="rf-flaw" x="195" y="304" width="170" height="38" rx="12"/>'
    + '<text class="rf-flaw-label" x="280" y="320" text-anchor="middle">'
    + '<tspan x="280" dy="0">Only shared by</tspan>'
    + '<tspan x="280" dy="14">unverified accounts</tspan>'
    + '</text>'
    + '</g>'

    + '<g data-step="3">'
    + '<path class="rf-link rf-link-rose" d="M365,225 Q400,170 432,115" marker-end="url(#rf-arrow)"/>'
    + '<text class="rf-header" x="502" y="58" text-anchor="middle" fill="#F472B6">Verdict</text>'
    + '<ellipse class="rf-glow" cx="502" cy="112" rx="90" ry="38" fill="#F472B6" filter="url(#rf-blur-sm)"/>'
    + '<rect class="rf-pill" x="432" y="94" width="140" height="36" rx="18"/>'
    + '<text class="rf-pill-label" x="502" y="118" text-anchor="middle">False</text>'
    + '<text class="rf-explain" x="502" y="150" text-anchor="middle">'
    + '<tspan x="502" dy="0">The photo is a long-circulating</tspan>'
    + '<tspan x="502" dy="16">composite, not from this storm.</tspan>'
    + '<tspan x="502" dy="16">No credible outlet reported it.</tspan>'
    + '</text>'
    + '</g>'
    + '</svg>';

  stage.innerHTML = SVG;
  var styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  root.appendChild(styleEl);
  note.textContent = 'Illustrative claim, not from FlawCheck. See the paper for the dataset and results.';

  var svg = stage.querySelector('svg');
  var stepEls = Array.prototype.slice.call(svg.querySelectorAll('[data-step]'));
  var railGroups = Array.prototype.slice.call(svg.querySelectorAll('.rf-step'));
  var railFill = svg.querySelector('.rf-rail-fill');
  var centers = [103, 248, 393, 538];
  var trackStart = 30, trackLen = 580;

  var step = 0, timer = null;

  var nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'ex-btn';
  nextBtn.textContent = 'Next';

  var replayBtn = document.createElement('button');
  replayBtn.type = 'button';
  replayBtn.className = 'ex-btn';
  replayBtn.textContent = 'Replay';

  function render(s) {
    step = s;
    stepEls.forEach(function (el) {
      var min = Number(el.getAttribute('data-step'));
      el.classList.toggle('in', min <= s);
    });
    railGroups.forEach(function (g, i) {
      g.classList.remove('is-active', 'is-done', 'is-upcoming');
      g.classList.add(i < s ? 'is-done' : (i === s ? 'is-active' : 'is-upcoming'));
    });
    if (railFill) {
      var f = Math.max(0, Math.min(1, (centers[s] - trackStart) / trackLen));
      railFill.style.transform = 'scaleX(' + f + ')';
    }
    nextBtn.disabled = s >= 3;
  }

  function clearTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function autoplay() {
    clearTimer();
    if (REDUCED) { render(3); return; }
    timer = setInterval(function () {
      var ns = step + 1;
      render(ns);
      if (ns >= 3) clearTimer();
    }, 2200);
  }

  function reset() {
    clearTimer();
    stepEls.forEach(function (el) { el.classList.remove('in'); });
    railGroups.forEach(function (g) { g.classList.remove('is-active', 'is-done', 'is-upcoming'); });
    svg.classList.toggle('rf-reduced', REDUCED);
    if (REDUCED) {
      render(3);
    } else {
      window.requestAnimationFrame(function () {
        render(0);
        autoplay();
      });
    }
  }

  nextBtn.addEventListener('click', function () {
    clearTimer();
    if (step < 3) render(step + 1);
  });
  replayBtn.addEventListener('click', reset);

  controls.appendChild(nextBtn);
  controls.appendChild(replayBtn);

  window.addEventListener('explainer:show', function (e) {
    if (e.detail === 'refute') {
      reset();
    } else {
      clearTimer();
    }
  });
})();
