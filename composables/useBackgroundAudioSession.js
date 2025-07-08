// Background Audio Session Manager - wybiera między SW a tradycyjnym audio
import { useSessionAudioManager } from './useSessionAudioManager'
import { useServiceWorkerAudio } from './useServiceWorkerAudio'

export const useBackgroundAudioSession = () => {
  const traditionalAudio = useSessionAudioManager()
  const serviceWorkerAudio = useServiceWorkerAudio()
  
  // Determine which audio system to use
  const useServiceWorker = ref(false)
  const isInitialized = ref(false)
  
  // Unified state that combines both systems
  const sessionState = computed(() => {
    if (useServiceWorker.value) {
      return serviceWorkerAudio.sessionState.value
    } else {
      return {
        isActive: traditionalAudio.isPlaying.value || traditionalAudio.isFinished.value,
        isPaused: !traditionalAudio.isPlaying.value && !traditionalAudio.isFinished.value,
        currentIndex: traditionalAudio.currentIndex.value,
        total: traditionalAudio.currentAffirmation.value ? 1 : 0, // Traditional doesn't track total
        currentAffirmation: traditionalAudio.currentAffirmation.value
      }
    }
  })
  
  const isPlaying = computed(() => {
    if (useServiceWorker.value) {
      return serviceWorkerAudio.isPlaying.value
    } else {
      return traditionalAudio.isPlaying.value
    }
  })
  
  const progress = computed(() => {
    if (useServiceWorker.value) {
      return serviceWorkerAudio.progress.value
    } else {
      return traditionalAudio.progress.value
    }
  })
  
  const currentAffirmation = computed(() => {
    if (useServiceWorker.value) {
      return serviceWorkerAudio.sessionState.value.currentAffirmation
    } else {
      return traditionalAudio.currentAffirmation.value
    }
  })
  
  const currentIndex = computed(() => {
    if (useServiceWorker.value) {
      return serviceWorkerAudio.sessionState.value.currentIndex
    } else {
      return traditionalAudio.currentIndex.value
    }
  })
  
  const isFinished = computed(() => {
    if (useServiceWorker.value) {
      return !serviceWorkerAudio.sessionState.value.isActive && 
             serviceWorkerAudio.sessionState.value.currentIndex > 0
    } else {
      return traditionalAudio.isFinished.value
    }
  })

  // === INITIALIZATION ===
  
  const initialize = async () => {
    if (isInitialized.value) return
    
    console.log('🔧 Initializing background audio session...')
    
    // Check if Service Worker is supported and can be used
    const canUseServiceWorker = await checkServiceWorkerSupport()
    
    if (canUseServiceWorker) {
      console.log('✅ Using Service Worker for background audio')
      useServiceWorker.value = true
    } else {
      console.log('ℹ️ Using traditional audio manager')
      useServiceWorker.value = false
    }
    
    isInitialized.value = true
  }
  
  const checkServiceWorkerSupport = async () => {
    // Check basic Service Worker support
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported')
      return false
    }
    
    // Check Web Audio API support
    if (!('AudioContext' in window) && !('webkitAudioContext' in window)) {
      console.log('❌ Web Audio API not supported')
      return false
    }
    
    // Check Media Session API support (optional but recommended)
    if (!('mediaSession' in navigator)) {
      console.log('⚠️ Media Session API not supported, but continuing with SW')
    }
    
    // Try to register Service Worker
    try {
      const registered = await serviceWorkerAudio.registerServiceWorker()
      return registered
    } catch (error) {
      console.error('❌ Failed to register Service Worker:', error)
      return false
    }
  }

  // === SESSION CONTROL ===
  
  const startSession = async (affirmations, settings = {}) => {
    await initialize()
    
    console.log('🎯 Starting background audio session')
    console.log('📊 Using Service Worker:', useServiceWorker.value)
    
    if (useServiceWorker.value) {
      await serviceWorkerAudio.startSession(affirmations, settings)
    } else {
      await traditionalAudio.startSession(affirmations, settings)
    }
  }
  
  const pauseSession = async () => {
    if (useServiceWorker.value) {
      await serviceWorkerAudio.pauseSession()
    } else {
      traditionalAudio.pauseSession()
    }
  }
  
  const resumeSession = async () => {
    if (useServiceWorker.value) {
      await serviceWorkerAudio.resumeSession()
    } else {
      await traditionalAudio.resumeSession()
    }
  }
  
  const stopSession = async () => {
    if (useServiceWorker.value) {
      await serviceWorkerAudio.stopSession()
    } else {
      await traditionalAudio.stopSession()
    }
  }
  
  const nextAffirmation = async () => {
    if (useServiceWorker.value) {
      await serviceWorkerAudio.nextAffirmation()
    } else {
      await traditionalAudio.nextAffirmation()
    }
  }

  // === UTILITY ===
  
  const cleanup = () => {
    if (useServiceWorker.value) {
      // Service Worker cleanup is handled automatically
    } else {
      traditionalAudio.cleanup()
    }
  }
  
  const getCapabilities = () => {
    return {
      supportsServiceWorker: serviceWorkerAudio.isSupported.value,
      supportsBackgroundAudio: useServiceWorker.value,
      supportsMediaSession: 'mediaSession' in navigator,
      supportsWakeLock: 'wakeLock' in navigator,
      currentSystem: useServiceWorker.value ? 'service-worker' : 'traditional'
    }
  }

  // === LIFECYCLE ===
  
  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    isPlaying: readonly(isPlaying),
    isFinished: readonly(isFinished),
    currentAffirmation: readonly(currentAffirmation),
    currentIndex: readonly(currentIndex),
    progress: readonly(progress),
    sessionState: readonly(sessionState),
    useServiceWorker: readonly(useServiceWorker),
    isInitialized: readonly(isInitialized),
    
    // Session control
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    nextAffirmation,
    
    // Utility
    initialize,
    cleanup,
    getCapabilities,
    
    // Access to underlying systems
    traditionalAudio,
    serviceWorkerAudio
  }
}