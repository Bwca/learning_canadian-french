// Built-in file library for the GitHub Pages build. manifest.json is generated
// at deploy time (.github/scripts/build-manifest.js) and lists the vocab lists /
// drill sets in the repo, so the tools can fetch them instead of asking for a
// local file. When opened locally (file://) there's no manifest and the picker
// stays hidden — the "Choose a file…" input still works as before.
async function fetchLibrary(kind) {
    try {
        const response = await fetch("manifest.json");
        if (!response.ok) return null;
        const groups = (await response.json())[kind];
        return groups && groups.length ? groups : null;
    } catch {
        return null;
    }
}

async function fetchLibraryFile(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Couldn't load ${filePath} (${response.status})`);
    return response.text();
}

// Single-choice dropdown, grouped by folder/topic. onPick(text, file) fires on selection.
async function mountLibrarySelect(container, kind, placeholder, onPick) {
    const groups = await fetchLibrary(kind);
    if (!groups) return;
    const select = document.createElement("select");
    select.setAttribute("aria-label", placeholder);
    select.add(new Option(placeholder, ""));
    groups.forEach(group => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = group.label;
        group.files.forEach(file => optgroup.appendChild(new Option(file.name, file.path)));
        select.appendChild(optgroup);
    });
    select.addEventListener("change", async () => {
        if (!select.value) return;
        const file = groups.flatMap(group => group.files).find(f => f.path === select.value);
        try {
            onPick(await fetchLibraryFile(select.value), file);
        } catch (error) {
            alert(error.message);
        }
    });
    container.innerHTML = `<div class="select is-fullwidth"></div><p class="help">…or choose a file from your computer:</p>`;
    container.firstElementChild.appendChild(select);
    container.classList.remove("hidden");
}

// Multi-choice checklist, grouped by folder, in a section that starts open and can be collapsed once
// the lists are chosen; its summary line counts the chosen ones. Returns a function giving the checked
// files as { name, text }, name being "<folder> / <file>". onChange, if given, fires when a box is ticked or unticked.
async function mountLibraryChecklist(container, kind, onChange) {
    const groups = await fetchLibrary(kind);
    if (!groups) return async () => [];
    container.innerHTML = `<details open><summary></summary>${groups.map(group => `
        <p class="has-text-weight-semibold mt-2">${group.label}</p>
        <div>${group.files.map(file => `
            <label class="checkbox mr-3"><input type="checkbox" value="${file.path}" data-name="${group.label} / ${file.name}"> ${file.name}</label>`).join("")}
        </div>`).join("")}</details><p class="help mt-2">…or choose files from your computer:</p>`;
    const summary = container.querySelector("summary");
    const countChosen = () => {
        const chosen = container.querySelectorAll("input:checked").length;
        summary.textContent = `Lists: ${chosen} chosen`;
    };
    countChosen();
    container.addEventListener("change", countChosen);
    container.classList.remove("hidden");
    if (onChange) container.addEventListener("change", onChange);
    return () => Promise.all([...container.querySelectorAll("input:checked")].map(async box =>
        ({ name: box.dataset.name, text: await fetchLibraryFile(box.value) })));
}
