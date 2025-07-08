<template>
  <div v-if="showPanel" class="fixed top-4 right-4 w-96 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50 overflow-hidden">
    <!-- Header -->
    <div class="bg-gray-100 dark:bg-gray-700 p-3 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium">🔍 Logger</span>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {{ logger.logs.length }}
        </span>
      </div>
      
      <div class="flex items-center space-x-1">
        <button @click="logger.clear()" 
                class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
          Clear
        </button>
        <button @click="exportLogs" 
                class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
          Export
        </button>
        <button @click="hidePanel" 
                class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
          Hide
        </button>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="p-2 border-b border-gray-200 dark:border-gray-600">
      <div class="flex items-center space-x-2 text-xs">
        <select v-model="selectedLevel" class="px-2 py-1 border rounded text-xs">
          <option value="">All Levels</option>
          <option value="DEBUG">Debug</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warn</option>
          <option value="ERROR">Error</option>
        </select>
        
        <select v-model="selectedCategory" class="px-2 py-1 border rounded text-xs">
          <option value="">All Categories</option>
          <option value="SESSION">Session</option>
          <option value="SW">Service Worker</option>
          <option value="AUDIO">Audio</option>
          <option value="UI">UI</option>
        </select>
      </div>
    </div>
    
    <!-- Logs -->
    <div class="overflow-y-auto max-h-64 p-2 space-y-1">
      <div v-for="log in filteredLogs" 
           :key="log.id"
           class="text-xs p-2 rounded border-l-2"
           :class="getLogClass(log)">
        
        <div class="flex items-center justify-between mb-1">
          <span class="font-medium">{{ log.category }}</span>
          <span class="text-gray-500">{{ formatTime(log.timestamp) }}</span>
        </div>
        
        <div class="text-gray-700 dark:text-gray-300">
          {{ log.message }}
        </div>
        
        <div v-if="log.data" class="mt-1 text-gray-600 dark:text-gray-400 font-mono text-xs">
          {{ formatData(log.data) }}
        </div>
      </div>
      
      <div v-if="filteredLogs.length === 0" class="text-center text-gray-500 py-4">
        No logs match current filters
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLogger } from '~/composables/useLogger'

const logger = useLogger()
const showPanel = ref(false)
const selectedLevel = ref('')
const selectedCategory = ref('')

// Filtered logs based on current filters
const filteredLogs = computed(() => {
  let filtered = logger.logs.value
  
  if (selectedLevel.value) {
    filtered = filtered.filter(log => log.levelName === selectedLevel.value)
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(log => log.category === selectedCategory.value)
  }
  
  return filtered.slice(0, 50) // Show only recent 50 logs
})

// Methods
const hidePanel = () => {
  showPanel.value = false
}

const exportLogs = () => {
  const exported = logger.exportLogs()
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs-${new Date().toISOString().slice(0, 19)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatData = (data) => {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2).slice(0, 100) + (JSON.stringify(data).length > 100 ? '...' : '')
  }
  return String(data)
}

const getLogClass = (log) => {
  const classes = {
    DEBUG: 'border-gray-300 bg-gray-50',
    INFO: 'border-blue-300 bg-blue-50',
    WARN: 'border-yellow-300 bg-yellow-50',
    ERROR: 'border-red-300 bg-red-50',
    CRITICAL: 'border-red-500 bg-red-100'
  }
  return classes[log.levelName] || 'border-gray-300 bg-gray-50'
}

// Keyboard shortcut to toggle panel
onMounted(() => {
  const handleKeydown = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      showPanel.value = !showPanel.value
    }
  }
  
  window.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})

// Expose show method
defineExpose({
  show: () => { showPanel.value = true },
  hide: hidePanel
})
</script>