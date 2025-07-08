// Service Worker for background audio playback
// Handles affirmation sessions in background with Media Session API

const CACHE_NAME = 'my-affirms-audio-v1'
const AUDIO_CACHE_NAME = 'my-affirms-audio-files-v1'

// Global state for current session
let currentSession = {
  isActive: false,
  isPaused: false,
  currentIndex: 0,
  affirmations: [],
  settings: {},
  audioContext: null,
  currentSource: null,
  nextTimeout: null,
  audioBuffers: new Map(),
  isLoading: false,
  preloadQueue: new Set(),
  connectionType: 'unknown',
  maxCachedAudio: 15, // Maximum audio files to keep in memory
  preloadCount: 3 // Default preload count
}

// === SERVICE WORKER LIFECYCLE ===

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker activated')
  event.waitUntil(self.clients.claim())
})

// === MESSAGE HANDLING FROM MAIN THREAD ===

self.addEventListener('message', async (event) => {
  const { type, data } = event.data
  
  console.log('📨 SW received message:', type)
  
  try {
    switch (type) {
      case 'START_SESSION':
        await startAudioSession(data)
        break
      case 'PAUSE_SESSION':
        pauseAudioSession()
        break
      case 'RESUME_SESSION':
        resumeAudioSession()
        break
      case 'STOP_SESSION':
        stopAudioSession()
        break
      case 'NEXT_AFFIRMATION':
        await nextAffirmation()
        break
      case 'SESSION_STATUS':
        sendSessionStatus()
        break
      case 'GET_PRELOAD_STATS':
        sendPreloadStats()
        break
      default:
        console.warn('Unknown message type:', type)
    }
  } catch (error) {
    console.error('❌ Error handling message:', error)
    sendMessageToClients('SESSION_ERROR', { error: error.message })
  }
})

// === AUDIO SESSION MANAGEMENT ===

async function startAudioSession(sessionData) {
  console.log('🎯 Starting audio session with', sessionData.affirmations.length, 'affirmations')
  
  try {
    // Initialize audio context
    if (!currentSession.audioContext) {
      currentSession.audioContext = new AudioContext()
    }
    
    // Resume audio context if suspended
    if (currentSession.audioContext.state === 'suspended') {
      await currentSession.audioContext.resume()
    }
    
    // Set session data
    currentSession = {
      ...currentSession,
      isActive: true,
      isPaused: false,
      currentIndex: 0,
      affirmations: sessionData.affirmations,
      settings: sessionData.settings,
      audioBuffers: new Map()
    }
    
    // Setup Media Session
    setupMediaSession()
    
    // Detect connection type and adjust preloading
    detectConnectionType()
    
    // Preload first few audio files intelligently
    await intelligentPreload()
    
    // Start playing first affirmation
    await playCurrentAffirmation()
    
    sendMessageToClients('SESSION_STARTED', {
      currentIndex: currentSession.currentIndex,
      total: currentSession.affirmations.length
    })
    
  } catch (error) {
    console.error('❌ Failed to start session:', error)
    currentSession.isActive = false
    throw error
  }
}

function pauseAudioSession() {
  console.log('⏸️ Pausing audio session')
  
  if (!currentSession.isActive) return
  
  currentSession.isPaused = true
  
  // Stop current audio
  if (currentSession.currentSource) {
    currentSession.currentSource.stop()
    currentSession.currentSource = null
  }
  
  // Clear timeout
  if (currentSession.nextTimeout) {
    clearTimeout(currentSession.nextTimeout)
    currentSession.nextTimeout = null
  }
  
  // Update Media Session
  updateMediaSessionPlaybackState('paused')
  
  sendMessageToClients('SESSION_PAUSED')
}

function resumeAudioSession() {
  console.log('▶️ Resuming audio session')
  
  if (!currentSession.isActive || !currentSession.isPaused) return
  
  currentSession.isPaused = false
  
  // Resume playing current affirmation
  playCurrentAffirmation()
  
  // Update Media Session
  updateMediaSessionPlaybackState('playing')
  
  sendMessageToClients('SESSION_RESUMED')
}

function stopAudioSession() {
  console.log('⏹️ Stopping audio session')
  
  // Stop current audio
  if (currentSession.currentSource) {
    currentSession.currentSource.stop()
    currentSession.currentSource = null
  }
  
  // Clear timeout
  if (currentSession.nextTimeout) {
    clearTimeout(currentSession.nextTimeout)
    currentSession.nextTimeout = null
  }
  
  // Reset session state
  currentSession = {
    ...currentSession,
    isActive: false,
    isPaused: false,
    currentIndex: 0,
    affirmations: [],
    settings: {},
    audioBuffers: new Map()
  }
  
  // Clear Media Session
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = null
    navigator.mediaSession.playbackState = 'none'
  }
  
  sendMessageToClients('SESSION_STOPPED')
}

// === AUDIO PLAYBACK ===

async function playCurrentAffirmation() {
  if (!currentSession.isActive || currentSession.isPaused) return
  
  const affirmation = currentSession.affirmations[currentSession.currentIndex]
  if (!affirmation) return
  
  console.log('🎵 Playing affirmation:', affirmation.id)
  
  try {
    // Update Media Session metadata
    updateMediaSessionMetadata(affirmation)
    updateMediaSessionPlaybackState('playing')
    
    // Get audio URLs for this affirmation
    const audioUrls = await getAffirmationAudioUrls(affirmation)
    
    if (audioUrls.length === 0) {
      console.warn('⚠️ No audio URLs found for affirmation')
      await scheduleNextAffirmation()
      return
    }
    
    // Play audio sequence
    await playAudioSequence(audioUrls)
    
    // Handle repetition if enabled
    if (currentSession.settings.repeatAffirmation && currentSession.isActive && !currentSession.isPaused) {
      const repeatDelay = (currentSession.settings.repeatDelay || 5)
      
      try {
        await createSilentDelay(repeatDelay)
        if (currentSession.isActive && !currentSession.isPaused) {
          await playAudioSequence(audioUrls)
          await scheduleNextAffirmation()
        }
      } catch (error) {
        console.warn('⚠️ Repeat silent delay failed, falling back to setTimeout:', error)
        // Fallback do setTimeout
        currentSession.nextTimeout = setTimeout(async () => {
          if (currentSession.isActive && !currentSession.isPaused) {
            await playAudioSequence(audioUrls)
            await scheduleNextAffirmation()
          }
        }, repeatDelay * 1000)
      }
    } else {
      await scheduleNextAffirmation()
    }
    
    // Preload upcoming affirmations in background
    setTimeout(() => preloadUpcoming(), 500)
    
  } catch (error) {
    console.error('❌ Failed to play affirmation:', error)
    await scheduleNextAffirmation()
  }
}

async function playAudioSequence(audioUrls) {
  const sentencePause = (currentSession.settings.sentencePause || 0) * 1000
  const speechRate = currentSession.settings.speechRate || 1.0
  
  for (let i = 0; i < audioUrls.length; i++) {
    if (!currentSession.isActive || currentSession.isPaused) break
    
    await playAudioBuffer(audioUrls[i], speechRate)
    
    // Add pause between sentences (except last one)
    if (i < audioUrls.length - 1 && sentencePause > 0) {
      await new Promise(resolve => {
        // Użyj silent delay zamiast setTimeout dla pauzy między zdaniami
        createSilentDelay(sentencePause / 1000).then(resolve).catch(() => {
          // Fallback do setTimeout
          setTimeout(resolve, sentencePause)
        })
      })
    }
  }
}

async function playAudioBuffer(audioUrl, playbackRate = 1.0) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get or load audio buffer (optimized)
      let audioBuffer = currentSession.audioBuffers.get(audioUrl)
      
      if (!audioBuffer) {
        console.log('⚡ Loading audio buffer on-demand:', audioUrl)
        audioBuffer = await loadAudioBuffer(audioUrl)
        
        // Manage cache size before adding new buffer
        manageCacheSize()
        currentSession.audioBuffers.set(audioUrl, audioBuffer)
      } else {
        console.log('🎯 Using cached audio buffer:', audioUrl)
      }
      
      // Create audio source
      const source = currentSession.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.playbackRate.value = playbackRate
      source.connect(currentSession.audioContext.destination)
      
      currentSession.currentSource = source
      
      source.onended = () => {
        currentSession.currentSource = null
        resolve()
      }
      
      source.start()
      
    } catch (error) {
      console.error('❌ Failed to play audio buffer:', error)
      reject(error)
    }
  })
}

async function loadAudioBuffer(audioUrl) {
  try {
    const response = await fetch(audioUrl)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await currentSession.audioContext.decodeAudioData(arrayBuffer)
    return audioBuffer
  } catch (error) {
    console.error('❌ Failed to load audio buffer:', error)
    throw error
  }
}

// === AFFIRMATION NAVIGATION ===

async function nextAffirmation() {
  console.log('⏭️ Moving to next affirmation')
  
  if (!currentSession.isActive) return
  
  // Stop current audio
  if (currentSession.currentSource) {
    currentSession.currentSource.stop()
    currentSession.currentSource = null
  }
  
  // Clear timeout
  if (currentSession.nextTimeout) {
    clearTimeout(currentSession.nextTimeout)
    currentSession.nextTimeout = null
  }
  
  // Move to next affirmation
  if (currentSession.currentIndex < currentSession.affirmations.length - 1) {
    currentSession.currentIndex++
    await playCurrentAffirmation()
    
    sendMessageToClients('AFFIRMATION_CHANGED', {
      currentIndex: currentSession.currentIndex,
      total: currentSession.affirmations.length,
      affirmation: currentSession.affirmations[currentSession.currentIndex]
    })
    
    // Trigger preloading of upcoming affirmations
    setTimeout(() => preloadUpcoming(), 200)
  } else {
    // Session finished
    console.log('🎉 Session completed')
    finishSession()
  }
}

async function scheduleNextAffirmation() {
  const pauseDuration = (currentSession.settings.pauseDuration || 3) * 1000
  
  if (currentSession.isActive && !currentSession.isPaused) {
    console.log(`⏰ Scheduling next affirmation in ${pauseDuration}ms`)
    
    // Użyj silent audio zamiast setTimeout - to będzie działać w tle
    try {
      await createSilentDelay(pauseDuration / 1000)
      if (currentSession.isActive && !currentSession.isPaused) {
        nextAffirmation()
      }
    } catch (error) {
      console.warn('⚠️ Silent delay failed, falling back to setTimeout:', error)
      // Fallback do setTimeout
      currentSession.nextTimeout = setTimeout(() => {
        if (currentSession.isActive && !currentSession.isPaused) {
          nextAffirmation()
        }
      }, pauseDuration)
    }
  }
}

// Tworzy ciche audio delay które działa w tle
function createSilentDelay(durationSeconds) {
  return new Promise((resolve, reject) => {
    // Tworzymy bardzo ciche audio o określonej długości
    const audioContext = new (self.AudioContext || self.webkitAudioContext)()
    
    const sampleRate = audioContext.sampleRate
    const numSamples = Math.floor(sampleRate * durationSeconds)
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
    
    // Buffer jest już wypełniony zerami (ciche)
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    
    // Podłącz do destination ale z bardzo niską głośnością
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 0.001 // Prawie niesłyszalne
    source.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    source.onended = () => {
      console.log(`✅ Silent delay completed: ${durationSeconds}s`)
      audioContext.close()
      resolve()
    }
    
    source.onerror = (error) => {
      console.warn('⚠️ Silent audio error:', error)
      audioContext.close()
      reject(error)
    }
    
    try {
      source.start()
    } catch (error) {
      audioContext.close()
      reject(error)
    }
  })
}

function finishSession() {
  console.log('🎉 Session finished naturally')
  
  currentSession.isActive = false
  
  // Clear Media Session
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = 'none'
  }
  
  sendMessageToClients('SESSION_FINISHED')
}

// === MEDIA SESSION API ===

function setupMediaSession() {
  if (!('mediaSession' in navigator)) {
    console.warn('⚠️ Media Session API not supported')
    return
  }
  
  console.log('🎮 Setting up Media Session API')
  
  // Set action handlers
  navigator.mediaSession.setActionHandler('play', () => {
    resumeAudioSession()
  })
  
  navigator.mediaSession.setActionHandler('pause', () => {
    pauseAudioSession()
  })
  
  navigator.mediaSession.setActionHandler('stop', () => {
    stopAudioSession()
  })
  
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    nextAffirmation()
  })
  
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    // Could implement previous affirmation if needed
    console.log('Previous track not implemented')
  })
}

function updateMediaSessionMetadata(affirmation) {
  if (!('mediaSession' in navigator)) return
  
  navigator.mediaSession.metadata = new MediaMetadata({
    title: affirmation.text.substring(0, 100) + (affirmation.text.length > 100 ? '...' : ''),
    artist: 'My Affirms',
    album: 'Affirmation Session',
    artwork: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  })
}

function updateMediaSessionPlaybackState(state) {
  if (!('mediaSession' in navigator)) return
  
  navigator.mediaSession.playbackState = state
}

// === UTILITY FUNCTIONS ===

async function getAffirmationAudioUrls(affirmation) {
  // Use pre-prepared audio URLs from main thread
  if (affirmation.audioUrls && affirmation.audioUrls.length > 0) {
    return affirmation.audioUrls
  }
  
  // Fallback - no audio URLs available
  console.warn('⚠️ No audio URLs available for affirmation:', affirmation.id)
  return []
}

// === INTELLIGENT PRELOADING SYSTEM ===

function detectConnectionType() {
  if ('connection' in navigator) {
    const connection = navigator.connection
    currentSession.connectionType = connection.effectiveType || 'unknown'
    
    // Adjust preload count based on connection
    switch (connection.effectiveType) {
      case '4g':
        currentSession.preloadCount = 5
        currentSession.maxCachedAudio = 20
        break
      case '3g':
        currentSession.preloadCount = 3
        currentSession.maxCachedAudio = 15
        break
      case '2g':
      case 'slow-2g':
        currentSession.preloadCount = 2
        currentSession.maxCachedAudio = 10
        break
      default:
        currentSession.preloadCount = 3
        currentSession.maxCachedAudio = 15
    }
    
    console.log(`📶 Connection: ${connection.effectiveType}, preload count: ${currentSession.preloadCount}`)
  }
}

async function intelligentPreload() {
  if (!currentSession.isActive || currentSession.isLoading) return
  
  currentSession.isLoading = true
  
  try {
    console.log('🧠 Starting intelligent preload...')
    
    // Phase 1: Preload first sentence of upcoming affirmations (for quick start)
    await preloadFirstSentences()
    
    // Phase 2: Preload remaining sentences in background
    setTimeout(() => preloadRemainingSentences(), 1000)
    
  } catch (error) {
    console.error('❌ Failed to preload audio files:', error)
  } finally {
    currentSession.isLoading = false
  }
}

async function preloadFirstSentences() {
  const preloadCount = Math.min(currentSession.preloadCount, currentSession.affirmations.length)
  console.log(`🎯 Preloading first sentences for ${preloadCount} affirmations`)
  
  const preloadPromises = []
  
  for (let i = 0; i < preloadCount; i++) {
    const affirmation = currentSession.affirmations[i]
    const audioUrls = await getAffirmationAudioUrls(affirmation)
    
    // Preload only first audio file (first sentence) for quick start
    if (audioUrls.length > 0) {
      const preloadPromise = loadAudioBufferSafely(audioUrls[0], `aff_${i}_first`)
      preloadPromises.push(preloadPromise)
    }
  }
  
  // Wait for all first sentences to load
  await Promise.allSettled(preloadPromises)
  console.log('✅ First sentences preloaded')
}

async function preloadRemainingSentences() {
  if (!currentSession.isActive) return
  
  console.log('🔄 Preloading remaining sentences...')
  
  const preloadCount = Math.min(currentSession.preloadCount, currentSession.affirmations.length)
  
  for (let i = 0; i < preloadCount; i++) {
    if (!currentSession.isActive) break
    
    const affirmation = currentSession.affirmations[i]
    const audioUrls = await getAffirmationAudioUrls(affirmation)
    
    // Preload remaining sentences (skip first one as it's already loaded)
    for (let j = 1; j < audioUrls.length; j++) {
      if (!currentSession.isActive) break
      
      try {
        await loadAudioBufferSafely(audioUrls[j], `aff_${i}_sent_${j}`)
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.warn(`⚠️ Failed to preload sentence ${j} of affirmation ${i}:`, error)
      }
    }
  }
  
  console.log('✅ Remaining sentences preloaded')
}

async function loadAudioBufferSafely(audioUrl, identifier) {
  if (currentSession.audioBuffers.has(audioUrl)) {
    console.log(`📋 Audio already cached: ${identifier}`)
    return currentSession.audioBuffers.get(audioUrl)
  }
  
  if (currentSession.preloadQueue.has(audioUrl)) {
    console.log(`⏳ Audio already in preload queue: ${identifier}`)
    return
  }
  
  currentSession.preloadQueue.add(audioUrl)
  
  try {
    console.log(`📥 Preloading: ${identifier}`)
    const audioBuffer = await loadAudioBuffer(audioUrl)
    
    // Manage cache size
    manageCacheSize()
    
    currentSession.audioBuffers.set(audioUrl, audioBuffer)
    console.log(`✅ Preloaded: ${identifier}`)
    
    return audioBuffer
    
  } catch (error) {
    console.warn(`❌ Failed to preload ${identifier}:`, error)
    throw error
  } finally {
    currentSession.preloadQueue.delete(audioUrl)
  }
}

function manageCacheSize() {
  if (currentSession.audioBuffers.size >= currentSession.maxCachedAudio) {
    console.log(`🧹 Cache cleanup: ${currentSession.audioBuffers.size}/${currentSession.maxCachedAudio}`)
    
    // Remove oldest entries (simple FIFO)
    const entries = Array.from(currentSession.audioBuffers.entries())
    const toRemove = entries.slice(0, Math.floor(currentSession.maxCachedAudio * 0.3)) // Remove 30%
    
    toRemove.forEach(([url]) => {
      currentSession.audioBuffers.delete(url)
    })
    
    console.log(`✅ Cache cleaned: ${currentSession.audioBuffers.size} items remaining`)
  }
}

// Preload upcoming affirmations as session progresses
async function preloadUpcoming() {
  if (!currentSession.isActive) return
  
  const currentIndex = currentSession.currentIndex
  const startIndex = currentIndex + 1
  const endIndex = Math.min(startIndex + currentSession.preloadCount, currentSession.affirmations.length)
  
  console.log(`🔮 Preloading upcoming affirmations: ${startIndex} to ${endIndex - 1}`)
  
  for (let i = startIndex; i < endIndex; i++) {
    if (!currentSession.isActive) break
    
    const affirmation = currentSession.affirmations[i]
    const audioUrls = await getAffirmationAudioUrls(affirmation)
    
    // Preload all sentences for upcoming affirmations
    for (let j = 0; j < audioUrls.length; j++) {
      if (!currentSession.isActive) break
      
      try {
        await loadAudioBufferSafely(audioUrls[j], `upcoming_${i}_${j}`)
        
        // Small delay between preloads
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } catch (error) {
        console.warn(`⚠️ Failed to preload upcoming audio ${i}_${j}:`, error)
      }
    }
  }
}

function sendSessionStatus() {
  sendMessageToClients('SESSION_STATUS', {
    isActive: currentSession.isActive,
    isPaused: currentSession.isPaused,
    currentIndex: currentSession.currentIndex,
    total: currentSession.affirmations.length,
    currentAffirmation: currentSession.affirmations[currentSession.currentIndex] || null
  })
}

function sendPreloadStats() {
  sendMessageToClients('PRELOAD_STATS', {
    totalPreloaded: currentSession.audioBuffers.size,
    cacheSize: currentSession.audioBuffers.size,
    maxCacheSize: currentSession.maxCachedAudio,
    preloadQueue: currentSession.preloadQueue.size,
    connectionType: currentSession.connectionType,
    preloadCount: currentSession.preloadCount
  })
}

function sendMessageToClients(type, data = {}) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type, data })
    })
  })
}

// === SCREEN WAKE LOCK (when supported) ===

let wakeLock = null

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      console.log('🔒 Screen wake lock acquired')
    }
  } catch (error) {
    console.warn('⚠️ Failed to acquire wake lock:', error)
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release()
    wakeLock = null
    console.log('🔓 Screen wake lock released')
  }
}

console.log('🚀 My Affirms Service Worker loaded')