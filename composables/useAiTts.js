import axios from 'axios'

export const useAiTts = () => {
  const { isFeatureEnabled } = usePremium()
  
  // Available AI voices configuration
  const aiVoices = [
    {
      id: 'pl-PL-ZofiaNeural',
      name: 'Zofia (Kobieta)',
      gender: 'female',
      language: 'pl-PL',
      provider: 'azure',
      description: 'Naturalny, przyjazny głos kobiecy'
    },
    {
      id: 'pl-PL-MarekNeural', 
      name: 'Marek (Mężczyzna)',
      gender: 'male',
      language: 'pl-PL',
      provider: 'azure',
      description: 'Ciepły, spokojny głos męski'
    },
    {
      id: 'pl-PL-AgnieszkaNeural',
      name: 'Agnieszka (Kobieta)',
      gender: 'female', 
      language: 'pl-PL',
      provider: 'azure',
      description: 'Energiczny, motywujący głos kobiecy'
    }
  ]
  
  // Cache for generated audio files
  const audioCache = ref(new Map())
  
  // Speech generation function from API (mock - can connect real API)
  const generateSpeechFromApi = async (text, voiceId, options = {}) => {
    try {
      // Mock implementation - simulates AI TTS API call
      // In reality this would be a call to Azure Cognitive Services, Google Cloud TTS, etc.
      
      console.log(`[AI TTS] Generating speech for: "${text.substring(0, 50)}..." with voice: ${voiceId}`)
      
      // API delay simulation
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Simulate successful API response with audio data
      // In a real implementation, this would be an ArrayBuffer of audio data
      
      /*
      // Example of real Azure Cognitive Services call:
      const response = await axios.post('https://YOUR_REGION.tts.speech.microsoft.com/cognitiveservices/v1', 
        `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pl-PL">
          <voice name="${voiceId}">
            <prosody rate="${options.rate || '0%'}" pitch="${options.pitch || '0%'}">
              ${text}
            </prosody>
          </voice>
        </speak>`, 
        {
          headers: {
            'Ocp-Apim-Subscription-Key': 'YOUR_API_KEY',
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
          },
          responseType: 'arraybuffer'
        }
      )
      
      return response.data // ArrayBuffer z audio
      */
      
      // Mock: Zwracamy null - oznacza fallback do Web Speech
      return null
      
    } catch (error) {
      console.error('[AI TTS] API Error:', error)
      throw error
    }
  }
  
  // Odtwarzanie audio z ArrayBuffer
  const playAudioBuffer = async (audioBuffer) => {
    return new Promise((resolve, reject) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        audioContext.decodeAudioData(audioBuffer, (decodedData) => {
          const source = audioContext.createBufferSource()
          source.buffer = decodedData
          source.connect(audioContext.destination)
          
          source.onended = () => resolve()
          source.start(0)
        }, (error) => {
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // Main AI TTS function
  const speakWithAi = async (text, options = {}) => {
    if (!isFeatureEnabled('aiTts')) {
      throw new Error('AI TTS is not available - Premium required')
    }
    
    const voiceId = options.voiceId || 'pl-PL-ZofiaNeural'
    const cacheKey = `${text}_${voiceId}_${JSON.stringify(options)}`
    
    try {
      // Check cache
      if (audioCache.value.has(cacheKey)) {
        console.log('[AI TTS] Using cached audio')
        const cachedAudio = audioCache.value.get(cacheKey)
        if (cachedAudio) {
          return await playAudioBuffer(cachedAudio)
        }
      }
      // If not cached, generate new audio
      console.log('[AI TTS] Generating new audio...')
      const audioBuffer = await generateSpeechFromApi(text, voiceId, {
        rate: options.rate ? `${(options.rate - 1) * 100}%` : '0%',
        pitch: options.pitch ? `${(options.pitch - 1) * 50}%` : '0%',
        volume: options.volume || 1.0
      })
      
      if (audioBuffer) {
        // Cache audio buffer
        audioCache.value.set(cacheKey, audioBuffer)
        
        // Play audio
        return await playAudioBuffer(audioBuffer)
      } else {
        // Fallback do enhanced Web Speech API
        console.log('[AI TTS] Falling back to enhanced Web Speech API')
        return await speakWithEnhancedWebSpeech(text, options)
      }
      
    } catch (error) {
      console.error('[AI TTS] Error:', error)
      // Fallback do Web Speech API
      return await speakWithEnhancedWebSpeech(text, options)
    }
  }
  
  // Enhanced Web Speech API jako fallback
  const speakWithEnhancedWebSpeech = async (text, options = {}) => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      

      utterance.rate = options.rate || 0.7 // slightly slower speech
      utterance.pitch = options.pitch || 0.9 // Slightly lower tone
      utterance.volume = options.volume || 0.9
      utterance.lang = 'pl-PL'
      
      // Try to find the best Polish voice
      const voices = window.speechSynthesis.getVoices()
      const polishVoices = voices.filter(voice => 
        voice.lang.includes('pl') || voice.lang.includes('PL')
      )
      
      if (polishVoices.length > 0) {
        // Prefer local voices
        const localPolishVoice = polishVoices.find(voice => voice.localService)
        utterance.voice = localPolishVoice || polishVoices[0]
      }
      
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      
      window.speechSynthesis.speak(utterance)
    })
  }
  
  const clearCache = () => {
    audioCache.value.clear()
    console.log('[AI TTS] Cache cleared')
  }
  
  const getCacheInfo = () => {
    return {
      size: audioCache.value.size,
      keys: Array.from(audioCache.value.keys()).map(key => key.substring(0, 50) + '...')
    }
  }
  
  // Getting available AI voices
  const getAvailableAiVoices = () => {
    return aiVoices
  }
  
  // Checking AI TTS availability
  const isAiTtsAvailable = () => {
    return isFeatureEnabled('aiTts')
  }
  
  // Voice testing
  const testVoice = async (voiceId, sampleText = "To jest test głosu premium. Czy podoba Ci się jego brzmienie?") => {
    if (!isAiTtsAvailable()) {
      throw new Error('AI TTS not available')
    }
    
    try {
      await speakWithAi(sampleText, { voiceId })
      return true
    } catch (error) {
      console.error('Voice test failed:', error)
      return false
    }
  }
  
  return {
    speakWithAi,
    getAvailableAiVoices,
    isAiTtsAvailable,
    testVoice,
    clearCache,
    getCacheInfo,
    aiVoices: readonly(ref(aiVoices))
  }
}