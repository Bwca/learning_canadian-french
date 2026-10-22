// Builds a manifest.json for each language on the GitHub Pages site: lists every
// vocab list, translation-drill set and reading exercise so the browser tools can
// offer them in a picker (Pages has no directory listing). A language is any
// top-level folder with an index.html, except ones starting with "." or "_" (like
// the _site output itself). Run from the repo root:
//   node .github/scripts/build-manifest.js <site-dir>
// writes <site-dir>/<language>/manifest.json, with paths relative to that folder.
const fs = require("fs");
const path = require("path");

const byNumber = (a, b) => a.localeCompare(b, undefined, { numeric: true });

function listDir(dir, filter) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(filter).sort(byNumber);
}

const isDir = dir => name => fs.statSync(path.join(dir, name)).isDirectory();

function buildManifest(langDir) {
    const rel = (...parts) => path.join(langDir, ...parts);

    const vocab = listDir(rel("anki-words"), isDir(rel("anki-words"))).map(group => ({
        label: group,
        files: listDir(rel("anki-words", group), name => name.endsWith(".txt")).map(name => ({
            name: name.replace(/\.txt$/, ""),
            path: `anki-words/${group}/${name}`,
        })),
    })).filter(group => group.files.length);

    // <root>/<level>/<topic>/<n>.json, grouped by level · topic and labelled with each file's title.
    // A title is a string (English) or { en, uk }; the name follows suit, for the picker to localize.
    const levelledJson = root => listDir(rel(root), isDir(rel(root))).flatMap(level =>
        listDir(rel(root, level), isDir(rel(root, level))).map(topic => ({
            label: `${level.toUpperCase()} · ${topic}`,
            files: listDir(rel(root, level, topic), name => name.endsWith(".json")).map(name => {
                const filePath = `${root}/${level}/${topic}/${name}`;
                const { title } = JSON.parse(fs.readFileSync(rel(filePath), "utf8"));
                const label = text => `${name.replace(/\.json$/, "")}. ${text || ""}`.trim();
                const titles = title && typeof title === "object" ? title : { en: title };
                return {
                    name: Object.fromEntries(Object.entries(titles).filter(([lang, text]) => text || lang === "en").map(([lang, text]) => [lang, label(text)])),
                    path: filePath,
                };
            }),
        }))
    ).filter(group => group.files.length);

    return {
        vocab,
        drills: levelledJson("grammar-exercises/translation-drills"),
        reading: levelledJson("reading-exercises"),
    };
}

const outDir = process.argv[2] || ".";
const languages = listDir(".", name => !/^[._]/.test(name) && isDir(".")(name) && fs.existsSync(path.join(name, "index.html")));
for (const lang of languages) {
    const manifest = buildManifest(lang);
    fs.mkdirSync(path.join(outDir, lang), { recursive: true });
    fs.writeFileSync(path.join(outDir, lang, "manifest.json"), JSON.stringify(manifest, null, 2));
    console.log(`${lang}/manifest.json: ${manifest.vocab.length} vocab groups, ${manifest.drills.length} drill topics, ${manifest.reading.length} reading topics`);
}
