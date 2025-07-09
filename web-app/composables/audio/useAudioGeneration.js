// Audio Generation - odpowiedzialny tylko za generowanie audio
export const useAudioGeneration = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()
  const { trackUsage } = useSubscription()
  
  const isGenerating = ref(false)
  const generationQueue = ref([])
  const error = ref(null)

  // Batch generation dla wielu zdań
  const generateBatchAudio = async (requests, voiceId) => {
    if (!user.value) {
      throw new Error('User must be logged in')
    }

    isGenerating.value = true
    error.value = null
    const results = []

    try {
      console.log(`🎵 Starting batch generation for ${requests.length} audio files`)
      
      // Grupuj podobne teksty dla cache
      const textCache = new Map()
      
      for (const request of requests) {
        const { id, text } = request
        
        // Sprawdź cache dla identycznego tekstu
        if (textCache.has(text)) {
          console.log(`📋 Using cached audio for: "${text}"`)
          results.push({
            id,
            ...textCache.get(text)
          })
          continue
        }

        try {
          console.log(`🎵 Generating audio for: "${text}"`)
          const result = await generateSingleAudio(id, text, voiceId)
          
          // Dodaj do cache
          textCache.set(text, result)
          results.push({ id, ...result })
          
          // Małe opóźnienie między requestami
          await new Promise(resolve => setTimeout(resolve, 200))
          
        } catch (error) {
          console.error(`❌ Failed to generate audio for "${text}":`, error)
          results.push({ id, error: error.message })
        }
      }

      console.log(`✅ Batch generation completed: ${results.length} files`)
      return results

    } catch (err) {
      error.value = err.message
      console.error('❌ Batch generation failed:', err)
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  // Generuj pojedyncze audio
  const generateSingleAudio = async (audioId, text, voiceId) => {
    if (!text || !text.trim()) {
      throw new Error('Text is required')
    }

    try {
      // Generuj audio przez Google TTS
      const response = await $fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: voiceId || 'pl-PL-ZofiaStandard',
          rate: 1.0,
          pitch: 0.0
        })
      })

      if (!response.success || !response.audioContent) {
        throw new Error('Failed to generate audio from TTS')
      }

      // Upload przez server-side endpoint
      const uploadResponse = await $fetch('/api/audio/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          affirmationId: audioId,
          audioContent: response.audioContent,
          userId: user.value.uid,
          voiceId: voiceId,
          characterCount: text.length,
          affirmationText: text.trim()
        })
      })

      if (!uploadResponse.success) {
        throw new Error('Failed to upload audio to storage')
      }

      const { filename, downloadURL, voiceType, characterCount } = uploadResponse

      // Śledź użycie
      await trackUsage(characterCount, voiceType)

      return { filename, voiceType, characterCount, downloadURL }

    } catch (err) {
      console.error('Error generating single audio:', err)
      throw err
    }
  }

  // Generuj audio dla wszystkich zdań afirmacji
  const generateSentenceAudio = async (affirmationId, text, voiceId) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    console.log(`🎵 Generating audio for ${sentences.length} sentences of affirmation:`, affirmationId)

    // Przygotuj requests dla batch generation
    const requests = sentences.map((sentence, i) => ({
      id: `${affirmationId}_sentence_${i}`,
      text: sentence.trim() + (sentence.trim().match(/[.!?]$/) ? '' : '.')
    }))

    try {
      const results = await generateBatchAudio(requests, voiceId)
      
      // Zwróć tylko udane ID
      const successfulIds = results
        .filter(result => !result.error)
        .map(result => result.id)

      console.log(`✅ Generated ${successfulIds.length}/${sentences.length} sentence audio files`)
      return successfulIds

    } catch (error) {
      console.error('❌ Failed to generate sentence audio:', error)
      throw error
    }
  }

  // Queue system dla generowania
  const addToQueue = (request) => {
    generationQueue.value.push(request)
    processQueue()
  }

  const processQueue = async () => {
    if (isGenerating.value || generationQueue.value.length === 0) return

    const request = generationQueue.value.shift()
    
    try {
      await request.execute()
      request.resolve()
    } catch (error) {
      request.reject(error)
    }

    // Proces następny w kolejce
    if (generationQueue.value.length > 0) {
      setTimeout(processQueue, 100)
    }
  }

  return {
    // State
    isGenerating: readonly(isGenerating),
    error: readonly(error),
    queueLength: computed(() => generationQueue.value.length),

    // Methods
    generateSingleAudio,
    generateBatchAudio,
    generateSentenceAudio,
    addToQueue
  }
}