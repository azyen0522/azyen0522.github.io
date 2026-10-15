/* MathEDU (EACL 2026) interactive explainer.
   Self-contained: no network, no modules, no external libs. */
(function () {
  var root = document.getElementById('ex-mathedu');
  if (!root) return;

  var stage = root.querySelector('.ex-stage');
  var controls = root.querySelector('.ex-controls');
  var note = root.querySelector('.ex-note');
  if (!stage || !controls || !note) return;

  /* ---------- scoped styles ---------- */
  var style = document.createElement('style');
  style.textContent = [
    '#ex-mathedu .ex-stage{width:100%;}',
    '#ex-mathedu .ex-stage svg{display:block;width:100%;height:auto;}',
    '#ex-mathedu .mathedu-eyebrow{font-family:"Sora",system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:.08em;fill:#A8B0D0;}',
    '#ex-mathedu .mathedu-box{fill:rgba(255,255,255,.04);stroke:rgba(255,255,255,.14);stroke-width:1;}',
    '#ex-mathedu .mathedu-problem{font-family:"Inter",system-ui,sans-serif;font-size:14px;font-weight:500;fill:#F3F5FF;}',
    '#ex-mathedu .mathedu-stepnum{fill:rgba(255,255,255,.06);stroke:rgba(255,255,255,.22);stroke-width:1;}',
    '#ex-mathedu .mathedu-stepnum-t{font-family:"Sora",system-ui,sans-serif;font-size:12px;font-weight:600;fill:#A8B0D0;}',
    '#ex-mathedu .mathedu-eq{font-family:"Inter",system-ui,sans-serif;font-size:15px;fill:#F3F5FF;}',
    '#ex-mathedu .mathedu-tasklabel{font-family:"Inter",system-ui,sans-serif;font-size:13px;font-weight:500;fill:#A8B0D0;transition:fill .3s ease;}',
    '#ex-mathedu .mathedu-tasklabel.is-current{fill:#F3F5FF;}',
    '#ex-mathedu .mathedu-ann{font-family:"Inter",system-ui,sans-serif;font-size:12px;fill:#F472B6;opacity:0;transition:opacity .4s ease;}',
    '#ex-mathedu .mathedu-ann.mathedu-shown{opacity:1;}',
    '#ex-mathedu .mathedu-accent{fill:transparent;transition:fill .3s ease;}',
    '#ex-mathedu .mathedu-accent.mathedu-shown{fill:#F472B6;}',
    '#ex-mathedu .mathedu-rowbg{fill:transparent;transition:fill .3s ease;}',
    '#ex-mathedu .mathedu-rowbg.mathedu-shown{fill:rgba(244,114,182,.08);}',
    '#ex-mathedu .mathedu-pulse{opacity:0;fill:none;stroke:#F472B6;stroke-width:2;}',
    '#ex-mathedu .mathedu-pulse.mathedu-shown{opacity:1;animation:mathedu-pulse-anim 1.6s ease-out infinite;}',
    '@keyframes mathedu-pulse-anim{0%{stroke-opacity:.9;r:11;}100%{stroke-opacity:0;r:19;}}',
    '#ex-mathedu .mathedu-badge-neutral{fill:rgba(255,255,255,.07);stroke:rgba(255,255,255,.25);stroke-width:1;transition:fill .3s ease,stroke .3s ease;}',
    '#ex-mathedu .mathedu-badge-rose{fill:rgba(244,114,182,.16);stroke:#F472B6;stroke-width:1.2;}',
    '#ex-mathedu .mathedu-badge-text{font-family:"Sora",system-ui,sans-serif;font-size:12px;font-weight:700;fill:#F3F5FF;transition:fill .3s ease;}',
    '#ex-mathedu .mathedu-badge-text.is-rose{fill:#F472B6;}',
    '#ex-mathedu .mathedu-bubble-rect{fill:rgba(245,158,11,.06);stroke:rgba(245,158,11,.45);stroke-width:1.2;opacity:0;transition:opacity .35s ease;}',
    '#ex-mathedu .mathedu-bubble-rect.mathedu-shown{opacity:1;}',
    '#ex-mathedu .mathedu-fb-text{font-family:"Inter",system-ui,sans-serif;font-size:14px;fill:#F3F5FF;opacity:0;transition:opacity .25s ease;}',
    '#ex-mathedu .mathedu-fb-text.mathedu-shown{opacity:1;}',
    '#ex-mathedu .mathedu-tag{font-family:"Inter",system-ui,sans-serif;font-size:11px;fill:#A8B0D0;opacity:0;transition:opacity .25s ease;}',
    '#ex-mathedu .mathedu-tag.mathedu-shown{opacity:1;}',
    '@media (prefers-reduced-motion: reduce){',
    '  #ex-mathedu .mathedu-ann,#ex-mathedu .mathedu-accent,#ex-mathedu .mathedu-rowbg,',
    '  #ex-mathedu .mathedu-badge-neutral,#ex-mathedu .mathedu-badge-rose,#ex-mathedu .mathedu-badge-text,',
    '  #ex-mathedu .mathedu-bubble-rect,#ex-mathedu .mathedu-fb-text,#ex-mathedu .mathedu-tag,',
    '  #ex-mathedu .mathedu-tasklabel{transition:none !important;}',
    '  #ex-mathedu .mathedu-pulse.mathedu-shown{animation:none;opacity:.35;}',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  /* ---------- markup ---------- */
  var svg = ''
    + '<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" style="overflow:visible" role="img" aria-label="MathEDU explainer: a student solution with a distribution error, and three model tasks: correctness, error location, feedback.">'
    + '<defs>'
    + '<radialGradient id="mathedu-glow-a" cx="50%" cy="50%" r="50%">'
    + '<stop offset="0%" stop-color="#2F5BFF" stop-opacity="0.30"/><stop offset="100%" stop-color="#2F5BFF" stop-opacity="0"/>'
    + '</radialGradient>'
    + '<radialGradient id="mathedu-glow-b" cx="50%" cy="50%" r="50%">'
    + '<stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.26"/><stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/>'
    + '</radialGradient>'
    + '</defs>'
    + '<rect x="0" y="0" width="640" height="360" rx="14" fill="#0E1538"/>'
    + '<circle cx="30" cy="10" r="150" fill="url(#mathedu-glow-a)"/>'
    + '<circle cx="610" cy="340" r="170" fill="url(#mathedu-glow-b)"/>'
    + '<line x1="316" y1="32" x2="316" y2="289" stroke="rgba(255,255,255,.08)" stroke-width="1"/>'

    /* ---- left: student's solution ---- */
    + '<text class="mathedu-eyebrow" x="16" y="42">STUDENT\'S SOLUTION</text>'
    + '<rect class="mathedu-box" x="16" y="52" width="292" height="30" rx="8"/>'
    + '<text class="mathedu-problem" x="28" y="72">Solve 3(x + 2) = 21.</text>'

    + '<circle class="mathedu-stepnum" cx="34" cy="113" r="11"/>'
    + '<text class="mathedu-stepnum-t" x="34" y="117" text-anchor="middle">1</text>'
    + '<text class="mathedu-eq" x="54" y="117">3(x + 2) = 21</text>'

    + '<rect id="mathedu-accent2" class="mathedu-accent" x="16" y="136" width="4" height="30" rx="2"/>'
    + '<rect id="mathedu-rowbg2" class="mathedu-rowbg" x="16" y="136" width="292" height="30" rx="6"/>'
    + '<circle class="mathedu-stepnum" cx="34" cy="151" r="11"/>'
    + '<circle id="mathedu-pulse2" class="mathedu-pulse" cx="34" cy="151" r="11"/>'
    + '<text class="mathedu-stepnum-t" x="34" y="155" text-anchor="middle">2</text>'
    + '<text class="mathedu-eq" x="54" y="155">3x + 2 = 21</text>'

    + '<circle class="mathedu-stepnum" cx="34" cy="189" r="11"/>'
    + '<text class="mathedu-stepnum-t" x="34" y="193" text-anchor="middle">3</text>'
    + '<text class="mathedu-eq" x="54" y="193">3x = 19</text>'

    + '<circle class="mathedu-stepnum" cx="34" cy="227" r="11"/>'
    + '<text class="mathedu-stepnum-t" x="34" y="231" text-anchor="middle">4</text>'
    + '<text class="mathedu-eq" x="54" y="231">x = 19/3</text>'
    + '<rect id="mathedu-badge1-rect" class="mathedu-badge-neutral" x="216" y="215" width="88" height="24" rx="12"/>'
    + '<text id="mathedu-badge1-text" class="mathedu-badge-text" x="260" y="231" text-anchor="middle">?</text>'

    + '<text id="mathedu-ann" class="mathedu-ann" x="16" y="264">'
    + '<tspan id="mathedu-ann-l1" x="16" dy="0"></tspan>'
    + '<tspan id="mathedu-ann-l2" x="16" dy="15"></tspan>'
    + '</text>'

    /* ---- right: model ---- */
    + '<text class="mathedu-eyebrow" x="332" y="42">MODEL</text>'

    + '<text id="mathedu-label1" class="mathedu-tasklabel" x="332" y="78">Task 1 · Correct?</text>'
    + '<rect id="mathedu-chip1-rect" class="mathedu-badge-neutral" x="524" y="64" width="92" height="26" rx="13"/>'
    + '<text id="mathedu-chip1-text" class="mathedu-badge-text" x="570" y="81" text-anchor="middle">—</text>'

    + '<text id="mathedu-label2" class="mathedu-tasklabel" x="332" y="116">Task 2 · Which step?</text>'
    + '<rect id="mathedu-chip2-rect" class="mathedu-badge-neutral" x="524" y="102" width="92" height="26" rx="13"/>'
    + '<text id="mathedu-chip2-text" class="mathedu-badge-text" x="570" y="119" text-anchor="middle">—</text>'

    + '<text id="mathedu-label3" class="mathedu-tasklabel" x="332" y="154">Task 3 · Feedback</text>'
    + '<rect id="mathedu-bubble" class="mathedu-bubble-rect" x="332" y="164" width="284" height="96" rx="12"/>'
    + '<text id="mathedu-fb" class="mathedu-fb-text" x="344" y="182">'
    + '<tspan id="mathedu-fb-l1" x="344" dy="0"></tspan>'
    + '<tspan id="mathedu-fb-l2" x="344" dy="18"></tspan>'
    + '<tspan id="mathedu-fb-l3" x="344" dy="18"></tspan>'
    + '<tspan id="mathedu-fb-l4" x="344" dy="18"></tspan>'
    + '</text>'
    + '<text id="mathedu-tag" class="mathedu-tag" x="332" y="274">'
    + '<tspan id="mathedu-tag-l1" x="332" dy="0"></tspan>'
    + '<tspan id="mathedu-tag-l2" x="332" dy="14"></tspan>'
    + '</text>'
    + '</svg>';

  stage.innerHTML = svg;

  controls.innerHTML = ''
    + '<button type="button" class="ex-btn" data-task="1" aria-pressed="false">Task 1 · Correct?</button>'
    + '<button type="button" class="ex-btn" data-task="2" aria-pressed="false">Task 2 · Which step?</button>'
    + '<button type="button" class="ex-btn" data-task="3" aria-pressed="false">Task 3 · Feedback</button>'
    + '<button type="button" class="ex-btn" id="mathedu-autoplay" aria-pressed="false">Auto-play</button>';

  note.textContent = 'Illustrative example, not from the dataset. Model results are in the paper.';

  /* ---------- element refs ---------- */
  var $ = function (id) { return root.querySelector('#' + id); };
  var accent2 = $('mathedu-accent2');
  var rowbg2 = $('mathedu-rowbg2');
  var pulse2 = $('mathedu-pulse2');
  var ann = $('mathedu-ann');
  var annL1 = $('mathedu-ann-l1');
  var annL2 = $('mathedu-ann-l2');

  var badge1Rect = $('mathedu-badge1-rect');
  var badge1Text = $('mathedu-badge1-text');
  var chip1Rect = $('mathedu-chip1-rect');
  var chip1Text = $('mathedu-chip1-text');
  var chip2Rect = $('mathedu-chip2-rect');
  var chip2Text = $('mathedu-chip2-text');

  var label1 = $('mathedu-label1');
  var label2 = $('mathedu-label2');
  var label3 = $('mathedu-label3');

  var bubble = $('mathedu-bubble');
  var fbText = $('mathedu-fb');
  var fbLines = [$('mathedu-fb-l1'), $('mathedu-fb-l2'), $('mathedu-fb-l3'), $('mathedu-fb-l4')];
  var tag = $('mathedu-tag');
  var tagLines = [$('mathedu-tag-l1'), $('mathedu-tag-l2')];

  var taskButtons = Array.prototype.slice.call(controls.querySelectorAll('button[data-task]'));
  var autoplayBtn = $('mathedu-autoplay') || controls.querySelector('#mathedu-autoplay');

  /* ---------- content ---------- */
  var ANNOTATION = 'distribution: 3·2 = 6, not 2';
  var FEEDBACK = 'Good start. When you distribute the 3, multiply both terms: 3·x and 3·2. That gives 3x + 6 = 21. Try again from there.';
  var TAG = "Teacher-written feedback is the reference in MathEDU.";

  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function wrapLines(str, maxLen) {
    var words = str.split(' ');
    var lines = [];
    var cur = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!cur) { cur = w; }
      else if ((cur + ' ' + w).length <= maxLen) { cur += ' ' + w; }
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function setLines(els, text, maxLen) {
    var lines = wrapLines(text, maxLen);
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = lines[i] || '';
    }
  }

  function setShown(el, show) {
    if (!el) return;
    el.classList.toggle('mathedu-shown', !!show);
  }

  /* static tag text, set once */
  setLines(tagLines, TAG, 34);

  /* ---------- state ---------- */
  var level = 0;
  var typingTimer = null;
  var autoplayTimers = [];
  var autoplayActive = false;

  function clearTyping() {
    if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
  }

  function typeFeedback() {
    clearTyping();
    if (REDUCED) {
      setLines(fbLines, FEEDBACK, 32);
      return;
    }
    var i = 0;
    var total = FEEDBACK.length;
    setLines(fbLines, '', 32);
    typingTimer = setInterval(function () {
      i += 3;
      if (i >= total) {
        i = total;
        clearTyping();
      }
      setLines(fbLines, FEEDBACK.slice(0, i), 32);
    }, 28);
  }

  function applyLevel(n) {
    level = n;

    var l1 = n >= 1, l2 = n >= 2, l3 = n >= 3;

    badge1Rect.classList.toggle('mathedu-badge-rose', l1);
    badge1Rect.classList.toggle('mathedu-badge-neutral', !l1);
    badge1Text.textContent = l1 ? 'Incorrect' : '?';
    badge1Text.classList.toggle('is-rose', l1);

    chip1Rect.classList.toggle('mathedu-badge-rose', l1);
    chip1Rect.classList.toggle('mathedu-badge-neutral', !l1);
    chip1Text.textContent = l1 ? 'Incorrect' : '—';
    chip1Text.classList.toggle('is-rose', l1);

    setShown(accent2, l2);
    setShown(rowbg2, l2);
    setShown(pulse2, l2);
    setShown(ann, l2);
    if (l2) { setLines([annL1, annL2], ANNOTATION, 34); }

    chip2Rect.classList.toggle('mathedu-badge-rose', l2);
    chip2Rect.classList.toggle('mathedu-badge-neutral', !l2);
    chip2Text.textContent = l2 ? 'Step 2' : '—';
    chip2Text.classList.toggle('is-rose', l2);

    setShown(bubble, l3);
    setShown(fbText, l3);
    setShown(tag, l3);
    if (l3) { typeFeedback(); } else { clearTyping(); setLines(fbLines, '', 32); }

    label1.classList.toggle('is-current', n === 1);
    label2.classList.toggle('is-current', n === 2);
    label3.classList.toggle('is-current', n === 3);

    taskButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.task) === n));
    });
  }

  /* ---------- autoplay ---------- */
  function clearAutoplayTimers() {
    autoplayTimers.forEach(function (t) { clearTimeout(t); });
    autoplayTimers = [];
  }

  function stopAutoplay() {
    clearAutoplayTimers();
    autoplayActive = false;
    if (autoplayBtn) autoplayBtn.setAttribute('aria-pressed', 'false');
  }

  function scheduleAutoplay() {
    clearAutoplayTimers();
    applyLevel(0);
    var typingDuration = REDUCED ? 0 : Math.ceil(FEEDBACK.length / 3) * 28;
    var t1 = 150, t2 = 2150, t3 = 4150;
    var restartAt = t3 + typingDuration + 1800;
    autoplayTimers.push(setTimeout(function () { applyLevel(1); }, t1));
    autoplayTimers.push(setTimeout(function () { applyLevel(2); }, t2));
    autoplayTimers.push(setTimeout(function () { applyLevel(3); }, t3));
    autoplayTimers.push(setTimeout(function () {
      if (autoplayActive) scheduleAutoplay();
    }, restartAt));
  }

  function startAutoplay() {
    autoplayActive = true;
    if (autoplayBtn) autoplayBtn.setAttribute('aria-pressed', 'true');
    scheduleAutoplay();
  }

  /* ---------- wiring ---------- */
  taskButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      stopAutoplay();
      applyLevel(Number(btn.dataset.task));
    });
  });

  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', function () {
      if (autoplayActive) { stopAutoplay(); }
      else { startAutoplay(); }
    });
  }

  window.addEventListener('explainer:show', function (e) {
    if (e.detail === 'mathedu') {
      startAutoplay();
    } else {
      stopAutoplay();
    }
  });

  /* initial, inert state (panel is display:none until shown) */
  applyLevel(0);
})();
