export const useI18nInit = () => {
  const { locale, setLocale } = useI18n()
  const { user } = useAuth()
  const { userProfile, getUserLanguage } = useUserProfile()

  const initializeLanguage = () => {
    if (user.value && userProfile.value) {
      const savedLanguage = getUserLanguage()
      if (savedLanguage && savedLanguage !== locale.value) {
        console.log('🔄 Initializing language from profile:', savedLanguage)
        setLocale(savedLanguage)
      }
    }
  }

  const subscribeToLanguageChanges = () => {
    // Watch for user profile changes and sync language
    watch(userProfile, (newProfile) => {
      if (newProfile && newProfile.language) {
        if (newProfile.language !== locale.value) {
          console.log('🔄 Syncing language from profile change:', newProfile.language)
          setLocale(newProfile.language)
        }
      }
    }, { immediate: true })

    // Also watch for user changes and initialize language
    watch(user, async (newUser) => {
      if (newUser) {
        // Wait a bit for user profile to load
        await new Promise(resolve => setTimeout(resolve, 500))
        initializeLanguage()
      }
    }, { immediate: true })
  }

  const ensureLanguageSync = () => {
    // Try to load language from localStorage first for instant loading
    const cachedLanguage = process.client ? localStorage.getItem('user_language') : null
    if (cachedLanguage && cachedLanguage !== locale.value) {
      console.log('🚀 Quick language restore from localStorage:', cachedLanguage)
      setLocale(cachedLanguage)
    }
    
    // Force sync language on page load
    console.log('🔍 ensureLanguageSync called')
    
    const trySync = (attempt = 1) => {
      console.log(`🔍 Sync attempt ${attempt}`)
      console.log('🔍 User:', !!user.value, user.value?.uid)
      console.log('🔍 UserProfile:', !!userProfile.value, userProfile.value?.language)
      console.log('🔍 Current locale:', locale.value)
      
      if (user.value && userProfile.value) {
        const userLanguage = getUserLanguage()
        console.log('🔍 User language from profile:', userLanguage)
        if (userLanguage && userLanguage !== locale.value) {
          console.log('🔄 Ensuring language sync:', userLanguage)
          setLocale(userLanguage)
          // Cache in localStorage for next time
          if (process.client) {
            localStorage.setItem('user_language', userLanguage)
          }
          return true // Success
        } else {
          console.log('🔍 No sync needed - same language or no user language')
          // Update cache if needed
          if (process.client && userLanguage) {
            localStorage.setItem('user_language', userLanguage)
          }
          return true // No sync needed, but user data is available
        }
      } else {
        console.log('🔍 Cannot sync - user or profile not available')
        
        // Retry up to 3 times with shorter delays since we have localStorage cache
        if (attempt < 3) {
          const delay = attempt * 300 // 300ms, 600ms
          console.log(`🔍 Retrying language sync in ${delay}ms... (attempt ${attempt + 1}/3)`)
          setTimeout(() => trySync(attempt + 1), delay)
        } else {
          console.log('🔍 Language sync failed after 3 attempts')
        }
        return false
      }
    }
    
    nextTick(() => trySync())
  }

  return {
    initializeLanguage,
    subscribeToLanguageChanges,
    ensureLanguageSync
  }
}