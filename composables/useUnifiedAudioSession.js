// Unified Audio Session - spojne odtwarzanie merged audio na wszystkich urzadzeniach
export const useUnifiedAudioSession = () => {
  const { mergeAudioFromUrls, isAudioContextSupported } = useAudioMerger()
  const { playAudioFromUrl, stopAllAudio, resetStoppedFlag } = useAudioPlayback()
  const { getAffirmationAudioUrls } = useAudioStorage()
  
  const isPlaying = ref(false)
  const isFinished = ref(false)
  const activeAffirmations = ref([])
  const mergedAudioUrl = ref(null)
  const isPreparingMergedAudio = ref(false)
  
  // Oblicz progress - zawsze 100% gdy skonczy odtwarzanie
  const progress = computed(() => {
    if (isFinished.value) return 100
    if (isPlaying.value) return 50 // W trakcie odtwarzania
    return 0
  })

  // Przygotuj merged audio dla wszystkich urzadzen
  const prepareMergedAudio = async (affirmations, settings) => {
    if (!affirmations?.length) {
      throw new Error('No affirmations to merge')
    }

    // Sprawdz czy AudioContext jest dostepny
    if (!isAudioContextSupported.value) {
      throw new Error('AudioContext not supported - cannot merge audio')
    }

    isPreparingMergedAudio.value = true
    
    try {
      console.log('🎵 Preparing merged audio...', {
        affirmations: affirmations.length
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

      // Polacz audio z pauzami miedzy afirmacjami
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

  // Rozpocznij sesje - zawsze merged audio
  const startSession = async (affirmations, settings = {}) => {
    if (!affirmations?.length) {
      throw new Error('No affirmations provided')
    }

    // Reset state
    stopSession()
    activeAffirmations.value = affirmations

    console.log('🎵 Starting unified audio session:', {
      affirmations: affirmations.length,
      audioContextSupported: isAudioContextSupported.value
    })

    try {
      // Przygotuj i odtwarz merged audio
      await prepareMergedAudio(affirmations, settings)
      await playMergedAudio()

    } catch (error) {
      console.error('❌ Failed to start session:', error)
      throw error
    }
  }

  // Odtwarz merged audio
  const playMergedAudio = async () => {
    if (!mergedAudioUrl.value) {
      throw new Error('No merged audio URL available')
    }

    isPlaying.value = true
    resetStoppedFlag()

    try {
      console.log('🎵 Playing merged audio...')
      
      // Uzyj natywnego odtwarzacza HTML5
      await playAudioFromUrl(mergedAudioUrl.value, {
        volume: 1.0,
        playbackRate: 1.0
      })

      // Sesja zakonczona
      isPlaying.value = false
      isFinished.value = true
      
      console.log('✅ Merged audio session completed')

    } catch (error) {
      isPlaying.value = false
      console.error('❌ Merged audio playback failed:', error)
      throw error
    }
  }

  // Zatrzymaj sesje
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
    activeAffirmations.value = []
  }

  return {
    // State
    isPlaying: readonly(isPlaying),
    isFinished: readonly(isFinished),
    isPreparingMergedAudio: readonly(isPreparingMergedAudio),
    activeAffirmations: readonly(activeAffirmations),
    progress,

    // Methods
    startSession,
    stopSession,
    resetSession,
    
    // Info
    isAudioContextSupported
  }
}