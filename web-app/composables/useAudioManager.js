// Audio Manager - centralne API dla wszystkich operacji audio
import { useAudioGeneration } from './audio/useAudioGeneration'
import { useAudioPlayback } from './audio/useAudioPlayback'
import { useAudioStorage } from './audio/useAudioStorage'
import { useAudioMetadata } from './audio/useAudioMetadata'

export const useAudioManager = () => {
  const generation = useAudioGeneration()
  const playback = useAudioPlayback()
  const storage = useAudioStorage()
  const metadata = useAudioMetadata()

  // Centralne state
  const isProcessing = ref(false)
  const error = ref(null)

  // === AFFIRMATION LIFECYCLE MANAGEMENT ===

  // Kompletne zarządzanie audio dla nowej afirmacji
  const createAffirmationAudio = async (affirmationId, text, voiceId, oldText = null) => {
    if (!text || !text.trim()) {
      throw new Error('Text is required')
    }

    isProcessing.value = true
    error.value = null

    try {
      console.log('🎯 Creating audio for affirmation:', { affirmationId, textLength: text.length })

      // 1. Cleanup starych audio jeśli to edycja
      if (oldText !== null) {
        console.log('🧹 Cleaning up old audio before regeneration')
        await deleteAffirmationAudio(affirmationId)
        
        // Małe opóźnienie dla cleanup
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // 2. Generuj nowe audio zdań
      const sentenceIds = await generation.generateSentenceAudio(affirmationId, text, voiceId)
      
      if (!sentenceIds || sentenceIds.length === 0) {
        throw new Error('Failed to generate any sentence audio')
      }

      console.log(`✅ Created audio for affirmation: ${sentenceIds.length} sentences`)
      
      return {
        sentenceIds,
        sentenceCount: sentenceIds.length,
        success: true
      }

    } catch (err) {
      error.value = err.message
      console.error('❌ Failed to create affirmation audio:', err)
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  // Usuń wszystkie audio dla afirmacji
  const deleteAffirmationAudio = async (affirmationId, sentenceIds = null) => {
    console.log('🗑️ Deleting audio for affirmation:', affirmationId)

    try {
      const result = await storage.deleteAffirmationAudio(affirmationId, sentenceIds)
      
      // Wyczyść cache metadata
      if (sentenceIds) {
        metadata.clearMetadataCache(sentenceIds)
      } else {
        // Wyczyść cache dla potencjalnych sentence IDs
        const potentialIds = Array.from({ length: 20 }, (_, i) => `${affirmationId}_sentence_${i}`)
        metadata.clearMetadataCache(potentialIds)
      }

      return result
    } catch (error) {
      console.error('❌ Failed to delete affirmation audio:', error)
      throw error
    }
  }

  // === PLAYBACK MANAGEMENT ===

  // Odtwórz afirmację z pauzami między zdaniami
  const playAffirmation = async (affirmation, options = {}) => {
    const { speechRate = 1.0, sentencePause = 0, voiceId } = options

    console.log('🎵 Playing affirmation:', affirmation.id)

    try {
      // Reset stopped flag
      playback.resetStoppedFlag()

      let audioUrls = []

      if (affirmation.sentenceIds && affirmation.sentenceIds.length > 0) {
        // Użyj przechowywanych sentence IDs
        console.log('🎯 Using stored sentence IDs for playback')
        const urls = await storage.getBatchAudioUrls(affirmation.sentenceIds)
        audioUrls = affirmation.sentenceIds.map(id => urls[id]).filter(Boolean)
      } else {
        // Fallback - spróbuj znaleźć audio zdań
        console.log('🔄 Fallback: searching for sentence audio')
        const sentences = affirmation.text.split(/[.!?]+/).filter(s => s.trim().length > 0)
        const sentenceIds = sentences.map((_, i) => `${affirmation.id}_sentence_${i}`)
        const urls = await storage.getBatchAudioUrls(sentenceIds)
        audioUrls = sentenceIds.map(id => urls[id]).filter(Boolean)
      }

      if (audioUrls.length === 0) {
        throw new Error('No audio files found for affirmation')
      }

      console.log(`🎵 Playing ${audioUrls.length} audio files with ${sentencePause}s pauses`)

      // Odtwórz sekwencję audio
      await playback.playAudioSequence(audioUrls, {
        sentencePause,
        speechRate
      })

      console.log('✅ Affirmation playback completed')

    } catch (error) {
      console.error('❌ Affirmation playback failed:', error)
      throw error
    }
  }

  // Zatrzymaj odtwarzanie
  const stopPlayback = () => {
    console.log('⏹️ Stopping audio playback')
    playback.stopAllAudio()
  }

  // === BATCH OPERATIONS ===

  // Generuj audio dla wielu afirmacji jednocześnie
  const createProjectAudio = async (affirmations, voiceId) => {
    if (!affirmations || affirmations.length === 0) {
      return { success: 0, errors: 0, results: [] }
    }

    console.log(`🎯 Creating audio for ${affirmations.length} affirmations`)

    isProcessing.value = true
    const results = []
    let success = 0
    let errors = 0

    try {
      // Przetwarzaj równolegle (ale z ograniczeniem)
      const batchSize = 3 // Maksymalnie 3 jednocześnie
      
      for (let i = 0; i < affirmations.length; i += batchSize) {
        const batch = affirmations.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (affirmation) => {
          try {
            const result = await createAffirmationAudio(
              affirmation.id, 
              affirmation.text, 
              voiceId
            )
            
            results.push({
              affirmationId: affirmation.id,
              success: true,
              ...result
            })
            success++
          } catch (error) {
            console.error(`❌ Failed to create audio for ${affirmation.id}:`, error)
            results.push({
              affirmationId: affirmation.id,
              success: false,
              error: error.message
            })
            errors++
          }
        })

        await Promise.all(batchPromises)
        
        // Małe opóźnienie między batches
        if (i + batchSize < affirmations.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      console.log(`✅ Project audio creation completed: ${success} success, ${errors} errors`)
      
      return { success, errors, results }

    } finally {
      isProcessing.value = false
    }
  }

  // Usuń audio dla całego projektu
  const deleteProjectAudio = async (affirmations) => {
    console.log(`🗑️ Deleting audio for ${affirmations.length} affirmations`)

    try {
      const result = await storage.deleteProjectAudio(affirmations)
      
      // Wyczyść cache metadata dla całego projektu
      const allSentenceIds = affirmations.flatMap(aff => aff.sentenceIds || [])
      if (allSentenceIds.length > 0) {
        metadata.clearMetadataCache(allSentenceIds)
      }

      return result
    } catch (error) {
      console.error('❌ Failed to delete project audio:', error)
      throw error
    }
  }

  // === VALIDATION & HEALTH CHECKS ===

  // Sprawdź stan audio dla afirmacji
  const validateAffirmationAudio = async (affirmation) => {
    console.log('🔍 Validating audio for affirmation:', affirmation.id)

    const validation = {
      affirmationId: affirmation.id,
      hasStoredIds: !!(affirmation.sentenceIds && affirmation.sentenceIds.length > 0),
      expectedSentences: affirmation.text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
      actualSentences: affirmation.sentenceIds?.length || 0,
      audioFiles: {
        found: [],
        missing: []
      },
      metadata: {
        valid: [],
        invalid: [],
        missing: []
      },
      isValid: false
    }

    try {
      if (affirmation.sentenceIds && affirmation.sentenceIds.length > 0) {
        // Sprawdź czy audio files istnieją
        const audioExists = await storage.checkBatchAudioExists(affirmation.sentenceIds)
        
        for (const sentenceId of affirmation.sentenceIds) {
          if (audioExists[sentenceId]) {
            validation.audioFiles.found.push(sentenceId)
          } else {
            validation.audioFiles.missing.push(sentenceId)
          }
        }

        // Sprawdź metadata
        const metadataValidation = await metadata.validateAudioMetadata(affirmation.sentenceIds)
        validation.metadata = metadataValidation

        // Określ czy afirmacja jest valid
        validation.isValid = 
          validation.audioFiles.missing.length === 0 &&
          validation.metadata.missing.length === 0 &&
          validation.metadata.invalid.length === 0 &&
          validation.actualSentences === validation.expectedSentences
      }

      return validation

    } catch (error) {
      console.error('❌ Audio validation failed:', error)
      validation.error = error.message
      return validation
    }
  }

  // Sprawdź stan audio dla całego projektu
  const validateProjectAudio = async (affirmations) => {
    console.log(`🔍 Validating audio for ${affirmations.length} affirmations`)

    const validations = []
    let validCount = 0
    let invalidCount = 0

    // Waliduj równolegle
    const promises = affirmations.map(async (affirmation) => {
      const validation = await validateAffirmationAudio(affirmation)
      validations.push(validation)
      
      if (validation.isValid) {
        validCount++
      } else {
        invalidCount++
      }
    })

    await Promise.all(promises)

    const summary = {
      total: affirmations.length,
      valid: validCount,
      invalid: invalidCount,
      validations
    }

    console.log(`✅ Project audio validation completed:`, summary)
    return summary
  }

  // === MIGRATION HELPERS ===

  // Migruj starą afirmację do nowego formatu
  const migrateAffirmationToNewFormat = async (affirmation, voiceId) => {
    if (affirmation.sentenceIds && affirmation.sentenceIds.length > 0) {
      console.log('ℹ️ Affirmation already in new format:', affirmation.id)
      return affirmation
    }

    console.log('🔄 Migrating affirmation to new format:', affirmation.id)

    try {
      const result = await createAffirmationAudio(affirmation.id, affirmation.text, voiceId)
      
      return {
        ...affirmation,
        sentenceIds: result.sentenceIds,
        sentenceCount: result.sentenceCount
      }
    } catch (error) {
      console.error('❌ Migration failed for affirmation:', affirmation.id, error)
      throw error
    }
  }

  return {
    // State
    isProcessing: readonly(isProcessing),
    error: readonly(error),
    isGenerating: generation.isGenerating,
    activeAudioCount: playback.activeAudioCount,
    cacheSize: metadata.cacheSize,

    // Affirmation lifecycle
    createAffirmationAudio,
    deleteAffirmationAudio,

    // Playback
    playAffirmation,
    stopPlayback,

    // Batch operations
    createProjectAudio,
    deleteProjectAudio,

    // Validation
    validateAffirmationAudio,
    validateProjectAudio,

    // Migration
    migrateAffirmationToNewFormat,

    // Direct access to modules (for advanced usage)
    modules: {
      generation,
      playback,
      storage,
      metadata
    }
  }
}