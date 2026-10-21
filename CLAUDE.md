# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Personal language-learning materials and small browser-based drilling tools for one learner. It's organised by language: each language has its own top-level folder holding its content, tools and conventions. French (`french/`) is the only one so far, but the repo is meant to grow more — don't put language-specific content or tools at the root.

Before working inside a language folder, read its own `CLAUDE.md` (e.g. `french/CLAUDE.md`) — content formats, level conventions and that language's curriculum plan live there, not here.

## Root layout

- `<language>/` — one folder per language, with an `index.html` landing page, its tool pages and its content.
- `index.html` — site landing page linking to each language. Add a card when a language is added.
- `library.js` — shared, language-agnostic picker used by every language's tool pages (`<script src="../library.js">`). It fetches `manifest.json` from the page's own folder; when that's missing (e.g. opened via `file://`) the picker stays hidden and the pages fall back to their file inputs.
- `.github/` — GitHub Pages deploy (see below).

## GitHub Pages deploy

`.github/workflows/pages.yml` runs on push to `master`. It copies the root `index.html` and `library.js`, plus every top-level folder that has an `index.html` (minus `pronunciation-generator/`, `tef-prep/` and `.md` files), then runs `.github/scripts/build-manifest.js`. Pages has no directory listing, so that script writes `<language>/manifest.json` listing the folder's `anki-words/<group>/*.txt` lists and the `<level>/<topic>/<n>.json` sets under `grammar-exercises/translation-drills/` and `reading-exercises/`, labelled with each file's `title`. It's generated, not committed — new content needs no manual registration. A new language that follows the same folder layout is picked up automatically; a new kind of content folder needs adding to `build-manifest.js`.

Pages' Source setting must be **GitHub Actions**; with "Deploy from a branch", GitHub's own publisher also runs and overwrites the site without the manifests.

There is no build system, lint or test command anywhere in the repo.
