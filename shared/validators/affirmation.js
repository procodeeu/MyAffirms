// Affirmation validation utilities
export const validateAffirmationText = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Affirmation text is required and must be a string')
  }
  
  const trimmedText = text.trim()
  
  if (trimmedText.length < 3) {
    throw new Error('Affirmation text must be at least 3 characters long')
  }
  
  if (trimmedText.length > 1000) {
    throw new Error('Affirmation text must be less than 1000 characters')
  }
  
  // Check for potentially harmful content
  const forbiddenPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i
  ]
  
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(trimmedText)) {
      throw new Error('Affirmation text contains forbidden content')
    }
  }
  
  return trimmedText
}

export const validateAffirmationData = (affirmationData) => {
  if (!affirmationData || typeof affirmationData !== 'object') {
    throw new Error('Affirmation data must be an object')
  }
  
  if (!affirmationData.id) {
    throw new Error('Affirmation ID is required')
  }
  
  validateAffirmationText(affirmationData.text)
  
  return true
}