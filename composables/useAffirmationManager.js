// Affirmation Manager - zarządzanie afirmacjami (business logic)
import { useAudioManager } from './useAudioManager'
import { useFirestore } from './useFirestore'

export const useAffirmationManager = () => {
  const audioManager = useAudioManager()
  const { updateProject } = useFirestore()
  
  // === VALIDATION ===
  
  const validateAffirmationText = (text) => {
    if (!text || !text.trim()) {
      throw new Error('Affirmation text is required')
    }
    
    const trimmedText = text.trim()
    
    if (trimmedText.length < 3) {
      throw new Error('Affirmation text must be at least 3 characters long')
    }
    
    if (trimmedText.length > 1000) {
      throw new Error('Affirmation text must be less than 1000 characters')
    }
    
    return trimmedText
  }
  
  const validateAffirmationData = (affirmationData) => {
    if (!affirmationData.id) {
      throw new Error('Affirmation ID is required')
    }
    
    validateAffirmationText(affirmationData.text)
    
    return true
  }
  
  // === AFFIRMATION CRUD OPERATIONS ===
  
  const createAffirmation = async (projectId, text, options = {}) => {
    console.log('➕ Creating new affirmation:', { projectId, textLength: text.length })
    
    try {
      // 1. Validate input
      const validatedText = validateAffirmationText(text)
      
      // 2. Create affirmation object
      const affirmationId = Date.now().toString()
      const newAffirmation = {
        id: affirmationId,
        text: validatedText,
        createdAt: new Date().toISOString(),
        isActive: true,
        ...options.additionalFields
      }
      
      // 3. Get current project data
      const currentProject = options.currentProject
      if (!currentProject) {
        throw new Error('Current project data is required')
      }
      
      // 4. Update project with new affirmation
      const updatedAffirmations = [...(currentProject.affirmations || []), newAffirmation]
      await updateProject(projectId, { affirmations: updatedAffirmations })
      
      // 5. Generate audio if requested
      if (options.autoGenerateAudio && options.voiceId) {
        console.log('🎵 Auto-generating audio for new affirmation')
        
        // Return immediately, generate audio in background
        setTimeout(async () => {
          try {
            const result = await audioManager.createAffirmationAudio(
              affirmationId,
              validatedText,
              options.voiceId
            )
            
            // Update affirmation with sentence IDs
            if (result.success && result.sentenceIds?.length > 0) {
              const updatedAffirmationsWithAudio = updatedAffirmations.map(aff => 
                aff.id === affirmationId 
                  ? { ...aff, sentenceIds: result.sentenceIds, sentenceCount: result.sentenceCount }
                  : aff
              )
              
              await updateProject(projectId, { affirmations: updatedAffirmationsWithAudio })
              console.log('✅ Updated affirmation with audio metadata:', { affirmationId, sentenceIds: result.sentenceIds })
              
              // Notify callback if provided
              if (options.onAudioGenerated) {
                options.onAudioGenerated(affirmationId, result)
              }
            }
          } catch (audioError) {
            console.error('❌ Background audio generation failed:', audioError)
            if (options.onAudioError) {
              options.onAudioError(affirmationId, audioError)
            }
          }
        }, 100)
      }
      
      console.log('✅ Affirmation created successfully:', affirmationId)
      return {
        success: true,
        affirmation: newAffirmation,
        updatedAffirmations
      }
      
    } catch (error) {
      console.error('❌ Failed to create affirmation:', error)
      throw error
    }
  }
  
  const updateAffirmation = async (projectId, affirmationId, newText, options = {}) => {
    console.log('📝 Updating affirmation:', { projectId, affirmationId, textLength: newText.length })
    
    try {
      // 1. Validate input
      const validatedText = validateAffirmationText(newText)
      
      // 2. Get current project data
      const currentProject = options.currentProject
      if (!currentProject) {
        throw new Error('Current project data is required')
      }
      
      // 3. Find existing affirmation
      const existingAffirmation = currentProject.affirmations?.find(aff => aff.id === affirmationId)
      if (!existingAffirmation) {
        throw new Error('Affirmation not found')
      }
      
      const oldText = existingAffirmation.text
      
      // 4. Update affirmation in project
      const updatedAffirmations = currentProject.affirmations.map(aff => 
        aff.id === affirmationId 
          ? { ...aff, text: validatedText, updatedAt: new Date().toISOString() }
          : aff
      )
      
      await updateProject(projectId, { affirmations: updatedAffirmations })
      
      // 5. Regenerate audio if requested
      if (options.autoGenerateAudio && options.voiceId && oldText !== validatedText) {
        console.log('🎵 Regenerating audio for updated affirmation')
        
        // Return immediately, regenerate audio in background
        setTimeout(async () => {
          try {
            const result = await audioManager.createAffirmationAudio(
              affirmationId,
              validatedText,
              options.voiceId,
              oldText // Pass old text for cleanup
            )
            
            // Update affirmation with new sentence IDs
            if (result.success && result.sentenceIds?.length > 0) {
              const updatedAffirmationsWithAudio = updatedAffirmations.map(aff => 
                aff.id === affirmationId 
                  ? { ...aff, sentenceIds: result.sentenceIds, sentenceCount: result.sentenceCount }
                  : aff
              )
              
              await updateProject(projectId, { affirmations: updatedAffirmationsWithAudio })
              console.log('✅ Updated affirmation with new audio metadata:', { affirmationId, sentenceIds: result.sentenceIds })
              
              // Notify callback if provided
              if (options.onAudioGenerated) {
                options.onAudioGenerated(affirmationId, result)
              }
            }
          } catch (audioError) {
            console.error('❌ Background audio regeneration failed:', audioError)
            if (options.onAudioError) {
              options.onAudioError(affirmationId, audioError)
            }
          }
        }, 100)
      }
      
      console.log('✅ Affirmation updated successfully:', affirmationId)
      return {
        success: true,
        affirmation: updatedAffirmations.find(aff => aff.id === affirmationId),
        updatedAffirmations
      }
      
    } catch (error) {
      console.error('❌ Failed to update affirmation:', error)
      throw error
    }
  }
  
  const deleteAffirmation = async (projectId, affirmationId, options = {}) => {
    console.log('🗑️ Deleting affirmation:', { projectId, affirmationId })
    
    try {
      // 1. Get current project data
      const currentProject = options.currentProject
      if (!currentProject) {
        throw new Error('Current project data is required')
      }
      
      // 2. Find affirmation to delete (to get sentence IDs for audio cleanup)
      const affirmationToDelete = currentProject.affirmations?.find(aff => aff.id === affirmationId)
      if (!affirmationToDelete) {
        throw new Error('Affirmation not found')
      }
      
      // 3. Remove affirmation from project
      const updatedAffirmations = currentProject.affirmations.filter(aff => aff.id !== affirmationId)
      await updateProject(projectId, { affirmations: updatedAffirmations })
      
      // 4. Delete associated audio
      try {
        await audioManager.deleteAffirmationAudio(affirmationId, affirmationToDelete.sentenceIds)
        console.log('✅ Audio deleted for affirmation:', affirmationId)
      } catch (audioError) {
        console.warn('⚠️ Failed to delete audio (continuing anyway):', audioError)
        // Don't fail the whole operation if audio deletion fails
      }
      
      console.log('✅ Affirmation deleted successfully:', affirmationId)
      return {
        success: true,
        deletedAffirmation: affirmationToDelete,
        updatedAffirmations
      }
      
    } catch (error) {
      console.error('❌ Failed to delete affirmation:', error)
      throw error
    }
  }
  
  const toggleAffirmationActive = async (projectId, affirmationId, options = {}) => {
    console.log('🔄 Toggling affirmation active state:', { projectId, affirmationId })
    
    try {
      // 1. Get current project data
      const currentProject = options.currentProject
      if (!currentProject) {
        throw new Error('Current project data is required')
      }
      
      // 2. Find affirmation
      const affirmation = currentProject.affirmations?.find(aff => aff.id === affirmationId)
      if (!affirmation) {
        throw new Error('Affirmation not found')
      }
      
      // 3. Toggle active state
      const newActiveState = affirmation.isActive === false ? true : false
      const updatedAffirmations = currentProject.affirmations.map(aff => 
        aff.id === affirmationId 
          ? { ...aff, isActive: newActiveState, updatedAt: new Date().toISOString() }
          : aff
      )
      
      await updateProject(projectId, { affirmations: updatedAffirmations })
      
      console.log('✅ Affirmation active state toggled:', { affirmationId, newActiveState })
      return {
        success: true,
        affirmation: updatedAffirmations.find(aff => aff.id === affirmationId),
        updatedAffirmations
      }
      
    } catch (error) {
      console.error('❌ Failed to toggle affirmation active state:', error)
      throw error
    }
  }
  
  // === BATCH OPERATIONS ===
  
  const reorderAffirmations = async (projectId, newOrder, options = {}) => {
    console.log('🔄 Reordering affirmations:', { projectId, count: newOrder.length })
    
    try {
      // 1. Validate input
      if (!Array.isArray(newOrder)) {
        throw new Error('New order must be an array')
      }
      
      // 2. Update project with new order
      await updateProject(projectId, { affirmations: newOrder })
      
      console.log('✅ Affirmations reordered successfully')
      return {
        success: true,
        updatedAffirmations: newOrder
      }
      
    } catch (error) {
      console.error('❌ Failed to reorder affirmations:', error)
      throw error
    }
  }
  
  const bulkToggleActive = async (projectId, affirmationIds, activeState, options = {}) => {
    console.log('🔄 Bulk toggling affirmations:', { projectId, count: affirmationIds.length, activeState })
    
    try {
      // 1. Get current project data
      const currentProject = options.currentProject
      if (!currentProject) {
        throw new Error('Current project data is required')
      }
      
      // 2. Update multiple affirmations
      const updatedAffirmations = currentProject.affirmations.map(aff => 
        affirmationIds.includes(aff.id)
          ? { ...aff, isActive: activeState, updatedAt: new Date().toISOString() }
          : aff
      )
      
      await updateProject(projectId, { affirmations: updatedAffirmations })
      
      console.log('✅ Bulk toggle completed successfully')
      return {
        success: true,
        updatedAffirmations,
        affectedCount: affirmationIds.length
      }
      
    } catch (error) {
      console.error('❌ Failed to bulk toggle affirmations:', error)
      throw error
    }
  }
  
  // === UTILITY FUNCTIONS ===
  
  const getActiveAffirmations = (affirmations) => {
    return affirmations?.filter(aff => aff.isActive !== false) || []
  }
  
  const getAffirmationStats = (affirmations) => {
    if (!affirmations || !Array.isArray(affirmations)) {
      return { total: 0, active: 0, inactive: 0 }
    }
    
    const total = affirmations.length
    const active = affirmations.filter(aff => aff.isActive !== false).length
    const inactive = total - active
    
    return { total, active, inactive }
  }
  
  const findAffirmationById = (affirmations, affirmationId) => {
    return affirmations?.find(aff => aff.id === affirmationId) || null
  }
  
  return {
    // CRUD operations
    createAffirmation,
    updateAffirmation,
    deleteAffirmation,
    toggleAffirmationActive,
    
    // Batch operations
    reorderAffirmations,
    bulkToggleActive,
    
    // Utility functions
    getActiveAffirmations,
    getAffirmationStats,
    findAffirmationById,
    
    // Validation
    validateAffirmationText,
    validateAffirmationData,
    
    // Access to underlying managers (for advanced usage)
    audioManager
  }
}