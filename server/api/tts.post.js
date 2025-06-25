export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { text, voiceId, rate, pitch } = body

  const GOOGLE_TTS_API = 'https://texttospeech.googleapis.com/v1/text:synthesize'
  
  const voiceMapping = {
    'pl-PL-ZofiaNeural': {
      languageCode: 'pl-PL',
      name: 'pl-PL-Wavenet-A',
      ssmlGender: 'FEMALE'
    },
    'pl-PL-MarekNeural': {
      languageCode: 'pl-PL', 
      name: 'pl-PL-Wavenet-B',
      ssmlGender: 'MALE'
    },
    'pl-PL-AgnieszkaNeural': {
      languageCode: 'pl-PL',
      name: 'pl-PL-Wavenet-C',
      ssmlGender: 'FEMALE'
    }
  }

  const selectedVoice = voiceMapping[voiceId] || voiceMapping['pl-PL-ZofiaNeural']

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
    
    if (API_KEY === 'YOUR_API_KEY_HERE') {
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
      throw new Error(`Google TTS API error: ${response.status}`)
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