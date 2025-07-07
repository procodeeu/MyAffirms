// Project Manager - zarządzanie projektami (business logic + JSON import)
import { useFirestore } from './useFirestore'
import { useAudioManager } from './useAudioManager'

export const useProjectManager = () => {
  const { 
    createProject: firestoreCreateProject,
    updateProject: firestoreUpdateProject,
    deleteProject: firestoreDeleteProject
  } = useFirestore()
  
  const audioManager = useAudioManager()
  
  // === VALIDATION ===
  
  const validateProjectName = (name) => {
    if (!name || !name.trim()) {
      throw new Error('Project name is required')
    }
    
    const trimmedName = name.trim()
    
    if (trimmedName.length < 2) {
      throw new Error('Project name must be at least 2 characters long')
    }
    
    if (trimmedName.length > 100) {
      throw new Error('Project name must be less than 100 characters')
    }
    
    return trimmedName
  }
  
  const validateProjectData = (projectData) => {
    if (!projectData.name) {
      throw new Error('Project name is required')
    }
    
    validateProjectName(projectData.name)
    
    if (projectData.affirmations && !Array.isArray(projectData.affirmations)) {
      throw new Error('Affirmations must be an array')
    }
    
    // Validate affirmations if provided
    if (projectData.affirmations) {
      projectData.affirmations.forEach((aff, index) => {
        if (!aff.text || typeof aff.text !== 'string') {
          throw new Error(`Affirmation ${index + 1}: text is required`)
        }
        if (aff.text.trim().length < 3) {
          throw new Error(`Affirmation ${index + 1}: text must be at least 3 characters`)
        }
        if (aff.text.trim().length > 1000) {
          throw new Error(`Affirmation ${index + 1}: text must be less than 1000 characters`)
        }
      })
    }
    
    return true
  }
  
  // === JSON VALIDATION ===
  
  const validateJsonData = (jsonData) => {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('Invalid JSON data')
    }
    
    // Check if it's multiple projects format
    if (jsonData.projects && Array.isArray(jsonData.projects)) {
      // Validate multiple projects format
      for (let i = 0; i < jsonData.projects.length; i++) {
        const project = jsonData.projects[i]
        if (!project.projectName || typeof project.projectName !== 'string') {
          throw new Error(`Project ${i + 1}: missing or invalid "projectName" field`)
        }
        
        if (!Array.isArray(project.affirmations)) {
          throw new Error(`Project ${i + 1}: "affirmations" must be an array`)
        }
        
        for (let j = 0; j < project.affirmations.length; j++) {
          const aff = project.affirmations[j]
          if (!aff.text || typeof aff.text !== 'string') {
            throw new Error(`Project ${i + 1}, affirmation ${j + 1}: missing "text" field`)
          }
          if (aff.isActive !== undefined && typeof aff.isActive !== 'boolean') {
            throw new Error(`Project ${i + 1}, affirmation ${j + 1}: "isActive" must be boolean`)
          }
        }
      }
    } else {
      // Validate single project format
      if (!jsonData.projectName || typeof jsonData.projectName !== 'string') {
        throw new Error('Missing required "projectName" field')
      }
      
      if (!Array.isArray(jsonData.affirmations)) {
        throw new Error('"affirmations" must be an array')
      }
      
      for (let i = 0; i < jsonData.affirmations.length; i++) {
        const aff = jsonData.affirmations[i]
        if (!aff.text || typeof aff.text !== 'string') {
          throw new Error(`Affirmation ${i + 1}: missing "text" field`)
        }
        if (aff.isActive !== undefined && typeof aff.isActive !== 'boolean') {
          throw new Error(`Affirmation ${i + 1}: "isActive" must be boolean`)
        }
      }
    }
    
    return true
  }
  
  // === PROJECT CRUD OPERATIONS ===
  
  const createProject = async (projectData, options = {}) => {
    console.log('➕ Creating new project:', { name: projectData.name, affirmationsCount: projectData.affirmations?.length || 0 })
    
    try {
      // 1. Validate input
      validateProjectData(projectData)
      
      // 2. Create project object
      const newProject = {
        name: validateProjectName(projectData.name),
        affirmations: projectData.affirmations || [],
        userId: options.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...projectData.additionalFields
      }
      
      // Generate unique IDs for affirmations
      newProject.affirmations = newProject.affirmations.map((aff, index) => ({
        id: `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
        text: aff.text.trim(),
        isActive: aff.isActive !== undefined ? aff.isActive : true,
        createdAt: new Date().toISOString(),
        ...aff
      }))
      
      // 3. Save to Firestore
      let projectId
      try {
        projectId = await firestoreCreateProject({
          name: newProject.name,
          affirmations: newProject.affirmations
        })
        newProject.id = projectId
      } catch (firestoreError) {
        console.warn('⚠️ Firestore save failed, using local ID:', firestoreError)
        newProject.id = Date.now().toString()
        
        // Save to localStorage as fallback
        if (options.localStorageKey && options.userId) {
          const existingProjects = JSON.parse(localStorage.getItem(options.localStorageKey) || '[]')
          existingProjects.push(newProject)
          localStorage.setItem(options.localStorageKey, JSON.stringify(existingProjects))
        }
      }
      
      // 4. Generate audio if requested
      if (options.autoGenerateAudio && newProject.affirmations.length > 0) {
        console.log('🎵 Auto-generating audio for new project')
        
        // Generate audio in background
        setTimeout(async () => {
          try {
            await generateProjectAudio(newProject, options)
          } catch (audioError) {
            console.error('❌ Background audio generation failed:', audioError)
            if (options.onAudioError) {
              options.onAudioError(newProject.id, audioError)
            }
          }
        }, 100)
      }
      
      console.log('✅ Project created successfully:', projectId)
      return {
        success: true,
        project: newProject
      }
      
    } catch (error) {
      console.error('❌ Failed to create project:', error)
      throw error
    }
  }
  
  const updateProject = async (projectId, updateData, options = {}) => {
    console.log('📝 Updating project:', { projectId, updates: Object.keys(updateData) })
    
    try {
      // 1. Validate input
      if (!projectId) {
        throw new Error('Project ID is required')
      }
      
      if (updateData.name) {
        updateData.name = validateProjectName(updateData.name)
      }
      
      if (updateData.affirmations) {
        validateProjectData({ name: 'temp', affirmations: updateData.affirmations })
      }
      
      // 2. Add timestamp
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString()
      }
      
      // 3. Update in Firestore
      try {
        await firestoreUpdateProject(projectId, updatedData)
      } catch (firestoreError) {
        console.warn('⚠️ Firestore update failed:', firestoreError)
        
        // Update localStorage as fallback
        if (options.localStorageKey && options.userId) {
          const existingProjects = JSON.parse(localStorage.getItem(options.localStorageKey) || '[]')
          const projectIndex = existingProjects.findIndex(p => p.id === projectId)
          if (projectIndex !== -1) {
            existingProjects[projectIndex] = { ...existingProjects[projectIndex], ...updatedData }
            localStorage.setItem(options.localStorageKey, JSON.stringify(existingProjects))
          }
        }
      }
      
      console.log('✅ Project updated successfully:', projectId)
      return {
        success: true,
        projectId,
        updatedData
      }
      
    } catch (error) {
      console.error('❌ Failed to update project:', error)
      throw error
    }
  }
  
  const deleteProject = async (projectId, options = {}) => {
    console.log('🗑️ Deleting project:', { projectId })
    
    try {
      // 1. Validate input
      if (!projectId) {
        throw new Error('Project ID is required')
      }
      
      // 2. Delete associated audio first
      if (options.projectData?.affirmations) {
        try {
          await audioManager.deleteProjectAudio(options.projectData.affirmations)
          console.log('✅ Project audio deleted')
        } catch (audioError) {
          console.warn('⚠️ Failed to delete project audio (continuing anyway):', audioError)
        }
      }
      
      // 3. Delete from Firestore
      try {
        await firestoreDeleteProject(projectId)
      } catch (firestoreError) {
        console.warn('⚠️ Firestore delete failed:', firestoreError)
        
        // Remove from localStorage as fallback
        if (options.localStorageKey && options.userId) {
          const existingProjects = JSON.parse(localStorage.getItem(options.localStorageKey) || '[]')
          const filteredProjects = existingProjects.filter(p => p.id !== projectId)
          localStorage.setItem(options.localStorageKey, JSON.stringify(filteredProjects))
        }
      }
      
      console.log('✅ Project deleted successfully:', projectId)
      return {
        success: true,
        projectId
      }
      
    } catch (error) {
      console.error('❌ Failed to delete project:', error)
      throw error
    }
  }
  
  const copyProject = async (originalProject, options = {}) => {
    console.log('📋 Copying project:', { originalId: originalProject.id, name: originalProject.name })
    
    try {
      // 1. Create copied project data
      const copiedProject = {
        name: `${originalProject.name} ${options.copySuffix || '(Copy)'}`,
        affirmations: originalProject.affirmations ? [...originalProject.affirmations].map(affirmation => ({
          ...affirmation,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          createdAt: new Date().toISOString()
        })) : [],
        userId: options.userId,
        sessionSettings: originalProject.sessionSettings // Copy session settings
      }
      
      // 2. Create the copied project
      const result = await createProject(copiedProject, {
        ...options,
        autoGenerateAudio: options.autoGenerateAudio !== false // Default to true
      })
      
      console.log('✅ Project copied successfully:', result.project.id)
      return result
      
    } catch (error) {
      console.error('❌ Failed to copy project:', error)
      throw error
    }
  }
  
  // === JSON IMPORT OPERATIONS ===
  
  const importFromJson = async (jsonText, options = {}) => {
    console.log('📥 Importing projects from JSON')
    
    try {
      // 1. Parse JSON
      const jsonData = JSON.parse(jsonText)
      
      // 2. Validate JSON structure
      validateJsonData(jsonData)
      
      // 3. Convert to project format
      const projectsToImport = []
      
      if (jsonData.projects && Array.isArray(jsonData.projects)) {
        // Multiple projects format
        for (let i = 0; i < jsonData.projects.length; i++) {
          const projectData = jsonData.projects[i]
          projectsToImport.push({
            name: projectData.projectName,
            affirmations: projectData.affirmations.map(aff => ({
              text: aff.text,
              isActive: aff.isActive !== undefined ? aff.isActive : true
            }))
          })
        }
      } else {
        // Single project format
        projectsToImport.push({
          name: jsonData.projectName,
          affirmations: jsonData.affirmations.map(aff => ({
            text: aff.text,
            isActive: aff.isActive !== undefined ? aff.isActive : true
          }))
        })
      }
      
      // 4. Create projects
      const importResults = []
      for (let i = 0; i < projectsToImport.length; i++) {
        const projectData = projectsToImport[i]
        
        try {
          const result = await createProject(projectData, {
            ...options,
            autoGenerateAudio: options.autoGenerateAudio !== false // Default to true
          })
          
          importResults.push({
            success: true,
            project: result.project,
            originalData: projectData
          })
          
        } catch (error) {
          console.error(`❌ Failed to import project ${i + 1}:`, error)
          importResults.push({
            success: false,
            error: error.message,
            originalData: projectData
          })
        }
      }
      
      const successCount = importResults.filter(r => r.success).length
      const errorCount = importResults.length - successCount
      
      console.log(`✅ JSON import completed: ${successCount} success, ${errorCount} errors`)
      
      return {
        success: errorCount === 0,
        results: importResults,
        successCount,
        errorCount,
        projects: importResults.filter(r => r.success).map(r => r.project)
      }
      
    } catch (error) {
      console.error('❌ Failed to import from JSON:', error)
      throw error
    }
  }
  
  const validateJsonText = (jsonText) => {
    if (!jsonText || !jsonText.trim()) {
      return { isValid: false, error: 'JSON text is empty' }
    }
    
    try {
      const parsed = JSON.parse(jsonText)
      validateJsonData(parsed)
      return { isValid: true, error: null }
    } catch (error) {
      return { isValid: false, error: error.message }
    }
  }
  
  // === AUDIO GENERATION ===
  
  const generateProjectAudio = async (project, options = {}) => {
    console.log('🎵 Generating audio for project:', project.name)
    
    try {
      if (!project.affirmations || project.affirmations.length === 0) {
        console.log('⚠️ No affirmations to generate audio for')
        return { success: true, generatedCount: 0 }
      }
      
      const voiceId = options.voiceId || 'pl-PL-ZofiaStandard'
      
      // Use Audio Manager to generate audio for all affirmations
      const result = await audioManager.createProjectAudio(project.affirmations, voiceId)
      
      console.log(`✅ Audio generation completed for project: ${result.success} success, ${result.errors} errors`)
      
      if (options.onAudioGenerated) {
        options.onAudioGenerated(project.id, result)
      }
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to generate project audio:', error)
      if (options.onAudioError) {
        options.onAudioError(project.id, error)
      }
      throw error
    }
  }
  
  // === UTILITY FUNCTIONS ===
  
  const getProjectStats = (project) => {
    const affirmations = project.affirmations || []
    const activeAffirmations = affirmations.filter(aff => aff.isActive !== false)
    
    return {
      totalAffirmations: affirmations.length,
      activeAffirmations: activeAffirmations.length,
      inactiveAffirmations: affirmations.length - activeAffirmations.length,
      hasAffirmations: affirmations.length > 0,
      canStartSession: activeAffirmations.length > 0
    }
  }
  
  const getDefaultProjectName = (existingProjects = []) => {
    const count = existingProjects.length + 1
    return `Project ${count}`
  }
  
  const findProjectById = (projects, projectId) => {
    return projects?.find(project => project.id === projectId) || null
  }
  
  const validateProjectForSession = (project) => {
    const stats = getProjectStats(project)
    
    return {
      isValid: stats.canStartSession,
      issues: stats.canStartSession ? [] : ['No active affirmations in project'],
      stats
    }
  }
  
  const mergeProjectData = (firestoreProject, localProject) => {
    // Merge Firestore data with local data (like session settings)
    return {
      ...firestoreProject,
      sessionSettings: localProject?.sessionSettings || firestoreProject.sessionSettings
    }
  }
  
  // === JSON EXAMPLES ===
  
  const getJsonExamples = () => {
    return {
      singleProject: {
        projectName: "My New Project",
        affirmations: [
          {
            text: "I am calm and confident",
            isActive: true
          },
          {
            text: "I have the strength to take action",
            isActive: true
          }
        ]
      },
      multipleProjects: {
        projects: [
          {
            projectName: "Project 1",
            affirmations: [
              {
                text: "First affirmation",
                isActive: true
              }
            ]
          },
          {
            projectName: "Project 2",
            affirmations: [
              {
                text: "Second affirmation",
                isActive: true
              }
            ]
          }
        ]
      }
    }
  }
  
  return {
    // CRUD operations
    createProject,
    updateProject,
    deleteProject,
    copyProject,
    
    // JSON import/export
    importFromJson,
    validateJsonText,
    getJsonExamples,
    
    // Audio generation
    generateProjectAudio,
    
    // Utility functions
    getProjectStats,
    getDefaultProjectName,
    findProjectById,
    validateProjectForSession,
    mergeProjectData,
    
    // Validation
    validateProjectName,
    validateProjectData,
    validateJsonData,
    
    // Access to underlying managers
    audioManager
  }
}