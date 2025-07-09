import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore'

export const useUserProfile = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()
  
  const userProfile = ref(null)
  const loading = ref(true)
  const error = ref('')

  const userProfileRef = computed(() => 
    user.value ? doc($firebase.db, 'user_profiles', user.value.uid) : null
  )

  const initializeUserProfile = async () => {
    if (!user.value || !$firebase?.db) {
      loading.value = false
      return
    }

    try {
      const docSnap = await getDoc(userProfileRef.value)
      
      if (docSnap.exists()) {
        userProfile.value = docSnap.data()
      } else {
        userProfile.value = {
          userId: user.value.uid,
          email: user.value.email,
          language: 'en',
          preferences: {
            theme: 'light',
            notifications: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await setDoc(userProfileRef.value, userProfile.value)
      }
    } catch (err) {
      error.value = 'Error loading user profile'
      console.error('User profile error:', err)
    } finally {
      loading.value = false
    }
  }

  const subscribeToUserProfile = () => {
    if (!userProfileRef.value) {
      return () => {}
    }

    return onSnapshot(userProfileRef.value, (doc) => {
      if (doc.exists()) {
        userProfile.value = doc.data()
      }
      loading.value = false
    }, (error) => {
      console.error('User profile subscription error:', error)
      loading.value = false
    })
  }

  const updateUserProfile = async (updates) => {
    if (!user.value || !userProfileRef.value) {
      throw new Error('User not authenticated')
    }

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(userProfileRef.value, updatedData)
      
      userProfile.value = {
        ...userProfile.value,
        ...updatedData
      }
    } catch (err) {
      error.value = 'Error updating user profile'
      throw err
    }
  }

  const updateLanguage = async (language) => {
    await updateUserProfile({ language })
  }

  const getUserLanguage = () => {
    return userProfile.value?.language || 'en'
  }

  watch(user, (newUser) => {
    if (newUser) {
      initializeUserProfile()
    } else {
      userProfile.value = null
      loading.value = false
    }
  }, { immediate: true })

  return {
    userProfile: readonly(userProfile),
    loading: readonly(loading),
    error: readonly(error),
    initializeUserProfile,
    subscribeToUserProfile,
    updateUserProfile,
    updateLanguage,
    getUserLanguage
  }
}