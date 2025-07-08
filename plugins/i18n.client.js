import pl from '~/locales/pl.json'
import en from '~/locales/en.json'

export default defineNuxtPlugin(async ({ $i18n }) => {
  $i18n.setLocaleMessage('pl', pl)
  $i18n.setLocaleMessage('en', en)
  
  // Safely try to get user language without breaking if auth isn't ready
  try {
    const { user } = useAuth()
    const { getUserLanguage, userProfile } = useUserProfile()
    
    // Only set language if user and profile are available
    if (user.value && userProfile.value) {
      const savedLanguage = getUserLanguage()
      if (savedLanguage && savedLanguage !== $i18n.locale.value) {
        $i18n.setLocale(savedLanguage)
      }
    }
  } catch (error) {
    // Auth not ready yet, that's fine - will be handled later
    console.log('Auth not ready during i18n plugin initialization')
  }
})
