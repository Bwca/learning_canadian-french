# Core vocabulary, A1 → B2

About 5,750 words and phrases for going from zero to CEFR B2 (NCLC 7, the TEF Canada target). Each file holds 50 entries, and the files are meant to be learned in order:

- `a1-*`, `a2-*`, `b1-*`, `b2-*`: single words, each list running from most to least frequent
- `expressions-*`: linking words, opinion phrases and letter formulas for the TEF writing and speaking sections (B1–B2)
- `quebec-*`: Québec vocabulary for the listening section (A2–B1)

Each line is `French<TAB>English<TAB>[sound:<slug>.webm]<TAB>/IPA/`, the same format as `../pronunciation/`. The IPA is standard French, not Québécois. Nouns have their article, and words with a feminine form show both (`l'acteur (m.) / l'actrice (f.)`, `beau / belle`). No audio exists yet. The sound tags are already in place for `pronunciation-generator`.

## How it was built

- **Level:** taken from the CEFR level in FLELex, a word list graded with the Beacco *Référentiels* (the CEFR guidebooks for French). Very common words were moved earlier: a word in the 1,000 most frequent is at most A2, and one in the 2,500 most frequent is at most B1.
- **Frequency and pronunciation:** from Lexique 3.83, using the average of film-subtitle and book frequencies. Rare B1/B2 words (fewer than 5 per million) were left out. Genders, feminine forms and IPA come from Lexique, plus a few automatic fixes: *œ* spelling, /ɔ/ in unstressed syllables, and no stray final schwa.
- **English glosses:** written by hand. Tagging errors, duplicates, slurs and vulgar words were removed. Glosses were cross-checked against the FreeDict French–English dictionary.
- **Added by hand:** numbers and core function words, TEF topic words (immigration, environment, work, housing), the expressions list and the Québec list.

## Sources and licence

- FLELex (Beacco version): François, Gala, Watrin & Fairon (2014), "FLELex: a graded lexical resource for French foreign learners", LREC. CENTAL, UCLouvain. CC BY-NC-SA 4.0.
- Lexique 3.83: New, Pallier et al., www.lexique.org. CC BY-SA 4.0.
- FreeDict fra-eng 0.4.1 (used only to check the glosses).

Because FLELex is CC BY-NC-SA 4.0, these lists are shared under the same licence, for non-commercial use with attribution.
