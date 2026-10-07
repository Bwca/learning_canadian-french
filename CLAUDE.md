# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Personal study materials and small tools for one learner working toward TEF Canada exam readiness (NCLC 7 / CEFR B2) in Canadian (Québécois) French — vocabulary lists, grammar exercises, and browser-based drilling tools. There is no build system, test suite, or CI; most of the repo is plain-text content, not application code.

`tef-prep/` is a separate sub-project nested in this repo — see below before treating it as more content/tooling to extend.

## Commands

The only runnable code is `pronunciation-generator/`:

```
cd pronunciation-generator
npm install
node make-pronunciation-files.js <relative-path-to-txt>
```

This launches a non-headless Chromium via Puppeteer, uses the Web Speech API (`fr-CA` / `en-US` voices) to speak each entry, records system audio, and writes `.webm` files. It requires a real display and working audio capture (`--use-fake-ui-for-media-stream` grants mic/screen-capture prompts automatically) — it will not run in a headless/CI environment.

**Windows only.** It captures audio via `getUserMedia({ chromeMediaSource: 'system' })`, a Windows-specific Chrome loopback-capture path that doesn't work on macOS/Linux. It also depends on Windows having `fr-CA` and `en-US` text-to-speech voices installed (Settings → Time & Language → Speech → Manage voices) — see README.md's pronunciation-generator section for the full requirements list.

`audio-drill.html`, `vocab-quiz.html`, and `translation-drill.html` have no build step; open them directly in a browser. The first two load a `.txt` file from `anki-words/`; `translation-drill.html` loads a `.json` file from `grammar-exercises/translation-drills/<topic>/`.

There are no lint or test commands configured anywhere in the repo.

## Vocabulary file format (`anki-words/day-N.txt`)

Tab-separated, one entry per line, in one of two states:

```
<French>\t<English>
<French>\t<English>\t[sound:<slug>.webm]
```

- The third column is optional and only present once audio has been generated for that entry.
- The `<slug>.webm` filename is chosen manually (derived from the English gloss, kebab-cased) *before* running the generator — the generator reads existing `[sound:...]` tags and produces audio to match them, it does not invent filenames. To add audio for a new entry: add the `[sound:...]` tag by hand first, then run `make-pronunciation-files.js` on that file.
- Parenthesized disambiguators in French text, e.g. `Tu` vs `(informal)`, and `/`-separated alternates are stripped/normalized by both `audio-drill.html` and the generator script (`cleanFrenchWord`/`removeSlashes`) before being spoken — keep that in mind if an entry looks slightly different when read aloud than as written.
- These files are formatted for direct import into Anki as flashcard decks.

## Grammar exercise formats (`grammar-exercises/`)

- **`translation-drills/<cefr-level>/<topic>/<n>.json`** — consumed by `translation-drill.html`. Top-level folders are CEFR levels (`a1/`, later `a2/`, `b1/`, `b2/`), matching the TEF roadmap's phase progression (see `tef-prep/ROADMAP.md` §4) — this keeps difficulty explicit and lets the same verb/tense be revisited at a harder level later without colliding with the easier set. Inside each level, one folder per grammar topic. Conjugation topics are scoped as `<verb>-<tense>` (e.g. `a1/etre-present/`, `a1/avoir-present/`, later `a2/etre-passe-compose/`) rather than one folder per verb, since conjugation drills are tense-specific; non-conjugation grammar topics (plurals, articles) use a plain descriptive slug instead (e.g. `a1/pluriel/`, `a1/articles/`). Numbered files inside (`1.json`, `2.json`, …) let more exercise sets be added to the same topic later without disturbing earlier ones. Each file contains `{ "title": ..., "exercises": [{ "en", "fr", "vocab": [{ "fr", "en" }] }] }`. `vocab` should list only the non-obvious words/phrases in that sentence (not full-sentence vocab) — they're surfaced as clickable, speakable hints during the exercise. These are generated on demand (by Claude, per the learner's request for a topic) rather than transcribed from a textbook; difficulty should match the level folder — A1 content must stay genuinely beginner (simple affirmative/negative statements, basic agreement, `est-ce que` questions only — no inversion, comparatives, or `ni...ni`), but should NOT skimp on vocabulary: cover the high-frequency core words/fixed expressions a true beginner needs (numbers, family, common objects, and set idiomatic phrases like `avoir faim/soif/raison/tort` — these are core A1 curriculum, not the "idiomatic phrasing" complexity to avoid). A2+ content can additionally lean into grammatically or lexically challenging constructions (inversion, comparatives, colloquial idioms, `ni...ni`), since drilling difficulty is the point once the learner is past the basics. Checking answers in the page is exact-match (case-insensitive), with a self-graded override checkbox for valid phrasings that differ from the reference — don't try to enumerate every acceptable translation in the JSON.

## `tef-prep/` — separate sub-project

`tef-prep/` is its own project within this repo: the program-management/planning layer for the whole TEF prep effort, not learning content or a tool itself. Keep that boundary — content/tooling conventions described elsewhere in this file (vocab format, grammar exercise format, etc.) don't apply inside `tef-prep/`, and planning/progress material (roadmap, phase check-ins, mock-exam logs, open questions) belongs here, not mixed into `anki-words/` or `grammar-exercises/`. Right now it's just `ROADMAP.md`, but treat future files added under this directory as part of the same planning sub-project rather than more drills/vocab.

### `tef-prep/ROADMAP.md`

This is the authoritative curriculum plan and **should be read before doing any curriculum-building work** (adding vocab, grammar progressions, or new drilling tools). Key points future work should respect:

- Target is NCLC 7 (CEFR B2) across all four TEF sections (reading, listening, writing, speaking) — content should skew Québécois, not Metropolitan French, especially for listening/speaking material.
- Speaking and writing tracks have no tooling at all yet and are the top priority gap (§6 of the roadmap) — favor building for these over adding more vocabulary tooling.
- New material should be phase-tagged (1–4, matching the CEFR progression in §4) so progress against exit criteria is measurable — untagged content is called out in the roadmap as an existing gap to fix.
- The roadmap is a living document: update it when a phase completes, priorities shift, or an open question in §7 gets answered — don't let it drift out of sync with actual progress.
