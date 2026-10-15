# An-Zi Yen — personal page

Static page for https://azyen0522.github.io/ (no build step). The lab website lives at https://nycu-nlp-lab.github.io/ (repo: NYCU-NLP-Lab/NYCU-NLP-Lab.github.io).

- `index.html` — about, lab preview card, research directions, full publication list, honors, contact
- `assets/css/main.css` — shared with the lab site (copy of the lab repo's file); `personal.css` — additions for this page
- `assets/js/main.js` — shared with the lab site; `personal.js` — loads publication data from the lab site, builds the formal list, handles `#lab`

`#lab` redirects to the lab website (used by the printed QR code). Publications are read from the lab site's `data/publications.js`, so updating that file updates both sites.
