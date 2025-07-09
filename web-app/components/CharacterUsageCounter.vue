<template>
  <div v-if="user" class="flex items-center gap-3 text-sm">
    <!-- Premium characters counter -->
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 rounded-full" :class="premiumStatusClass"></div>
      <span class="text-gray-700">
        <span class="font-medium">{{ formatNumber(usage.premiumCharacters) }}</span>/<span class="text-gray-500">{{ formatNumber(currentPlan.features.premiumCharacters) }}</span>
      </span>
      <span class="text-xs text-gray-500">AI</span>
    </div>
    
    <!-- Separator -->
    <div class="w-px h-4 bg-gray-300"></div>
    
    <!-- Standard characters counter -->
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 rounded-full" :class="standardStatusClass"></div>
      <span class="text-gray-700">
        <span class="font-medium">{{ formatNumber(usage.standardCharacters) }}</span>/<span class="text-gray-500">{{ formatNumber(currentPlan.features.standardCharacters) }}</span>
      </span>
      <span class="text-xs text-gray-500">Std</span>
    </div>
    
    <!-- Reset date info on hover -->
    <div class="relative group">
      <svg class="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {{ $t('subscription.usage_resets') }}: {{ formatDate(usage.resetDate) }}
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const { user } = useAuth()
const {
  hasActiveSubscription,
  usage,
  canUsePremiumVoices,
  canUseStandardVoices,
  currentPlan
} = useSubscription()

// Status colors based on usage percentage
const premiumStatusClass = computed(() => {
  if (!user.value) return 'bg-gray-300'
  
  const percentage = (usage.value.premiumCharacters / currentPlan.value.features.premiumCharacters) * 100
  
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 75) return 'bg-yellow-500'
  return 'bg-green-500'
})

const standardStatusClass = computed(() => {
  if (!user.value) return 'bg-gray-300'
  
  const percentage = (usage.value.standardCharacters / currentPlan.value.features.standardCharacters) * 100
  
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 75) return 'bg-yellow-500'
  return 'bg-green-500'
})

// Format numbers for display
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'k'
  }
  return num.toString()
}

// Format dates
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short'
  })
}
</script>