// Available TTS voices configuration
export const ttsVoices = {
  'pl-PL': [
    {
      id: 'pl-PL-ZofiaNeural',
      name: 'Zofia (Premium)',
      gender: 'female',
      language: 'pl-PL',
      description: 'Naturalny głos kobiecy - jakość AI',
      provider: 'Google Cloud',
      type: 'neural'
    },
    {
      id: 'pl-PL-MarekNeural', 
      name: 'Marek (Premium)',
      gender: 'male',
      language: 'pl-PL',
      description: 'Ciepły głos męski - jakość AI',
      provider: 'Google Cloud',
      type: 'neural'
    },
    {
      id: 'pl-PL-AgnieszkaNeural',
      name: 'Agnieszka (Premium)',
      gender: 'female', 
      language: 'pl-PL',
      description: 'Wyrazisty głos kobiecy - jakość AI',
      provider: 'Google Cloud',
      type: 'neural'
    },
    {
      id: 'pl-PL-ZofiaStandard',
      name: 'Zofia (Standard)',
      gender: 'female',
      language: 'pl-PL',
      description: 'Standardowy głos kobiecy',
      provider: 'Google Cloud',
      type: 'standard'
    }
  ],
  'en-US': [
    {
      id: 'en-US-JennyNeural',
      name: 'Jenny',
      gender: 'female',
      language: 'en-US',
      description: 'Natural female voice',
      provider: 'Google Cloud',
      type: 'neural'
    },
    {
      id: 'en-US-GuyNeural',
      name: 'Guy',
      gender: 'male',
      language: 'en-US',
      description: 'Clear male voice',
      provider: 'Google Cloud',
      type: 'neural'
    }
  ]
  // Add more languages as needed
}

export const getVoicesForLanguage = (languageCode) => {
  return ttsVoices[languageCode] || ttsVoices['en-US']
}

export const getVoiceById = (voiceId) => {
  for (const voices of Object.values(ttsVoices)) {
    const voice = voices.find(v => v.id === voiceId)
    if (voice) return voice
  }
  return null
}