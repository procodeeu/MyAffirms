// Group Manager - zarządzanie grupami projektów (business logic)
import { useFirestore } from '@my-affirms/shared'

export const useGroupManager = () => {
  const { 
    createGroup: firestoreCreateGroup,
    updateGroup: firestoreUpdateGroup,
    deleteGroup: firestoreDeleteGroup,
    addProjectToGroup: firestoreAddProjectToGroup,
    removeProjectFromGroup: firestoreRemoveProjectFromGroup
  } = useFirestore()
  
  // === VALIDATION ===
  
  const validateGroupName = (name) => {
    if (!name || !name.trim()) {
      throw new Error('Group name is required')
    }
    
    const trimmedName = name.trim()
    
    if (trimmedName.length < 2) {
      throw new Error('Group name must be at least 2 characters long')
    }
    
    if (trimmedName.length > 100) {
      throw new Error('Group name must be less than 100 characters')
    }
    
    return trimmedName
  }
  
  const validateGroupData = (groupData) => {
    if (!groupData.name) {
      throw new Error('Group name is required')
    }
    
    validateGroupName(groupData.name)
    
    if (groupData.projectIds && !Array.isArray(groupData.projectIds)) {
      throw new Error('Project IDs must be an array')
    }
    
    return true
  }
  
  const validateProjectIds = (projectIds, availableProjects = []) => {
    if (!Array.isArray(projectIds)) {
      throw new Error('Project IDs must be an array')
    }
    
    // Check if all project IDs exist in available projects
    const availableProjectIds = availableProjects.map(p => p.id)
    const invalidIds = projectIds.filter(id => !availableProjectIds.includes(id))
    
    if (invalidIds.length > 0) {
      throw new Error(`Invalid project IDs: ${invalidIds.join(', ')}`)
    }
    
    return true
  }
  
  // === GROUP CRUD OPERATIONS ===
  
  const createGroup = async (groupData, options = {}) => {
    console.log('➕ Creating new group:', { name: groupData.name, projectCount: groupData.projectIds?.length || 0 })
    
    try {
      // 1. Validate input
      validateGroupData(groupData)
      
      if (groupData.projectIds && options.availableProjects) {
        validateProjectIds(groupData.projectIds, options.availableProjects)
      }
      
      // 2. Create group object
      const newGroup = {
        name: validateGroupName(groupData.name),
        projectIds: groupData.projectIds || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...groupData.additionalFields
      }
      
      // 3. Save to Firestore
      const groupId = await firestoreCreateGroup(newGroup)
      newGroup.id = groupId
      
      console.log('✅ Group created successfully:', groupId)
      return {
        success: true,
        group: newGroup
      }
      
    } catch (error) {
      console.error('❌ Failed to create group:', error)
      throw error
    }
  }
  
  const updateGroup = async (groupId, updateData, options = {}) => {
    console.log('📝 Updating group:', { groupId, updates: Object.keys(updateData) })
    
    try {
      // 1. Validate input
      if (!groupId) {
        throw new Error('Group ID is required')
      }
      
      if (updateData.name) {
        updateData.name = validateGroupName(updateData.name)
      }
      
      if (updateData.projectIds && options.availableProjects) {
        validateProjectIds(updateData.projectIds, options.availableProjects)
      }
      
      // 2. Add timestamp
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString()
      }
      
      // 3. Update in Firestore
      await firestoreUpdateGroup(groupId, updatedData)
      
      console.log('✅ Group updated successfully:', groupId)
      return {
        success: true,
        groupId,
        updatedData
      }
      
    } catch (error) {
      console.error('❌ Failed to update group:', error)
      throw error
    }
  }
  
  const deleteGroup = async (groupId, options = {}) => {
    console.log('🗑️ Deleting group:', { groupId })
    
    try {
      // 1. Validate input
      if (!groupId) {
        throw new Error('Group ID is required')
      }
      
      // 2. Delete from Firestore
      await firestoreDeleteGroup(groupId)
      
      console.log('✅ Group deleted successfully:', groupId)
      return {
        success: true,
        groupId
      }
      
    } catch (error) {
      console.error('❌ Failed to delete group:', error)
      throw error
    }
  }
  
  // === PROJECT-GROUP RELATIONSHIP MANAGEMENT ===
  
  const addProjectToGroup = async (groupId, projectId, options = {}) => {
    console.log('🔗 Adding project to group:', { groupId, projectId })
    
    try {
      // 1. Validate input
      if (!groupId || !projectId) {
        throw new Error('Group ID and Project ID are required')
      }
      
      if (options.availableProjects) {
        validateProjectIds([projectId], options.availableProjects)
      }
      
      // 2. Add to Firestore
      await firestoreAddProjectToGroup(groupId, projectId)
      
      console.log('✅ Project added to group successfully:', { groupId, projectId })
      return {
        success: true,
        groupId,
        projectId
      }
      
    } catch (error) {
      console.error('❌ Failed to add project to group:', error)
      throw error
    }
  }
  
  const removeProjectFromGroup = async (groupId, projectId, options = {}) => {
    console.log('🔗 Removing project from group:', { groupId, projectId })
    
    try {
      // 1. Validate input
      if (!groupId || !projectId) {
        throw new Error('Group ID and Project ID are required')
      }
      
      // 2. Remove from Firestore
      await firestoreRemoveProjectFromGroup(groupId, projectId)
      
      console.log('✅ Project removed from group successfully:', { groupId, projectId })
      return {
        success: true,
        groupId,
        projectId
      }
      
    } catch (error) {
      console.error('❌ Failed to remove project from group:', error)
      throw error
    }
  }
  
  // === BATCH OPERATIONS ===
  
  const addMultipleProjectsToGroup = async (groupId, projectIds, options = {}) => {
    console.log('🔗 Adding multiple projects to group:', { groupId, count: projectIds.length })
    
    try {
      // 1. Validate input
      if (!groupId || !Array.isArray(projectIds)) {
        throw new Error('Group ID and array of Project IDs are required')
      }
      
      if (options.availableProjects) {
        validateProjectIds(projectIds, options.availableProjects)
      }
      
      // 2. Add projects one by one (could be optimized with batch operations)
      const results = []
      for (const projectId of projectIds) {
        try {
          const result = await addProjectToGroup(groupId, projectId, options)
          results.push({ projectId, success: true })
        } catch (error) {
          console.error(`Failed to add project ${projectId} to group:`, error)
          results.push({ projectId, success: false, error: error.message })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const errorCount = results.length - successCount
      
      console.log(`✅ Batch add completed: ${successCount} success, ${errorCount} errors`)
      return {
        success: errorCount === 0,
        results,
        successCount,
        errorCount
      }
      
    } catch (error) {
      console.error('❌ Failed to add multiple projects to group:', error)
      throw error
    }
  }
  
  const removeMultipleProjectsFromGroup = async (groupId, projectIds, options = {}) => {
    console.log('🔗 Removing multiple projects from group:', { groupId, count: projectIds.length })
    
    try {
      // 1. Validate input
      if (!groupId || !Array.isArray(projectIds)) {
        throw new Error('Group ID and array of Project IDs are required')
      }
      
      // 2. Remove projects one by one
      const results = []
      for (const projectId of projectIds) {
        try {
          const result = await removeProjectFromGroup(groupId, projectId, options)
          results.push({ projectId, success: true })
        } catch (error) {
          console.error(`Failed to remove project ${projectId} from group:`, error)
          results.push({ projectId, success: false, error: error.message })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const errorCount = results.length - successCount
      
      console.log(`✅ Batch remove completed: ${successCount} success, ${errorCount} errors`)
      return {
        success: errorCount === 0,
        results,
        successCount,
        errorCount
      }
      
    } catch (error) {
      console.error('❌ Failed to remove multiple projects from group:', error)
      throw error
    }
  }
  
  const updateGroupProjects = async (groupId, newProjectIds, options = {}) => {
    console.log('🔄 Updating group projects:', { groupId, newCount: newProjectIds.length })
    
    try {
      // 1. Validate input
      if (!groupId || !Array.isArray(newProjectIds)) {
        throw new Error('Group ID and array of Project IDs are required')
      }
      
      if (options.availableProjects) {
        validateProjectIds(newProjectIds, options.availableProjects)
      }
      
      // 2. Update group with new project list
      const result = await updateGroup(groupId, { projectIds: newProjectIds }, options)
      
      console.log('✅ Group projects updated successfully:', groupId)
      return result
      
    } catch (error) {
      console.error('❌ Failed to update group projects:', error)
      throw error
    }
  }
  
  // === UTILITY FUNCTIONS ===
  
  const getGroupProjectsCount = (group) => {
    return group?.projectIds?.length || 0
  }
  
  const getGroupProjectNames = (group, availableProjects = []) => {
    if (!group?.projectIds) return []
    
    return group.projectIds
      .map(id => availableProjects.find(p => p.id === id)?.name)
      .filter(Boolean)
  }
  
  const getGroupProjects = (group, availableProjects = []) => {
    if (!group?.projectIds) return []
    
    return group.projectIds
      .map(id => availableProjects.find(p => p.id === id))
      .filter(Boolean)
  }
  
  const getProjectsNotInGroup = (group, availableProjects = []) => {
    const groupProjectIds = group?.projectIds || []
    return availableProjects.filter(project => !groupProjectIds.includes(project.id))
  }
  
  const getGroupStats = (group, availableProjects = []) => {
    const groupProjects = getGroupProjects(group, availableProjects)
    const totalAffirmations = groupProjects.reduce((sum, project) => {
      return sum + (project.affirmations?.length || 0)
    }, 0)
    
    const activeAffirmations = groupProjects.reduce((sum, project) => {
      const activeCount = project.affirmations?.filter(aff => aff.isActive !== false).length || 0
      return sum + activeCount
    }, 0)
    
    return {
      projectCount: groupProjects.length,
      totalAffirmations,
      activeAffirmations,
      projects: groupProjects
    }
  }
  
  const findGroupById = (groups, groupId) => {
    return groups?.find(group => group.id === groupId) || null
  }
  
  const findGroupsByProjectId = (groups, projectId) => {
    return groups?.filter(group => group.projectIds?.includes(projectId)) || []
  }
  
  const validateGroupForSession = (group, availableProjects = []) => {
    const groupProjects = getGroupProjects(group, availableProjects)
    const activeProjects = groupProjects.filter(project => 
      project.affirmations?.some(aff => aff.isActive !== false)
    )
    
    return {
      isValid: activeProjects.length > 0,
      projectCount: groupProjects.length,
      activeProjectCount: activeProjects.length,
      totalAffirmations: groupProjects.reduce((sum, p) => sum + (p.affirmations?.length || 0), 0),
      activeAffirmations: activeProjects.reduce((sum, p) => 
        sum + (p.affirmations?.filter(aff => aff.isActive !== false).length || 0), 0
      ),
      issues: activeProjects.length === 0 ? ['No active affirmations in group'] : []
    }
  }
  
  return {
    // CRUD operations
    createGroup,
    updateGroup,
    deleteGroup,
    
    // Project-Group relationships
    addProjectToGroup,
    removeProjectFromGroup,
    addMultipleProjectsToGroup,
    removeMultipleProjectsFromGroup,
    updateGroupProjects,
    
    // Utility functions
    getGroupProjectsCount,
    getGroupProjectNames,
    getGroupProjects,
    getProjectsNotInGroup,
    getGroupStats,
    findGroupById,
    findGroupsByProjectId,
    validateGroupForSession,
    
    // Validation
    validateGroupName,
    validateGroupData,
    validateProjectIds
  }
}