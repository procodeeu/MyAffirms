import { useAudioMerger } from "./audio/useAudioMerger.js"
import { useAudioPlayback } from "./audio/useAudioPlayback.js"
import { useAudioStorage } from "./audio/useAudioStorage.js"

// Unified Audio Session - spojne odtwarzanie merged audio na wszystkich urzadzeniach
export const useUnifiedAudioSession = () => {
  const { mergeAudioFromUrls, isAudioContextSupported } = useAudioMerger()
  const { playAudioFromUrl, stopAllAudio, resetStoppedFlag } = useAudioPlayback()
  const { getBatchAudioUrls } = useAudioStorage()
  
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
      throw new Error('AudioContext not supported - cannot merge audio. Device may not support audio merging.')
    }

    isPreparingMergedAudio.value = true
    
    try {
      console.log('Preparing merged audio...', {
        affirmations: affirmations.length
      })

      // Pobierz URL-e wszystkich audio
      const audioUrls = []
      for (const affirmation of affirmations) {
        if (affirmation.sentenceIds && affirmation.sentenceIds.length > 0) {
          // Uzyj przechowywanych sentence IDs
          const urls = await getBatchAudioUrls(affirmation.sentenceIds)
          const affirmationUrls = affirmation.sentenceIds.map(id => urls[id]).filter(Boolean)
          audioUrls.push(...affirmationUrls)
        } else {
          // Fallback - sprobuj znalezc audio zdan
          const sentences = affirmation.text.split(/[.!?]+/).filter(s => s.trim().length > 0)
          const sentenceIds = sentences.map((_, i) => `${affirmation.id}_sentence_${i}`)
          const urls = await getBatchAudioUrls(sentenceIds)
          const affirmationUrls = sentenceIds.map(id => urls[id]).filter(Boolean)
          audioUrls.push(...affirmationUrls)
        }
      }

      if (!audioUrls.length) {
        throw new Error('No audio files found for affirmations')
      }

      console.log('Found audio URLs:', audioUrls.length)

      // Polacz audio z pauzami miedzy afirmacjami
      const pauseBetween = settings?.affirmationPause || 2.0
      const result = await mergeAudioFromUrls(audioUrls, {
        pauseBetween,
        outputFormat: 'wav'
      })

      mergedAudioUrl.value = result.url
      
      console.log('Merged audio prepared:', {
        duration: result.duration,
        size: result.size,
        url: result.url
      })

      return result

    } catch (error) {
      console.error('Failed to prepare merged audio:', error)
      throw error
    } finally {
      isPreparingMergedAudio.value = false
    }
  }

  // Przygotuj sesje - tylko przygotuj merged audio, nie odtwarzaj automatycznie
  const prepareSession = async (affirmations, settings = {}) => {
    if (!affirmations?.length) {
      throw new Error('No affirmations provided')
    }

    // Reset state
    stopSession()
    activeAffirmations.value = affirmations

    console.log('Preparing unified audio session:', {
      affirmations: affirmations.length,
      audioContextSupported: isAudioContextSupported.value
    })

    try {
      // Sprawdz czy AudioContext jest dostepny
      if (!isAudioContextSupported.value) {
        throw new Error('AudioContext not supported - falling back to sequential playback')
      }

      // Tylko przygotuj merged audio
      const result = await prepareMergedAudio(affirmations, settings)
      console.log('Session prepared successfully - ready for native player')
      return result

    } catch (error) {
      console.error('Failed to prepare session:', error)
      
      // Jesli to problem z AudioContext, zasugeruj fallback
      if (error.message.includes('AudioContext') || error.message.includes('decode')) {
        throw new Error('Audio merging failed on this device. This is common on some mobile devices. Please try using individual affirmation playback instead.')
      }
      
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
      console.log('Playing merged audio...')
      
      // Uzyj natywnego odtwarzacza HTML5
      await playAudioFromUrl(mergedAudioUrl.value, {
        volume: 1.0,
        playbackRate: 1.0
      })

      // Sesja zakonczona
      isPlaying.value = false
      isFinished.value = true
      
      console.log('Merged audio session completed')

    } catch (error) {
      isPlaying.value = false
      console.error('Merged audio playback failed:', error)
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
    mergedAudioUrl: readonly(mergedAudioUrl),
    progress,

    // Methods
    prepareSession,
    stopSession,
    resetSession,
    
    // Info
    isAudioContextSupported
  }
}