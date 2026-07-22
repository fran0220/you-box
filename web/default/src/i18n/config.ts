import i18n, { type BackendModule, type ReadCallback } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

type LocaleModule = { default: { translation: Record<string, string> } }

// Locale bundles are loaded on demand so the active language (plus the
// English fallback) is fetched as its own chunk instead of shipping all
// six languages in the entry bundle (~2 MB of JSON).
const localeLoaders: Record<string, () => Promise<LocaleModule>> = {
  en: () => import('./locales/en.json'),
  zh: () => import('./locales/zh.json'),
  fr: () => import('./locales/fr.json'),
  ru: () => import('./locales/ru.json'),
  ja: () => import('./locales/ja.json'),
  vi: () => import('./locales/vi.json'),
}

const lazyLocaleBackend: BackendModule = {
  type: 'backend',
  init: () => {},
  read: (language: string, _namespace: string, callback: ReadCallback) => {
    const loader = localeLoaders[language]
    if (!loader) {
      callback(new Error(`unsupported language: ${language}`), false)
      return
    }
    loader()
      .then((mod) => callback(null, mod.default.translation))
      .catch((err: Error) => callback(err, false))
  },
}

// Resolves once the detected language (and fallback) finished loading.
// main.tsx awaits this before the first render to avoid flashing raw keys.
export const i18nReady = i18n
  .use(LanguageDetector)
  .use(lazyLocaleBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh', 'fr', 'ru', 'ja', 'vi'],
    load: 'languageOnly', // Convert zh-CN -> zh
    nsSeparator: false, // Allow literal colons in keys (e.g., URLs, labels)
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      // Translations are awaited before the initial render; later language
      // switches re-render in place instead of suspending the tree.
      useSuspense: false,
    },
  })

export default i18n
