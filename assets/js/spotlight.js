/* Spotlight: one EgoArgus video, several dialogue variants. Same scene, different words, different decision. */
(function () {
  var root = document.getElementById('spotlight'); if (!root) return;
  var CASES = window.EGO_CASES || [];
  var video = root.querySelector('#spotVideo'), tabs = root.querySelectorAll('.case-tab'), variantsEl = root.querySelector('#spotVariants');
  var bubble = root.querySelector('#spotDialogue'), assist = root.querySelector('#spotAssist'), fill = root.querySelector('#spotFill'), marker = root.querySelector('#spotMarker');
  var hint = root.querySelector('#spotHint'), dlg = root.querySelector('#spotDlg'), dec = root.querySelector('#spotDecision'), msg = root.querySelector('#spotMsg'), why = root.querySelector('#spotWhy');
  var ci = 0, vi = 0, D = 12.1, shownDlg = false, shownMsg = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function play() { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  function loadCase(i) {
    ci = i; var c = CASES[i];
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); });
    video.poster = 'assets/video/' + c.key + '.jpg'; video.src = 'assets/video/' + c.key + '.mp4'; video.load();
    variantsEl.innerHTML = c.variants.map(function (v, k) { return '<button class="vbtn ' + v.s + '" aria-pressed="' + (k === 0) + '" data-k="' + k + '">' + esc(v.label) + '</button>'; }).join('');
    variantsEl.querySelectorAll('.vbtn').forEach(function (b) { b.addEventListener('click', function () { loadVariant(+b.dataset.k); video.currentTime = 0; play(); }); });
    loadVariant(0); play();
  }
  function loadVariant(k) {
    vi = k; var v = CASES[ci].variants[k];
    variantsEl.querySelectorAll('.vbtn').forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === k)); });
    shownDlg = false; shownMsg = false; bubble.classList.remove('in'); assist.classList.remove('in');
    bubble.innerHTML = v.dialogue.map(function (d) { return '<span class="who">' + (d[0] === 'user' ? 'User' : 'Other person') + '</span>' + esc(d[1]); }).join('<br>');
    assist.textContent = v.msg || '';
    assist.classList.toggle('calm', v.urg === 'low' || v.urg === 'medium');
    var t = v.req ? v.t : null;
    marker.style.display = (t !== null && t !== undefined) ? '' : 'none';
    if (t !== null && t !== undefined) marker.style.left = (t / D * 100) + '%';
    hint.textContent = v.hint;
    dlg.innerHTML = v.dialogue.map(function (d) { return '<div><b>' + (d[0] === 'user' ? 'User' : 'Other person') + '</b>' + esc(d[1]) + '</div>'; }).join('');
    dec.innerHTML = v.req ? '<span class="pill warn">Assist</span> at ' + (t !== null && t !== undefined ? t.toFixed(1) + ' s' : 'once the issue is visible') + (v.urg ? ' · ' + esc(v.urg) + ' urgency' : '') : '<span class="pill ok">Stay quiet</span> no assistance needed';
    msg.textContent = v.req ? v.msg : v.no;
    why.textContent = v.issue;
  }
  video.addEventListener('timeupdate', function () {
    var v = CASES[ci].variants[vi], d = video.duration || D, ct = video.currentTime;
    fill.style.width = (ct / d * 100) + '%';
    if (ct < 0.25) { shownDlg = false; shownMsg = false; bubble.classList.remove('in'); assist.classList.remove('in'); return; }
    if (!shownDlg && ct >= (v.dt || 0)) { shownDlg = true; bubble.classList.add('in'); }
    if (v.req && !shownMsg && v.t !== null && v.t !== undefined && ct >= v.t) { shownMsg = true; assist.classList.add('in'); }
  });
  tabs.forEach(function (t, k) { t.addEventListener('click', function () { loadCase(k); }); });
  root.querySelector('#spotReplay').addEventListener('click', function () { video.currentTime = 0; play(); });
  var started = false;
  new IntersectionObserver(function (en) { if (en[0].isIntersecting && !started) { started = true; loadCase(0); } }, { threshold: .15 }).observe(root.querySelector('.spot-player'));
  // series tabs on the home page
  var stabs = root.querySelectorAll('.series-tab[data-pane]');
  stabs.forEach(function (t) { t.addEventListener('click', function () {
    stabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
    root.querySelectorAll('.series-pane').forEach(function (p) { p.classList.toggle('active', p.dataset.pane === t.dataset.pane); });
    if (t.dataset.pane === 'egoargus') { if (!started) { started = true; loadCase(0); } else play(); } else video.pause();
    var vc = root.querySelector('#vistaClip'); if (vc) { if (t.dataset.pane === 'vista') { var q = vc.play(); if (q && q.catch) q.catch(function () {}); } else vc.pause(); }
  }); });
  var v2 = root.querySelector('#vistaClip');
  if (v2 && !stabs.length) new IntersectionObserver(function (en) { var p = en[0].isIntersecting ? v2.play() : v2.pause(); if (p && p.catch) p.catch(function () {}); }, { threshold: .3 }).observe(v2);
})();

/* series publication list (assistants.html) */
(function () {
  var el = document.getElementById('seriesList'); if (!el || !window.PUBS) return;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var rows = window.PUBS.filter(function (p) { return p.tags.indexOf('situated') >= 0; });
  el.innerHTML = '<div class="pub-list">' + rows.map(function (p) { return '<article class="pub"><span class="badge top">' + esc(p.venue) + '</span><div><div class="t">' + (p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>' : esc(p.title)) + '</div><div class="a">' + esc(p.authors).replace(/An-Zi Yen/g, '<b>An-Zi Yen</b>') + '</div></div></article>'; }).join('') + '</div>';
})();
