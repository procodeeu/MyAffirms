import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore'

export const usePremium = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()
  
  const premiumStatus = ref(null)
  const loading = ref(true)
  const error = ref('')

  const userPremiumRef = computed(() => 
    user.value ? doc($firebase.db, 'premium_users', user.value.uid) : null
  )

  const initializePremiumStatus = async () => {
    if (!user.value || !$firebase?.db) {
      loading.value = false
      return
    }

    try {
      const docSnap = await getDoc(userPremiumRef.value)
      
      if (docSnap.exists()) {
        premiumStatus.value = docSnap.data()
      } else {
        premiumStatus.value = {
          isPremium: false,
          plan: 'free',
          subscriptionId: null,
          subscriptionStatus: null,
          subscriptionStart: null,
          subscriptionEnd: null,
          features: {
            aiTts: false,
            unlimitedProjects: false,
            advancedAnalytics: false,
            prioritySupport: false
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await setDoc(userPremiumRef.value, premiumStatus.value)
      }
    } catch (err) {
      error.value = 'Błąd podczas pobierania statusu premium'
      console.error('Premium status error:', err)
    } finally {
      loading.value = false
    }
  }

  const subscribeToPremiumStatus = () => {
    if (!userPremiumRef.value) {
      return () => {}
    }

    return onSnapshot(userPremiumRef.value, (doc) => {
      if (doc.exists()) {
        premiumStatus.value = doc.data()
      }
      loading.value = false
    }, (error) => {
      console.error('Premium subscription error:', error)
      loading.value = false
    })
  }

  const updatePremiumStatus = async (updates) => {
    if (!user.value || !userPremiumRef.value) {
      throw new Error('User not authenticated')
    }

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(userPremiumRef.value, updatedData)
      
      premiumStatus.value = {
        ...premiumStatus.value,
        ...updatedData
      }
    } catch (err) {
      error.value = 'Błąd podczas aktualizacji statusu premium'
      throw err
    }
  }

  const grantPremium = async (plan = 'premium', duration = 'monthly') => {
    const now = new Date()
    const endDate = new Date(now)
    
    if (duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (duration === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    const premiumData = {
      isPremium: true,
      plan,
      subscriptionStatus: 'active',
      subscriptionStart: now.toISOString(),
      subscriptionEnd: endDate.toISOString(),
      features: {
        aiTts: true,
        unlimitedProjects: true,
        advancedAnalytics: true,
        prioritySupport: true
      }
    }

    await updatePremiumStatus(premiumData)
  }

  const revokePremium = async () => {
    const freeData = {
      isPremium: false,
      plan: 'free',
      subscriptionStatus: 'cancelled',
      subscriptionEnd: new Date().toISOString(),
      features: {
        aiTts: false,
        unlimitedProjects: false,
        advancedAnalytics: false,
        prioritySupport: false
      }
    }

    await updatePremiumStatus(freeData)
  }

  const isPremiumActive = computed(() => {
    if (!premiumStatus.value) return false
    
    if (!premiumStatus.value.isPremium) return false
    
    if (premiumStatus.value.subscriptionEnd) {
      const endDate = new Date(premiumStatus.value.subscriptionEnd)
      const now = new Date()
      return endDate > now
    }
    
    return premiumStatus.value.subscriptionStatus === 'active'
  })

  const hasFeature = (feature) => {
    if (!premiumStatus.value) return false
    return premiumStatus.value.features?.[feature] || false
  }

  const getDaysUntilExpiry = () => {
    if (!premiumStatus.value?.subscriptionEnd) return null
    
    const endDate = new Date(premiumStatus.value.subscriptionEnd)
    const now = new Date()
    const diffTime = endDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  const isFeatureEnabled = (feature) => {
    return isPremiumActive.value && hasFeature(feature)
  }

  const getPremiumFeatures = () => {
    return [
      {
        key: 'aiTts',
        name: 'AI Text-to-Speech',
        description: 'Wysokiej jakości głosy AI zamiast standardowego TTS',
        enabled: isFeatureEnabled('aiTts')
      },
      {
        key: 'unlimitedProjects',
        name: 'Nieograniczone projekty',
        description: 'Twórz dowolną liczbę projektów i grup',
        enabled: isFeatureEnabled('unlimitedProjects')
      },
      {
        key: 'advancedAnalytics',
        name: 'Zaawansowane statystyki',
        description: 'Szczegółowe raporty i analiza postępów',
        enabled: isFeatureEnabled('advancedAnalytics')
      },
      {
        key: 'prioritySupport',
        name: 'Priorytetowe wsparcie',
        description: 'Szybsza pomoc techniczna i wsparcie',
        enabled: isFeatureEnabled('prioritySupport')
      }
    ]
  }

  watch(user, (newUser) => {
    if (newUser) {
      initializePremiumStatus()
    } else {
      premiumStatus.value = null
      loading.value = false
    }
  }, { immediate: true })

  return {
    premiumStatus: readonly(premiumStatus),
    loading: readonly(loading),
    error: readonly(error),
    isPremiumActive,
    hasFeature,
    isFeatureEnabled,
    getDaysUntilExpiry,
    getPremiumFeatures,
    initializePremiumStatus,
    subscribeToPremiumStatus,
    updatePremiumStatus,
    grantPremium,
    revokePremium
  }
}