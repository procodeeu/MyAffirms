// Audio Metadata - odpowiedzialny za metadata audio
import { doc, getDoc } from 'firebase/firestore'

export const useAudioMetadata = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()

  // Cache dla metadata
  const metadataCache = ref(new Map())

  // Pobierz metadata dla pojedynczego audio
  const getAudioMetadata = async (audioId, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    // Sprawdź cache
    const cacheKey = `${activeUser?.uid}_${audioId}`
    if (metadataCache.value.has(cacheKey)) {
      console.log('📋 Using cached metadata for:', audioId)
      return metadataCache.value.get(cacheKey)
    }

    console.log('🔍 Fetching metadata for:', audioId)
    
    // Poczekaj na user jeśli nie jest dostępny
    if (!activeUser && !userOverride) {
      console.log('⏳ Waiting for user to be available...')
      await new Promise(resolve => setTimeout(resolve, 100))
      const retryUser = user.value
      if (!retryUser) {
        console.log('❌ User still not available after retry')
        return null
      }
      return getAudioMetadata(audioId, retryUser)
    }

    if (!activeUser || !$firebase.db) {
      console.log('❌ Missing user or firebase:', { hasUser: !!activeUser, hasDb: !!$firebase.db })
      return null
    }

    try {
      const audioDoc = await getDoc(doc($firebase.db, 'affirmation_audio', audioId))
      
      if (audioDoc.exists()) {
        const data = audioDoc.data()
        
        if (data.user_id === activeUser.uid) {
          const metadata = {
            voiceId: data.voice_id,
            voiceName: data.voice_name,
            voiceType: data.voice_type,
            affirmationText: data.affirmation_text,
            createdAt: data.created_at,
            downloadUrl: data.download_url,
            filename: data.filename,
            characterCount: data.character_count
          }
          
          // Dodaj do cache
          metadataCache.value.set(cacheKey, metadata)
          
          console.log('✅ Retrieved and cached metadata for:', audioId)
          return metadata
        } else {
          console.log('⚠️ User ID mismatch:', { docUserId: data.user_id, currentUserId: activeUser.uid })
        }
      } else {
        console.log('⚠️ Audio document does not exist:', audioId)
      }
      
      return null
    } catch (err) {
      console.error('❌ Error getting audio metadata:', err)
      return null
    }
  }

  // Pobierz metadata dla wielu audio jednocześnie
  const getBatchAudioMetadata = async (audioIds, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    if (!activeUser || !$firebase.db) {
      console.error('❌ Missing user or firebase for batch metadata lookup')
      return {}
    }

    console.log(`🔍 Fetching metadata for ${audioIds.length} audio files`)
    
    const metadata = {}
    const uncachedIds = []

    // Sprawdź cache najpierw
    for (const audioId of audioIds) {
      const cacheKey = `${activeUser.uid}_${audioId}`
      if (metadataCache.value.has(cacheKey)) {
        metadata[audioId] = metadataCache.value.get(cacheKey)
      } else {
        uncachedIds.push(audioId)
      }
    }

    if (uncachedIds.length > 0) {
      console.log(`📡 Fetching ${uncachedIds.length} uncached metadata from Firestore`)
      
      // Fetch uncached metadata równolegle
      const promises = uncachedIds.map(async (audioId) => {
        try {
          const meta = await getAudioMetadata(audioId, activeUser)
          if (meta) {
            metadata[audioId] = meta
          }
        } catch (error) {
          console.warn(`⚠️ Failed to get metadata for ${audioId}:`, error)
        }
      })

      await Promise.all(promises)
    }

    console.log(`✅ Retrieved metadata for ${Object.keys(metadata).length}/${audioIds.length} audio files`)
    return metadata
  }

  // Sprawdź które audio mają kompletne metadata
  const validateAudioMetadata = async (audioIds, userOverride = null) => {
    const metadata = await getBatchAudioMetadata(audioIds, userOverride)
    
    const validation = {
      valid: [],
      invalid: [],
      missing: []
    }

    for (const audioId of audioIds) {
      const meta = metadata[audioId]
      
      if (!meta) {
        validation.missing.push(audioId)
      } else if (meta.downloadUrl && meta.voiceId && meta.affirmationText) {
        validation.valid.push(audioId)
      } else {
        validation.invalid.push(audioId)
      }
    }

    return validation
  }

  // Wyczyść cache dla określonych audio
  const clearMetadataCache = (audioIds = null, userOverride = null) => {
    const activeUser = userOverride || user.value
    
    if (!audioIds) {
      // Wyczyść cały cache
      metadataCache.value.clear()
      console.log('🧹 Cleared entire metadata cache')
    } else {
      // Wyczyść tylko określone audio
      for (const audioId of audioIds) {
        const cacheKey = `${activeUser?.uid}_${audioId}`
        metadataCache.value.delete(cacheKey)
      }
      console.log(`🧹 Cleared metadata cache for ${audioIds.length} audio files`)
    }
  }

  // Pobierz statystyki cache
  const getCacheStats = () => {
    return {
      size: metadataCache.value.size,
      keys: Array.from(metadataCache.value.keys())
    }
  }

  // Sprawdź czy audio ma metadata
  const hasMetadata = async (audioId, userOverride = null) => {
    const metadata = await getAudioMetadata(audioId, userOverride)
    return !!metadata
  }

  return {
    // Single operations
    getAudioMetadata,
    hasMetadata,

    // Batch operations
    getBatchAudioMetadata,
    validateAudioMetadata,

    // Cache management
    clearMetadataCache,
    getCacheStats,

    // State
    cacheSize: computed(() => metadataCache.value.size)
  }
}