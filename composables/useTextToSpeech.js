export const useTextToSpeech = () => {
  const { isFeatureEnabled } = usePremium()
  
  const isAiTtsEnabled = computed(() => isFeatureEnabled('aiTts'))
  const createWebSpeechUtterance = (text, options = {}) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate || 0.8
    utterance.lang = options.lang || 'pl-PL'
    utterance.volume = options.volume || 1
    utterance.pitch = options.pitch || 1
    
    if (options.voice) {
      utterance.voice = options.voice
    }
    
    return utterance
  }
  
  const speakWithWebSpeech = (text, options = {}) => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel()
      const utterance = createWebSpeechUtterance(text, options)
      
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      
      window.speechSynthesis.speak(utterance)
    })
  }
  
  const speakWithAiTts = async (text, options = {}) => {
    console.log('[Premium TTS] AI TTS requested for:', text.substring(0, 50) + '...', 'Voice:', options.voiceId)
    
    try {
      if (isAiTtsEnabled.value) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            voiceId: options.voiceId || 'pl-PL-ZofiaNeural',
            rate: options.rate || 1.0,
            pitch: ((options.pitch || 1.0) - 1.0) * 20
          })
        })

        const result = await response.json()
        
        if (result.success && result.audioContent) {
          console.log('[Premium TTS] Successfully got audio from Google Cloud API via server')
          return await playBase64Audio(result.audioContent)
        } else if (result.error === 'API_KEY_NOT_CONFIGURED') {
          console.log('[Premium TTS] API key not configured - using enhanced Web Speech with voice simulation')
          
          let voiceOptions = { ...options }
          
          switch (options.voiceId) {
            case 'pl-PL-MarekNeural':
              voiceOptions.rate = (options.rate || 1.0) * 0.85
              voiceOptions.pitch = (options.pitch || 1.0) * 0.8
              console.log('[Premium TTS] Simulating Marek voice - lower pitch, slower rate')
              break
              
            case 'pl-PL-AgnieszkaNeural':
              voiceOptions.rate = (options.rate || 1.0) * 1.1
              voiceOptions.pitch = (options.pitch || 1.0) * 1.2
              console.log('[Premium TTS] Simulating Agnieszka voice - higher pitch, faster rate')
              break
              
            default:
              voiceOptions.rate = (options.rate || 1.0) * 0.9
              voiceOptions.pitch = (options.pitch || 1.0) * 1.0
              console.log('[Premium TTS] Simulating Zofia voice - natural settings')
              break
          }
          
          await new Promise(resolve => setTimeout(resolve, 1200))
          
          return await speakWithWebSpeech(text, voiceOptions)
        } else {
          throw new Error(result.error || 'Unknown TTS API error')
        }
      } else {
        console.log('[Premium TTS] Premium not available, using standard Web Speech')
        return await speakWithWebSpeech(text, options)
      }
    } catch (error) {
      console.error('[Premium TTS] AI TTS error, falling back to enhanced Web Speech:', error)
      
      const enhancedOptions = {
        ...options,
        rate: options.rate ? options.rate * 0.85 : 0.7,
        pitch: options.pitch || 0.9,
        volume: options.volume || 0.9
      }
      
      return await speakWithWebSpeech(text, enhancedOptions)
    }
  }

  const playBase64Audio = async (base64Audio) => {
    return new Promise((resolve, reject) => {
      try {
        const audioData = atob(base64Audio)
        const arrayBuffer = new ArrayBuffer(audioData.length)
        const uint8Array = new Uint8Array(arrayBuffer)
        
        for (let i = 0; i < audioData.length; i++) {
          uint8Array[i] = audioData.charCodeAt(i)
        }
        
        const blob = new Blob([arrayBuffer], { type: 'audio/mp3' })
        const audioUrl = URL.createObjectURL(blob)
        
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl)
          reject(error)
        }
        
        audio.play()
        
      } catch (error) {
        reject(error)
      }
    })
  }
  
  const splitIntoSentences = (text) => {
    // Podziel tekst na zdania używając różnych zakończeń zdań
    const sentences = text.split(/(?<=[.!?])\s+/).filter(sentence => sentence.trim().length > 0)
    return sentences
  }

  const speakWithSentencePause = async (text, options = {}) => {
    if (!text || !text.trim()) {
      return Promise.resolve()
    }

    const sentences = splitIntoSentences(text)
    const sentencePause = options.sentencePause || 4 // Default 4 seconds
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim()
      if (sentence) {
        // Speak the sentence
        if (isAiTtsEnabled.value && options.useAi !== false) {
          await speakWithAiTts(sentence, options)
        } else {
          await speakWithWebSpeech(sentence, options)
        }
        
        // Add pause between sentences (except after the last one)
        if (i < sentences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, sentencePause * 1000))
        }
      }
    }
  }

  const speak = async (text, options = {}) => {
    if (!text || !text.trim()) {
      return Promise.resolve()
    }
    
    // If sentence pause is enabled and text has multiple sentences
    if (options.sentencePause && options.sentencePause > 0) {
      const sentences = splitIntoSentences(text)
      if (sentences.length > 1) {
        return await speakWithSentencePause(text, options)
      }
    }
    
    try {
      if (isAiTtsEnabled.value && options.useAi !== false) {
        return await speakWithAiTts(text, options)
      } else {
        return await speakWithWebSpeech(text, options)
      }
    } catch (error) {
      console.error('TTS Error:', error)
      return await speakWithWebSpeech(text, options)
    }
  }
  
  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }
  
  const isAvailable = () => {
    return 'speechSynthesis' in window
  }
  
  const getAvailableVoices = () => {
    if (!isAvailable()) return []
    
    const voices = window.speechSynthesis.getVoices()
    
    if (voices.length === 0) {
      setTimeout(() => {
        window.speechSynthesis.getVoices()
      }, 100)
    }
    
    return voices
  }
  
  const getPolishVoices = () => {
    return getAvailableVoices().filter(voice => 
      voice.lang.includes('pl') || voice.lang.includes('PL')
    )
  }
  
  const getBestPolishVoice = () => {
    const polishVoices = getPolishVoices()
    if (polishVoices.length === 0) return null
    
    const localVoice = polishVoices.find(voice => voice.localService)
    if (localVoice) return localVoice
    
    return polishVoices[0]
  }
  
  const loadVoices = () => {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices()
      
      if (voices.length > 0) {
        resolve(voices)
        return
      }
      
      const onVoicesChanged = () => {
        voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
          resolve(voices)
        }
      }
      
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
      
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
        resolve(window.speechSynthesis.getVoices())
      }, 3000)
    })
  }

  const getTtsInfo = async () => {
    await loadVoices()
    
    const voices = getAvailableVoices()
    const polishVoices = getPolishVoices()
    const bestVoice = getBestPolishVoice()
    
    let apiConfigured = false
    try {
      const testResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test', voiceId: 'pl-PL-ZofiaNeural' })
      })
      const testResult = await testResponse.json()
      apiConfigured = testResult.success || testResult.error !== 'API_KEY_NOT_CONFIGURED'
    } catch (error) {
      apiConfigured = false
    }
    
    return {
      isAiEnabled: isAiTtsEnabled.value,
      isPremium: isAiTtsEnabled.value,
      apiConfigured: apiConfigured,
      engine: isAiTtsEnabled.value ? (apiConfigured ? 'Google Cloud TTS (Premium)' : 'AI TTS Demo Mode') : 'Web Speech API',
      availableVoices: voices.length,
      polishVoices: polishVoices.length,
      bestPolishVoice: bestVoice?.name || 'Brak',
      allVoices: voices.map(v => ({ name: v.name, lang: v.lang, localService: v.localService })),
      polishVoicesList: polishVoices.map(v => ({ name: v.name, lang: v.lang, localService: v.localService }))
    }
  }
  
  const getAvailableAiVoices = () => {
    return [
      {
        id: 'pl-PL-ZofiaNeural',
        name: 'Zofia (Wavenet-A)',
        gender: 'female',
        language: 'pl-PL',
        description: 'Naturalny głos kobiecy AI - Wavenet',
        provider: 'Google Cloud'
      },
      {
        id: 'pl-PL-MarekNeural', 
        name: 'Marek (Wavenet-B)',
        gender: 'male',
        language: 'pl-PL',
        description: 'Ciepły głos męski AI - Wavenet',
        provider: 'Google Cloud'
      },
      {
        id: 'pl-PL-AgnieszkaNeural',
        name: 'Agnieszka (Wavenet-C)',
        gender: 'female', 
        language: 'pl-PL',
        description: 'Wyrazisty głos kobiecy AI - Wavenet',
        provider: 'Google Cloud'
      }
    ]
  }

  const testVoice = async (voiceId, sampleText = "To jest test głosu premium. Czy podoba Ci się jego brzmienie?") => {
    if (!isAiTtsEnabled.value) {
      throw new Error('AI TTS not available')
    }
    
    try {
      await speakWithAiTts(sampleText, { voiceId })
      return true
    } catch (error) {
      console.error('Voice test failed:', error)
      return false
    }
  }

  const getCacheInfo = () => {
    return {
      size: 0,
      keys: []
    }
  }

  const clearCache = () => {
    console.log('[TTS] Cache cleared (mock)')
  }

  return {
    speak,
    stop,
    isAvailable,
    getAvailableVoices,
    getPolishVoices,
    getBestPolishVoice,
    getTtsInfo,
    loadVoices,
    getAvailableAiVoices,
    testVoice,
    getCacheInfo,
    clearCache,
    isAiTtsEnabled: readonly(isAiTtsEnabled)
  }
}