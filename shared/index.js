// Main entry point for @my-affirms/shared
export * from './firebase/index.js'
export * from './tts/index.js'
export * from './validators/index.js'
export * from './utils/index.js'

// Re-export commonly used items
export { COLLECTIONS, STORAGE_PATHS } from './firebase/config.js'
export { ttsConfig, voiceLanguageMapping } from './tts/config.js'
export { ttsVoices, getVoicesForLanguage } from './tts/voices.js'