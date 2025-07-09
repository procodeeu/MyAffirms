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
import { ref as storageRef, deleteObject } from 'firebase/storage'

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
      // ZAWSZE usuń stare audio przed generowaniem nowego
      console.log('🧹 Pre-generation cleanup for affirmation:', affirmationId)
      await deleteAudio(affirmationId)
      console.log('✅ Pre-generation cleanup completed for:', affirmationId)
      
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
          characterCount: text.length,
          affirmationText: text.trim() // Dodaj tekst afirmacji
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

  // Pobierz metadane audio (głos, tekst, etc.)
  const getAudioMetadata = async (affirmationId, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    console.log('🔍 getAudioMetadata called for:', { affirmationId, userId: activeUser?.uid, hasUser: !!activeUser })
    
    // Poczekaj na user jeśli nie jest dostępny
    if (!activeUser && !userOverride) {
      console.log('⏳ Waiting for user to be available...')
      await new Promise(resolve => setTimeout(resolve, 100))
      const retryUser = user.value
      if (!retryUser) {
        console.log('❌ User still not available after retry')
        return null
      }
      console.log('✅ User now available:', retryUser.uid)
      return getAudioMetadata(affirmationId, retryUser)
    }
    
    if (!activeUser || !$firebase.db) {
      console.log('❌ Missing user or firebase:', { hasUser: !!activeUser, hasDb: !!$firebase.db })
      return null
    }
    
    try {
      console.log('📡 Fetching audio document from Firestore...')
      const audioDoc = await getDoc(doc($firebase.db, 'affirmation_audio', affirmationId))
      
      if (audioDoc.exists()) {
        const data = audioDoc.data()
        console.log('📄 Audio document found:', data)
        
        if (data.user_id === activeUser.uid) {
          const metadata = {
            voiceId: data.voice_id,
            voiceName: data.voice_name,
            voiceType: data.voice_type,
            affirmationText: data.affirmation_text,
            createdAt: data.created_at,
            downloadUrl: data.download_url
          }
          console.log('✅ Returning metadata:', metadata)
          return metadata
        } else {
          console.log('⚠️ User ID mismatch:', { docUserId: data.user_id, currentUserId: activeUser.uid })
        }
      } else {
        console.log('⚠️ Audio document does not exist for affirmation:', affirmationId)
      }
      
      return null
    } catch (err) {
      console.error('❌ Error getting audio metadata:', err)
      return null
    }
  }
  
  // Odtwórz audio afirmacji
  const playAudio = async (affirmationId, options = {}, userOverride = null) => {
    console.log('🎵 playAudio called for:', affirmationId)
    const audioUrl = await getAudioUrl(affirmationId, userOverride)
    
    console.log('🔗 Audio URL retrieved:', audioUrl)
    
    if (!audioUrl) {
      console.error('❌ No audio URL found for affirmation:', affirmationId)
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
  const deleteAudio = async (affirmationId, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    if (!activeUser || !$firebase.db || !$firebase.storage) return
    
    try {
      console.log('🗑️ Attempting to delete audio for affirmation:', affirmationId)
      
      // 1. Usuń główne audio afirmacji
      const audioDoc = await getDoc(doc($firebase.db, 'affirmation_audio', affirmationId))
      
      if (audioDoc.exists()) {
        const data = audioDoc.data()
        console.log('📄 Found main audio document:', { filename: data.filename, userId: data.user_id })
        
        // Sprawdź czy należy do użytkownika
        if (data.user_id === activeUser.uid) {
          // Usuń plik z Firebase Storage
          try {
            const audioRef = storageRef($firebase.storage, `audio/${activeUser.uid}/${data.filename}`)
            await deleteObject(audioRef)
            console.log('✅ Deleted main audio file from storage:', data.filename)
          } catch (storageError) {
            if (storageError.code === 'storage/object-not-found') {
              console.log('ℹ️ Main audio file already deleted from storage:', data.filename)
            } else {
              console.warn('⚠️ Could not delete main audio file from storage:', storageError.message)
            }
          }
          
          // Usuń dokument z Firestore
          await deleteDoc(doc($firebase.db, 'affirmation_audio', affirmationId))
          console.log('✅ Deleted main audio metadata for affirmation:', affirmationId)
        }
      }
      
      // 2. Usuń wszystkie audio zdań dla tej afirmacji
      await deleteSentenceAudio(affirmationId, activeUser)
      
    } catch (err) {
      console.error('❌ Error deleting audio:', err)
      // Nie rzucamy błędu, bo to może być wywoływane automatycznie
    }
  }

  // Usuń audio dla wszystkich zdań afirmacji
  const deleteSentenceAudio = async (affirmationId, userOverride = null, sentenceIds = null) => {
    const activeUser = userOverride || user.value
    
    if (!activeUser || !$firebase.db || !$firebase.storage) return
    
    try {
      console.log('🗑️ Cleaning up sentence audio for affirmation:', affirmationId)
      
      let deletedSentences = 0
      
      if (sentenceIds && sentenceIds.length > 0) {
        // Użyj przechowywanych identyfikatorów zdań (bardziej precyzyjne)
        console.log('🎯 Using stored sentence IDs:', sentenceIds)
        
        for (const sentenceId of sentenceIds) {
          try {
            const sentenceDoc = await getDoc(doc($firebase.db, 'affirmation_audio', sentenceId))
            
            if (sentenceDoc.exists()) {
              const data = sentenceDoc.data()
              
              if (data.user_id === activeUser.uid) {
                console.log('🗑️ Found sentence audio to delete:', sentenceId)
                
                // Usuń plik z Storage
                if (data.filename) {
                  try {
                    const audioRef = storageRef($firebase.storage, `audio/${activeUser.uid}/${data.filename}`)
                    await deleteObject(audioRef)
                    console.log('✅ Deleted sentence audio file:', data.filename)
                  } catch (storageError) {
                    if (storageError.code === 'storage/object-not-found') {
                      console.log('ℹ️ Sentence audio file already deleted from storage:', data.filename)
                    } else {
                      console.warn('⚠️ Could not delete sentence audio file from storage:', storageError.message)
                    }
                  }
                }
                
                // Usuń dokument z Firestore
                await deleteDoc(doc($firebase.db, 'affirmation_audio', sentenceId))
                console.log('✅ Deleted sentence audio metadata:', sentenceId)
                deletedSentences++
              }
            }
          } catch (error) {
            console.warn('⚠️ Error deleting sentence audio:', sentenceId, error.message)
          }
        }
      } else {
        // Fallback - sprawdź do 20 zdań (dla starych afirmacji bez sentenceIds)
        console.log('🔄 No stored sentence IDs, using fallback method')
        
        for (let i = 0; i < 20; i++) {
          const sentenceId = `${affirmationId}_sentence_${i}`
          
          try {
            const sentenceDoc = await getDoc(doc($firebase.db, 'affirmation_audio', sentenceId))
            
            if (sentenceDoc.exists()) {
              const data = sentenceDoc.data()
              
              if (data.user_id === activeUser.uid) {
                console.log('🗑️ Found sentence audio to delete:', sentenceId)
                
                // Usuń plik z Storage
                if (data.filename) {
                  try {
                    const audioRef = storageRef($firebase.storage, `audio/${activeUser.uid}/${data.filename}`)
                    await deleteObject(audioRef)
                    console.log('✅ Deleted sentence audio file:', data.filename)
                  } catch (storageError) {
                    if (storageError.code === 'storage/object-not-found') {
                      console.log('ℹ️ Sentence audio file already deleted from storage:', data.filename)
                    } else {
                      console.warn('⚠️ Could not delete sentence audio file from storage:', storageError.message)
                    }
                  }
                }
                
                // Usuń dokument z Firestore
                await deleteDoc(doc($firebase.db, 'affirmation_audio', sentenceId))
                console.log('✅ Deleted sentence audio metadata:', sentenceId)
                deletedSentences++
              }
            } else {
              // Jeśli nie ma zdania o tym indeksie, prawdopodobnie skończyły się zdania
              if (i > 0) break
            }
          } catch (error) {
            console.warn('⚠️ Error checking/deleting sentence audio:', sentenceId, error.message)
          }
        }
      }
      
      if (deletedSentences > 0) {
        console.log(`✅ Cleaned up ${deletedSentences} sentence audio files for affirmation:`, affirmationId)
      } else {
        console.log('ℹ️ No sentence audio found to clean up for affirmation:', affirmationId)
      }
      
    } catch (err) {
      console.error('❌ Error cleaning up sentence audio:', err)
    }
  }
  
  // Usuń wszystkie audio dla projektu (przy usuwaniu projektu)
  const deleteAllProjectAudio = async (projectAffirmations, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    if (!activeUser || !$firebase.db || !$firebase.storage) {
      console.log('⚠️ Missing user or firebase for project audio cleanup', {
        hasUser: !!activeUser,
        hasDb: !!$firebase.db,
        hasStorage: !!$firebase.storage
      })
      return
    }
    
    if (!projectAffirmations || projectAffirmations.length === 0) {
      console.log('ℹ️ No affirmations to clean up')
      return
    }
    
    console.log('🧹 Starting cleanup of all project audio...', { count: projectAffirmations.length })
    
    let deletedCount = 0
    let errorCount = 0
    
    for (const affirmation of projectAffirmations) {
      try {
        console.log(`🗑️ Deleting audio for affirmation: ${affirmation.id}`)
        await deleteAudio(affirmation.id, activeUser)
        deletedCount++
      } catch (error) {
        console.error(`❌ Failed to delete audio for affirmation ${affirmation.id}:`, error)
        errorCount++
      }
    }
    
    console.log(`✅ Project audio cleanup completed:`, { 
      total: projectAffirmations.length,
      deleted: deletedCount, 
      errors: errorCount 
    })
  }

  // Auto-generuj audio gdy afirmacja się zmienia
  const autoGenerateAudio = async (affirmationId, text, voiceId, oldText = null) => {
    
    if (!user.value) {
      return
    }
    
    try {
      console.log('🔄 autoGenerateAudio started:', { 
        affirmationId, 
        textLength: text?.length, 
        hasOldText: oldText !== null,
        textChanged: oldText ? text.trim() !== oldText.trim() : 'new'
      })
      
      // ZAWSZE usuń stare audio przy edycji (gdy oldText istnieje)
      // lub gdy generujemy nowe audio dla istniejącej afirmacji
      if (oldText !== null) {
        console.log('🗑️ Pre-edit cleanup - deleting old audio for affirmation:', affirmationId)
        await deleteAudio(affirmationId)
        console.log('✅ Pre-edit cleanup completed for:', affirmationId)
        
        // Dodaj małe opóźnienie aby upewnić się, że usunięcie zostało przetworzone
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('⏱️ Cleanup delay completed for:', affirmationId)
      }
      
      // Generuj nowe audio tylko jeśli tekst się zmienił lub to nowa afirmacja
      if (text && text.trim() && (!oldText || text.trim() !== oldText.trim())) {
        console.log('🎵 Generating new audio for affirmation:', affirmationId)
        await generateAudio(affirmationId, text, voiceId)
        console.log('✅ New audio generation completed for:', affirmationId)
      } else if (oldText && text.trim() === oldText.trim()) {
        console.log('📝 Text unchanged, skipping audio generation for:', affirmationId)
      }
      
      console.log('🏁 autoGenerateAudio finished successfully for:', affirmationId)
    } catch (err) {
      console.error('❌ Auto-generate audio failed for:', affirmationId, err)
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
    getAudioMetadata,
    hasAudio,
    playAudio,
    deleteAudio,
    deleteSentenceAudio,
    deleteAllProjectAudio,
    autoGenerateAudio
  }
}