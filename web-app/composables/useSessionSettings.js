// Session Settings Manager - zarządzanie ustawieniami sesji afirmacji
import { useTextToSpeech } from './useTextToSpeech'

export const useSessionSettings = (options = {}) => {
  const { getLanguageMapping, getAvailableAiVoices } = useTextToSpeech()
  const { $i18n } = useNuxtApp()
  
  // === DEFAULT SETTINGS ===
  
  const getDefaultSettings = () => ({
    speechRate: 1.0,
    pauseDuration: 3,
    sentencePause: 4,
    repeatAffirmation: false,
    repeatDelay: 5,
    voiceId: 'pl-PL-ZofiaNeural',
    voicesByLanguage: {}, // Store selected voices per language
    backgroundMusic: false, // Background relaxing music
    musicVolume: 0.15, // Low volume for background music
    musicType: 'birds' // Type of background music: birds, ocean
  })
  
  // === REACTIVE SETTINGS STATE ===
  
  const settings = ref(getDefaultSettings())
  
  // === VALIDATION ===
  
  const validateSettings = (settingsData) => {
    const errors = []
    
    if (settingsData.speechRate !== undefined) {
      if (typeof settingsData.speechRate !== 'number' || settingsData.speechRate < 0.1 || settingsData.speechRate > 3.0) {
        errors.push('Speech rate must be between 0.1 and 3.0')
      }
    }
    
    if (settingsData.pauseDuration !== undefined) {
      if (typeof settingsData.pauseDuration !== 'number' || settingsData.pauseDuration < 0 || settingsData.pauseDuration > 30) {
        errors.push('Pause duration must be between 0 and 30 seconds')
      }
    }
    
    if (settingsData.sentencePause !== undefined) {
      if (typeof settingsData.sentencePause !== 'number' || settingsData.sentencePause < 0 || settingsData.sentencePause > 10) {
        errors.push('Sentence pause must be between 0 and 10 seconds')
      }
    }
    
    if (settingsData.repeatDelay !== undefined) {
      if (typeof settingsData.repeatDelay !== 'number' || settingsData.repeatDelay < 1 || settingsData.repeatDelay > 60) {
        errors.push('Repeat delay must be between 1 and 60 seconds')
      }
    }
    
    if (settingsData.musicVolume !== undefined) {
      if (typeof settingsData.musicVolume !== 'number' || settingsData.musicVolume < 0 || settingsData.musicVolume > 1) {
        errors.push('Music volume must be between 0 and 1')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // === VOICE MANAGEMENT ===
  
  const availableVoices = computed(() => {
    const ttsLanguage = getLanguageMapping($i18n.locale.value)
    return getAvailableAiVoices(ttsLanguage)
  })
  
  const getCurrentLanguageVoices = () => {
    const ttsLanguage = getLanguageMapping($i18n.locale.value)
    return getAvailableAiVoices(ttsLanguage)
  }
  
  const getVoiceForLanguage = (languageCode) => {
    const voices = getAvailableAiVoices(languageCode)
    const savedVoiceId = settings.value.voicesByLanguage[languageCode]
    
    // Check if saved voice exists for this language
    if (savedVoiceId && voices.find(v => v.id === savedVoiceId)) {
      return savedVoiceId
    }
    
    // Return default voice for language
    if (voices.length > 0) {
      const defaultVoice = voices.find(v => v.gender === 'female') || voices[0]
      return defaultVoice.id
    }
    
    return 'pl-PL-ZofiaNeural' // Fallback
  }
  
  const setVoiceForLanguage = (languageCode, voiceId) => {
    settings.value.voicesByLanguage[languageCode] = voiceId
    
    // If this is the current language, update the main voiceId
    const currentLanguage = getLanguageMapping($i18n.locale.value)
    if (languageCode === currentLanguage) {
      settings.value.voiceId = voiceId
    }
  }
  
  const updateVoiceForCurrentLanguage = (voiceId) => {
    const currentLanguage = getLanguageMapping($i18n.locale.value)
    setVoiceForLanguage(currentLanguage, voiceId)
  }
  
  // === MUSIC SETTINGS ===
  
  const musicTypes = [
    { value: 'birds_generated', label: 'Ptaki (generowane)', category: 'generated' },
    { value: 'ocean_generated', label: 'Ocean (generowany)', category: 'generated' },
    { value: 'deeper_meaning', label: 'Deeper Meaning', category: 'relaxing' },
    { value: 'relaxing_music', label: 'Muzyka relaksacyjna', category: 'relaxing' },
    { value: 'meditation_music', label: 'Muzyka medytacyjna', category: 'relaxing' },
    { value: 'spa_music', label: 'Muzyka spa', category: 'relaxing' },
    { value: 'nature_sounds', label: 'Dźwięki natury', category: 'nature' },
    { value: 'rain_sounds', label: 'Dźwięki deszczu', category: 'nature' },
    { value: 'forest_ambience', label: 'Ambience lasu', category: 'nature' }
  ]
  
  const getMusicTypesByCategory = () => {
    return {
      generated: musicTypes.filter(m => m.category === 'generated'),
      relaxing: musicTypes.filter(m => m.category === 'relaxing'),
      nature: musicTypes.filter(m => m.category === 'nature')
    }
  }
  
  const getMusicTypeLabel = (musicType) => {
    const type = musicTypes.find(m => m.value === musicType)
    return type?.label || musicType
  }
  
  // === SETTINGS OPERATIONS ===
  
  const updateSettings = (newSettings, options = {}) => {
    console.log('📝 Updating session settings:', Object.keys(newSettings))
    
    try {
      // Validate new settings
      const validation = validateSettings(newSettings)
      if (!validation.isValid) {
        throw new Error(`Invalid settings: ${validation.errors.join(', ')}`)
      }
      
      // Merge with existing settings
      const updatedSettings = {
        ...settings.value,
        ...newSettings
      }
      
      settings.value = updatedSettings
      
      // Persist if callback provided
      if (options.onUpdate) {
        options.onUpdate(updatedSettings)
      }
      
      console.log('✅ Settings updated successfully')
      return { success: true, settings: updatedSettings }
      
    } catch (error) {
      console.error('❌ Failed to update settings:', error)
      throw error
    }
  }
  
  const resetSettings = (options = {}) => {
    console.log('🔄 Resetting session settings to defaults')
    
    const defaultSettings = getDefaultSettings()
    settings.value = defaultSettings
    
    if (options.onUpdate) {
      options.onUpdate(defaultSettings)
    }
    
    console.log('✅ Settings reset to defaults')
    return { success: true, settings: defaultSettings }
  }
  
  const loadSettings = (savedSettings, options = {}) => {
    console.log('📥 Loading session settings')
    
    try {
      if (!savedSettings || typeof savedSettings !== 'object') {
        console.log('⚠️ No valid saved settings, using defaults')
        return resetSettings(options)
      }
      
      // Merge saved settings with defaults to preserve new properties
      const mergedSettings = {
        ...getDefaultSettings(),
        ...savedSettings,
        voicesByLanguage: savedSettings.voicesByLanguage || {}
      }
      
      // Validate merged settings
      const validation = validateSettings(mergedSettings)
      if (!validation.isValid) {
        console.warn('⚠️ Invalid saved settings, using defaults:', validation.errors)
        return resetSettings(options)
      }
      
      settings.value = mergedSettings
      
      console.log('✅ Settings loaded successfully')
      return { success: true, settings: mergedSettings }
      
    } catch (error) {
      console.error('❌ Failed to load settings:', error)
      return resetSettings(options)
    }
  }
  
  // === LANGUAGE CHANGE HANDLING ===
  
  const handleLanguageChange = (newLocale, options = {}) => {
    console.log('🌐 Handling language change:', newLocale)
    
    const ttsLanguage = getLanguageMapping(newLocale)
    const voices = getAvailableAiVoices(ttsLanguage)
    
    if (voices.length > 0) {
      // Check if we have a saved voice for this language
      const savedVoiceId = settings.value.voicesByLanguage[ttsLanguage]
      const savedVoiceExists = savedVoiceId && voices.find(v => v.id === savedVoiceId)
      
      if (savedVoiceExists) {
        // Use saved voice for this language
        settings.value.voiceId = savedVoiceId
        console.log('✅ Using saved voice for language:', { language: ttsLanguage, voiceId: savedVoiceId })
      } else {
        // Set default voice and save it
        const defaultVoice = voices.find(v => v.gender === 'female') || voices[0]
        settings.value.voiceId = defaultVoice.id
        settings.value.voicesByLanguage[ttsLanguage] = defaultVoice.id
        console.log('✅ Set default voice for language:', { language: ttsLanguage, voiceId: defaultVoice.id })
      }
      
      // Persist changes if callback provided
      if (options.onUpdate) {
        options.onUpdate(settings.value)
      }
    }
  }
  
  // === COMPUTED PROPERTIES ===
  
  const sessionSummary = computed(() => {
    const s = settings.value
    return {
      speechRate: s.speechRate,
      pauseDuration: s.pauseDuration,
      sentencePause: s.sentencePause,
      hasRepeat: s.repeatAffirmation,
      repeatDelay: s.repeatDelay,
      voiceId: s.voiceId,
      hasBackgroundMusic: s.backgroundMusic,
      musicType: s.musicType,
      musicVolume: s.musicVolume
    }
  })
  
  const isValidConfiguration = computed(() => {
    const validation = validateSettings(settings.value)
    return validation.isValid
  })
  
  const currentVoiceInfo = computed(() => {
    const voices = getCurrentLanguageVoices()
    const currentVoice = voices.find(v => v.id === settings.value.voiceId)
    return currentVoice || null
  })
  
  // === WATCHERS ===
  
  // Watch for voice changes and save per language
  watch(() => settings.value.voiceId, (newVoiceId) => {
    if (newVoiceId) {
      const ttsLanguage = getLanguageMapping($i18n.locale.value)
      settings.value.voicesByLanguage[ttsLanguage] = newVoiceId
    }
  })
  
  // Watch for locale changes and update voice
  if (options.autoHandleLanguageChange !== false) {
    watch(() => $i18n.locale.value, (newLocale) => {
      handleLanguageChange(newLocale, options)
    })
  }
  
  // === INITIALIZATION ===
  
  const initializeSettings = (initialSettings = null, initOptions = {}) => {
    console.log('🚀 Initializing session settings')
    
    // Load settings
    const result = loadSettings(initialSettings, initOptions)
    
    // Set up voice for current language
    handleLanguageChange($i18n.locale.value, initOptions)
    
    console.log('✅ Session settings initialized')
    return result
  }
  
  // === UTILITY FUNCTIONS ===
  
  const exportSettings = () => {
    return JSON.parse(JSON.stringify(settings.value))
  }
  
  const importSettings = (importedSettings, options = {}) => {
    return loadSettings(importedSettings, options)
  }
  
  const getSettingsForSession = () => {
    // Return settings optimized for session use
    return {
      speechRate: settings.value.speechRate,
      pauseDuration: settings.value.pauseDuration,
      sentencePause: settings.value.sentencePause,
      repeatAffirmation: settings.value.repeatAffirmation,
      repeatDelay: settings.value.repeatDelay,
      voiceId: settings.value.voiceId,
      backgroundMusic: settings.value.backgroundMusic,
      musicVolume: settings.value.musicVolume,
      musicType: settings.value.musicType,
      voicesByLanguage: settings.value.voicesByLanguage
    }
  }
  
  const validateForSession = () => {
    const errors = []
    
    if (!settings.value.voiceId) {
      errors.push('No voice selected')
    }
    
    if (settings.value.backgroundMusic && !settings.value.musicType) {
      errors.push('Background music enabled but no music type selected')
    }
    
    const validation = validateSettings(settings.value)
    if (!validation.isValid) {
      errors.push(...validation.errors)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      canStartSession: errors.length === 0
    }
  }
  
  return {
    // State
    settings: readonly(settings),
    availableVoices,
    sessionSummary,
    isValidConfiguration,
    currentVoiceInfo,
    
    // Settings operations
    updateSettings,
    resetSettings,
    loadSettings,
    initializeSettings,
    
    // Voice management
    getCurrentLanguageVoices,
    getVoiceForLanguage,
    setVoiceForLanguage,
    updateVoiceForCurrentLanguage,
    handleLanguageChange,
    
    // Music management
    musicTypes,
    getMusicTypesByCategory,
    getMusicTypeLabel,
    
    // Validation
    validateSettings,
    validateForSession,
    
    // Utility
    exportSettings,
    importSettings,
    getSettingsForSession,
    getDefaultSettings
  }
}