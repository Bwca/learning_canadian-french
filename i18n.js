// The learner's own language — the one the interface, translations and explanations are shown in
// (English or Ukrainian). Shared by every page: the choice is remembered in localStorage, and switching
// it re-translates the page in place, so nothing typed or loaded is lost.
//
// Interface text: give an element data-i18n="key" for its text, and/or data-i18n-attr="aria-label:key,
// placeholder:key" for attributes; {name} placeholders are filled from data-i18n-vars (JSON). Strings come
// from I18N_COMMON plus the page's own defineStrings({ en: {…}, uk: {…} }). A key with no Ukrainian
// string falls back to the English one.
//
// Content (the translations in vocab lists and exercise files): give an element data-en / data-uk
// attributes, which contentAttrs() builds. It shows the chosen language, or the English while that
// translation hasn't been written yet.
const UI_LANGUAGES = {
    en: { label: "EN", name: "English", speech: "en-US" },
    uk: { label: "УКР", name: "Українська", speech: "uk-UA" },
};
const UI_LANGUAGE_KEY = "uiLanguage";
let uiLanguage = UI_LANGUAGES[localStorage.getItem(UI_LANGUAGE_KEY)] ? localStorage.getItem(UI_LANGUAGE_KEY) : "en";

const i18nStrings = { en: {}, uk: {} };

function defineStrings(strings) {
    for (const lang in strings) Object.assign(i18nStrings[lang], strings[lang]);
}

function t(key, vars = {}) {
    const text = i18nStrings[uiLanguage][key] ?? i18nStrings.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
}

// A piece of content in the chosen language: value is { en, uk } (an exercise or vocab entry works
// as is) or a plain string, which is English.
function contentLanguage(value) {
    return value && typeof value === "object" && value[uiLanguage] ? uiLanguage : "en";
}

function localized(value) {
    if (value == null) return "";
    return typeof value === "object" ? value[contentLanguage(value)] || "" : String(value);
}

function i18nEscape(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function contentAttrs(value) {
    if (value && typeof value === "object") {
        return Object.keys(UI_LANGUAGES).filter(lang => value[lang])
            .map(lang => `data-${lang}="${i18nEscape(value[lang])}"`).join(" ");
    }
    return `data-en="${i18nEscape(value ?? "")}"`;
}

function applyTranslations(root = document) {
    const all = selector => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
    const vars = el => (el.dataset.i18nVars ? JSON.parse(el.dataset.i18nVars) : {});
    all("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n, vars(el)); });
    all("[data-i18n-attr]").forEach(el => {
        el.dataset.i18nAttr.split(",").forEach(pair => {
            const [attr, key] = pair.split(":").map(s => s.trim());
            el.setAttribute(attr, t(key, vars(el)));
        });
    });
    all("[data-en]").forEach(el => {
        const lang = el.dataset[uiLanguage] ? uiLanguage : "en";
        el.textContent = el.dataset[lang];
        el.lang = lang;
    });
}

// Interface text set from code (scores, voice notes, errors), kept translatable.
function setText(el, key, vars) {
    el.dataset.i18n = key;
    if (vars) el.dataset.i18nVars = JSON.stringify(vars);
    else delete el.dataset.i18nVars;
    applyTranslations(el);
}

function clearText(el) {
    delete el.dataset.i18n;
    delete el.dataset.i18nVars;
    el.textContent = "";
}

function setUiLanguage(lang) {
    uiLanguage = lang;
    localStorage.setItem(UI_LANGUAGE_KEY, lang);
    document.documentElement.lang = lang;
    applyTranslations();
    document.querySelectorAll(".language-switch .button").forEach(button => {
        const selected = button.dataset.lang === lang;
        button.classList.toggle("is-dark", selected);
        button.setAttribute("aria-pressed", selected);
    });
    document.dispatchEvent(new CustomEvent("uilanguagechange"));
}

// EN | УКР buttons at the top of the page's .container, or at the right of its .page-nav bar
// (the bar with the link back up to the index page) when it has one.
function mountLanguageSwitch() {
    const nav = document.querySelector(".page-nav");
    const container = document.querySelector(".container") || document.body;
    const group = document.createElement("div");
    group.className = "buttons has-addons is-right language-switch mb-0";
    group.setAttribute("role", "group");
    group.dataset.i18nAttr = "aria-label:languageSwitch";
    group.innerHTML = Object.entries(UI_LANGUAGES).map(([lang, { label, name }]) =>
        `<button type="button" class="button is-small" data-lang="${lang}" lang="${lang}" title="${name}">${label}</button>`).join("");
    group.addEventListener("click", event => {
        const button = event.target.closest(".button");
        if (button && button.dataset.lang !== uiLanguage) setUiLanguage(button.dataset.lang);
    });
    if (nav) nav.append(group);
    else container.prepend(group);
}

const I18N_COMMON = {
    en: {
        languageSwitch: "Your language",
        allTools: "All tools",
        textSizeControls: "Text size controls",
        textSize: "Text size:",
        textSmaller: "Decrease text size",
        textReset: "Reset text size to default",
        textResetButton: "Reset",
        textBigger: "Increase text size",
        frenchVoice: "French voice",
        speechSpeed: "Speech speed:",
        noFrenchVoice: "No French voice installed",
        noFrenchVoiceHint: "⚠️ No fr-* voice found on this system — speech will fall back to the default system voice.",
        usingVoice: "🔊 Using: {voice}",
        usingNetworkVoice: "🔊 Using: {voice} — this is a network voice; if it stays silent on the first click or two, try a local voice instead if one is listed",
        speechFailedNetwork: "⚠️ Speech failed: \"{voice}\" is a network voice and didn't respond. This commonly happens after a browser or Windows update changes network-voice availability — try switching to a local voice above.",
        speechFailedGeneric: "⚠️ Speech failed: the selected voice didn't respond. Try again, or check your system's speech/audio settings.",
        orChooseFile: "…or choose a file from your computer:",
        orChooseFiles: "…or choose files from your computer:",
        listsChosen: "Lists: {n} chosen",
        score: "Score: {correct} / {total} ({percent}%)",
        markCorrect: "Mark as Correct",
    },
    uk: {
        languageSwitch: "Ваша мова",
        allTools: "Усі тренажери",
        textSizeControls: "Розмір тексту",
        textSize: "Розмір тексту:",
        textSmaller: "Зменшити текст",
        textReset: "Повернути звичайний розмір тексту",
        textResetButton: "Скинути",
        textBigger: "Збільшити текст",
        frenchVoice: "Французький голос",
        speechSpeed: "Швидкість мовлення:",
        noFrenchVoice: "Французький голос не встановлено",
        noFrenchVoiceHint: "⚠️ У системі немає голосу fr-* — читатиме стандартний системний голос.",
        usingVoice: "🔊 Голос: {voice}",
        usingNetworkVoice: "🔊 Голос: {voice} — це мережевий голос; якщо він мовчить після першого-другого натискання, спробуйте локальний голос, якщо такий є у списку",
        speechFailedNetwork: "⚠️ Не вдалося озвучити: мережевий голос «{voice}» не відповів. Так часто буває після оновлення браузера чи Windows, яке змінює доступність мережевих голосів, — спробуйте вибрати локальний голос вище.",
        speechFailedGeneric: "⚠️ Не вдалося озвучити: вибраний голос не відповів. Спробуйте ще раз або перевірте налаштування мовлення та звуку в системі.",
        orChooseFile: "…або виберіть файл на комп'ютері:",
        orChooseFiles: "…або виберіть файли на комп'ютері:",
        listsChosen: "Списки: вибрано {n}",
        score: "Результат: {correct} / {total} ({percent}%)",
        markCorrect: "Зарахувати",
    },
};
defineStrings(I18N_COMMON);

document.documentElement.lang = uiLanguage;
// Page scripts run before this fires, so their own strings are defined by then.
document.addEventListener("DOMContentLoaded", () => {
    mountLanguageSwitch();
    setUiLanguage(uiLanguage);
});
