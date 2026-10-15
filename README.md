# NYCU NLP Lab — website

Static site for https://azyen0522.github.io/ (no build step).

- `index.html` — home: hero, research areas, featured interactive explainers, flagship-theme tabs (EgoArgus / VISTA), publications, demos, people, contact
- `assistants.html` — the situational-assistant series page: overview, timeline, full EgoArgus player, VISTA platform, series papers
- `assets/js/spotlight.js` — EgoArgus video player (dialogue variants from `data/egoargus_cases.js`), series tabs, series paper list
- `assets/video/` — five EgoArgus decision videos (480p re-encodes of the Hugging Face release) and one VISTA demo clip; `assets/img/vista/` holds the 14 VISTA posters
- `assets/css/main.css` — design tokens and layout
- `assets/js/main.js` — nav, hero canvas, scroll reveal, tabs, publication filters
- `assets/js/explainers/*.js` — one self-contained interactive explainer per featured paper
- `data/publications.json` — publication records (source of truth); `data/publications.js` is the same data as a script for `file://` use

## Updating publications

Edit `data/publications.json`, then regenerate the script copy:

```sh
python3 -c "import json;open('data/publications.js','w').write('window.PUBS = '+json.dumps(json.load(open('data/publications.json')),ensure_ascii=False,indent=1)+';\n')"
```

Fields: `authors`, `year`, `title`, `venue`, `type` (journal | conference | findings | demo | preprint | chapter), `note`, `link`, `tags` (assistants | trust | education | efficiency | language), `selected`.

## Adding a project to the flagship series

1. Home page: add a `.series-tab` button and a matching `.series-pane` in the `#spotlight` section of `index.html` (the pane should reuse the `.spot-player` card so the block keeps the same height).
2. Series page: add a timeline entry and a section in `assistants.html`.
3. Tag its publication `situated` in `data/publications.json` so it appears in the series paper list.

## Media credits

- `assets/video/*.mp4` are 480p re-encodes of decision videos from the public EgoArgus dataset (https://huggingface.co/datasets/tommytyc/EgoArgus), generated with VISTA. Dialogue, decisions, and assistant messages shown in the player come from `dataset/paper_eval.csv` in https://github.com/NYCU-NLP-Lab/EgoArgus.
- `assets/video/vista_microwave.mp4` and `assets/img/vista/*.webp` are from the public VISTA demonstration platform.
