export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { text, voiceId, rate, pitch } = body
  
  console.log('TTS API Request:', { text: text?.substring(0, 50) + '...', voiceId, rate, pitch, textLength: text?.length })

  // Walidacja danych wejściowych
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: 'Text is required and cannot be empty',
      textProvided: text
    }
  }

  const GOOGLE_TTS_API = 'https://texttospeech.googleapis.com/v1/text:synthesize'
  
  const voiceMapping = {
    // Polish voices - Premium (WaveNet)
    'pl-PL-ZofiaNeural': { languageCode: 'pl-PL', name: 'pl-PL-Wavenet-A', ssmlGender: 'FEMALE' },
    'pl-PL-MarekNeural': { languageCode: 'pl-PL', name: 'pl-PL-Wavenet-B', ssmlGender: 'MALE' },
    'pl-PL-AgnieszkaNeural': { languageCode: 'pl-PL', name: 'pl-PL-Wavenet-C', ssmlGender: 'FEMALE' },
    
    // Polish voices - Standard
    'pl-PL-ZofiaStandard': { languageCode: 'pl-PL', name: 'pl-PL-Standard-A', ssmlGender: 'FEMALE' },
    'pl-PL-MarekStandard': { languageCode: 'pl-PL', name: 'pl-PL-Standard-B', ssmlGender: 'MALE' },
    'pl-PL-AgnieszkaStandard': { languageCode: 'pl-PL', name: 'pl-PL-Standard-C', ssmlGender: 'FEMALE' },
    
    // English voices
    'en-US-JennyNeural': { languageCode: 'en-US', name: 'en-US-Wavenet-F', ssmlGender: 'FEMALE' },
    'en-US-GuyNeural': { languageCode: 'en-US', name: 'en-US-Wavenet-D', ssmlGender: 'MALE' },
    'en-US-AriaNeural': { languageCode: 'en-US', name: 'en-US-Wavenet-G', ssmlGender: 'FEMALE' },
    
    // German voices
    'de-DE-KatjaNeural': { languageCode: 'de-DE', name: 'de-DE-Wavenet-A', ssmlGender: 'FEMALE' },
    'de-DE-ConradNeural': { languageCode: 'de-DE', name: 'de-DE-Wavenet-B', ssmlGender: 'MALE' },
    
    // French voices
    'fr-FR-DeniseNeural': { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-A', ssmlGender: 'FEMALE' },
    'fr-FR-HenriNeural': { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-B', ssmlGender: 'MALE' },
    
    // Spanish voices
    'es-ES-ElviraNeural': { languageCode: 'es-ES', name: 'es-ES-Wavenet-A', ssmlGender: 'FEMALE' },
    'es-ES-AlvaroNeural': { languageCode: 'es-ES', name: 'es-ES-Wavenet-B', ssmlGender: 'MALE' },
    
    // Italian voices
    'it-IT-ElsaNeural': { languageCode: 'it-IT', name: 'it-IT-Wavenet-A', ssmlGender: 'FEMALE' },
    'it-IT-DiegoNeural': { languageCode: 'it-IT', name: 'it-IT-Wavenet-C', ssmlGender: 'MALE' },
    
    // Dutch voices
    'nl-NL-ColetteNeural': { languageCode: 'nl-NL', name: 'nl-NL-Wavenet-A', ssmlGender: 'FEMALE' },
    'nl-NL-MaartenNeural': { languageCode: 'nl-NL', name: 'nl-NL-Wavenet-B', ssmlGender: 'MALE' },
    
    // Portuguese voices
    'pt-PT-RaquelNeural': { languageCode: 'pt-PT', name: 'pt-PT-Wavenet-A', ssmlGender: 'FEMALE' },
    'pt-PT-DuarteNeural': { languageCode: 'pt-PT', name: 'pt-PT-Wavenet-B', ssmlGender: 'MALE' },
    
    // Swedish voices
    'sv-SE-SofieNeural': { languageCode: 'sv-SE', name: 'sv-SE-Wavenet-A', ssmlGender: 'FEMALE' },
    'sv-SE-MattiasNeural': { languageCode: 'sv-SE', name: 'sv-SE-Wavenet-B', ssmlGender: 'MALE' },
    
    // Czech voices
    'cs-CZ-VlastaNeural': { languageCode: 'cs-CZ', name: 'cs-CZ-Wavenet-A', ssmlGender: 'FEMALE' },
    'cs-CZ-AntoninNeural': { languageCode: 'cs-CZ', name: 'cs-CZ-Wavenet-B', ssmlGender: 'MALE' }
  }

  const selectedVoice = voiceMapping[voiceId] || voiceMapping['pl-PL-ZofiaNeural']
  console.log('Voice mapping:', { 
    requestedVoiceId: voiceId, 
    mappedTo: selectedVoice.name, 
    gender: selectedVoice.ssmlGender,
    language: selectedVoice.languageCode 
  })

  try {
    const requestBody = {
      input: { text },
      voice: {
        languageCode: selectedVoice.languageCode,
        name: selectedVoice.name,
        ssmlGender: selectedVoice.ssmlGender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: rate || 1.0,
        pitch: pitch || 0.0,
        volumeGainDb: 0.0
      }
    }

    const API_KEY = process.env.GOOGLE_CLOUD_API_KEY || 'YOUR_API_KEY_HERE'
    
    console.log('API Key status:', { 
      hasKey: !!API_KEY, 
      keyLength: API_KEY?.length, 
      isDefault: API_KEY === 'YOUR_API_KEY_HERE',
      keyPrefix: API_KEY?.substring(0, 10) + '...'
    })
    
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
      console.log('Google Cloud API key not configured, using mock response')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: false,
        error: 'API_KEY_NOT_CONFIGURED',
        mock: true,
        message: 'Google Cloud TTS API key not configured. Using Web Speech API fallback.'
      }
    }

    const response = await fetch(`${GOOGLE_TTS_API}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google TTS API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        requestBody: JSON.stringify(requestBody, null, 2)
      })
      throw new Error(`Google TTS API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      audioContent: data.audioContent,
      voiceUsed: selectedVoice.name,
      format: 'mp3'
    }

  } catch (error) {
    console.error('TTS API Error:', error)
    
    return {
      success: false,
      error: error.message,
      fallback: true
    }
  }
})