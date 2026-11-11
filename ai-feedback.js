// "Explain my mistake": analysis of a wrong typed answer by Chrome's built-in AI (the Prompt API,
// running Gemini Nano on the device — nothing is sent to a server). Shared by every page where the
// learner types answers and checks them. Needs ../i18n.js loaded first.
//
// Where the browser has no built-in AI (other browsers, older Chrome, a device that can't run the
// model) the button never appears and the page works as before. The first use may download the model;
// Chrome wants a click for that, which the button provides.
//
// Usage, after checking an answer:
//   showAiExplain(container, task)   — task null (answer right, or left empty) just clears the container
// where task is {
//   studied: "fr" | "en",        the language being learnt, the one the answer is written in
//   exercise: "…",               what the learner was asked to do, in plain English
//   expected: "…" | ["…", …],    the reference answer(s)
//   given: "…",                  what the learner typed
//   note: "…",                   optional: the rule the exercise trains, or the set's own explanation
// }

const AI_LANGUAGE_NAMES = { en: "English", uk: "Ukrainian", fr: "French" };
// Languages Chrome's Prompt API currently accepts in expectedInputs / expectedOutputs.
// Ukrainian is not among them — probing it makes Chrome log console noise (and can look
// like an "execution config" warning) even when English would work fine.
const AI_API_LANGUAGES = new Set(["en", "ja", "es", "de", "fr"]);

defineStrings({
    en: {
        aiExplain: "🤖 Explain my mistake",
        aiExplainLabel: "Explain my mistake with Chrome's built-in AI",
        aiThinking: "🤖 Looking at your answer…",
        aiDownloading: "🤖 Downloading Chrome's AI model (first time only)… {percent}%",
        aiFailed: "⚠️ The AI couldn't analyse this answer: {error}",
        aiConfigMissing: "⚠️ Chrome has the AI model, but its feature config isn't ready yet. Open chrome://components, update \"Optimization Guide On Device Model\", relaunch Chrome, and try again (sometimes it needs a few hours).",
        aiEnglishOnly: "Chrome's built-in AI can't write Ukrainian yet, so this explanation is in English.",
        aiDisclaimer: "AI explanation — it can be wrong; the reference answer is what counts.",
    },
    uk: {
        aiExplain: "🤖 Поясни мою помилку",
        aiExplainLabel: "Пояснити помилку за допомогою вбудованого ШІ Chrome",
        aiThinking: "🤖 Аналізую вашу відповідь…",
        aiDownloading: "🤖 Завантажую модель ШІ Chrome (лише першого разу)… {percent}%",
        aiFailed: "⚠️ ШІ не зміг проаналізувати відповідь: {error}",
        aiConfigMissing: "⚠️ Chrome має модель ШІ, але конфіг функції ще не готовий. Відкрийте chrome://components, оновіть «Optimization Guide On Device Model», перезапустіть Chrome і спробуйте знову (іноді потрібно кілька годин).",
        aiEnglishOnly: "Вбудований ШІ Chrome поки не пише українською, тож пояснення англійською.",
        aiDisclaimer: "Пояснення від ШІ — воно може помилятися; орієнтуйтеся на правильну відповідь.",
    },
});

document.head.insertAdjacentHTML("beforeend", `<style>
    .ai-feedback { margin-top: 8px; text-align: left; }
    .ai-feedback-output { margin-top: 6px; }
    .ai-feedback-text { background: #eef3fc; border-left: 4px solid #485fc7; padding: 0.5em 0.75em; border-radius: 4px; }
    .ai-feedback-text p + p { margin-top: 0.25em; }
</style>`);

const aiFeedback = {
    // Per explanation language: { options, outputLanguage } once the API has said which it supports.
    setups: {},
    sessions: {},
};

function aiFeedbackSupported() {
    return "LanguageModel" in self;
}

function aiApiLanguages(...codes) {
    return [...new Set(codes.filter(code => AI_API_LANGUAGES.has(code)))];
}

// The session options to use, trying the learner's own language first (only if Chrome supports
// it) and falling back to English, then to no language hints (same shape as a working extension
// create() call) for Chrome versions that don't want the language fields.
async function aiFeedbackSetup(studied) {
    const key = `${studied}:${uiLanguage}`;
    if (key in aiFeedback.setups) return aiFeedback.setups[key];
    const outputLanguage = AI_API_LANGUAGES.has(uiLanguage) ? uiLanguage : "en";
    const inputs = aiApiLanguages("en", studied, uiLanguage);
    const candidates = [
        ...(outputLanguage !== "en" ? [{
            outputLanguage,
            options: {
                expectedInputs: [{ type: "text", languages: inputs.length ? inputs : ["en"] }],
                expectedOutputs: [{ type: "text", languages: [outputLanguage] }],
            },
        }] : []),
        {
            outputLanguage: "en",
            options: {
                expectedInputs: [{ type: "text", languages: inputs.length ? inputs : ["en"] }],
                expectedOutputs: [{ type: "text", languages: ["en"] }],
            },
        },
        {
            outputLanguage: "en",
            options: {
                expectedInputs: [{ type: "text", languages: ["en"] }],
                expectedOutputs: [{ type: "text", languages: ["en"] }],
            },
        },
        // No language hints — matches the LinkedIn sample that already works on this machine.
        { outputLanguage: "en", options: {} },
    ];
    let setup = null;
    for (const candidate of candidates) {
        try {
            if (await LanguageModel.availability(candidate.options) !== "unavailable") { setup = candidate; break; }
        } catch {
            // An option this Chrome doesn't understand: try the next, simpler one.
        }
    }
    aiFeedback.setups[key] = setup;
    return setup;
}

function aiFeedbackLooksLikeMissingConfig(error) {
    const message = String(error?.message || error || "").toLowerCase();
    return message.includes("execution config")
        || message.includes("not available on this device")
        || message.includes("unable to create")
        || message.includes("model was available");
}

function aiSystemPrompt(studied, outputLanguage) {
    const studiedName = AI_LANGUAGE_NAMES[studied];
    const variety = studied === "fr"
        ? "The course teaches Canadian (Québec) French, so accept Québec words and usage."
        : "The course teaches Canadian English, so accept Canadian spelling and usage.";
    return `You are a patient ${studiedName} teacher. Your student is a beginner whose own language is ${AI_LANGUAGE_NAMES[uiLanguage]}.
The student did an exercise, and their answer did not match the reference answer. Explain what went wrong.
${variety}

Rules:
- Write in ${AI_LANGUAGE_NAMES[outputLanguage]}, in short, simple sentences. Quote ${studiedName} words exactly as written.
- If the student's answer is also correct (a valid alternative, only a different word order or synonym that keeps the meaning), start with "✅" and say in one sentence why it is acceptable. Mention any small slip separately.
- Otherwise, list each mistake on its own line as: • <the student's words> → <the correct words>: <the reason>.
- Name the reason precisely: spelling, missing or wrong accent, gender, agreement, verb form, article, preposition, word order, or wrong word (say what the student's word means).
- At most 4 lines. No greeting, no praise, no repeating the whole sentence, no extra advice.`;
}

async function aiFeedbackSession(studied, setup, onProgress) {
    const key = `${studied}:${uiLanguage}:${setup.outputLanguage}`;
    if (!aiFeedback.sessions[key]) {
        aiFeedback.sessions[key] = LanguageModel.create({
            ...setup.options,
            initialPrompts: [{ role: "system", content: aiSystemPrompt(studied, setup.outputLanguage) }],
            monitor(m) {
                m.addEventListener("downloadprogress", e => onProgress(Math.round(e.loaded * 100)));
            },
        }).catch(error => {
            delete aiFeedback.sessions[key];
            throw error;
        });
    }
    return aiFeedback.sessions[key];
}

function aiTaskPrompt(task) {
    const expected = Array.isArray(task.expected) ? task.expected : [task.expected];
    return [
        `Exercise: ${task.exercise}`,
        expected.length > 1 ? `Accepted answers: ${expected.map(a => `"${a}"`).join(", ")}` : `Reference answer: "${expected[0]}"`,
        task.note ? `What the exercise trains: ${task.note}` : "",
        `Student's answer: "${task.given}"`,
    ].filter(Boolean).join("\n");
}

// The model's plain-text answer as HTML: escaped, one paragraph per line, **bold** kept.
function aiFeedbackHtml(text) {
    return text.trim().split(/\n+/).map(line => line.trim()).filter(Boolean)
        .map(line => `<p>${i18nEscape(line.replace(/^[-*]\s+/, "• ")).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`)
        .join("");
}

async function explainWithAi(task, output) {
    const status = document.createElement("p");
    status.className = "help";
    output.replaceChildren(status);
    setText(status, "aiThinking");
    try {
        const setup = await aiFeedbackSetup(task.studied);
        if (!setup) throw new Error("not available on this device");
        const base = await aiFeedbackSession(task.studied, setup, percent => setText(status, "aiDownloading", { percent }));
        setText(status, "aiThinking");
        // A fresh copy of the session per answer, so earlier answers don't pile up in its context.
        const session = await base.clone();
        let reply;
        try {
            reply = await session.prompt(aiTaskPrompt(task));
        } finally {
            session.destroy();
        }
        output.innerHTML = `<div class="ai-feedback-text" lang="${setup.outputLanguage}">${aiFeedbackHtml(reply)}</div>`
            + (setup.outputLanguage !== uiLanguage ? `<p class="help" data-i18n="aiEnglishOnly"></p>` : "")
            + `<p class="help has-text-grey" data-i18n="aiDisclaimer"></p>`;
        applyTranslations(output);
    } catch (error) {
        if (aiFeedbackLooksLikeMissingConfig(error)) setText(status, "aiConfigMissing");
        else setText(status, "aiFailed", { error: error?.message || String(error) });
        status.classList.add("has-text-danger");
    }
}

async function showAiExplain(container, task) {
    container.replaceChildren();
    // Checking again before the availability check below finishes must not leave the older button behind.
    const token = String((Number(container.dataset.aiToken) || 0) + 1);
    container.dataset.aiToken = token;
    if (!task || !task.given.trim() || !aiFeedbackSupported()) return;
    if (!(await aiFeedbackSetup(task.studied)) || container.dataset.aiToken !== token) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button is-small is-link is-light";
    button.dataset.i18n = "aiExplain";
    button.dataset.i18nAttr = "aria-label:aiExplainLabel";
    const output = document.createElement("div");
    output.className = "ai-feedback-output";
    output.setAttribute("aria-live", "polite");
    button.addEventListener("click", async () => {
        button.disabled = true;
        await explainWithAi(task, output);
        button.disabled = false;
    });
    container.append(button, output);
    applyTranslations(container);
}
