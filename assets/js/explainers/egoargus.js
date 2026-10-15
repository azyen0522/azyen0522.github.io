/* EgoArgus (EMNLP 2026) interactive explainer. Self-contained, no deps, no network. */
(function () {
  var root = document.getElementById('ex-egoargus');
  if (!root) return;
  var stage = root.querySelector('.ex-stage');
  var controls = root.querySelector('.ex-controls');
  var note = root.querySelector('.ex-note');
  if (!stage || !controls || !note) return;

  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var TRACK_X = 346, TRACK_W = 252;

  var STYLE = [
    '#ex-egoargus svg{width:100%;height:auto;display:block;overflow:visible}',
    '#ex-egoargus svg text{font-family:"Inter",system-ui,sans-serif;fill:#F3F5FF}',
    '#ex-egoargus .eg-head{font-family:"Sora",system-ui,sans-serif}',
    '#ex-egoargus .eg-eyebrow{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;fill:#22D3EE}',
    '#ex-egoargus .eg-tiny{font-size:9.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;fill:#A8B0D0;opacity:.85}',
    '#ex-egoargus .eg-italic{font-style:italic;font-size:11.5px;fill:#A8B0D0}',
    '#ex-egoargus .eg-label{font-size:12.5px;font-weight:600;fill:#F3F5FF}',
    '#ex-egoargus .eg-body{font-size:13px;fill:#F3F5FF}',
    '#ex-egoargus .eg-quote{font-size:13px;fill:#F3F5FF}',
    '#ex-egoargus .eg-pill-label{font-size:12.5px;font-weight:700;letter-spacing:.02em;fill:#0B1020}',
    '#ex-egoargus .eg-conflict-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;fill:#F59E0B}',
    '#ex-egoargus .eg-blob{opacity:.12}',
    '#ex-egoargus .eg-bar-track{fill:rgba(255,255,255,.09)}',
    '#ex-egoargus .eg-bar-fill{transition:width .6s cubic-bezier(.22,.8,.2,1)}',
    '#ex-egoargus .eg-bar-fill.eg-visual{fill:#22D3EE}',
    '#ex-egoargus .eg-bar-fill.eg-language{fill:#8B5CF6}',
    '#ex-egoargus .eg-glow{transition:opacity .35s ease}',
    '#ex-egoargus .eg-dim{opacity:.15}',
    '#ex-egoargus .eg-pulse{animation:eg-pulse 1.8s ease-in-out infinite}',
    '@keyframes eg-pulse{0%,100%{opacity:.35}50%{opacity:.85}}',
    '#ex-egoargus .eg-reveal{opacity:0;transform:translateY(8px);transition:opacity .45s ease,transform .45s ease;transform-box:fill-box;transform-origin:center}',
    '#ex-egoargus .eg-reveal.in{opacity:1;transform:translateY(0)}',
    '@media (prefers-reduced-motion: reduce){',
    '#ex-egoargus .eg-bar-fill{transition:none}',
    '#ex-egoargus .eg-glow{transition:none}',
    '#ex-egoargus .eg-pulse{animation:none;opacity:.65}',
    '#ex-egoargus .eg-reveal{transition:none}',
    '}'
  ].join('');

  var SVG = ''
    + '<svg viewBox="0 0 640 360" role="img" aria-labelledby="egoargus-svg-title">'
    + '<title id="egoargus-svg-title">EgoArgus: an egocentric assistant arbitrating between visual evidence and user language</title>'
    + '<defs>'
    + '<filter id="eg-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>'
    + '<filter id="eg-blur-sm" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>'
    + '<marker id="eg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
    + '<path d="M0,0 L10,5 L0,10 Z" fill="rgba(168,176,208,.6)"/></marker>'
    + '</defs>'

    + '<rect x="0" y="0" width="640" height="360" rx="18" fill="#0E1538"/>'
    + '<circle class="eg-blob" cx="70" cy="330" r="90" fill="#2F5BFF" filter="url(#eg-blur)"/>'
    + '<circle class="eg-blob" cx="590" cy="40" r="80" fill="#8B5CF6" filter="url(#eg-blur)"/>'

    /* ---------- left: egocentric kitchen viewfinder ---------- */
    + '<rect x="20" y="24" width="272" height="216" rx="16" fill="#131B46" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>'
    + '<rect x="34" y="176" width="244" height="50" rx="8" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>'

    + '<g id="egoargus-stove" class="eg-reveal in">'
    + '<rect x="84" y="150" width="144" height="40" rx="8" fill="#0A0F2B" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>'
    + '<rect x="116" y="104" width="80" height="46" rx="10" fill="#1B2454" stroke="rgba(255,255,255,.28)" stroke-width="1.5"/>'
    + '<ellipse cx="156" cy="104" rx="42" ry="7" fill="#232C5E" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>'
    + '<circle cx="156" cy="96" r="4" fill="rgba(255,255,255,.3)"/>'
    + '<rect x="104" y="120" width="12" height="9" rx="3" fill="#1B2454" stroke="rgba(255,255,255,.25)" stroke-width="1.3"/>'
    + '<rect x="196" y="120" width="12" height="9" rx="3" fill="#1B2454" stroke="rgba(255,255,255,.25)" stroke-width="1.3"/>'
    + '<circle id="egoargus-flame-glow" class="eg-glow eg-dim" cx="156" cy="150" r="42" fill="#F59E0B" filter="url(#eg-blur-sm)"/>'
    + '<path d="M132 144 C126 149 125 157 132 160 C139 157 138 149 132 144 Z" fill="#F59E0B"/>'
    + '<path d="M180 144 C174 149 173 157 180 160 C187 157 186 149 180 144 Z" fill="#F59E0B"/>'
    + '<g id="egoargus-steam" class="eg-reveal">'
    + '<circle id="egoargus-pot-glow" class="eg-glow eg-dim" cx="156" cy="120" r="56" fill="#22D3EE" filter="url(#eg-blur-sm)"/>'
    + '<path d="M140 100 C136 88 146 84 142 72 C138 60 148 56 144 46" stroke="rgba(255,255,255,.55)" stroke-width="1.5" fill="none" stroke-linecap="round"/>'
    + '<path d="M156 98 C152 84 162 78 158 64 C154 50 164 44 160 32" stroke="rgba(255,255,255,.55)" stroke-width="1.5" fill="none" stroke-linecap="round"/>'
    + '<path d="M172 100 C176 88 166 84 170 72 C174 60 164 56 168 46" stroke="rgba(255,255,255,.55)" stroke-width="1.5" fill="none" stroke-linecap="round"/>'
    + '<path d="M118 108 C112 118 110 130 116 140 C120 146 114 150 116 156" stroke="#22D3EE" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/>'
    + '<path d="M194 108 C200 118 202 130 196 140 C192 146 198 150 196 156" stroke="#22D3EE" stroke-width="2" fill="none" opacity=".8" stroke-linecap="round"/>'
    + '</g>'
    + '</g>'

    + '<g id="egoargus-wall" class="eg-reveal">'
    + '<circle cx="156" cy="140" r="26" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.22)" stroke-width="1.5"/>'
    + '<line x1="156" y1="114" x2="156" y2="120" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-linecap="round"/>'
    + '<line x1="156" y1="160" x2="156" y2="166" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-linecap="round"/>'
    + '<line x1="130" y1="140" x2="136" y2="140" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-linecap="round"/>'
    + '<line x1="176" y1="140" x2="182" y2="140" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-linecap="round"/>'
    + '<line x1="156" y1="140" x2="156" y2="124" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round"/>'
    + '<line x1="156" y1="140" x2="168" y2="140" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round"/>'
    + '<circle cx="156" cy="140" r="2" fill="rgba(255,255,255,.6)"/>'
    + '</g>'

    + '<path d="M28 48 V32 H44" fill="none" stroke="#22D3EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M268 32 H284 V48" fill="none" stroke="#22D3EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M28 216 V232 H44" fill="none" stroke="#22D3EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    + '<path d="M284 216 V232 H268" fill="none" stroke="#22D3EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'

    + '<line x1="296" y1="182" x2="326" y2="182" stroke="rgba(168,176,208,.5)" stroke-width="1.5" stroke-dasharray="3 4" marker-end="url(#eg-arrow)"/>'

    /* ---------- user speech bubble ---------- */
    + '<rect id="egoargus-bubble-glow" class="eg-glow eg-dim" x="20" y="244" width="272" height="88" rx="22" fill="#8B5CF6" filter="url(#eg-blur-sm)"/>'
    + '<path d="M66 254 L86 254 L70 242 Z" fill="#131B46" stroke="rgba(255,255,255,.18)" stroke-width="1.5" stroke-linejoin="round"/>'
    + '<rect x="20" y="254" width="272" height="72" rx="16" fill="#131B46" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>'
    + '<rect id="egoargus-bubble-conflict" class="eg-reveal" x="20" y="254" width="272" height="72" rx="16" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="5 4"/>'
    + '<text class="eg-tiny" x="36" y="272">user</text>'
    + '<text id="egoargus-quote" class="eg-quote" x="36" y="300"><tspan x="36" y="300"> </tspan></text>'

    /* ---------- right: assistant card ---------- */
    + '<rect x="330" y="24" width="288" height="304" rx="18" fill="#121A46" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>'
    + '<circle cx="352" cy="50" r="11" fill="rgba(34,211,238,.12)" stroke="#22D3EE" stroke-width="1.5"/>'
    + '<circle cx="348" cy="50" r="1.6" fill="#22D3EE"/>'
    + '<circle cx="356" cy="50" r="1.6" fill="#22D3EE"/>'
    + '<line x1="352" y1="39" x2="352" y2="34" stroke="#22D3EE" stroke-width="1.5" stroke-linecap="round"/>'
    + '<circle cx="352" cy="33" r="1.8" fill="#22D3EE"/>'
    + '<text class="eg-head eg-eyebrow" x="372" y="54">assistant</text>'
    + '<line x1="346" y1="68" x2="598" y2="68" stroke="rgba(255,255,255,.14)"/>'
    + '<text class="eg-italic" x="346" y="86">which modality to trust?</text>'

    + '<ellipse cx="352" cy="102" rx="7" ry="4.3" fill="rgba(34,211,238,.15)" stroke="#22D3EE" stroke-width="1.3"/>'
    + '<circle cx="352" cy="102" r="1.8" fill="#22D3EE"/>'
    + '<text class="eg-head eg-label" x="366" y="106">Visual evidence</text>'
    + '<rect class="eg-bar-track" x="346" y="114" width="252" height="10" rx="5"/>'
    + '<rect id="egoargus-bar-visual" class="eg-bar-fill eg-visual" x="346" y="114" width="0" height="10" rx="5"/>'

    + '<rect x="345" y="135" width="14" height="10" rx="3" fill="rgba(139,92,246,.15)" stroke="#8B5CF6" stroke-width="1.3"/>'
    + '<text class="eg-head eg-label" x="366" y="143">User language</text>'
    + '<rect class="eg-bar-track" x="346" y="151" width="252" height="10" rx="5"/>'
    + '<rect id="egoargus-bar-language" class="eg-bar-fill eg-language" x="346" y="151" width="0" height="10" rx="5"/>'

    + '<g id="egoargus-conflict-tag" class="eg-reveal">'
    + '<rect x="346" y="167" width="92" height="20" rx="10" fill="rgba(245,158,11,.12)" stroke="#F59E0B" stroke-width="1.3" stroke-dasharray="4 3"/>'
    + '<text class="eg-head eg-conflict-label" x="392" y="181" text-anchor="middle">conflict</text>'
    + '</g>'

    + '<line x1="346" y1="202" x2="598" y2="202" stroke="rgba(255,255,255,.14)"/>'
    + '<text class="eg-head eg-eyebrow" x="346" y="220">decision</text>'

    + '<g id="egoargus-decision" class="eg-reveal">'
    + '<rect id="egoargus-decision-badge" x="346" y="228" width="120" height="28" rx="14" fill="#F472B6"/>'
    + '<text id="egoargus-decision-label" class="eg-head eg-pill-label" x="406" y="247" text-anchor="middle">Intervene</text>'
    + '<text id="egoargus-decision-text" class="eg-body" x="346" y="276"><tspan x="346" y="276"> </tspan></text>'
    + '</g>'
    + '</svg>';

  stage.innerHTML = SVG;
  var styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  root.appendChild(styleEl);
  note.textContent = 'Illustrative scenario in the style of EgoArgus. Model results are in the paper.';

  var svg = stage.querySelector('svg');
  var stoveEl = svg.querySelector('#egoargus-stove');
  var wallEl = svg.querySelector('#egoargus-wall');
  var steamEl = svg.querySelector('#egoargus-steam');
  var flameGlowEl = svg.querySelector('#egoargus-flame-glow');
  var potGlowEl = svg.querySelector('#egoargus-pot-glow');
  var bubbleGlowEl = svg.querySelector('#egoargus-bubble-glow');
  var bubbleConflictEl = svg.querySelector('#egoargus-bubble-conflict');
  var quoteEl = svg.querySelector('#egoargus-quote');
  var barVisualEl = svg.querySelector('#egoargus-bar-visual');
  var barLanguageEl = svg.querySelector('#egoargus-bar-language');
  var conflictTagEl = svg.querySelector('#egoargus-conflict-tag');
  var decisionGroupEl = svg.querySelector('#egoargus-decision');
  var decisionBadgeEl = svg.querySelector('#egoargus-decision-badge');
  var decisionLabelEl = svg.querySelector('#egoargus-decision-label');
  var decisionTextEl = svg.querySelector('#egoargus-decision-text');
  var titleEl = svg.querySelector('#egoargus-svg-title');

  var SCENARIOS = [
    {
      label: 'Both agree',
      frame: 'kitchen', pot: 'normal',
      userText: ['I think I left the stove on.'],
      pulse: { flame: true, pot: false, bubble: true },
      conflict: false,
      bars: { visual: 0.86, language: 0.82 },
      decision: { action: 'intervene', lines: ['Yes, the front burner is still on.'] }
    },
    {
      label: 'They conflict',
      frame: 'kitchen', pot: 'normal',
      userText: ['The stove is off, right?'],
      pulse: { flame: true, pot: false, bubble: false },
      conflict: true,
      bars: { visual: 0.88, language: 0.22 },
      decision: { action: 'intervene', lines: ['It still looks on from here.', 'Want me to double-check?'] }
    },
    {
      label: 'Only language helps',
      frame: 'wall', pot: 'none',
      userText: ['Remind me to take the pie out', 'in ten minutes.'],
      pulse: { flame: false, pot: false, bubble: true },
      conflict: false,
      bars: { visual: 0.16, language: 0.84 },
      decision: { action: 'none', lines: ['Reminder set for 10 minutes.'] }
    },
    {
      label: 'Only vision helps',
      frame: 'kitchen', pot: 'boiling',
      userText: ['...and then we went to the beach.'],
      pulse: { flame: false, pot: true, bubble: false },
      conflict: false,
      bars: { visual: 0.9, language: 0.18 },
      decision: { action: 'intervene', lines: ['Your pot is boiling over.'] }
    }
  ];

  var currentIndex = 0;
  var buttons = [];

  function setLines(textEl, lines, oneLineY, twoLineY0, dy) {
    var x = textEl.getAttribute('x');
    while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
    var startY = lines.length === 1 ? oneLineY : twoLineY0;
    lines.forEach(function (line, i) {
      var ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      ts.setAttribute('x', x);
      ts.setAttribute('y', startY + i * dy);
      ts.textContent = line;
      textEl.appendChild(ts);
    });
  }

  function reveal(el, delay) {
    if (!el) return;
    if (REDUCED) { el.classList.add('in'); return; }
    el.classList.remove('in');
    void el.getBoundingClientRect();
    if (delay) {
      setTimeout(function () { el.classList.add('in'); }, delay);
    } else {
      window.requestAnimationFrame(function () { el.classList.add('in'); });
    }
  }

  function hide(el) {
    if (el) el.classList.remove('in');
  }

  function setPulse(el, active) {
    if (!el) return;
    if (active) {
      el.classList.remove('eg-dim');
      el.classList.add('eg-pulse');
    } else {
      el.classList.remove('eg-pulse');
      el.classList.add('eg-dim');
    }
  }

  function growBar(el, px) {
    if (!el) return;
    if (REDUCED) {
      el.style.transition = 'none';
      el.style.width = px + 'px';
      return;
    }
    el.style.transition = 'none';
    el.style.width = '0px';
    void el.getBoundingClientRect();
    window.requestAnimationFrame(function () {
      el.style.transition = '';
      el.style.width = px + 'px';
    });
  }

  function render(idx) {
    var s = SCENARIOS[idx];
    currentIndex = idx;

    buttons.forEach(function (b, i) {
      b.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
    });

    if (titleEl) {
      titleEl.textContent = 'EgoArgus scenario: ' + s.label + '. Decision: ' +
        (s.decision.action === 'intervene' ? 'intervene' : 'no action') + '.';
    }

    if (s.frame === 'kitchen') { reveal(stoveEl); hide(wallEl); }
    else { hide(stoveEl); reveal(wallEl); }

    if (s.pot === 'boiling') { reveal(steamEl); } else { hide(steamEl); }

    if (s.conflict) { reveal(conflictTagEl); reveal(bubbleConflictEl); }
    else { hide(conflictTagEl); hide(bubbleConflictEl); }

    setPulse(flameGlowEl, s.pulse.flame);
    setPulse(potGlowEl, s.pulse.pot);
    setPulse(bubbleGlowEl, s.pulse.bubble);

    setLines(quoteEl, s.userText, 300, 293, 18);

    growBar(barVisualEl, s.bars.visual * TRACK_W);
    growBar(barLanguageEl, s.bars.language * TRACK_W);

    var isIntervene = s.decision.action === 'intervene';
    if (decisionBadgeEl) decisionBadgeEl.setAttribute('fill', isIntervene ? '#F472B6' : '#14B8A6');
    if (decisionLabelEl) decisionLabelEl.textContent = isIntervene ? 'Intervene' : 'No action';
    setLines(decisionTextEl, s.decision.lines, 276, 270, 20);

    reveal(decisionGroupEl, REDUCED ? 0 : 260);
  }

  SCENARIOS.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ex-btn';
    b.textContent = s.label;
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () { render(i); });
    controls.appendChild(b);
    buttons.push(b);
  });

  render(0);

  window.addEventListener('explainer:show', function (e) {
    if (e.detail === 'egoargus') render(currentIndex);
  });
})();
