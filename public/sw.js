'''// Service Worker for background audio playback
// Handles affirmation sessions in background with Media Session API

const CACHE_NAME = 'my-affirms-audio-v1'
const AUDIO_CACHE_NAME = 'my-affirms-audio-files-v1'
const SILENCE_FILE_PATH = '/audio/silence/longchirp-88445.mp3';


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
  maxCachedAudio: 50, // Increased cache size
  preloadCount: 10, // Increased preload count
  playbackStartTime: 0,
  playbackPositionUpdater: null
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
    
    // Preload all audio files for session
    await preloadAllAudio()
    
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
  if (!currentSession.isActive || currentSession.isPaused) return;

  const affirmation = currentSession.affirmations[currentSession.currentIndex];
  if (!affirmation) return;

  console.log('🎵 Playing affirmation:', affirmation.id);

  try {
    const audioUrls = await getAffirmationAudioUrls(affirmation);

    if (audioUrls.length === 0) {
      console.warn('⚠️ No audio URLs found for affirmation');
      await scheduleNextAffirmation();
      return;
    }

    await updateMediaSessionMetadata(affirmation, audioUrls);
    updateMediaSessionPlaybackState('playing');

    // Play the sequence of sentences
    await playAudioSequence(audioUrls);

    // Handle repetition if enabled
    if (currentSession.settings.repeatAffirmation && currentSession.isActive && !currentSession.isPaused) {
      console.log('🔁 Repeating affirmation after a pause...');
      // Use the silence file for the repeat delay
      await playAudioBuffer(SILENCE_FILE_PATH);

      if (currentSession.isActive && !currentSession.isPaused) {
        // Re-play the sequence
        await playAudioSequence(audioUrls);
      }
    }

    // Schedule the next affirmation (which includes the main pause)
    await scheduleNextAffirmation();

  } catch (error) {
    console.error('❌ Failed to play affirmation:', error);
    // Even on error, try to move to the next one
    await scheduleNextAffirmation();
  }
}

async function playAudioSequence(audioUrls) {
  const sentencePause = (currentSession.settings.sentencePause || 0);
  const speechRate = currentSession.settings.speechRate || 1.0;

  for (let i = 0; i < audioUrls.length; i++) {
    if (!currentSession.isActive || currentSession.isPaused) break;

    await playAudioBuffer(audioUrls[i], speechRate);

    // Add pause between sentences (except last one)
    if (i < audioUrls.length - 1 && sentencePause > 0) {
       // Always use the 5s silence file for sentence pauses for this test
      await playAudioBuffer(SILENCE_FILE_PATH);
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
      
      // Start tracking playback position for Media Session
      currentSession.playbackStartTime = currentSession.audioContext.currentTime
      startPlaybackPositionUpdater(audioBuffer.duration)
      
      source.onended = () => {
        currentSession.currentSource = null
        stopPlaybackPositionUpdater()
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
    
  } else {
    // Session finished
    console.log('🎉 Session completed')
    finishSession()
  }
}

async function scheduleNextAffirmation() {
  if (!currentSession.isActive || currentSession.isPaused) return;

  console.log(`⏰ Scheduling next affirmation with a pause.`);

  try {
    // Use the silent audio file to maintain the audio session during the pause
    await playAudioBuffer(SILENCE_FILE_PATH);
    
    // After the "silence" has played, move to the next affirmation
    if (currentSession.isActive && !currentSession.isPaused) {
      nextAffirmation();
    }
  } catch (error) {
    console.error('❌ Failed to play silence for pause, stopping session to be safe:', error);
    // If playing silence fails, it's safer to stop the session
    // as we can no longer guarantee playback.
    stopAudioSession();
  }
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

async function updateMediaSessionMetadata(affirmation, audioUrls) {
  if (!('mediaSession' in navigator)) return

  let duration = 0
  try {
    // Calculate total duration of the affirmation
    for (const url of audioUrls) {
      const buffer = await loadAudioBuffer(url)
      duration += buffer.duration
    }
  } catch (error) {
    console.warn('Could not calculate duration for Media Session', error)
  }
  
  navigator.mediaSession.metadata = new MediaMetadata({
    title: affirmation.text.substring(0, 100) + (affirmation.text.length > 100 ? '...' : ''),
    artist: 'My Affirms',
    album: 'Affirmation Session',
    artwork: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  })

  // Set position state
  if (duration > 0) {
    updateMediaSessionPositionState(duration)
  }
}

function updateMediaSessionPlaybackState(state) {
  if (!('mediaSession' in navigator)) return
  
  navigator.mediaSession.playbackState = state
}

function updateMediaSessionPositionState(duration) {
  if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
    navigator.mediaSession.setPositionState({
      duration: duration,
      playbackRate: 1.0,
      position: 0
    })
  }
}

function startPlaybackPositionUpdater(duration) {
  if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
    stopPlaybackPositionUpdater() // Clear any existing updater

    currentSession.playbackPositionUpdater = setInterval(() => {
      const elapsedTime = currentSession.audioContext.currentTime - currentSession.playbackStartTime
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1.0,
        position: Math.min(elapsedTime, duration)
      })
    }, 250)
  }
}

function stopPlaybackPositionUpdater() {
  if (currentSession.playbackPositionUpdater) {
    clearInterval(currentSession.playbackPositionUpdater)
    currentSession.playbackPositionUpdater = null
  }
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

// === AGGRESSIVE PRELOADING SYSTEM ===

function detectConnectionType() {
  if ('connection' in navigator) {
    const connection = navigator.connection
    currentSession.connectionType = connection.effectiveType || 'unknown'
    
    // Adjust preload count based on connection
    switch (connection.effectiveType) {
      case '4g':
        currentSession.preloadCount = 20
        currentSession.maxCachedAudio = 100
        break
      case '3g':
        currentSession.preloadCount = 10
        currentSession.maxCachedAudio = 50
        break
      case '2g':
      case 'slow-2g':
        currentSession.preloadCount = 5
        currentSession.maxCachedAudio = 25
        break
      default:
        currentSession.preloadCount = 10
        currentSession.maxCachedAudio = 50
    }
    
    console.log(`📶 Connection: ${connection.effectiveType}, preload count: ${currentSession.preloadCount}`)
  }
}

async function preloadAllAudio() {
  if (!currentSession.isActive || currentSession.isLoading) return
  
  currentSession.isLoading = true
  
  try {
    console.log('🧠 Preloading all audio for the session...')
    
    const allUrls = new Set()
    for (const affirmation of currentSession.affirmations) {
      const urls = await getAffirmationAudioUrls(affirmation)
      for (const url of urls) {
        allUrls.add(url)
      }
    }
    allUrls.add(SILENCE_FILE_PATH);


    const preloadPromises = []
    for (const url of allUrls) {
      preloadPromises.push(loadAudioBufferSafely(url, url))
    }
    
    await Promise.allSettled(preloadPromises)
    console.log('✅ All audio preloaded')
    
  } catch (error) {
    console.error('❌ Failed to preload all audio files:', error)
  } finally {
    currentSession.isLoading = false
  }
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
'''
