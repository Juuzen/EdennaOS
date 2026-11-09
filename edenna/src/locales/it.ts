import type { TranslationTree } from "@prozilla-os/core";

/** Testi generali di Edenna OS — italiano (lingua di riferimento). */
export const it = {
	system: {
		name: "Edenna OS",
	},
	places: {
		workstation: "Postazione",
		desktop: "Scrivania",
		documents: "Documenti",
	},
} satisfies TranslationTree;

export type EdennaTranslationTree = typeof it;
