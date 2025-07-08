// Service Worker Audio Manager - komunikacja z SW dla audio w tle
export const useServiceWorkerAudio = () => {
  const isSupported = ref(false)
  const isRegistered = ref(false)
  const swRegistration = ref(null)
  const sessionState = ref({
    isActive: false,
    isPaused: false,
    currentIndex: 0,
    total: 0,
    currentAffirmation: null
  })

  // === SERVICE WORKER REGISTRATION ===

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker not supported')
      return false
    }

    try {
      console.log('🔧 Registering Service Worker...')
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      swRegistration.value = registration
      isRegistered.value = true
      isSupported.value = true
      
      console.log('✅ Service Worker registered successfully')
      
      // Listen for messages from Service Worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
      
      // Wait for Service Worker to be ready
      await navigator.serviceWorker.ready
      
      return true
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      return false
    }
  }

  // === MESSAGE HANDLING ===

  const handleServiceWorkerMessage = (event) => {
    const { type, data } = event.data
    
    console.log('📨 Received from SW:', type, data)
    
    switch (type) {
      case 'SESSION_STARTED':
        sessionState.value.isActive = true
        sessionState.value.isPaused = false
        sessionState.value.currentIndex = data.currentIndex
        sessionState.value.total = data.total
        break
        
      case 'SESSION_PAUSED':
        sessionState.value.isPaused = true
        break
        
      case 'SESSION_RESUMED':
        sessionState.value.isPaused = false
        break
        
      case 'SESSION_STOPPED':
      case 'SESSION_FINISHED':
        sessionState.value.isActive = false
        sessionState.value.isPaused = false
        sessionState.value.currentIndex = 0
        sessionState.value.total = 0
        sessionState.value.currentAffirmation = null
        break
        
      case 'AFFIRMATION_CHANGED':
        sessionState.value.currentIndex = data.currentIndex
        sessionState.value.total = data.total
        sessionState.value.currentAffirmation = data.affirmation
        break
        
      case 'SESSION_STATUS':
        sessionState.value = { ...sessionState.value, ...data }
        break
        
      case 'SESSION_ERROR':
        console.error('❌ Service Worker session error:', data.error)
        break
        
      default:
        console.warn('Unknown message type from SW:', type)
    }
  }

  // === SESSION CONTROL ===

  const startSession = async (affirmations, settings = {}) => {
    if (!isRegistered.value) {
      throw new Error('Service Worker not registered')
    }

    console.log('🎯 Starting SW session with', affirmations.length, 'affirmations')
    
    // Prepare affirmations data with audio URLs
    const preparedAffirmations = await prepareAffirmationsForSW(affirmations, settings)
    
    const message = {
      type: 'START_SESSION',
      data: {
        affirmations: preparedAffirmations,
        settings
      }
    }
    
    await sendMessageToServiceWorker(message)
  }

  const pauseSession = async () => {
    await sendMessageToServiceWorker({ type: 'PAUSE_SESSION' })
  }

  const resumeSession = async () => {
    await sendMessageToServiceWorker({ type: 'RESUME_SESSION' })
  }

  const stopSession = async () => {
    await sendMessageToServiceWorker({ type: 'STOP_SESSION' })
  }

  const nextAffirmation = async () => {
    await sendMessageToServiceWorker({ type: 'NEXT_AFFIRMATION' })
  }

  const getSessionStatus = async () => {
    await sendMessageToServiceWorker({ type: 'SESSION_STATUS' })
  }

  // === UTILITY FUNCTIONS ===

  const sendMessageToServiceWorker = async (message) => {
    if (!navigator.serviceWorker.controller) {
      console.warn('⚠️ No active Service Worker controller')
      return
    }

    navigator.serviceWorker.controller.postMessage(message)
  }

  const prepareAffirmationsForSW = async (affirmations, settings) => {
    const { useAudioStorage } = await import('./audio/useAudioStorage')
    const storage = useAudioStorage()
    
    const preparedAffirmations = []
    
    for (const affirmation of affirmations) {
      try {
        let audioUrls = []
        
        if (affirmation.sentenceIds && affirmation.sentenceIds.length > 0) {
          // Get audio URLs for stored sentence IDs
          const urls = await storage.getBatchAudioUrls(affirmation.sentenceIds)
          audioUrls = affirmation.sentenceIds.map(id => urls[id]).filter(Boolean)
        } else {
          // Fallback - try to find sentence audio
          const sentences = affirmation.text.split(/[.!?]+/).filter(s => s.trim().length > 0)
          const sentenceIds = sentences.map((_, i) => `${affirmation.id}_sentence_${i}`)
          const urls = await storage.getBatchAudioUrls(sentenceIds)
          audioUrls = sentenceIds.map(id => urls[id]).filter(Boolean)
        }
        
        preparedAffirmations.push({
          ...affirmation,
          audioUrls
        })
        
      } catch (error) {
        console.warn('⚠️ Failed to prepare affirmation audio:', affirmation.id, error)
        // Add affirmation without audio URLs - SW will handle fallback
        preparedAffirmations.push({
          ...affirmation,
          audioUrls: []
        })
      }
    }
    
    return preparedAffirmations
  }

  // === COMPUTED PROPERTIES ===

  const isPlaying = computed(() => sessionState.value.isActive && !sessionState.value.isPaused)
  const progress = computed(() => {
    if (!sessionState.value.isActive || sessionState.value.total === 0) return 0
    return ((sessionState.value.currentIndex + 1) / sessionState.value.total) * 100
  })

  // === LIFECYCLE ===

  // Auto-register Service Worker on mount
  onMounted(async () => {
    await registerServiceWorker()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
    }
  })

  return {
    // State
    isSupported: readonly(isSupported),
    isRegistered: readonly(isRegistered),
    sessionState: readonly(sessionState),
    isPlaying: readonly(isPlaying),
    progress: readonly(progress),
    
    // Session control
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    nextAffirmation,
    getSessionStatus,
    
    // Utility
    registerServiceWorker,
    sendMessageToServiceWorker
  }
}