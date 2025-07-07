// Audio Storage - odpowiedzialny za storage i cleanup
import { 
  doc, 
  getDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore'
import { ref as storageRef, deleteObject } from 'firebase/storage'

export const useAudioStorage = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()

  // Pobierz URL audio
  const getAudioUrl = async (audioId, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    if (!activeUser || !$firebase.db) {
      console.error('❌ Missing user or firebase for audio lookup')
      return null
    }

    try {
      const audioDoc = await getDoc(doc($firebase.db, 'affirmation_audio', audioId))
      
      if (audioDoc.exists()) {
        const data = audioDoc.data()
        
        if (data.user_id === activeUser.uid) {
          return data.download_url
        } else {
          console.error('⚠️ User ID mismatch in audio doc')
        }
      }
      
      return null
    } catch (err) {
      console.error('❌ Error getting audio URL:', err)
      return null
    }
  }

  // Pobierz URLs dla wielu audio jednocześnie
  const getBatchAudioUrls = async (audioIds, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    if (!activeUser || !$firebase.db) {
      console.error('❌ Missing user or firebase for batch audio lookup')
      return {}
    }

    const urls = {}
    
    // Batch fetch dla lepszej wydajności
    const promises = audioIds.map(async (audioId) => {
      try {
        const url = await getAudioUrl(audioId, activeUser)
        if (url) {
          urls[audioId] = url
        }
      } catch (error) {
        console.warn(`⚠️ Failed to get URL for ${audioId}:`, error)
      }
    })

    await Promise.all(promises)
    return urls
  }

  // Usuń pojedyncze audio
  const deleteSingleAudio = async (audioId, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    if (!activeUser || !$firebase.db || !$firebase.storage) {
      console.warn('⚠️ Missing dependencies for audio deletion')
      return false
    }

    try {
      console.log('🗑️ Deleting audio:', audioId)
      
      const audioDoc = await getDoc(doc($firebase.db, 'affirmation_audio', audioId))
      
      if (audioDoc.exists()) {
        const data = audioDoc.data()
        
        if (data.user_id === activeUser.uid) {
          // Usuń plik z Storage
          if (data.filename) {
            try {
              const audioRef = storageRef($firebase.storage, `audio/${activeUser.uid}/${data.filename}`)
              await deleteObject(audioRef)
              console.log('✅ Deleted audio file from storage:', data.filename)
            } catch (storageError) {
              if (storageError.code === 'storage/object-not-found') {
                console.log('ℹ️ Audio file already deleted from storage')
              } else {
                console.warn('⚠️ Could not delete audio file from storage:', storageError.message)
              }
            }
          }
          
          // Usuń dokument z Firestore
          await deleteDoc(doc($firebase.db, 'affirmation_audio', audioId))
          console.log('✅ Deleted audio metadata:', audioId)
          return true
        } else {
          console.warn('⚠️ User ID mismatch - cannot delete audio')
          return false
        }
      } else {
        console.log('ℹ️ Audio document does not exist:', audioId)
        return true // Już usunięte
      }
    } catch (err) {
      console.error('❌ Error deleting audio:', audioId, err)
      return false
    }
  }

  // Usuń wiele audio jednocześnie
  const deleteBatchAudio = async (audioIds, userOverride = null) => {
    if (!audioIds || audioIds.length === 0) {
      console.log('ℹ️ No audio IDs to delete')
      return { deleted: 0, errors: 0 }
    }

    console.log(`🗑️ Starting batch deletion of ${audioIds.length} audio files`)
    
    let deleted = 0
    let errors = 0

    // Usuń równolegle dla lepszej wydajności
    const promises = audioIds.map(async (audioId) => {
      try {
        const success = await deleteSingleAudio(audioId, userOverride)
        if (success) {
          deleted++
        } else {
          errors++
        }
      } catch (error) {
        console.error(`❌ Failed to delete audio ${audioId}:`, error)
        errors++
      }
    })

    await Promise.all(promises)

    console.log(`✅ Batch deletion completed: ${deleted} deleted, ${errors} errors`)
    return { deleted, errors }
  }

  // Usuń wszystkie audio dla afirmacji (używając sentenceIds)
  const deleteAffirmationAudio = async (affirmationId, sentenceIds = null, userOverride = null) => {
    console.log('🗑️ Cleaning up audio for affirmation:', affirmationId)

    const audioIdsToDelete = []

    if (sentenceIds && sentenceIds.length > 0) {
      // Użyj przechowywanych identyfikatorów (preferowane)
      console.log('🎯 Using stored sentence IDs:', sentenceIds)
      audioIdsToDelete.push(...sentenceIds)
    } else {
      // Fallback - sprawdź standardowe ID zdań
      console.log('🔄 No stored sentence IDs, using fallback method')
      for (let i = 0; i < 20; i++) {
        audioIdsToDelete.push(`${affirmationId}_sentence_${i}`)
      }
    }

    // Usuń wszystkie audio jednocześnie
    const result = await deleteBatchAudio(audioIdsToDelete, userOverride)
    
    if (result.deleted > 0) {
      console.log(`✅ Cleaned up ${result.deleted} audio files for affirmation:`, affirmationId)
    } else {
      console.log('ℹ️ No audio found to clean up for affirmation:', affirmationId)
    }

    return result
  }

  // Usuń wszystkie audio dla projektu
  const deleteProjectAudio = async (projectAffirmations, userOverride = null) => {
    if (!projectAffirmations || projectAffirmations.length === 0) {
      console.log('ℹ️ No affirmations to clean up')
      return { deleted: 0, errors: 0 }
    }

    console.log(`🧹 Starting cleanup of all project audio (${projectAffirmations.length} affirmations)`)

    let totalDeleted = 0
    let totalErrors = 0

    // Zbierz wszystkie audio IDs do usunięcia
    const allAudioIds = []
    
    for (const affirmation of projectAffirmations) {
      if (affirmation.sentenceIds && affirmation.sentenceIds.length > 0) {
        allAudioIds.push(...affirmation.sentenceIds)
      } else {
        // Fallback dla starych afirmacji
        for (let i = 0; i < 20; i++) {
          allAudioIds.push(`${affirmation.id}_sentence_${i}`)
        }
      }
    }

    // Usuń wszystkie audio jednocześnie
    const result = await deleteBatchAudio(allAudioIds, userOverride)
    
    console.log(`✅ Project audio cleanup completed:`, {
      affirmations: projectAffirmations.length,
      deleted: result.deleted,
      errors: result.errors
    })

    return result
  }

  // Sprawdź czy audio istnieje
  const audioExists = async (audioId, userOverride = null) => {
    const url = await getAudioUrl(audioId, userOverride)
    return !!url
  }

  // Sprawdź które audio istnieją z listy
  const checkBatchAudioExists = async (audioIds, userOverride = null) => {
    const urls = await getBatchAudioUrls(audioIds, userOverride)
    return audioIds.reduce((acc, audioId) => {
      acc[audioId] = !!urls[audioId]
      return acc
    }, {})
  }

  return {
    // Single operations
    getAudioUrl,
    deleteSingleAudio,
    audioExists,

    // Batch operations
    getBatchAudioUrls,
    deleteBatchAudio,
    checkBatchAudioExists,

    // High-level operations
    deleteAffirmationAudio,
    deleteProjectAudio
  }
}