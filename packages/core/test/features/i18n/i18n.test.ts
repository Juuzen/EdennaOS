// [Edenna] Tests for the localization system.
import { describe, expect, it, vi } from "vitest";
import { defineOverrides, defineTranslations, I18n, plural } from "../../../src/features/i18n";
import { coreTranslations } from "../../../src/locales";
import { en as coreEn } from "../../../src/locales/en";
import { it as coreIt } from "../../../src/locales/it";

const testTranslations = defineTranslations("test", {
	en: {
		greeting: "Hello {name}",
		nested: { deep: { value: "Deep" } },
		files: plural({ zero: "No files", one: "{count} file", other: "{count} files" }),
		onlyEnglish: "Only in English",
	},
	it: {
		greeting: "Ciao {name}",
		nested: { deep: { value: "Profondo" } },
		files: plural({ zero: "Nessun file", one: "{count} file", other: "{count} file" }),
		onlyEnglish: "",
	},
});

function createI18n(locale = "it", overrides = [] as ReturnType<typeof defineOverrides>[]) {
	return new I18n({ locale, fallbackLocale: "en", availableLocales: ["it", "en"], overrides });
}

describe("I18n", () => {
	it("translates nested keys and fills placeholders", () => {
		const i18n = createI18n();
		expect(i18n.translate(testTranslations, "greeting", { name: "Ada" })).toBe("Ciao Ada");
		expect(i18n.translate(testTranslations, "nested.deep.value")).toBe("Profondo");
	});

	it("keeps unknown placeholders", () => {
		expect(createI18n().translate(testTranslations, "greeting")).toBe("Ciao {name}");
	});

	it("selects plural forms", () => {
		const i18n = createI18n("en");
		expect(i18n.translate(testTranslations, "files", { count: 0 })).toBe("No files");
		expect(i18n.translate(testTranslations, "files", { count: 1 })).toBe("1 file");
		expect(i18n.translate(testTranslations, "files", { count: 5 })).toBe("5 files");
	});

	it("switches language and notifies listeners", () => {
		const i18n = createI18n();
		const listener = vi.fn();
		const unsubscribe = i18n.subscribe(listener);

		i18n.nextLocale();
		expect(i18n.locale).toBe("en");
		expect(i18n.translate(testTranslations, "greeting", { name: "Ada" })).toBe("Hello Ada");
		expect(listener).toHaveBeenCalledTimes(1);

		unsubscribe();
		i18n.nextLocale();
		expect(i18n.locale).toBe("it");
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("falls back to the fallback language for missing locales", () => {
		const i18n = createI18n("fr");
		expect(i18n.translate(testTranslations, "greeting", { name: "Ada" })).toBe("Hello Ada");
	});

	it("returns the key for missing translations", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		expect(createI18n().translateUnchecked(testTranslations, "missing.key")).toBe("missing.key");
		warn.mockRestore();
	});

	it("applies overrides per language, merging nested groups", () => {
		const i18n = createI18n("it", [
			defineOverrides(testTranslations, { it: { nested: { deep: { value: "Sovrascritto" } } } }),
			defineOverrides(testTranslations, { it: { greeting: "Salve {name}" } }),
		]);
		expect(i18n.translate(testTranslations, "nested.deep.value")).toBe("Sovrascritto");
		expect(i18n.translate(testTranslations, "greeting", { name: "Ada" })).toBe("Salve Ada");

		i18n.setLocale("en");
		expect(i18n.translate(testTranslations, "greeting", { name: "Ada" })).toBe("Hello Ada");
	});

	it("resolves localized texts", () => {
		const i18n = createI18n();
		expect(i18n.resolveText("Plain")).toBe("Plain");
		expect(i18n.resolveText({ it: "Documenti", en: "Documents" })).toBe("Documenti");
		expect(i18n.resolveText({ en: "Documents" })).toBe("Documents");
	});

	it("names languages in their own language", () => {
		const i18n = createI18n();
		expect(i18n.getLanguageName("it")).toBe("Italiano");
		expect(i18n.getLanguageName("en")).toBe("English");
	});
});

describe("core translations", () => {
	it("have the same keys in every language", () => {
		const keys = (tree: object, prefix = ""): string[] => Object.entries(tree).flatMap(([key, value]) =>
			typeof value === "object" && !("other" in value) ? keys(value as object, `${prefix}${key}.`) : [`${prefix}${key}`]
		);
		expect(keys(coreIt).sort()).toEqual(keys(coreEn).sort());
	});

	it("are used by default", () => {
		expect(createI18n().translate(coreTranslations, "window.close")).toBe("Chiudi");
		expect(createI18n("en").translate(coreTranslations, "items", { count: 2 })).toBe("2 items");
	});
});
