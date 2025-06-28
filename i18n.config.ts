export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  silentFallbackWarn: false,
  silentTranslationWarn: false,
  missingWarn: true,
  fallbackWarn: true,
  missing: (locale: string, key: string) => {
    console.log(`🔍 Missing key "${key}" in locale "${locale}"`)
    return key
  }
}))