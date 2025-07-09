// Session Audio Manager - orkiestracja audio podczas sesji afirmacji
import { useAudioManager } from './useAudioManager'
import { useBackgroundMusic } from './useBackgroundMusic'
import { useTextToSpeech } from './useTextToSpeech'

export const useSessionAudioManager = () => {
  const audioManager = useAudioManager()
  const backgroundMusic = useBackgroundMusic()
  const tts = useTextToSpeech()
  
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
    if (savedVoiceId && savedVoiceId.startsWith(currentLanguage)) {
      return savedVoiceId
    }
    
    // Check if we have a saved voice for current language in voicesByLanguage
    const savedByLanguage = settings.voicesByLanguage?.[currentLanguage]
    if (savedByLanguage && voices.find(v => v.id === savedByLanguage)) {
      return savedByLanguage
    }
    
    // Fallback to default voice for current language
    if (voices.length > 0) {
      const defaultVoice = voices.find(v => v.gender === 'female') || voices[0]
      return defaultVoice.id
    }
    
    return 'pl-PL-ZofiaNeural'
  }
  
  // === SESSION LIFECYCLE ===
  
  const startSession = async (affirmations, settings = {}) => {
    console.log('🎯 Starting session with', affirmations.length, 'affirmations')
    
    if (affirmations.length === 0) {
      throw new Error('No affirmations provided for session')
    }
    
    // Initialize session state
    sessionState.value = {
      isActive: true,
      isPaused: false,
      isFinished: false,
      currentIndex: 0,
      currentAffirmation: affirmations[0],
      affirmations: [...affirmations], // Create copy
      settings: { ...settings },
      timeout: null
    }
    
    try {
      // Start background music if enabled
      if (settings.backgroundMusic) {
        const musicVolume = settings.musicVolume || 0.15
        const musicType = settings.musicType || 'birds'
        
        console.log('🎵 Starting background music:', { musicType, musicVolume })
        await backgroundMusic.play(musicVolume, musicType)
      }
      
      // Start playing first affirmation
      await playCurrentAffirmation()
      
      console.log('✅ Session started successfully')
      
    } catch (error) {
      console.error('❌ Failed to start session:', error)
      await stopSession()
      throw error
    }
  }
  
  const stopSession = async () => {
    console.log('⏹️ Stopping session')
    
    // Clear any pending timeouts
    if (sessionState.value.timeout) {
      clearTimeout(sessionState.value.timeout)
      sessionState.value.timeout = null
    }
    
    // Stop all audio
    audioManager.stopPlayback()
    tts.stop()
    
    // Fade out background music
    backgroundMusic.fadeOut()
    
    // Update session state
    sessionState.value.isActive = false
    sessionState.value.isFinished = true
    sessionState.value.isPaused = false
    
    console.log('✅ Session stopped')
  }
  
  const pauseSession = () => {
    console.log('⏸️ Pausing session')
    
    if (!sessionState.value.isActive) return
    
    // Clear timeout
    if (sessionState.value.timeout) {
      clearTimeout(sessionState.value.timeout)
      sessionState.value.timeout = null
    }
    
    // Stop current audio
    audioManager.stopPlayback()
    tts.stop()
    
    sessionState.value.isPaused = true
    console.log('✅ Session paused')
  }
  
  const resumeSession = async () => {
    console.log('▶️ Resuming session')
    
    if (!sessionState.value.isActive || !sessionState.value.isPaused) return
    
    sessionState.value.isPaused = false
    
    try {
      await playCurrentAffirmation()
      console.log('✅ Session resumed')
    } catch (error) {
      console.error('❌ Failed to resume session:', error)
      await stopSession()
    }
  }
  
  const nextAffirmation = async () => {
    console.log('⏭️ Moving to next affirmation')
    
    if (!sessionState.value.isActive) return
    
    // Clear current timeout
    if (sessionState.value.timeout) {
      clearTimeout(sessionState.value.timeout)
      sessionState.value.timeout = null
    }
    
    // Stop current audio
    audioManager.stopPlayback()
    tts.stop()
    
    // Move to next affirmation
    if (sessionState.value.currentIndex < sessionState.value.affirmations.length - 1) {
      sessionState.value.currentIndex++
      sessionState.value.currentAffirmation = sessionState.value.affirmations[sessionState.value.currentIndex]
      
      try {
        await playCurrentAffirmation()
      } catch (error) {
        console.error('❌ Failed to play next affirmation:', error)
        await stopSession()
      }
    } else {
      // Session finished
      console.log('🏁 Session completed - all affirmations played')
      await finishSession()
    }
  }
  
  const finishSession = async () => {
    console.log('🏁 Finishing session naturally')
    
    sessionState.value.isActive = false
    sessionState.value.isFinished = true
    
    // Fade out background music
    backgroundMusic.fadeOut()
    
    console.log('✅ Session finished')
  }
  
  // === AFFIRMATION PLAYBACK ===
  
  const playCurrentAffirmation = async () => {
    if (!sessionState.value.isActive || sessionState.value.isPaused) return
    
    const affirmation = sessionState.value.currentAffirmation
    const settings = sessionState.value.settings
    
    console.log('🎵 Playing affirmation:', affirmation.id)
    
    const {
      speechRate = 1.0,
      pauseDuration = 3,
      sentencePause = 4,
      repeatAffirmation = false,
      repeatDelay = 5
    } = settings
    
    try {
      // Wait for user if not available (for auth context)
      const { user } = useAuth()
      if (!user.value) {
        await waitForUser()
      }
      
      // Determine voice and sentence pause settings
      const sentences = affirmation.text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const hasMultipleSentences = sentences.length > 1
      const shouldUseSentencePause = sentencePause > 0 && hasMultipleSentences
      const voiceId = getAppropriateVoiceId(settings)
      
      // Try to play using Audio Manager (pre-generated audio)
      await audioManager.playAffirmation(affirmation, {
        speechRate,
        sentencePause: shouldUseSentencePause ? sentencePause : 0,
        voiceId
      })
      
      console.log('✅ Affirmation played successfully')
      
      // Handle repetition
      if (repeatAffirmation && sessionState.value.isActive && !sessionState.value.isPaused) {
        sessionState.value.timeout = setTimeout(async () => {
          if (sessionState.value.isActive && !sessionState.value.isPaused) {
            try {
              await audioManager.playAffirmation(affirmation, {
                speechRate,
                sentencePause: shouldUseSentencePause ? sentencePause : 0,
                voiceId
              })
              scheduleNextAffirmation(pauseDuration)
            } catch (error) {
              console.error('❌ Repeat playback failed:', error)
              scheduleNextAffirmation(pauseDuration)
            }
          }
        }, repeatDelay * 1000)
      } else {
        scheduleNextAffirmation(pauseDuration)
      }
      
    } catch (error) {
      console.warn('⚠️ Audio Manager playback failed, trying TTS fallback:', error)
      
      // Fallback to TTS
      try {
        const voiceId = getAppropriateVoiceId(settings)
        const sentences = affirmation.text.split(/[.!?]+/).filter(s => s.trim().length > 0)
        const hasMultipleSentences = sentences.length > 1
        const shouldUseSentencePause = sentencePause > 0 && hasMultipleSentences
        
        await tts.speak(affirmation.text, {
          rate: speechRate,
          sentencePause: shouldUseSentencePause ? sentencePause : 0,
          voiceId: voiceId
        })
        
        console.log('✅ TTS fallback successful')
        
        // Handle repetition for TTS
        if (repeatAffirmation && sessionState.value.isActive && !sessionState.value.isPaused) {
          sessionState.value.timeout = setTimeout(async () => {
            if (sessionState.value.isActive && !sessionState.value.isPaused) {
              try {
                await tts.speak(affirmation.text, {
                  rate: speechRate,
                  sentencePause: shouldUseSentencePause ? sentencePause : 0,
                  voiceId: voiceId
                })
                scheduleNextAffirmation(pauseDuration)
              } catch (error) {
                console.error('❌ TTS repeat failed:', error)
                scheduleNextAffirmation(pauseDuration)
              }
            }
          }, repeatDelay * 1000)
        } else {
          scheduleNextAffirmation(pauseDuration)
        }
        
      } catch (ttsError) {
        console.error('❌ TTS fallback also failed:', ttsError)
        // Move to next affirmation even if current one fails
        scheduleNextAffirmation(pauseDuration)
      }
    }
  }
  
  const scheduleNextAffirmation = (pauseDuration) => {
    if (sessionState.value.isActive && !sessionState.value.isPaused) {
      console.log(`⏰ Scheduling next affirmation in ${pauseDuration}s`)
      sessionState.value.timeout = setTimeout(() => {
        if (sessionState.value.isActive && !sessionState.value.isPaused) {
          nextAffirmation()
        }
      }, pauseDuration * 1000)
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
          resolve()
        }
      })
    })
  }
  
  // === CLEANUP ===
  
  const cleanup = () => {
    console.log('🧹 Cleaning up session audio manager')
    
    if (sessionState.value.timeout) {
      clearTimeout(sessionState.value.timeout)
    }
    
    audioManager.stopPlayback()
    tts.stop()
    backgroundMusic.stop()
    
    // Reset state
    sessionState.value = {
      isActive: false,
      isPaused: false,
      isFinished: false,
      currentIndex: 0,
      currentAffirmation: null,
      affirmations: [],
      settings: {},
      timeout: null
    }
  }
  
  // Auto cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    // State (readonly)
    isPlaying: readonly(isPlaying),
    isFinished: readonly(isFinished),
    currentAffirmation: readonly(currentAffirmation),
    currentIndex: readonly(currentIndex),
    progress: readonly(progress),
    
    // Session control
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    nextAffirmation,
    
    // Utility
    cleanup,
    
    // Access to underlying managers (for advanced usage)
    audioManager,
    backgroundMusic,
    tts
  }
}