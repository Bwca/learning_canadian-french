# Language learning

Personal study materials and small browser-based tools for learning languages: vocabulary lists, grammar and reading exercises, and drills for pronunciation and recall.

## Languages

| Folder | Language | Details |
|---|---|---|
| [`french/`](french/) | Canadian (Québécois) French, for TEF Canada prep | [french/README.md](french/README.md) |

Each language lives in its own top-level folder with its content, its tools and a landing page (`index.html`).

## Online (GitHub Pages)

The browser tools are published at <https://bwca.github.io/learning_canadian-french/> by `.github/workflows/pages.yml` on every push to `master`. The root `index.html` links to each language's landing page.

The deploy publishes every top-level folder that has an `index.html`, leaving out non-web parts (`pronunciation-generator/`, `tef-prep/`, `.md` files). It then runs `.github/scripts/build-manifest.js`, which writes a `manifest.json` into each language folder listing its `anki-words/` lists, translation drills and reading exercises. `library.js` turns that into a picker in each tool, so nothing needs downloading, and new files show up automatically on the next push.

One-time setup: repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Adding a language

Create a top-level folder (e.g. `spanish/`) with an `index.html`, and follow the same content layout as `french/` (`anki-words/<group>/*.txt`, `grammar-exercises/translation-drills/<level>/<topic>/<n>.json`, `reading-exercises/<level>/<topic>/<n>.json`) so the deploy picks it up and builds its picker. Add it to the table above and to the root `index.html`.
