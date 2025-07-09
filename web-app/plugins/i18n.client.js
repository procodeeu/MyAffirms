import pl from '~/locales/pl.json'
import en from '~/locales/en.json'

export default defineNuxtPlugin(async ({ $i18n }) => {
  $i18n.setLocaleMessage('pl', pl)
  $i18n.setLocaleMessage('en', en)
  
  const { user } = useAuth()
  const { getUserLanguage, userProfile } = useUserProfile()
  
  if (user.value && userProfile.value) {
    const savedLanguage = getUserLanguage()
    if (savedLanguage && savedLanguage !== $i18n.locale.value) {
      $i18n.setLocale(savedLanguage)
    }
  }
})
