<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ $t('subscription.title') }}</h1>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-800">{{ error }}</p>
        </div>
        
        <!-- Free plan info -->
        <div v-else-if="!hasActiveSubscription" class="space-y-6">
          <!-- Current plan info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-blue-800 font-medium">{{ $t('subscription.current_plan') }}: {{ FREE_PLAN.name }}</span>
            </div>
            <p class="text-blue-700 text-sm">{{ formatNumber(FREE_PLAN.features.premiumCharacters) }} znaków AI + {{ formatNumber(FREE_PLAN.features.standardCharacters) }} znaków standard miesięcznie</p>
          </div>
          
          <!-- Usage statistics for free plan -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-blue-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-blue-900 mb-2">{{ $t('subscription.premium_usage') }}</h3>
              <div class="flex items-center justify-between mb-2">
                <span class="text-blue-700">{{ formatNumber(usage.premiumCharacters) }} / {{ formatNumber(FREE_PLAN.features.premiumCharacters) }}</span>
                <span class="text-blue-600 font-medium">{{ Math.round((usage.premiumCharacters / FREE_PLAN.features.premiumCharacters) * 100) }}%</span>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: Math.min(100, (usage.premiumCharacters / FREE_PLAN.features.premiumCharacters) * 100) + '%' }"
                ></div>
              </div>
              <p class="text-sm text-blue-600 mt-2">{{ $t('subscription.remaining') }}: {{ formatNumber(Math.max(0, FREE_PLAN.features.premiumCharacters - usage.premiumCharacters)) }}</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('subscription.standard_usage') }}</h3>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700">{{ formatNumber(usage.standardCharacters) }} / {{ formatNumber(FREE_PLAN.features.standardCharacters) }}</span>
                <span class="text-gray-600 font-medium">{{ Math.round((usage.standardCharacters / FREE_PLAN.features.standardCharacters) * 100) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-gray-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: Math.min(100, (usage.standardCharacters / FREE_PLAN.features.standardCharacters) * 100) + '%' }"
                ></div>
              </div>
              <p class="text-sm text-gray-600 mt-2">{{ $t('subscription.remaining') }}: {{ formatNumber(Math.max(0, FREE_PLAN.features.standardCharacters - usage.standardCharacters)) }}</p>
            </div>
          </div>
          
          <!-- Upgrade section -->
          <div class="text-center py-8">
            <div class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ $t('subscription.upgrade_title') }}</h2>
            <p class="text-gray-600 mb-6">{{ $t('subscription.upgrade_description') }}</p>
            
            <!-- Pricing card -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white max-w-md mx-auto">
              <h3 class="text-xl font-bold mb-2">{{ PREMIUM_PLAN.name }}</h3>
              <div class="text-3xl font-bold mb-2">
                {{ PREMIUM_PLAN.price }} {{ PREMIUM_PLAN.currency }}
                <span class="text-sm font-normal">/{{ $t('subscription.month') }}</span>
              </div>
              
              <ul class="text-sm space-y-2 mb-6">
                <li class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  {{ formatNumber(PREMIUM_PLAN.features.premiumCharacters) }} {{ $t('subscription.premium_characters') }}
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  {{ formatNumber(PREMIUM_PLAN.features.standardCharacters) }} {{ $t('subscription.standard_characters') }}
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  {{ $t('subscription.premium_voices') }}
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  {{ $t('subscription.no_ads') }}
                </li>
              </ul>
              
              <button 
                @click="subscribe"
                :disabled="isLoading"
                class="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {{ $t('subscription.subscribe_now') }}
              </button>
            </div>
            </div>
          </div>
        </div>
        
        <!-- Active subscription -->
        <div v-else class="space-y-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-green-800 font-medium">{{ $t('subscription.active_subscription') }}</span>
            </div>
          </div>
          
          <!-- Usage statistics -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-blue-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-blue-900 mb-2">{{ $t('subscription.premium_usage') }}</h3>
              <div class="flex items-center justify-between mb-2">
                <span class="text-blue-700">{{ formatNumber(usage.premiumCharacters) }} / {{ formatNumber(PREMIUM_PLAN.features.premiumCharacters) }}</span>
                <span class="text-blue-600 font-medium">{{ Math.round((usage.premiumCharacters / PREMIUM_PLAN.features.premiumCharacters) * 100) }}%</span>
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: Math.min(100, (usage.premiumCharacters / PREMIUM_PLAN.features.premiumCharacters) * 100) + '%' }"
                ></div>
              </div>
              <p class="text-sm text-blue-600 mt-2">{{ $t('subscription.remaining') }}: {{ formatNumber(remainingPremiumCharacters) }}</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('subscription.standard_usage') }}</h3>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700">{{ formatNumber(usage.standardCharacters) }} / {{ formatNumber(PREMIUM_PLAN.features.standardCharacters) }}</span>
                <span class="text-gray-600 font-medium">{{ Math.round((usage.standardCharacters / PREMIUM_PLAN.features.standardCharacters) * 100) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-gray-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: Math.min(100, (usage.standardCharacters / PREMIUM_PLAN.features.standardCharacters) * 100) + '%' }"
                ></div>
              </div>
              <p class="text-sm text-gray-600 mt-2">{{ $t('subscription.remaining') }}: {{ formatNumber(remainingStandardCharacters) }}</p>
            </div>
          </div>
          
          <!-- Subscription details -->
          <div class="border rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('subscription.details') }}</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('subscription.plan') }}:</span>
                <span class="font-medium">{{ PREMIUM_PLAN.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('subscription.status') }}:</span>
                <span class="font-medium text-green-600">{{ $t('subscription.active') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('subscription.next_billing') }}:</span>
                <span class="font-medium">{{ formatDate(subscription.next_billed_at) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ $t('subscription.usage_resets') }}:</span>
                <span class="font-medium">{{ formatDate(usage.resetDate) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Cancel subscription -->
          <div class="border-t pt-6">
            <button 
              @click="cancelSubscription"
              :disabled="isLoading"
              class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ $t('subscription.cancel') }}
            </button>
            <p class="text-sm text-gray-500 mt-2">{{ $t('subscription.cancel_note') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const { user } = useAuth()

// Przekieruj niezalogowanych użytkowników
if (!user.value) {
  await navigateTo('/login')
}

const {
  subscription,
  usage,
  isLoading,
  error,
  hasActiveSubscription,
  remainingPremiumCharacters,
  remainingStandardCharacters,
  subscribe,
  cancelSubscription,
  FREE_PLAN,
  PREMIUM_PLAN
} = useSubscription()

// Meta
definePageMeta({
  title: 'Subskrypcja',
  requiresAuth: true
})

// Formatowanie liczb
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'k'
  }
  return num.toString()
}

// Formatowanie dat
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>