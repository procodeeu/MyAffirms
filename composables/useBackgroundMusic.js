export const useBackgroundMusic = () => {
  let audioElement = null
  let fadeInterval = null
  
  // Nature sounds - free URLs that work cross-origin
  const musicTracks = {
    'birds': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder - will be replaced with nature sounds generator
    'ocean': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder - will be replaced with nature sounds generator
    'rain': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder - will be replaced with nature sounds generator
  }
  
  const createBirdsSound = () => {
    // Create bird chirping sounds using Web Audio API
    if (typeof window === 'undefined') return null
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const masterGain = audioContext.createGain()
      masterGain.gain.setValueAtTime(0, audioContext.currentTime)
      masterGain.connect(audioContext.destination)
      
      let isPlaying = true
      let chirpTimeouts = []
      
      // Create chirping sounds at random intervals
      const createChirp = () => {
        if (!isPlaying) return
        
        const oscillator = audioContext.createOscillator()
        const chirpGain = audioContext.createGain()
        
        // Random frequency for different birds (1200-2800 Hz - more audible range)
        const frequency = 1200 + Math.random() * 1600
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, audioContext.currentTime + 0.08)
        
        oscillator.type = 'sine'
        
        // Quick fade in/out for chirp effect - fixed method names
        chirpGain.gain.setValueAtTime(0, audioContext.currentTime)
        chirpGain.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.02) // Louder chirps
        chirpGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12)
        
        oscillator.connect(chirpGain)
        chirpGain.connect(masterGain)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.12)
        
        // Schedule next chirp randomly
        const nextChirpDelay = Math.random() * 2500 + 800 // 0.8-3.3 seconds
        const timeoutId = setTimeout(createChirp, nextChirpDelay)
        chirpTimeouts.push(timeoutId)
      }
      
      // Create multiple birds with different timing
      for (let i = 0; i < 3; i++) {
        const initialDelay = i * 800 + Math.random() * 1000
        const timeoutId = setTimeout(createChirp, initialDelay)
        chirpTimeouts.push(timeoutId)
      }
      
      return { 
        audioContext, 
        gainNode: masterGain, 
        type: 'birds',
        stop: () => {
          isPlaying = false
          chirpTimeouts.forEach(id => clearTimeout(id))
          chirpTimeouts = []
        }
      }
    } catch (error) {
      console.error('Could not create birds sound:', error)
      return null
    }
  }
  
  const createOceanSound = () => {
    // Create ocean waves sound using Web Audio API
    if (typeof window === 'undefined') return null
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Create white noise for wave base
      const bufferSize = audioContext.sampleRate * 4 // 4 seconds
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
      const data = buffer.getChannelData(0)
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      
      const source = audioContext.createBufferSource()
      source.buffer = buffer
      source.loop = true
      
      // Filter for ocean-like sound
      const filter = audioContext.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, audioContext.currentTime)
      
      const gainNode = audioContext.createGain()
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      
      source.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      source.start()
      
      return { audioContext, gainNode, source, type: 'ocean' }
    } catch (error) {
      console.error('Could not create ocean sound:', error)
      return null
    }
  }
  
  const play = (volume = 0.15, soundType = 'birds') => {
    console.log('🎵 Starting background music at volume:', volume, 'type:', soundType)
    
    try {
      let ambientSystem = null
      
      // Create appropriate nature sound based on type
      switch (soundType) {
        case 'birds':
          ambientSystem = createBirdsSound()
          break
        case 'ocean':
          ambientSystem = createOceanSound()
          break
        default:
          ambientSystem = createBirdsSound() // Default to birds
      }
      
      if (ambientSystem) {
        const { audioContext, gainNode } = ambientSystem
        
        // Slowly fade in the ambient sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.currentTime + 3)
        
        // Store reference for stopping
        audioElement = ambientSystem
        
        console.log(`🎵 ${soundType} background sound started`)
        return true
      }
      
      console.log('🎵 Could not create nature sounds, no fallback available')
      return false
    } catch (error) {
      console.error('Background music error:', error)
      return false
    }
  }
  
  const stop = () => {
    console.log('🎵 Stopping background music')
    
    if (audioElement) {
      if (audioElement.audioContext) {
        try {
          // Stop birds timeouts if it's birds sound
          if (audioElement.stop) {
            audioElement.stop()
          }
          
          // Stop different types of audio sources
          if (audioElement.source) {
            audioElement.source.stop()
          }
          if (audioElement.oscillator1) {
            audioElement.oscillator1.stop()
          }
          if (audioElement.oscillator2) {
            audioElement.oscillator2.stop()
          }
          audioElement.audioContext.close()
        } catch (error) {
          console.log('Audio context already stopped')
        }
      } else if (audioElement.pause) {
        // Stop HTML5 audio
        audioElement.pause()
        audioElement.currentTime = 0
      }
      
      audioElement = null
    }
    
    if (fadeInterval) {
      clearInterval(fadeInterval)
      fadeInterval = null
    }
  }
  
  const fadeOut = (duration = 2000) => {
    if (!audioElement) return
    
    console.log('🎵 Fading out background music')
    
    if (audioElement.gainNode) {
      // Stop birds timeouts if it's birds sound
      if (audioElement.stop) {
        audioElement.stop()
      }
      
      // Fade out Web Audio API
      const { audioContext, gainNode } = audioElement
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000)
      
      setTimeout(() => stop(), duration)
    } else if (audioElement.volume !== undefined) {
      // Fade out HTML5 audio
      const startVolume = audioElement.volume
      const fadeStep = startVolume / (duration / 100)
      
      fadeInterval = setInterval(() => {
        if (audioElement && audioElement.volume > 0) {
          audioElement.volume = Math.max(0, audioElement.volume - fadeStep)
        } else {
          stop()
        }
      }, 100)
    }
  }
  
  const setVolume = (volume) => {
    if (!audioElement) return
    
    if (audioElement.gainNode) {
      // For birds, use higher multiplier since chirps are short
      const multiplier = audioElement.type === 'birds' ? 0.8 : 0.3
      audioElement.gainNode.gain.setValueAtTime(volume * multiplier, audioElement.audioContext.currentTime)
    } else if (audioElement.volume !== undefined) {
      audioElement.volume = volume
    }
  }
  
  return {
    play,
    stop,
    fadeOut,
    setVolume
  }
}