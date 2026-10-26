# CLAUDE.md — English

Guidance for working in `english/`. Repo-wide layout, the shared `library.js`/`i18n.js` and the GitHub Pages deploy are covered in the root `CLAUDE.md`. Paths below are relative to `english/`.

## What this folder is

Study materials and drilling tools in Canadian English for one Ukrainian-speaking learner at CLB 7 (about CEFR B2), who is studying accounting and office administration. Content uses Canadian spelling and usage (`cheque`, `centre`, `realize`, `on the weekend`, CRA, GST/HST) and is read aloud with an `en-CA` voice.

`audio-drill.html`, `vocab-quiz.html` and `gap-fill.html` have no build step. The first two load a `.txt` file from `anki-words/`; `gap-fill.html` loads a `.json` file from `grammar-exercises/gap-fill/<level>/<topic>/`.

## Learner language (Ukrainian)

Translations in the content are always Ukrainian. The EN | УКР switch only changes the interface text, plus the `{ "en", "uk" }` titles, `focus` and `why` notes in the gap-fill sets. Ukrainian translations should be natural Ukrainian, not word-for-word. Keep Canadian names and terms (CRA, GST, Interac e-Transfer) as they are.

## Vocabulary file format (`anki-words/<group>/<nn>-<slug>.txt`)

Tab-separated, one entry per line:

```
<English>\t<Ukrainian>
<English>\t<Ukrainian>\t[sound:<slug>.webm]
```

- Groups are subject areas (`accounting/`, `admin-assistant/`), and each list holds exactly 50 entries. Don't repeat an English or a Ukrainian entry across lists in the same group.
- Verbs are written with `to` (`to reconcile`). The quiz accepts the answer with or without it.
- Notes go in parentheses: `GST (Goods and Services Tax)`. They're stripped from the accepted answers and from what's spoken.
- ` / ` separates alternatives (`colleague / co-worker`). The quiz accepts any of them, so avoid slashes inside a single term.
- The optional third column is an Anki sound tag, as in French. These files import directly into Anki.

## Gap-fill format (`grammar-exercises/gap-fill/<level>/<topic>/<n>.json`)

Consumed by `gap-fill.html`. Levels are CEFR folders (`b2/` for now). Topics are named after the grammar (`past-simple-present-perfect/`, `dependent-prepositions/`), each with numbered sets of 10 items. Each file contains:

```json
{
  "title": { "en": "…", "uk": "…" },
  "focus": { "en": "…", "uk": "…" },
  "exercises": [
    { "text": "She ___ (work) here since 2019.", "answers": [["has worked", "has been working"]],
      "uk": "…", "why": { "en": "…", "uk": "…" } }
  ]
}
```

- `answers` has one entry per `___` in `text`: a string, or a list of accepted answers with the preferred one first.
- Tense gaps put the verb hint in parentheses straight after the gap: `___ (not receive)`, `___ (already / send)`. Preposition gaps have no hint. Avoid other parentheses in `text`.
- Write answers in full forms only (`do not`, `will not`, `has not`). The page expands the learner's contractions (`don't`, `won't`, `can't`, `'ve`, `'ll`, `'re`, `'m`) before comparing. It doesn't expand `'s` or `'d`, since those are ambiguous.
- `uk` is a Ukrainian translation, shown blurred until hovered. `why` is a one-line reason shown after checking. `focus` summarises the rule for the whole set.
- Contexts are office, bookkeeping and Canadian workplace life, to reinforce the vocabulary lists.

The sets in `b2/` were generated from Python sources kept outside the repo. Edit the JSON directly; the page doesn't depend on how it was made.
