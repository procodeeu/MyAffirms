<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Panel Administracyjny</h1>
        <p class="text-gray-600">Zarządzanie użytkownikami premium</p>
      </div>

      <div v-if="!user" class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-gray-600">Musisz być zalogowany, aby uzyskać dostęp do panelu admin.</p>
      </div>

      <div v-else-if="!isAdmin" class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-gray-600">Nie masz uprawnień administratora.</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Current User Premium Status -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Twój Status Premium</h2>
          
          <div v-if="premiumLoading" class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span class="text-gray-600">Ładowanie...</span>
          </div>
          
          <div v-else-if="premiumStatus" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium text-gray-800 mb-2">Status</h3>
                <div class="flex items-center space-x-2">
                  <div :class="isPremiumActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                       class="px-2 py-1 rounded-full text-sm font-medium">
                    {{ isPremiumActive ? 'Premium' : 'Free' }}
                  </div>
                  <div v-if="isPremiumActive && getDaysUntilExpiry() !== null" 
                       class="text-sm text-gray-600">
                    {{ getDaysUntilExpiry() }} dni do wygaśnięcia
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium text-gray-800 mb-2">Plan</h3>
                <p class="text-gray-600 capitalize">{{ premiumStatus.plan || 'free' }}</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-800 mb-3">Funkcje Premium</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div v-for="feature in getPremiumFeatures()" :key="feature.key" 
                     class="flex items-center space-x-2">
                  <div :class="feature.enabled ? 'bg-green-500' : 'bg-gray-300'" 
                       class="w-3 h-3 rounded-full"></div>
                  <span :class="feature.enabled ? 'text-gray-800' : 'text-gray-500'" 
                        class="text-sm">
                    {{ feature.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Premium Management Actions -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Zarządzanie Premium</h2>
          
          <div class="space-y-4">
            <div v-if="!isPremiumActive" class="space-y-3">
              <h3 class="font-medium text-gray-700">Aktywuj Premium</h3>
              <div class="flex flex-wrap gap-2">
                <button @click="activatePremium('monthly')" 
                        :disabled="activating"
                        class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="activating">Aktywowanie...</span>
                  <span v-else>Premium Miesięczny</span>
                </button>
                <button @click="activatePremium('yearly')" 
                        :disabled="activating"
                        class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="activating">Aktywowanie...</span>
                  <span v-else>Premium Roczny</span>
                </button>
              </div>
            </div>

            <div v-else class="space-y-3">
              <h3 class="font-medium text-gray-700">Dezaktywuj Premium</h3>
              <button @click="deactivatePremium" 
                      :disabled="deactivating"
                      class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="deactivating">Dezaktywowanie...</span>
                <span v-else>Usuń Premium</span>
              </button>
            </div>
          </div>
        </div>

        <!-- User Account Management -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Zarządzanie Kontami</h2>
          
          <div class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-800 mb-2">Twoje Konta</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p class="font-medium text-gray-800">{{ user.email }}</p>
                      <p class="text-sm text-gray-600">
                        {{ user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email/Hasło' }}
                      </p>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500">Aktywne</div>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 rounded-lg p-4">
              <h3 class="font-medium text-blue-800 mb-2">Instrukcje</h3>
              <div class="text-sm text-blue-700 space-y-1">
                <p>• Możesz przełączać się między kontami w sekcji uwierzytelniania</p>
                <p>• Status premium jest przypisany do konkretnego konta (UID)</p>
                <p>• Każde konto może mieć osobny status premium</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Tools -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Narzędzia Deweloperskie</h2>
          
          <div class="space-y-4">
            <div class="bg-yellow-50 rounded-lg p-4">
              <h3 class="font-medium text-yellow-800 mb-2">Informacje Techniczne</h3>
              <div class="text-sm text-yellow-700 space-y-1">
                <p><strong>User ID:</strong> {{ user.uid }}</p>
                <p><strong>Email:</strong> {{ user.email }}</p>
                <p><strong>Provider:</strong> {{ user.providerData[0]?.providerId }}</p>
                <p><strong>Premium Collection:</strong> premium_users/{{ user.uid }}</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-800 mb-2">Firestore Status</h3>
              <div class="text-sm text-gray-600">
                <p>Premium data jest przechowywana w kolekcji 'premium_users'</p>
                <p>Każdy użytkownik ma dokument o ID równym jego UID</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { user } = useAuth()
const { 
  premiumStatus, 
  loading: premiumLoading, 
  isPremiumActive, 
  getDaysUntilExpiry, 
  getPremiumFeatures,
  grantPremium,
  revokePremium
} = usePremium()

const activating = ref(false)
const deactivating = ref(false)

const isAdmin = computed(() => {
  if (!user.value) return false
  
  const adminEmails = [
    'demo@test.com',
    user.value.email // Your email is automatically admin
  ]
  
  return adminEmails.includes(user.value.email)
})

const activatePremium = async (duration = 'monthly') => {
  if (activating.value) return
  
  try {
    activating.value = true
    await grantPremium('premium', duration)
    
    const message = duration === 'yearly' ? 'Premium na 12 miesięcy aktywowany!' : 'Premium na 1 miesiąc aktywowany!'
    
    // Simple success feedback
    alert(message)
  } catch (error) {
    console.error('Error activating premium:', error)
    alert('Błąd podczas aktywacji premium')
  } finally {
    activating.value = false
  }
}

const deactivatePremium = async () => {
  if (deactivating.value) return
  
  if (!confirm('Czy na pewno chcesz dezaktywować premium?')) {
    return
  }
  
  try {
    deactivating.value = true
    await revokePremium()
    alert('Premium zostało dezaktywowane')
  } catch (error) {
    console.error('Error deactivating premium:', error)
    alert('Błąd podczas dezaktywacji premium')
  } finally {
    deactivating.value = false
  }
}

definePageMeta({
  middleware: 'auth'
})
</script>