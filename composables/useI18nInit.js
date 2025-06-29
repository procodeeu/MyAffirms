export const useI18nInit = () => {
  const { locale, setLocale } = useI18n()
  const { user } = useAuth()
  const { userProfile, getUserLanguage } = useUserProfile()

  const initializeLanguage = () => {
    if (user.value && userProfile.value) {
      const savedLanguage = getUserLanguage()
      if (savedLanguage && savedLanguage !== locale.value) {
        setLocale(savedLanguage)
      }
    }
  }

  const subscribeToLanguageChanges = () => {
    // Watch for user profile changes and sync language
    watch(userProfile, (newProfile) => {
      if (newProfile && newProfile.language) {
        if (newProfile.language !== locale.value) {
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
      setLocale(cachedLanguage)
    }
    
    const trySync = (attempt = 1) => {
      if (user.value && userProfile.value) {
        const userLanguage = getUserLanguage()
        if (userLanguage && userLanguage !== locale.value) {
          setLocale(userLanguage)
          // Cache in localStorage for next time
          if (process.client) {
            localStorage.setItem('user_language', userLanguage)
          }
          return true // Success
        } else {
          // Update cache if needed
          if (process.client && userLanguage) {
            localStorage.setItem('user_language', userLanguage)
          }
          return true // No sync needed, but user data is available
        }
      } else {
        // Retry up to 3 times with shorter delays since we have localStorage cache
        if (attempt < 3) {
          const delay = attempt * 300 // 300ms, 600ms
          setTimeout(() => trySync(attempt + 1), delay)
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