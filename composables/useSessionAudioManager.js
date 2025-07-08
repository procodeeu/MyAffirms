// Session Audio Manager - orkiestracja audio podczas sesji afirmacji
import { useAudioManager } from './useAudioManager'
import { useBackgroundMusic } from './useBackgroundMusic'
import { useTextToSpeech } from './useTextToSpeech'
import { useBackgroundTiming } from './useBackgroundTiming'

export const useSessionAudioManager = () => {
  const audioManager = useAudioManager()
  const backgroundMusic = useBackgroundMusic()
  const tts = useTextToSpeech()
  const timing = useBackgroundTiming()
  
  // Session state
  const sessionState = ref({
    isActive: false,
    isPaused: false,
    isFinished: false,
    currentIndex: 0,
    currentAffirmation: null,
    affirmations: [],
    settings: {},
    timeout: null
  })
  
  // Computed properties for external access
  const isPlaying = computed(() => sessionState.value.isActive && !sessionState.value.isPaused)
  const isFinished = computed(() => sessionState.value.isFinished)
  const currentAffirmation = computed(() => sessionState.value.currentAffirmation)
  const currentIndex = computed(() => sessionState.value.currentIndex)
  const progress = computed(() => {
    if (!sessionState.value.isActive || sessionState.value.affirmations.length === 0) return 0
    return ((sessionState.value.currentIndex + 1) / sessionState.value.affirmations.length) * 100
  })
  
  // === VOICE SELECTION LOGIC ===
  const getAppropriateVoiceId = (settings = {}) => {
    const { getLanguageMapping, getAvailableAiVoices } = tts
    const { $i18n } = useNuxtApp()
    const currentLanguage = getLanguageMapping($i18n.locale.value)
    const voices = getAvailableAiVoices(currentLanguage)
    
    // Check if saved voice is for current language
    const savedVoiceId = settings.voiceId
    if (savedVoiceId && voices.find(v => v.id === savedVoiceId)) {
      return savedVoiceId
    }
    
    // Return default voice for current language
    if (voices.length > 0) {
      const defaultVoice = voices.find(v => v.gender === 'female') || voices[0]
      return defaultVoice.id
    }
    
    return 'pl-PL-ZofiaNeural' // Ultimate fallback
  }
  
  // === SESSION MANAGEMENT ===
  
  const startAudioSession = async (affirmations, settings) => {
    console.log('Starting audio session with', affirmations.length, 'affirmations')
    
    if (!affirmations || affirmations.length === 0) {
      throw new Error('No affirmations provided')
    }
    
    // Reset session state
    sessionState.value = {
      isActive: true,
      isPaused: false,
      isFinished: false,
      currentIndex: 0,
      currentAffirmation: null,
      affirmations: [...affirmations],
      settings: { ...settings },
      timeout: null
    }
    
    // Start background music if enabled
    if (settings.backgroundMusic) {
      await backgroundMusic.play(settings.musicVolume, settings.musicType)
    }
    
    // Start playing first affirmation
    await playCurrentAffirmation()
  }
  
  const stopAudioSession = async () => {
    console.log('Stopping audio session')
    
    sessionState.value.isActive = false
    sessionState.value.isPaused = false
    
    // Clear any pending timeouts
    if (sessionState.value.timeout) {
      clearTimeout(sessionState.value.timeout)
      sessionState.value.timeout = null
    }
    
    // Stop audio playback
    audioManager.stopPlayback()
    
    // Stop background music
    backgroundMusic.stop()
  }
  
  const pauseAudioSession = () => {
    console.log('Pausing audio session')
    sessionState.value.isPaused = true
    audioManager.stopPlayback()
  }
  
  const resumeAudioSession = async () => {
    console.log('Resuming audio session')
    sessionState.value.isPaused = false
    await playCurrentAffirmation()
  }
  
  const nextAudioAffirmation = async () => {
    if (!sessionState.value.isActive) return
    
    sessionState.value.currentIndex++
    
    if (sessionState.value.currentIndex >= sessionState.value.affirmations.length) {
      // Session finished
      sessionState.value.isFinished = true
      sessionState.value.isActive = false
      console.log('Audio session completed')
      backgroundMusic.stop()
      return
    }
    
    await playCurrentAffirmation()
  }
  
  // === PLAYBACK LOGIC ===
  
  const playCurrentAffirmation = async () => {
    if (!sessionState.value.isActive || sessionState.value.isPaused) return
    
    const affirmation = sessionState.value.affirmations[sessionState.value.currentIndex]
    if (!affirmation) return
    
    sessionState.value.currentAffirmation = affirmation
    const settings = sessionState.value.settings
    
    console.log(`Playing affirmation ${sessionState.value.currentIndex + 1}/${sessionState.value.affirmations.length}:`, affirmation.text)
    
    try {
      const {
        speechRate = 1.0,
        sentencePause = 0,
        repeatAffirmation = false,
        repeatDelay = 5,
        pauseDuration = 3
      } = settings
      
      const voiceId = getAppropriateVoiceId(settings)
      const shouldUseSentencePause = sentencePause > 0
      
      // Try to play with audio manager first
      try {
        await audioManager.playAffirmation(affirmation, {
          speechRate,
          sentencePause: shouldUseSentencePause ? sentencePause : 0,
          voiceId
        })
        
        console.log('Affirmation played successfully')
        
        // Handle repetition
        if (repeatAffirmation && sessionState.value.isActive && !sessionState.value.isPaused) {
          await timing.delay(repeatDelay)
          if (sessionState.value.isActive && !sessionState.value.isPaused) {
            try {
              await audioManager.playAffirmation(affirmation, {
                speechRate,
                sentencePause: shouldUseSentencePause ? sentencePause : 0,
                voiceId
              })
              await scheduleNextAffirmation(pauseDuration)
            } catch (error) {
              console.error('Repeat playback failed:', error)
              await scheduleNextAffirmation(pauseDuration)
            }
          }
        } else {
          await scheduleNextAffirmation(pauseDuration)
        }
        
      } catch (audioError) {
        console.warn('Audio manager failed, trying TTS fallback:', audioError)
        
        // Fallback to TTS
        await tts.speak(affirmation.text, {
          rate: speechRate,
          sentencePause: shouldUseSentencePause ? sentencePause : 0,
          voiceId: voiceId
        })
        
        console.log('TTS fallback successful')
        
        // Handle repetition for TTS
        if (repeatAffirmation && sessionState.value.isActive && !sessionState.value.isPaused) {
          await timing.delay(repeatDelay)
          if (sessionState.value.isActive && !sessionState.value.isPaused) {
            try {
              await tts.speak(affirmation.text, {
                rate: speechRate,
                sentencePause: shouldUseSentencePause ? sentencePause : 0,
                voiceId: voiceId
              })
              await scheduleNextAffirmation(pauseDuration)
            } catch (error) {
              console.error('TTS repeat failed:', error)
              await scheduleNextAffirmation(pauseDuration)
            }
          }
        } else {
          await scheduleNextAffirmation(pauseDuration)
        }
      }
    } catch (error) {
      console.error('Failed to play affirmation:', error)
      await scheduleNextAffirmation(pauseDuration)
    }
  }
  
  const scheduleNextAffirmation = async (pauseDuration) => {
    if (sessionState.value.isActive && !sessionState.value.isPaused) {
      console.log(`Scheduling next affirmation in ${pauseDuration}s`)
      
      try {
        await timing.delay(pauseDuration)
        if (sessionState.value.isActive && !sessionState.value.isPaused) {
          await nextAudioAffirmation()
        }
      } catch (error) {
        console.warn('Scheduling failed:', error)
      }
    }
  }
  
  // === UTILITY FUNCTIONS ===
  
  const waitForUser = async () => {
    const { user } = useAuth()
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        unwatch()
        reject(new Error('User loading timeout'))
      }, 5000) // 5s timeout
      
      const unwatch = watch(user, (newUser) => {
        if (newUser) {
          clearTimeout(timeout)
          unwatch()
          resolve(newUser)
        }
      }, { immediate: true })
    })
  }
  
  return {
    // State
    sessionState: readonly(sessionState),
    isPlaying,
    isFinished,
    currentAffirmation,
    currentIndex,
    progress,
    
    // Session management
    startAudioSession,
    stopAudioSession,
    pauseAudioSession,
    resumeAudioSession,
    nextAudioAffirmation,
    
    // Utility
    waitForUser,
    getAppropriateVoiceId
  }
}