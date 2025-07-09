// Project validation utilities
export const validateProjectData = (projectData) => {
  if (!projectData || typeof projectData !== 'object') {
    throw new Error('Project data must be an object')
  }
  
  if (!projectData.name || typeof projectData.name !== 'string') {
    throw new Error('Project name is required and must be a string')
  }
  
  const trimmedName = projectData.name.trim()
  
  if (trimmedName.length < 1) {
    throw new Error('Project name cannot be empty')
  }
  
  if (trimmedName.length > 100) {
    throw new Error('Project name must be less than 100 characters')
  }
  
  // Validate affirmations if present
  if (projectData.affirmations && Array.isArray(projectData.affirmations)) {
    if (projectData.affirmations.length > 1000) {
      throw new Error('Project cannot have more than 1000 affirmations')
    }
  }
  
  return {
    ...projectData,
    name: trimmedName
  }
}

export const validateGroupData = (groupData) => {
  if (!groupData || typeof groupData !== 'object') {
    throw new Error('Group data must be an object')
  }
  
  if (!groupData.name || typeof groupData.name !== 'string') {
    throw new Error('Group name is required and must be a string')
  }
  
  const trimmedName = groupData.name.trim()
  
  if (trimmedName.length < 1) {
    throw new Error('Group name cannot be empty')
  }
  
  if (trimmedName.length > 100) {
    throw new Error('Group name must be less than 100 characters')
  }
  
  return {
    ...groupData,
    name: trimmedName
  }
}