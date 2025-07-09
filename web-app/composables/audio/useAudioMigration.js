// Audio Migration - pomocnik do migracji ze starego systemu
export const useAudioMigration = () => {
  const { modules } = useAudioManager()

  // Sprawdź czy projekt wymaga migracji
  const checkProjectMigrationNeeded = (project) => {
    if (!project?.affirmations) {
      return { needed: false, affirmationsToMigrate: [] }
    }

    const affirmationsToMigrate = project.affirmations.filter(aff => 
      !aff.sentenceIds || aff.sentenceIds.length === 0
    )

    return {
      needed: affirmationsToMigrate.length > 0,
      affirmationsToMigrate,
      total: project.affirmations.length,
      migrated: project.affirmations.length - affirmationsToMigrate.length
    }
  }

  // Migruj cały projekt do nowego formatu
  const migrateProject = async (project, voiceId, onProgress = null) => {
    const migrationCheck = checkProjectMigrationNeeded(project)
    
    if (!migrationCheck.needed) {
      console.log('✅ Project already migrated:', project.id)
      return { success: true, migrated: 0, errors: 0 }
    }

    console.log(`🔄 Starting migration for project: ${project.id}`)
    console.log(`📊 ${migrationCheck.affirmationsToMigrate.length}/${migrationCheck.total} affirmations need migration`)

    let migrated = 0
    let errors = 0
    const migratedAffirmations = [...project.affirmations]

    for (let i = 0; i < migrationCheck.affirmationsToMigrate.length; i++) {
      const affirmation = migrationCheck.affirmationsToMigrate[i]
      
      try {
        console.log(`🔄 Migrating affirmation ${i + 1}/${migrationCheck.affirmationsToMigrate.length}: ${affirmation.id}`)
        
        const result = await modules.generation.generateSentenceAudio(
          affirmation.id, 
          affirmation.text, 
          voiceId
        )

        if (result && result.length > 0) {
          // Zaktualizuj afirmację w kopii
          const affIndex = migratedAffirmations.findIndex(a => a.id === affirmation.id)
          if (affIndex !== -1) {
            migratedAffirmations[affIndex] = {
              ...migratedAffirmations[affIndex],
              sentenceIds: result,
              sentenceCount: result.length
            }
          }

          migrated++
          console.log(`✅ Migrated affirmation: ${affirmation.id} (${result.length} sentences)`)
        } else {
          throw new Error('No sentence IDs generated')
        }

        // Callback dla progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: migrationCheck.affirmationsToMigrate.length,
            affirmationId: affirmation.id,
            success: true
          })
        }

        // Małe opóźnienie między migracjami
        await new Promise(resolve => setTimeout(resolve, 300))

      } catch (error) {
        console.error(`❌ Failed to migrate affirmation ${affirmation.id}:`, error)
        errors++

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: migrationCheck.affirmationsToMigrate.length,
            affirmationId: affirmation.id,
            success: false,
            error: error.message
          })
        }
      }
    }

    console.log(`🏁 Migration completed: ${migrated} migrated, ${errors} errors`)

    return {
      success: errors === 0,
      migrated,
      errors,
      migratedProject: {
        ...project,
        affirmations: migratedAffirmations
      }
    }
  }

  // Cleanup starych plików audio (główne audio afirmacji)
  const cleanupLegacyAudio = async (project) => {
    if (!project?.affirmations) {
      return { deleted: 0, errors: 0 }
    }

    console.log('🧹 Cleaning up legacy audio files for project:', project.id)

    const legacyAudioIds = project.affirmations.map(aff => aff.id) // Główne audio afirmacji
    
    try {
      const result = await modules.storage.deleteBatchAudio(legacyAudioIds)
      console.log(`✅ Legacy cleanup completed: ${result.deleted} deleted, ${result.errors} errors`)
      return result
    } catch (error) {
      console.error('❌ Legacy cleanup failed:', error)
      throw error
    }
  }

  // Sprawdź czy istnieją orphaned audio files
  const findOrphanedAudio = async (project) => {
    if (!project?.affirmations) {
      return { orphaned: [], total: 0 }
    }

    console.log('🔍 Searching for orphaned audio files in project:', project.id)

    // Zbierz wszystkie oczekiwane sentence IDs
    const expectedIds = new Set()
    for (const affirmation of project.affirmations) {
      if (affirmation.sentenceIds) {
        affirmation.sentenceIds.forEach(id => expectedIds.add(id))
      }
    }

    // Sprawdź czy istnieją dodatkowe pliki
    const orphaned = []
    
    // Sprawdź potencjalne legacy audio (główne audio afirmacji)
    for (const affirmation of project.affirmations) {
      const legacyId = affirmation.id
      const exists = await modules.storage.audioExists(legacyId)
      if (exists) {
        orphaned.push({
          id: legacyId,
          type: 'legacy_main_audio',
          affirmationId: affirmation.id
        })
      }
    }

    // Sprawdź potencjalne orphaned sentence audio
    for (const affirmation of project.affirmations) {
      for (let i = 0; i < 20; i++) {
        const sentenceId = `${affirmation.id}_sentence_${i}`
        
        if (!expectedIds.has(sentenceId)) {
          const exists = await modules.storage.audioExists(sentenceId)
          if (exists) {
            orphaned.push({
              id: sentenceId,
              type: 'orphaned_sentence_audio',
              affirmationId: affirmation.id,
              sentenceIndex: i
            })
          }
        }
      }
    }

    console.log(`🔍 Found ${orphaned.length} orphaned audio files`)
    return { orphaned, total: orphaned.length }
  }

  // Usuń orphaned audio files
  const cleanupOrphanedAudio = async (project) => {
    const orphanedResult = await findOrphanedAudio(project)
    
    if (orphanedResult.total === 0) {
      console.log('✅ No orphaned audio files found')
      return { deleted: 0, errors: 0 }
    }

    console.log(`🧹 Cleaning up ${orphanedResult.total} orphaned audio files`)

    const orphanedIds = orphanedResult.orphaned.map(item => item.id)
    
    try {
      const result = await modules.storage.deleteBatchAudio(orphanedIds)
      console.log(`✅ Orphaned cleanup completed: ${result.deleted} deleted, ${result.errors} errors`)
      return result
    } catch (error) {
      console.error('❌ Orphaned cleanup failed:', error)
      throw error
    }
  }

  return {
    // Migration checks
    checkProjectMigrationNeeded,

    // Migration operations
    migrateProject,

    // Cleanup operations
    cleanupLegacyAudio,
    findOrphanedAudio,
    cleanupOrphanedAudio
  }
}