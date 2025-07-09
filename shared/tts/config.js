// TTS configuration and voice mappings
export const ttsConfig = {
  // Google Cloud TTS settings
  googleCloud: {
    apiEndpoint: '/api/tts',
    defaultVoice: 'pl-PL-ZofiaNeural',
    fallbackVoice: 'pl-PL-ZofiaStandard'
  },
  
  // Web Speech API settings
  webSpeech: {
    defaultRate: 0.8,
    defaultPitch: 1.0,
    defaultVolume: 1.0
  },
  
  // Usage limits
  limits: {
    premium: {
      neural: 300000, // characters per month
      standard: 1200000
    },
    free: {
      webSpeech: -1, // unlimited
      standard: 10000 // characters per month
    }
  }
}

// Voice mappings for different languages
export const voiceLanguageMapping = {
  'pl': 'pl-PL',
  'en': 'en-US', 
  'de': 'de-DE',
  'fr': 'fr-FR',
  'es': 'es-ES',
  'it': 'it-IT',
  'nl': 'nl-NL',
  'pt': 'pt-PT',
  'sv': 'sv-SE',
  'cs': 'cs-CZ',
  'da': 'da-DK',
  'no': 'nb-NO',
  'fi': 'fi-FI',
  'sk': 'sk-SK',
  'hu': 'hu-HU',
  'ro': 'ro-RO',
  'bg': 'bg-BG',
  'hr': 'hr-HR',
  'sl': 'sl-SI',
  'et': 'et-EE',
  'lv': 'lv-LV',
  'lt': 'lt-LT',
  'el': 'el-GR',
  'mt': 'mt-MT'
}