// Unified Audio Session - inteligentne przełączanie między trybami desktop/mobile
export const useUnifiedAudioSession = () => {
  const { mergeAudioFromUrls, isMobile, isAudioContextSupported } = useAudioMerger()
  const { playAudioFromUrl, playAudioSequence, stopAllAudio, resetStoppedFlag } = useAudioPlayback()
  const { getAffirmationAudioUrls } = useAudioStorage()
  
  const isPlaying = ref(false)
  const isFinished = ref(false)
  const currentIndex = ref(0)
  const currentAffirmation = ref(null)
  const activeAffirmations = ref([])
  const sessionMode = ref('desktop') // 'desktop' | 'mobile-merged' | 'mobile-sequence'
  const mergedAudioUrl = ref(null)
  const isPreparingMergedAudio = ref(false)
  
  // Oblicz progress
  const progress = computed(() => {
    if (!activeAffirmations.value?.length) return 0
    return ((currentIndex.value + 1) / activeAffirmations.value.length) * 100
  })

  // Określ najlepszy tryb dla urządzenia
  const determineBestMode = () => {
    if (!process.client) return 'desktop'
    
    // Na mobile preferuj merged audio jeśli AudioContext jest dostępny
    if (isMobile.value && isAudioContextSupported.value) {
      return 'mobile-merged'
    }
    
    // Na mobile bez AudioContext użyj sekwencji (może działać gorzej)
    if (isMobile.value) {
      return 'mobile-sequence'
    }
    
    // Na desktop użyj kontrolowanej sekwencji
    return 'desktop'
  }

  // Przygotuj merged audio dla mobile
  const prepareMergedAudio = async (affirmations, settings) => {
    if (!affirmations?.length) {
      throw new Error('No affirmations to merge')
    }

    isPreparingMergedAudio.value = true
    
    try {
      console.log('🎵 Preparing merged audio for mobile...', {
        affirmations: affirmations.length,
        mode: sessionMode.value
      })

      // Pobierz URL-e wszystkich audio
      const audioUrls = []
      for (const affirmation of affirmations) {
        const urls = await getAffirmationAudioUrls(affirmation.id)
        if (urls?.length) {
          audioUrls.push(...urls)
        }
      }

      if (!audioUrls.length) {
        throw new Error('No audio files found for affirmations')
      }

      console.log('🎵 Found audio URLs:', audioUrls.length)

      // Połącz audio z pauzami między afirmacjami
      const pauseBetween = settings?.affirmationPause || 2.0
      const result = await mergeAudioFromUrls(audioUrls, {
        pauseBetween,
        outputFormat: 'wav'
      })

      mergedAudioUrl.value = result.url
      
      console.log('✅ Merged audio prepared:', {
        duration: result.duration,
        size: result.size,
        url: result.url
      })

      return result

    } catch (error) {
      console.error('❌ Failed to prepare merged audio:', error)
      throw error
    } finally {
      isPreparingMergedAudio.value = false
    }
  }

  // Rozpocznij sesję - automatycznie wybierz najlepszy tryb
  const startSession = async (affirmations, settings = {}) => {
    if (!affirmations?.length) {
      throw new Error('No affirmations provided')
    }

    // Reset state
    stopSession()
    activeAffirmations.value = affirmations
    currentIndex.value = 0
    currentAffirmation.value = affirmations[0]
    sessionMode.value = determineBestMode()

    console.log('🎵 Starting unified audio session:', {
      affirmations: affirmations.length,
      mode: sessionMode.value,
      isMobile: isMobile.value,
      audioContextSupported: isAudioContextSupported.value
    })

    try {
      if (sessionMode.value === 'mobile-merged') {
        // Tryb mobile z merged audio
        await prepareMergedAudio(affirmations, settings)
        await playMergedAudio()
        
      } else if (sessionMode.value === 'mobile-sequence') {
        // Tryb mobile z sekwencją (fallback)
        await playSequentialAudio(affirmations, settings)
        
      } else {
        // Tryb desktop z kontrolą
        await playControlledSequence(affirmations, settings)
      }

    } catch (error) {
      console.error('❌ Failed to start session:', error)
      throw error
    }
  }

  // Odtwórz merged audio (mobile)
  const playMergedAudio = async () => {
    if (!mergedAudioUrl.value) {
      throw new Error('No merged audio URL available')
    }

    isPlaying.value = true
    resetStoppedFlag()

    try {
      console.log('🎵 Playing merged audio...')
      
      // Na mobile użyj natywnego odtwarzacza HTML5
      await playAudioFromUrl(mergedAudioUrl.value, {
        volume: 1.0,
        playbackRate: 1.0
      })

      // Sesja zakończona
      isPlaying.value = false
      isFinished.value = true
      
      console.log('✅ Merged audio session completed')

    } catch (error) {
      isPlaying.value = false
      console.error('❌ Merged audio playback failed:', error)
      throw error
    }
  }

  // Odtwórz sekwencję audio (mobile fallback)
  const playSequentialAudio = async (affirmations, settings) => {
    isPlaying.value = true
    resetStoppedFlag()

    try {
      for (let i = 0; i < affirmations.length; i++) {
        if (!isPlaying.value) break

        currentIndex.value = i
        currentAffirmation.value = affirmations[i]

        const audioUrls = await getAffirmationAudioUrls(affirmations[i].id)
        if (audioUrls?.length) {
          await playAudioSequence(audioUrls, {
            sentencePause: settings?.sentencePause || 0.5,
            speechRate: settings?.speechRate || 1.0
          })
        }

        // Pauza między afirmacjami
        if (i < affirmations.length - 1 && isPlaying.value) {
          const pauseMs = (settings?.affirmationPause || 2.0) * 1000
          await new Promise(resolve => setTimeout(resolve, pauseMs))
        }
      }

      if (isPlaying.value) {
        isFinished.value = true
      }

    } catch (error) {
      console.error('❌ Sequential audio playback failed:', error)
      throw error
    } finally {
      isPlaying.value = false
    }
  }

  // Odtwórz kontrolowaną sekwencję (desktop)
  const playControlledSequence = async (affirmations, settings) => {
    isPlaying.value = true
    resetStoppedFlag()

    try {
      // Na desktop odtwarzaj pierwszą afirmację i czekaj na user input
      await playCurrentAffirmation(settings)

    } catch (error) {
      console.error('❌ Controlled sequence failed:', error)
      throw error
    }
  }

  // Odtwórz aktualną afirmację (desktop)
  const playCurrentAffirmation = async (settings = {}) => {
    if (!currentAffirmation.value) return

    try {
      const audioUrls = await getAffirmationAudioUrls(currentAffirmation.value.id)
      if (audioUrls?.length) {
        await playAudioSequence(audioUrls, {
          sentencePause: settings?.sentencePause || 0.5,
          speechRate: settings?.speechRate || 1.0
        })
      }

      // Auto-advance na desktop po zakończeniu afirmacji
      if (isPlaying.value && sessionMode.value === 'desktop') {
        await new Promise(resolve => {
          const pauseMs = (settings?.affirmationPause || 2.0) * 1000
          setTimeout(() => {
            if (isPlaying.value) {
              nextAffirmation(settings)
            }
            resolve()
          }, pauseMs)
        })
      }

    } catch (error) {
      console.error('❌ Failed to play current affirmation:', error)
    }
  }

  // Przejdź do następnej afirmacji (desktop)
  const nextAffirmation = async (settings = {}) => {
    if (!isPlaying.value || sessionMode.value !== 'desktop') return

    if (currentIndex.value < activeAffirmations.value.length - 1) {
      currentIndex.value++
      currentAffirmation.value = activeAffirmations.value[currentIndex.value]
      
      // Zatrzymaj obecne audio
      stopAllAudio()
      resetStoppedFlag()
      
      // Odtwórz następną afirmację
      await playCurrentAffirmation(settings)
      
    } else {
      // Koniec sesji
      isPlaying.value = false
      isFinished.value = true
    }
  }

  // Zatrzymaj sesję
  const stopSession = () => {
    isPlaying.value = false
    isFinished.value = false
    stopAllAudio()
    
    // Cleanup merged audio URL
    if (mergedAudioUrl.value) {
      URL.revokeObjectURL(mergedAudioUrl.value)
      mergedAudioUrl.value = null
    }
  }

  // Reset sesji
  const resetSession = () => {
    stopSession()
    currentIndex.value = 0
    currentAffirmation.value = null
    activeAffirmations.value = []
    sessionMode.value = 'desktop'
  }

  return {
    // State
    isPlaying: readonly(isPlaying),
    isFinished: readonly(isFinished),
    isPreparingMergedAudio: readonly(isPreparingMergedAudio),
    currentIndex: readonly(currentIndex),
    currentAffirmation: readonly(currentAffirmation),
    activeAffirmations: readonly(activeAffirmations),
    sessionMode: readonly(sessionMode),
    progress,

    // Methods
    startSession,
    stopSession,
    resetSession,
    nextAffirmation, // Tylko dla desktop
    
    // Info
    isMobile,
    isAudioContextSupported
  }
}