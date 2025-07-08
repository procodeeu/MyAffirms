<template>
  <div v-if="showControls" class="fixed bottom-4 left-4 right-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            Background Audio Test
          </p>
          <p class="text-xs text-gray-500">
            SW: {{ sw.isRegistered ? '✅' : '❌' }} | 
            Supported: {{ sw.isSupported ? '✅' : '❌' }}
          </p>
        </div>
        
        <div class="flex items-center space-x-2">
          <button @click="testServiceWorker" 
                  class="px-3 py-1 bg-blue-600 text-white rounded text-sm">
            Test SW
          </button>
          <button @click="hideControls" 
                  class="px-3 py-1 bg-gray-600 text-white rounded text-sm">
            Hide
          </button>
        </div>
      </div>
      
      <div v-if="sw.error" class="mt-2 text-xs text-red-600">
        Error: {{ sw.error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSimpleServiceWorker } from '~/composables/useSimpleServiceWorker'

const showControls = ref(false)
const sw = useSimpleServiceWorker()

const testServiceWorker = async () => {
  console.log('🧪 Testing Service Worker...')
  const success = await sw.register()
  
  if (success) {
    sw.sendMessage('TEST_MESSAGE', { timestamp: Date.now() })
  }
}

const hideControls = () => {
  showControls.value = false
}

// Show controls only when explicitly needed
const show = () => {
  showControls.value = true
}

// Don't auto-initialize anything on mount
// onMounted(() => {
//   // Intentionally empty - no auto-registration
// })

defineExpose({
  show,
  hide: hideControls
})
</script>