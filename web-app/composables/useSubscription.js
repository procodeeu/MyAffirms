import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  orderBy,
  limit
} from 'firebase/firestore'

export const useSubscription = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()
  
  // Plan konfiguracja
  const FREE_PLAN = {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'PLN',
    interval: 'month',
    features: {
      premiumCharacters: 3000, // 3k premium characters (10x mniej)
      standardCharacters: 12000, // 12k standard characters (10x mniej)
      totalCharacters: 15000 // Combined limit
    }
  }
  
  const PREMIUM_PLAN = {
    id: 'premium_monthly',
    name: 'Premium',
    price: 20, // PLN
    currency: 'PLN',
    interval: 'month',
    features: {
      premiumCharacters: 30000, // 30k premium characters
      standardCharacters: 120000, // 120k standard characters
      totalCharacters: 150000 // Combined limit
    }
  }
  
  // Stan subskrypcji
  const subscription = ref(null)
  const usage = ref({
    premiumCharacters: 0,
    standardCharacters: 0,
    totalCharacters: 0,
    resetDate: null
  })
  
  const isLoading = ref(false)
  const error = ref(null)
  
  // Sprawdź czy użytkownik ma aktywną subskrypcję
  const hasActiveSubscription = computed(() => {
    return subscription.value && 
           subscription.value.status === 'active' &&
           new Date(subscription.value.next_billed_at) > new Date()
  })
  
  // Obecny plan użytkownika
  const currentPlan = computed(() => {
    return hasActiveSubscription.value ? PREMIUM_PLAN : FREE_PLAN
  })
  
  // Sprawdź czy może używać premium głosów
  const canUsePremiumVoices = computed(() => {
    return usage.value.premiumCharacters < currentPlan.value.features.premiumCharacters
  })
  
  // Sprawdź czy może używać standardowych głosów
  const canUseStandardVoices = computed(() => {
    return usage.value.standardCharacters < currentPlan.value.features.standardCharacters
  })
  
  // Sprawdź pozostałe znaki
  const remainingPremiumCharacters = computed(() => {
    return Math.max(0, currentPlan.value.features.premiumCharacters - usage.value.premiumCharacters)
  })
  
  const remainingStandardCharacters = computed(() => {
    return Math.max(0, currentPlan.value.features.standardCharacters - usage.value.standardCharacters)
  })
  
  // Załaduj dane subskrypcji
  const loadSubscription = async () => {
    if (!user.value || !$firebase.db) return
    
    isLoading.value = true
    error.value = null
    
    try {
      // Pobierz subskrypcję użytkownika
      const subRef = doc($firebase.db, 'subscriptions', user.value.uid)
      const subDoc = await getDoc(subRef)
      
      if (subDoc.exists()) {
        subscription.value = { id: subDoc.id, ...subDoc.data() }
      } else {
        subscription.value = null
      }
      
      // Pobierz użycie w bieżącym miesiącu
      await loadUsage()
      
    } catch (err) {
      error.value = err.message
      console.error('Error loading subscription:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Załaduj użycie miesięczne
  const loadUsage = async () => {
    if (!user.value || !$firebase.db) return
    
    const currentDate = new Date()
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    try {
      const usageQuery = query(
        collection($firebase.db, 'usage_tracking'),
        where('user_id', '==', user.value.uid),
        where('created_at', '>=', startOfMonth),
        where('created_at', '<=', endOfMonth)
      )
      
      const usageSnapshot = await getDocs(usageQuery)
      
      let premiumUsed = 0
      let standardUsed = 0
      
      usageSnapshot.forEach(doc => {
        const data = doc.data()
        if (data.voice_type === 'premium') {
          premiumUsed += data.characters_used
        } else {
          standardUsed += data.characters_used
        }
      })
      
      usage.value = {
        premiumCharacters: premiumUsed,
        standardCharacters: standardUsed,
        totalCharacters: premiumUsed + standardUsed,
        resetDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      }
      
    } catch (err) {
      console.error('Error loading usage:', err)
    }
  }
  
  // Rozpocznij proces subskrypcji
  const subscribe = async () => {
    if (!user.value) {
      throw new Error('User must be logged in to subscribe')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Pobierz cenę z Paddle API
      const { data } = await $fetch('/api/subscription/create-checkout', {
        method: 'POST',
        body: {
          userId: user.value.uid,
          email: user.value.email,
          plan: 'premium_monthly'
        }
      })
      
      // Otwórz checkout Paddle
      const { $paddle } = useNuxtApp()
      if ($paddle) {
        $paddle.Checkout.open({
          items: [{ priceId: data.priceId, quantity: 1 }],
          customer: {
            email: user.value.email
          },
          customData: {
            userId: user.value.uid
          }
        })
      }
    } catch (err) {
      error.value = err.message
      console.error('Error creating subscription:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Anuluj subskrypcję
  const cancelSubscription = async () => {
    if (!subscription.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      await $fetch('/api/subscription/cancel', {
        method: 'POST',
        body: {
          subscriptionId: subscription.value.id
        }
      })
      
      await loadSubscription()
    } catch (err) {
      error.value = err.message
      console.error('Error cancelling subscription:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Śledź użycie znaków
  const trackUsage = async (characters, voiceType = 'standard') => {
    if (!user.value || !$firebase.db) return false
    
    try {
      // Sprawdź obecne użycie
      await loadUsage()
      
      // Sprawdź limity na podstawie obecnego planu
      const limits = {
        premium: currentPlan.value.features.premiumCharacters,
        standard: currentPlan.value.features.standardCharacters
      }
      
      if (voiceType === 'premium' && (usage.value.premiumCharacters + characters) > limits.premium) {
        throw new Error('Premium character limit exceeded')
      }
      
      if (voiceType === 'standard' && (usage.value.standardCharacters + characters) > limits.standard) {
        throw new Error('Standard character limit exceeded')
      }
      
      // Zapisz użycie
      await addDoc(collection($firebase.db, 'usage_tracking'), {
        user_id: user.value.uid,
        subscription_id: subscription.value?.id || 'free',
        characters_used: characters,
        voice_type: voiceType,
        created_at: new Date()
      })
      
      // Zaktualizuj lokalne użycie
      if (voiceType === 'premium') {
        usage.value.premiumCharacters += characters
      } else {
        usage.value.standardCharacters += characters
      }
      usage.value.totalCharacters += characters
      
      return true
    } catch (err) {
      console.error('Error tracking usage:', err)
      throw err
    }
  }
  
  // Automatycznie załaduj dane po zalogowaniu
  watch(user, (newUser) => {
    if (newUser) {
      loadSubscription()
    } else {
      subscription.value = null
      usage.value = {
        premiumCharacters: 0,
        standardCharacters: 0,
        totalCharacters: 0,
        resetDate: null
      }
    }
  }, { immediate: true })
  
  return {
    // State
    subscription: readonly(subscription),
    usage: readonly(usage),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    hasActiveSubscription,
    canUsePremiumVoices,
    canUseStandardVoices,
    remainingPremiumCharacters,
    remainingStandardCharacters,
    
    // Methods
    loadSubscription,
    subscribe,
    cancelSubscription,
    trackUsage,
    
    // Constants
    FREE_PLAN,
    PREMIUM_PLAN,
    currentPlan
  }
}