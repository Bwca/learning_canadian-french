// Builds manifest.json for the GitHub Pages site: lists every vocab list,
// translation-drill set and reading exercise so the browser tools can offer them in a picker
// (Pages has no directory listing). Run from the repo root.
const fs = require("fs");
const path = require("path");

const byNumber = (a, b) => a.localeCompare(b, undefined, { numeric: true });

function listDir(dir, filter) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(filter).sort(byNumber);
}

const isDir = dir => name => fs.statSync(path.join(dir, name)).isDirectory();

const vocab = listDir("anki-words", isDir("anki-words")).map(group => ({
    label: group,
    files: listDir(path.join("anki-words", group), name => name.endsWith(".txt")).map(name => ({
        name: name.replace(/\.txt$/, ""),
        path: `anki-words/${group}/${name}`,
    })),
})).filter(group => group.files.length);

// <root>/<level>/<topic>/<n>.json, grouped by level · topic and labelled with each file's title.
const levelledJson = root => listDir(root, isDir(root)).flatMap(level =>
    listDir(path.join(root, level), isDir(path.join(root, level))).map(topic => ({
        label: `${level.toUpperCase()} · ${topic}`,
        files: listDir(path.join(root, level, topic), name => name.endsWith(".json")).map(name => {
            const filePath = `${root}/${level}/${topic}/${name}`;
            const { title } = JSON.parse(fs.readFileSync(filePath, "utf8"));
            return { name: `${name.replace(/\.json$/, "")}. ${title || ""}`.trim(), path: filePath };
        }),
    }))
).filter(group => group.files.length);

const drills = levelledJson("grammar-exercises/translation-drills");
const reading = levelledJson("reading-exercises");

const outDir = process.argv[2] || ".";
fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({ vocab, drills, reading }, null, 2));
console.log(`manifest.json: ${vocab.length} vocab groups, ${drills.length} drill topics, ${reading.length} reading topics`);
