<template>
  <div v-if="sessionState.isActive" class="fixed bottom-4 left-4 right-4 z-50">
    <!-- Background Audio Session Controls -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <!-- Session Info -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ $t('session.playing_merged_audio') }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ sessionState.total }} {{ $t('session.affirmations_merged') }} • 
            {{ $t('session.unified_mode') }}
          </p>
        </div>
        
        <!-- System Indicator -->
        <div class="flex items-center space-x-2">
          <div v-if="capabilities.supportsBackgroundAudio" 
               class="w-2 h-2 bg-green-500 rounded-full" 
               :title="$t('session.backgroundSupported')">
          </div>
          <div v-else 
               class="w-2 h-2 bg-yellow-500 rounded-full" 
               :title="$t('session.foregroundOnly')">
          </div>
        </div>
      </div>
      
      <!-- Merged Audio Info -->
      <div class="mb-3">
        <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {{ $t('session.playing_all_affirmations') }}
        </p>
      </div>
      
      <!-- Progress Bar -->
      <div class="mb-3">
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
               :style="{ width: progress + '%' }">
          </div>
        </div>
      </div>
      
      <!-- Controls -->
      <div class="flex items-center justify-center space-x-4">
        <!-- Previous (if implemented) -->
        <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                disabled>
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/>
          </svg>
        </button>
        
        <!-- Play/Pause -->
        <button @click="togglePlayback"
                class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
          <svg v-if="isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
          </svg>
        </button>
        
        <!-- Next -->
        <button @click="nextAffirmation"
                class="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"/>
          </svg>
        </button>
        
        <!-- Stop -->
        <button @click="stopSession"
                class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      
      <!-- Capabilities Info (Development) -->
      <div v-if="showDebugInfo" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <details class="text-xs text-gray-500 dark:text-gray-400">
          <summary class="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            {{ $t('session.technicalInfo') }}
          </summary>
          <div class="mt-2 space-y-1">
            <div>Service Worker: {{ capabilities.supportsServiceWorker ? '✅' : '❌' }}</div>
            <div>Background Audio: {{ capabilities.supportsBackgroundAudio ? '✅' : '❌' }}</div>
            <div>Media Session: {{ capabilities.supportsMediaSession ? '✅' : '❌' }}</div>
            <div>Wake Lock: {{ capabilities.supportsWakeLock ? '✅' : '❌' }}</div>
            <div>Current System: {{ capabilities.currentSystem }}</div>
            
            <!-- Preloading Stats -->
            <div v-if="preloadStats.isStatsAvailable" class="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
              <div class="font-medium mb-1">Preloading Performance:</div>
              <div>Cache: {{ preloadStats.stats.cacheSize }}/{{ preloadStats.stats.maxCacheSize }} ({{ preloadStats.cacheUtilization }}%)</div>
              <div>Connection: {{ preloadStats.connectionQuality.label }} ({{ preloadStats.stats.connectionType }})</div>
              <div>Preload Queue: {{ preloadStats.stats.preloadQueue }}</div>
              <div>Preload Count: {{ preloadStats.stats.preloadCount }}</div>
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUnifiedAudioSession } from '~/composables/useUnifiedAudioSession'
import { usePreloadingStats } from '~/composables/usePreloadingStats'

const props = defineProps({
  showDebugInfo: {
    type: Boolean,
    default: false
  }
})

const unifiedAudio = useUnifiedAudioSession()
const preloadStats = usePreloadingStats()

// Reactive state
const isPlaying = unifiedAudio.isPlaying
const isFinished = unifiedAudio.isFinished
const progress = unifiedAudio.progress
const activeAffirmations = unifiedAudio.activeAffirmations

// Simplified session state for unified audio
const sessionState = computed(() => ({
  isActive: isPlaying.value || isFinished.value,
  isPaused: false,
  total: activeAffirmations.value?.length || 0
}))

const currentIndex = computed(() => isFinished.value ? activeAffirmations.value?.length || 0 : 0)
const currentAffirmation = computed(() => activeAffirmations.value?.[0] || null)
const capabilities = ref({ currentSystem: 'unified-merged' })

// === METHODS ===

const togglePlayback = async () => {
  try {
    if (isPlaying.value) {
      await unifiedAudio.stopSession()
    } else {
      // Unified audio nie ma resume - trzeba restart
      console.log('Unified audio nie obsługuje pause/resume')
    }
  } catch (error) {
    console.error('❌ Failed to toggle playback:', error)
  }
}

const nextAffirmation = async () => {
  try {
    // Unified audio odtwarza wszystko jako jeden plik - brak next
    console.log('Unified audio nie obsługuje przeskakiwania afirmacji')
  } catch (error) {
    console.error('❌ Failed to skip to next affirmation:', error)
  }
}

const stopSession = async () => {
  try {
    await unifiedAudio.stopSession()
  } catch (error) {
    console.error('❌ Failed to stop session:', error)
  }
}

// === LIFECYCLE ===

onMounted(async () => {
  // Unified audio nie wymaga inicjalizacji
  capabilities.value = { 
    currentSystem: 'unified-merged',
    supportsBackgroundAudio: false,
    supportsServiceWorker: false,
    supportsMediaSession: false,
    supportsWakeLock: false
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>