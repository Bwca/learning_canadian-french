# CLAUDE.md — French

Guidance for working in `french/`. Repo-wide layout, the shared `library.js` and the GitHub Pages deploy are covered in the root `CLAUDE.md`. Paths below are relative to `french/`.

## What this folder is

Personal study materials and small tools for one learner working toward TEF Canada exam readiness (NCLC 7 / CEFR B2) in Canadian (Québécois) French — vocabulary lists, grammar exercises, and browser-based drilling tools. There is no build system or test suite; most of it is plain-text content, not application code.

`tef-prep/` is a separate sub-project nested in this folder — see below before treating it as more content/tooling to extend.

## Commands

The only runnable code is `pronunciation-generator/`:

```
cd pronunciation-generator
npm install
node make-pronunciation-files.js <relative-path-to-txt>
```

This launches a non-headless Chromium via Puppeteer, uses the Web Speech API (`fr-CA` / `en-US` voices) to speak each entry, records system audio, and writes `.webm` files. It requires a real display and working audio capture (`--use-fake-ui-for-media-stream` grants mic/screen-capture prompts automatically) — it will not run in a headless/CI environment.

**Windows only.** It captures audio via `getUserMedia({ chromeMediaSource: 'system' })`, a Windows-specific Chrome loopback-capture path that doesn't work on macOS/Linux. It also depends on Windows having `fr-CA` and `en-US` text-to-speech voices installed (Settings → Time & Language → Speech → Manage voices) — see README.md's pronunciation-generator section for the full requirements list.

`audio-drill.html`, `vocab-quiz.html`, `translation-drill.html`, and `reading-trainer.html` have no build step; open them directly in a browser. The first two load a `.txt` file from `anki-words/`; `translation-drill.html` loads a `.json` file from `grammar-exercises/translation-drills/<level>/<topic>/`; `reading-trainer.html` loads one from `reading-exercises/<level>/<topic>/`.

The pages load the shared picker from `../library.js`, and are published to GitHub Pages with the generated `manifest.json` (see the root `CLAUDE.md`). `pronunciation-generator/`, `tef-prep/` and the `.md` files are left out of the site.

There are no lint or test commands configured anywhere in the repo.

## Learner languages (English, Ukrainian)

The learner reads the materials in English or Ukrainian, switched per page (see `i18n.js` in the root `CLAUDE.md`). Every English translation or explanation has a Ukrainian counterpart beside it, in the formats below; a missing Ukrainian one falls back to the English, so content can be translated gradually.

**Translate into Ukrainian from the French**, using the English only to settle what was meant — not English-to-Ukrainian. Keep Québec notes (`(Québec: …)` → `(у Квебеку: …)`). Ukrainian grammar can carry what English needed a hint for (ти/ви for `(informal)`/`(formal)`, gendered past tense or adjectives for `(masc.)`/`(fem.)`), so drop such a hint when the Ukrainian already makes it plain. Keep it if the exact-match answer still depends on it.

## Vocabulary file format (`anki-words/day-N.txt`)

Tab-separated, one entry per line, in one of two states:

```
<French>\t<English>
<French>\t<English>\t[sound:<slug>.webm]
```

- The third column is optional and only present once audio has been generated for that entry.
- An optional fourth column holds a standard-French (not Québécois) IPA transcription in slashes, e.g. `/la mɛzɔ̃/`. It covers only what's spoken (parenthesized notes are skipped), with `/`-separated forms written as `/bɔ̃, bɔn/`. `audio-drill.html` shows it under the French word. The generator and vocab quiz ignore it, and in Anki the note type needs an extra field for it. `anki-words/pronunciation/`, `anki-words/core-a1-b2/` and `anki-words/phrases/` have it.
- An optional fifth column holds the Ukrainian translation. A line with it but no audio or IPA keeps those columns empty (`bonjour\thello\t\t\tдобрий день`). `audio-drill.html` and `vocab-quiz.html` show it when switched to Ukrainian; the generator ignores it.
- The `<slug>.webm` filename is chosen manually (derived from the English gloss, kebab-cased) *before* running the generator — the generator reads existing `[sound:...]` tags and produces audio to match them, it does not invent filenames. To add audio for a new entry: add the `[sound:...]` tag by hand first, then run `make-pronunciation-files.js` on that file.
- Parenthesized disambiguators in French text, e.g. `Tu` vs `(informal)`, and `/`-separated alternates are stripped/normalized by both `audio-drill.html` and the generator script (`cleanFrenchWord`/`removeSlashes`) before being spoken — keep that in mind if an entry looks slightly different when read aloud than as written.
- These files are formatted for direct import into Anki as flashcard decks.

## Grammar exercise formats (`grammar-exercises/`)

- **`translation-drills/<cefr-level>/<topic>/<n>.json`** — consumed by `translation-drill.html`. Top-level folders are CEFR levels (`a1/`, later `a2/`, `b1/`, `b2/`), matching the TEF roadmap's phase progression (see `tef-prep/ROADMAP.md` §4) — this keeps difficulty explicit and lets the same verb/tense be revisited at a harder level later without colliding with the easier set. Inside each level, one folder per grammar topic. Conjugation topics are scoped as `<verb>-<tense>` (e.g. `a1/etre-present/`, `a1/avoir-present/`, later `a2/etre-passe-compose/`) rather than one folder per verb, since conjugation drills are tense-specific; non-conjugation grammar topics (plurals, articles) use a plain descriptive slug instead (e.g. `a1/pluriel/`, `a1/articles/`). Numbered files inside (`1.json`, `2.json`, …) let more exercise sets be added to the same topic later without disturbing earlier ones. Each file contains `{ "title": ..., "exercises": [{ "en", "uk", "fr", "vocab": [{ "fr", "en", "uk" }] }] }`. `title` is a string or `{ "en", "uk" }`. `vocab` should list only the non-obvious words/phrases in that sentence (not full-sentence vocab) — they're surfaced as clickable, speakable hints during the exercise. These are generated on demand (by Claude, per the learner's request for a topic) rather than transcribed from a textbook; difficulty should match the level folder — A1 content must stay genuinely beginner (simple affirmative/negative statements, basic agreement, `est-ce que` questions only — no inversion, comparatives, or `ni...ni`), but should NOT skimp on vocabulary: cover the high-frequency core words/fixed expressions a true beginner needs (numbers, family, common objects, and set idiomatic phrases like `avoir faim/soif/raison/tort` — these are core A1 curriculum, not the "idiomatic phrasing" complexity to avoid). A2+ content can additionally lean into grammatically or lexically challenging constructions (inversion, comparatives, colloquial idioms, `ni...ni`), since drilling difficulty is the point once the learner is past the basics. Checking answers in the page is exact-match (case-insensitive), with a self-graded override checkbox for valid phrasings that differ from the reference — don't try to enumerate every acceptable translation in the JSON.

## Reading exercise format (`reading-exercises/`)

**`<cefr-level>/<topic>/<n>.json`**, consumed by `reading-trainer.html`. It uses the same level/topic/numbering scheme as the translation drills. Topic slugs name what's trained, e.g. `a1/nasale-in/` for the nasal [ɛ̃] spellings or `a1/e-ferme/` and `a1/e-ouvert/` for closed é vs. open è. Aim for 10 sets per topic, like the translation drills. Each file contains `{ "title", "sounds": [...], "focus", "sentences": [{ "fr", "en", "uk" }], "vocab": [{ "fr", "en", "uk" }] }`. `title` and `focus` are strings or `{ "en", "uk" }`; keep the IPA symbol and `« »` quotes in the Ukrainian title and focus too. Wrap the trained letters in `fr` in square brackets (`Dem[ain]`): they're highlighted on screen and stripped before speech. Mark them by hand, and only where the letters really make the target sound (`p[ain]` but not `semaine`, `b[on]` but not `bonne`). Unmarked look-alikes in the passage are useful contrast, and `focus` should point them out. The IPA symbol in `title` (e.g. `Closed [e] — …`) becomes a button that says the sound on its own. Voices can't read IPA, so the page maps each symbol to a real word made of just that sound (`SOUND_SAMPLES` in `reading-trainer.html`, e.g. `[e]` → `et`). A lone letter like `é` gets spelled out as "e accent aigu". A new sound needs an entry there, or its symbol stays plain text. `sounds` are the spellings shown as tags above the passage; `vocab` follows the same rules as in translation drills. Keep the text Québécois where register allows (e.g. dollars, `c'est le fun`), and call out Québec pronunciation differences in `focus`. The exception is `a1/vocabulaire-de-base/`: short stories that put the `anki-words/core-a1-b2/` lists in context, two sets per list (sets 2n−1 and 2n for the nth list), with every list word in one of the two and listed in `vocab` with the list's own glosses. Those have no brackets and an empty `sounds`. Their `focus` covers the pronunciation traps in that passage's words.

## `tef-prep/` — separate sub-project

`tef-prep/` is its own project within this repo: the program-management/planning layer for the whole TEF prep effort, not learning content or a tool itself. Keep that boundary — content/tooling conventions described elsewhere in this file (vocab format, grammar exercise format, etc.) don't apply inside `tef-prep/`, and planning/progress material (roadmap, phase check-ins, mock-exam logs, open questions) belongs here, not mixed into `anki-words/` or `grammar-exercises/`. Right now it's just `ROADMAP.md`, but treat future files added under this directory as part of the same planning sub-project rather than more drills/vocab.

### `tef-prep/ROADMAP.md`

This is the authoritative curriculum plan and **should be read before doing any curriculum-building work** (adding vocab, grammar progressions, or new drilling tools). Key points future work should respect:

- Target is NCLC 7 (CEFR B2) across all four TEF sections (reading, listening, writing, speaking) — content should skew Québécois, not Metropolitan French, especially for listening/speaking material.
- Speaking and writing tracks have no tooling at all yet and are the top priority gap (§6 of the roadmap) — favor building for these over adding more vocabulary tooling.
- New material should be phase-tagged (1–4, matching the CEFR progression in §4) so progress against exit criteria is measurable — untagged content is called out in the roadmap as an existing gap to fix.
- The roadmap is a living document: update it when a phase completes, priorities shift, or an open question in §7 gets answered — don't let it drift out of sync with actual progress.
