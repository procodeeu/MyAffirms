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
    watch(userProfile, (newProfile) => {
      if (newProfile && newProfile.language) {
        if (newProfile.language !== locale.value) {
          setLocale(newProfile.language)
        }
      }
    }, { immediate: true })
  }

  return {
    initializeLanguage,
    subscribeToLanguageChanges
  }
}