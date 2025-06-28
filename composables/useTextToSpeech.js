export const useTextToSpeech = () => {
  const { isFeatureEnabled } = usePremium()
  
  const isAiTtsEnabled = computed(() => isFeatureEnabled('aiTts'))
  
  // Track active audio elements for proper cleanup
  let activeAudioElements = []
  let isStopped = false
  const findWebSpeechVoice = (voiceId, language = 'pl-PL') => {
    const voices = window.speechSynthesis.getVoices()
    
    // Try to find voice by language first (most important)
    const languageVoices = voices.filter(voice => voice.lang.startsWith(language.substring(0, 2)))
    
    // If we have language-matching voices, prefer them
    if (languageVoices.length > 0) {
      // Try to find a female voice first
      const femaleVoice = languageVoices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('kobieta') ||
        voice.name.toLowerCase().includes('zofia') ||
        voice.name.toLowerCase().includes('paulina')
      )
      
      if (femaleVoice) {
        console.log('🎤 Found female voice for', language, ':', femaleVoice.name)
        return femaleVoice
      }
      
      // Fallback to first voice of this language
      console.log('🎤 Using first voice for', language, ':', languageVoices[0].name)
      return languageVoices[0]
    }
    
    console.log('🎤 No voice found for', language, 'using default')
    return null
  }

  const createWebSpeechUtterance = (text, options = {}) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate || 0.8
    utterance.lang = options.lang || 'pl-PL'
    utterance.volume = options.volume || 1
    utterance.pitch = options.pitch || 1
    
    // If voiceId is provided, try to find appropriate Web Speech voice
    if (options.voiceId) {
      const language = options.voiceId.substring(0, 5) // Extract language from voiceId like 'pl-PL'
      const webVoice = findWebSpeechVoice(options.voiceId, language)
      if (webVoice) {
        utterance.voice = webVoice
        utterance.lang = webVoice.lang
      }
    } else if (options.voice) {
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
        
        // Add to active audio elements for tracking
        activeAudioElements.push(audio)
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          // Remove from active elements
          const index = activeAudioElements.indexOf(audio)
          if (index > -1) {
            activeAudioElements.splice(index, 1)
          }
          resolve()
        }
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl)
          // Remove from active elements
          const index = activeAudioElements.indexOf(audio)
          if (index > -1) {
            activeAudioElements.splice(index, 1)
          }
          reject(error)
        }
        
        // Handle manual stop during playback
        audio.onpause = () => {
          if (isStopped) {
            URL.revokeObjectURL(audioUrl)
            // Remove from active elements
            const index = activeAudioElements.indexOf(audio)
            if (index > -1) {
              activeAudioElements.splice(index, 1)
            }
          }
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

    // Reset stopped flag when starting new speech
    isStopped = false
    const sentences = splitIntoSentences(text)
    const sentencePause = options.sentencePause || 4 // Default 4 seconds
    
    for (let i = 0; i < sentences.length; i++) {
      // Check if speech was stopped
      if (isStopped) {
        console.log('Speech stopped, interrupting sentence loop')
        break
      }
      
      const sentence = sentences[i].trim()
      if (sentence) {
        // Speak the sentence
        if (isAiTtsEnabled.value && options.useAi !== false) {
          await speakWithAiTts(sentence, options)
        } else {
          await speakWithWebSpeech(sentence, options)
        }
        
        // Check again if speech was stopped during speaking
        if (isStopped) {
          console.log('Speech stopped during sentence, interrupting')
          break
        }
        
        // Add pause between sentences (except after the last one)
        if (i < sentences.length - 1) {
          // Use shorter intervals to check for interruption during pause
          const pauseMs = sentencePause * 1000
          const checkInterval = 100 // Check every 100ms
          let elapsed = 0
          
          while (elapsed < pauseMs && !isStopped) {
            await new Promise(resolve => setTimeout(resolve, Math.min(checkInterval, pauseMs - elapsed)))
            elapsed += checkInterval
          }
          
          if (isStopped) {
            console.log('Speech stopped during pause, interrupting')
            break
          }
        }
      }
    }
  }

  const speak = async (text, options = {}) => {
    if (!text || !text.trim()) {
      return Promise.resolve()
    }
    
    // Reset stopped flag when starting new speech
    isStopped = false
    
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
    // Set stopped flag to interrupt ongoing speech loops
    isStopped = true
    
    // Stop Web Speech API
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    
    // Stop all active HTML5 Audio elements (from AI TTS)
    activeAudioElements.forEach(audio => {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch (error) {
        console.warn('Error stopping audio element:', error)
      }
    })
    
    // Clear the active audio elements array
    activeAudioElements = []
    
    console.log('All TTS stopped and audio elements cleared')
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
  
  const getLanguageMapping = (appLocale) => {
    const mapping = {
      'pl': 'pl-PL',
      'en': 'en-US', 
      'de': 'de-DE',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'it': 'it-IT',
      'nl': 'nl-NL',
      'pt': 'pt-PT',
      'sv': 'sv-SE',
      'cs': 'cs-CZ',
      'da': 'da-DK',
      'no': 'nb-NO',
      'fi': 'fi-FI',
      'sk': 'sk-SK',
      'hu': 'hu-HU',
      'ro': 'ro-RO',
      'bg': 'bg-BG',
      'hr': 'hr-HR',
      'sl': 'sl-SI',
      'et': 'et-EE',
      'lv': 'lv-LV',
      'lt': 'lt-LT',
      'el': 'el-GR',
      'mt': 'mt-MT'
    }
    return mapping[appLocale] || 'en-US'
  }

  const getAvailableAiVoices = (languageCode = 'pl-PL') => {
    const voicesByLanguage = {
      'pl-PL': [
        {
          id: 'pl-PL-ZofiaNeural',
          name: 'Zofia',
          gender: 'female',
          language: 'pl-PL',
          description: 'Naturalny głos kobiecy',
          provider: 'Google Cloud'
        },
        {
          id: 'pl-PL-MarekNeural', 
          name: 'Marek',
          gender: 'male',
          language: 'pl-PL',
          description: 'Ciepły głos męski',
          provider: 'Google Cloud'
        },
        {
          id: 'pl-PL-AgnieszkaNeural',
          name: 'Agnieszka',
          gender: 'female', 
          language: 'pl-PL',
          description: 'Wyrazisty głos kobiecy',
          provider: 'Google Cloud'
        }
      ],
      'en-US': [
        {
          id: 'en-US-JennyNeural',
          name: 'Jenny',
          gender: 'female',
          language: 'en-US',
          description: 'Natural female voice',
          provider: 'Google Cloud'
        },
        {
          id: 'en-US-GuyNeural',
          name: 'Guy',
          gender: 'male',
          language: 'en-US',
          description: 'Clear male voice',
          provider: 'Google Cloud'
        },
        {
          id: 'en-US-AriaNeural',
          name: 'Aria',
          gender: 'female',
          language: 'en-US',
          description: 'Expressive female voice',
          provider: 'Google Cloud'
        }
      ],
      'de-DE': [
        {
          id: 'de-DE-KatjaNeural',
          name: 'Katja',
          gender: 'female',
          language: 'de-DE',
          description: 'Natürliche weibliche Stimme',
          provider: 'Google Cloud'
        },
        {
          id: 'de-DE-ConradNeural',
          name: 'Conrad',
          gender: 'male',
          language: 'de-DE',
          description: 'Klare männliche Stimme',
          provider: 'Google Cloud'
        }
      ],
      'fr-FR': [
        {
          id: 'fr-FR-DeniseNeural',
          name: 'Denise',
          gender: 'female',
          language: 'fr-FR',
          description: 'Voix féminine naturelle',
          provider: 'Google Cloud'
        },
        {
          id: 'fr-FR-HenriNeural',
          name: 'Henri',
          gender: 'male',
          language: 'fr-FR',
          description: 'Voix masculine claire',
          provider: 'Google Cloud'
        }
      ],
      'es-ES': [
        {
          id: 'es-ES-ElviraNeural',
          name: 'Elvira',
          gender: 'female',
          language: 'es-ES',
          description: 'Voz femenina natural',
          provider: 'Google Cloud'
        },
        {
          id: 'es-ES-AlvaroNeural',
          name: 'Álvaro',
          gender: 'male',
          language: 'es-ES',
          description: 'Voz masculina clara',
          provider: 'Google Cloud'
        }
      ],
      'it-IT': [
        {
          id: 'it-IT-ElsaNeural',
          name: 'Elsa',
          gender: 'female',
          language: 'it-IT',
          description: 'Voce femminile naturale',
          provider: 'Google Cloud'
        },
        {
          id: 'it-IT-DiegoNeural',
          name: 'Diego',
          gender: 'male',
          language: 'it-IT',
          description: 'Voce maschile chiara',
          provider: 'Google Cloud'
        }
      ],
      'nl-NL': [
        {
          id: 'nl-NL-ColetteNeural',
          name: 'Colette',
          gender: 'female',
          language: 'nl-NL',
          description: 'Natuurlijke vrouwelijke stem',
          provider: 'Google Cloud'
        },
        {
          id: 'nl-NL-MaartenNeural',
          name: 'Maarten',
          gender: 'male',
          language: 'nl-NL',
          description: 'Heldere mannelijke stem',
          provider: 'Google Cloud'
        }
      ],
      'pt-PT': [
        {
          id: 'pt-PT-RaquelNeural',
          name: 'Raquel',
          gender: 'female',
          language: 'pt-PT',
          description: 'Voz feminina natural',
          provider: 'Google Cloud'
        },
        {
          id: 'pt-PT-DuarteNeural',
          name: 'Duarte',
          gender: 'male',
          language: 'pt-PT',
          description: 'Voz masculina clara',
          provider: 'Google Cloud'
        }
      ],
      'sv-SE': [
        {
          id: 'sv-SE-SofieNeural',
          name: 'Sofie',
          gender: 'female',
          language: 'sv-SE',
          description: 'Naturlig kvinnlig röst',
          provider: 'Google Cloud'
        },
        {
          id: 'sv-SE-MattiasNeural',
          name: 'Mattias',
          gender: 'male',
          language: 'sv-SE',
          description: 'Klar manlig röst',
          provider: 'Google Cloud'
        }
      ],
      'cs-CZ': [
        {
          id: 'cs-CZ-VlastaNeural',
          name: 'Vlasta',
          gender: 'female',
          language: 'cs-CZ',
          description: 'Přirozený ženský hlas',
          provider: 'Google Cloud'
        },
        {
          id: 'cs-CZ-AntoninNeural',
          name: 'Antonín',
          gender: 'male',
          language: 'cs-CZ',
          description: 'Jasný mužský hlas',
          provider: 'Google Cloud'
        }
      ]
    }
    
    return voicesByLanguage[languageCode] || voicesByLanguage['en-US']
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
    getLanguageMapping,
    testVoice,
    getCacheInfo,
    clearCache,
    isAiTtsEnabled: readonly(isAiTtsEnabled)
  }
}