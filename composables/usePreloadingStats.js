// Preloading Statistics - monitor preloading performance
export const usePreloadingStats = () => {
  const stats = ref({
    totalPreloaded: 0,
    cacheHits: 0,
    cacheMisses: 0,
    preloadErrors: 0,
    connectionType: 'unknown',
    cacheSize: 0,
    maxCacheSize: 15,
    preloadQueue: 0,
    lastUpdate: null
  })

  const isServiceWorkerSupported = ref(false)
  const isStatsAvailable = ref(false)

  // === STATS COLLECTION ===

  const requestStats = async () => {
    // Service Worker removed - stats not available
    console.warn('Service Worker stats disabled - unified audio system')
    return
  }

  const handleStatsMessage = (event) => {
    const { type, data } = event.data
    
    if (type === 'PRELOAD_STATS') {
      stats.value = {
        ...stats.value,
        ...data,
        lastUpdate: new Date()
      }
      isStatsAvailable.value = true
    }
  }

  // === COMPUTED METRICS ===

  const cacheHitRate = computed(() => {
    const total = stats.value.cacheHits + stats.value.cacheMisses
    return total > 0 ? Math.round((stats.value.cacheHits / total) * 100) : 0
  })

  const cacheUtilization = computed(() => {
    return stats.value.maxCacheSize > 0 
      ? Math.round((stats.value.cacheSize / stats.value.maxCacheSize) * 100) 
      : 0
  })

  const preloadEfficiency = computed(() => {
    const total = stats.value.totalPreloaded + stats.value.preloadErrors
    return total > 0 ? Math.round((stats.value.totalPreloaded / total) * 100) : 0
  })

  const connectionQuality = computed(() => {
    switch (stats.value.connectionType) {
      case '4g': return { label: 'Excellent', color: 'green' }
      case '3g': return { label: 'Good', color: 'yellow' }
      case '2g': return { label: 'Poor', color: 'orange' }
      case 'slow-2g': return { label: 'Very Poor', color: 'red' }
      default: return { label: 'Unknown', color: 'gray' }
    }
  })

  // === LIFECYCLE ===

  onMounted(() => {
    // Service Worker removed
    isServiceWorkerSupported.value = false
  })

  return {
    // State
    stats: readonly(stats),
    isServiceWorkerSupported: readonly(isServiceWorkerSupported),
    isStatsAvailable: readonly(isStatsAvailable),
    
    // Computed metrics
    cacheHitRate: readonly(cacheHitRate),
    cacheUtilization: readonly(cacheUtilization),
    preloadEfficiency: readonly(preloadEfficiency),
    connectionQuality: readonly(connectionQuality),
    
    // Methods
    requestStats
  }
}