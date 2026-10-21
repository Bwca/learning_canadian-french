# Phrases

Set phrases and example sentences, grouped by topic, one file per topic. Each line is `French<TAB>English<TAB>[sound:<slug>.webm]<TAB>/IPA/`, the same format as `../core-a1-b2/`. The IPA is standard French, not Québécois. No audio exists yet; the sound tags are in place for `pronunciation-generator`.

| File | Topic | Source |
|---|---|---|
| `greetings.txt` | Greetings, polite phrases, goodbyes | [French Greetings (French Essentials Lesson 1)](https://www.youtube.com/watch?v=hd0_GZHHWeE) and the "30 Greetings French" PDF from pdf-language-lessons.com |
| `avoir.txt` | Expressions with *avoir* (*avoir faim*, *avoir besoin de*…) | [20 Useful French Expressions with AVOIR](https://www.youtube.com/watch?v=EfM6WOHfzks) |
| `est-ce-que.txt` | Yes/no questions with *est-ce que* | [Asking questions in French with EST-CE QUE (French Essentials Lesson 30)](https://www.youtube.com/watch?v=o0tgXagvolU) |
| `il-y-a.txt` | *Il y a*: there is/are, its tenses, the negative, and "ago" | [IL Y A - How to say "there is" or "there are" in French](https://www.youtube.com/watch?v=oV9RNNq4Pg0) |

The videos are by Learn French With Alexa.

## How it was built

- The phrases were taken from the videos' subtitles. Two videos had none, so their audio was transcribed with Whisper. A few French example sentences that Whisper skipped were filled in from the video's own repetition or explanation of them.
- The PDF is partly machine-translated. Its calques were replaced with what people actually say: *comment avez-vous été ?* became *qu'est-ce que tu deviens ?*, *comment est tout ?* was dropped, and *revoyons-nous* became *on se revoit bientôt*.
- The videos teach France French, so Québec usage was added where it differs. It's marked "(Québec)" in the English: *allô*, *bienvenue* as "you're welcome", *bonne fin de semaine*, *ça va pas mal* meaning "pretty good", *crème glacée*, *avoir hâte*, *avoir le goût de*, *avoir de la misère à*, the *-tu* question particle and *y a*.
