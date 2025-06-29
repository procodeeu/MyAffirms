import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore'

export const useAffirmationAudio = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()
  const { trackUsage } = useSubscription()
  
  const isGenerating = ref(false)
  const error = ref(null)
  
  // Generuj audio dla afirmacji
  const generateAudio = async (affirmationId, text, voiceId) => {
    if (!user.value) {
      throw new Error('User must be logged in')
    }
    
    if (!text || !text.trim()) {
      throw new Error('Text is required')
    }
    
    isGenerating.value = true
    error.value = null
    
    try {
      // Sprawdź czy audio już istnieje i usuń
      await deleteAudio(affirmationId)
      
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
      
      // Upload przez server-side endpoint (unika CORS problemy)
      const uploadResponse = await $fetch('/api/audio/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          affirmationId: affirmationId,
          audioContent: response.audioContent,
          userId: user.value.uid,
          voiceId: voiceId,
          characterCount: text.length
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
      error.value = err.message
      console.error('Error generating audio:', err)
      
      // Check if it's a CORS/Storage error
      if (err.message.includes('CORS') || err.message.includes('Access to XMLHttpRequest')) {
        console.error('Firebase Storage CORS error - check Storage rules and configuration')
        error.value = 'Firebase Storage CORS error - audio will be generated on-demand during sessions'
      }
      
      throw err
    } finally {
      isGenerating.value = false
    }
  }
  
  // Pobierz URL audio dla afirmacji
  const getAudioUrl = async (affirmationId, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    if (!activeUser || !$firebase.db) {
      console.error('Missing user or firebase for audio lookup')
      return null
    }
    
    try {
      const audioDoc = await getDoc(doc($firebase.db, 'affirmation_audio', affirmationId))
      
      if (audioDoc.exists()) {
        const data = audioDoc.data()
        
        if (data.user_id === activeUser.uid) {
          return data.download_url
        } else {
          console.error('User ID mismatch in audio doc')
        }
      } else {
        console.error('No audio document found for affirmation:', affirmationId)
      }
      
      return null
    } catch (err) {
      console.error('Error getting audio URL:', err)
      return null
    }
  }
  
  // Sprawdź czy afirmacja ma wygenerowane audio
  const hasAudio = async (affirmationId) => {
    const url = await getAudioUrl(affirmationId)
    return !!url
  }
  
  // Odtwórz audio afirmacji
  const playAudio = async (affirmationId, options = {}, userOverride = null) => {
    const audioUrl = await getAudioUrl(affirmationId, userOverride)
    
    if (!audioUrl) {
      console.error('No audio URL found for affirmation:', affirmationId)
      throw new Error('No audio available for this affirmation')
    }
    
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      
      audio.onloadstart = () => {
        console.log('Audio loading started')
      }
      
      audio.oncanplay = () => {
        console.log('Audio can start playing')
      }
      
      audio.onended = () => {
        console.log('Audio playback finished')
        resolve()
      }
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        reject(new Error('Audio playback failed'))
      }
      
      // Ustaw opcje audio
      if (options.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume))
      }
      
      if (options.playbackRate !== undefined) {
        audio.playbackRate = Math.max(0.25, Math.min(4, options.playbackRate))
      }
      
      // Załaduj i odtwórz - dodaj timestamp żeby uniknąć cache
      const urlWithTimestamp = audioUrl + '?t=' + Date.now()
      audio.src = urlWithTimestamp
      audio.load()
      
      audio.play().catch(reject)
      
      // Zwróć referencję do audio dla kontroli z zewnątrz
      return audio
    })
  }
  
  // Usuń audio dla afirmacji (gdy text się zmienia)
  const deleteAudio = async (affirmationId) => {
    if (!user.value || !$firebase.db || !$firebase.storage) return
    
    try {
      // Pobierz informacje o audio
      const audioDoc = await getDoc(doc($firebase.db, 'affirmation_audio', affirmationId))
      
      if (audioDoc.exists()) {
        const data = audioDoc.data()
        
        // Sprawdź czy należy do użytkownika
        if (data.user_id === user.value.uid) {
          // Usuń plik z Firebase Storage
          try {
            const audioRef = storageRef($firebase.storage, `audio/${user.value.uid}/${data.filename}`)
            await deleteObject(audioRef)
            console.log('Deleted audio file from storage:', data.filename)
          } catch (storageError) {
            console.warn('Could not delete audio file from storage:', storageError)
          }
          
          // Usuń dokument z Firestore
          await deleteDoc(doc($firebase.db, 'affirmation_audio', affirmationId))
          console.log('Deleted audio metadata for affirmation:', affirmationId)
        }
      }
    } catch (err) {
      console.error('Error deleting audio:', err)
      // Nie rzucamy błędu, bo to może być wywoływane automatycznie
    }
  }
  
  // Auto-generuj audio gdy afirmacja się zmienia
  const autoGenerateAudio = async (affirmationId, text, voiceId, oldText = null) => {
    
    if (!user.value) {
      return
    }
    
    // Jeśli tekst się nie zmienił, nie generuj ponownie
    if (oldText && text.trim() === oldText.trim()) {
      return
    }
    
    try {
      // Usuń stare audio jeśli istnieje
      if (oldText && oldText.trim()) {
        await deleteAudio(affirmationId)
      }
      
      // Generuj nowe audio
      if (text && text.trim()) {
        await generateAudio(affirmationId, text, voiceId)
      }
    } catch (err) {
      console.error('Auto-generate audio failed:', err)
      // Nie blokujemy UI, tylko logujemy błąd
    }
  }
  
  return {
    // State
    isGenerating: readonly(isGenerating),
    error: readonly(error),
    
    // Methods
    generateAudio,
    getAudioUrl,
    hasAudio,
    playAudio,
    deleteAudio,
    autoGenerateAudio
  }
}