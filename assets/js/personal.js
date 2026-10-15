/* personal page: load shared publication data from the lab site (fallback: local copy), then the shared main.js */
(function () {
  var LAB = document.documentElement.dataset.lab || 'https://nycu-nlp-lab.github.io/';
  // #lab (the QR-code link) goes straight to the lab site
  if (location.hash === '#lab') {
    var o = document.createElement('div'); o.className = 'redirecting';
    o.innerHTML = 'Taking you to <b>NYCU NLP Lab</b>… <a href="' + LAB + '">Open it now</a>';
    document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(o); });
    location.replace(LAB);
    return;
  }
  function load(src) { return new Promise(function (ok, bad) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s); }); }
  load(LAB + 'data/publications.js').catch(function () { return load('../NLP-Lab/data/publications.js'); }).catch(function () {}).then(function () { return load('assets/js/main.js'); }).then(function () {
    // formal publication list (same records as the lab site)
    var box = document.getElementById('formalPubs');
    if (box && window.PUBS) {
      var groups = [['Journal Articles', ['journal']], ['Conference Papers', ['conference', 'findings', 'demo']], ['Preprints and Book Chapters', ['preprint', 'chapter']]];
      var mark = function (h) { return h.replace(/An-Zi Yen/g, '<u>An-Zi Yen</u>'); };
      box.innerHTML = groups.map(function (g) {
        var rows = window.PUBS.filter(function (p) { return g[1].indexOf(p.type) >= 0; });
        return rows.length ? '<h3>' + g[0] + '</h3><ol>' + rows.map(function (p) { return '<li>' + mark(p.citation_html || p.authors + ' (' + p.year + '). \u201C' + p.title + '.\u201D ' + p.venue + '.') + '</li>'; }).join('') + '</ol>' : '';
      }).join('');
      var copy = document.getElementById('copyPubs');
      if (copy) copy.addEventListener('click', function () {
        var text = groups.map(function (g) {
          var rows = window.PUBS.filter(function (p) { return g[1].indexOf(p.type) >= 0; });
          return rows.length ? g[0] + ':\n' + rows.map(function (p, i) { var d = document.createElement('div'); d.innerHTML = p.citation_html || ''; return (i + 1) + '. ' + (d.textContent || p.title).replace(/\s*\(Link\)\s*$/, '').trim(); }).join('\n') : '';
        }).filter(Boolean).join('\n\n');
        navigator.clipboard.writeText(text).then(function () { copy.textContent = 'Copied'; copy.classList.add('copied'); setTimeout(function () { copy.textContent = 'Copy list as text'; copy.classList.remove('copied'); }, 1800); });
      });
    }
    // lab links
    document.querySelectorAll('a[data-lab]').forEach(function (a) { a.href = LAB + (a.dataset.lab || ''); });
    // arriving on #lab (or the old #projects) spotlights the lab card
    var card = document.getElementById('lab');
    function spot() { if (!card) return; card.classList.remove('spot'); void card.offsetWidth; card.classList.add('spot'); }
    if (/^#projects$/.test(location.hash)) { setTimeout(function () { card.scrollIntoView({ block: 'center' }); spot(); }, 200); }
    window.addEventListener('hashchange', function () { if (/^#(lab|projects)$/.test(location.hash)) spot(); });
  });
})();
