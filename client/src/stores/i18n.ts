import { browser, createI18n, localeFrom } from "@nanostores/i18n";
import { persistentAtom } from "@nanostores/persistent";

/**
 * User-select locale. This overrides the browser's setting.
 */
export const $locale = persistentAtom<string | undefined>("locale", undefined);

/**
 * If $locale is undefined, this uses the browser's locales. The ones I'm able
 * to translate to is VI, EN and JA. Any other locale falls back to EN.
 */
const $localeStore = localeFrom($locale, browser({
  available: ["vi", "en", "ja"],
  fallback: "en",
}));

/**
 * The Internationalization store.
 */
export const $i18n = createI18n($localeStore, {
  get(code) {
    return import(`../i18n/${code}.json`);
  }
});
