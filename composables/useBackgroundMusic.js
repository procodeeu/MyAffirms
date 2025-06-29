export const useBackgroundMusic = () => {
  let audioElement = null
  let fadeInterval = null
  
  // Audio files - place your music files in /public/audio/ directory
  const musicTracks = {
    // Generated nature sounds (Web Audio API)
    'birds_generated': null,
    'ocean_generated': null,
    
    // Real audio files (place in /public/audio/)
    'deeper_meaning': '/audio/DeeperMeaning.mp3',
    'relaxing_music': '/audio/relaxing_music.mp3',
    'meditation_music': '/audio/meditation_music.mp3',
    'nature_sounds': '/audio/nature_sounds.mp3',
    'rain_sounds': '/audio/rain_sounds.mp3',
    'forest_ambience': '/audio/forest_ambience.mp3',
    'spa_music': '/audio/spa_music.mp3'
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
  
  const createAudioFilePlayer = async (audioUrl) => {
    // Play real audio files
    if (typeof window === 'undefined') return null
    
    try {
      const audio = new Audio(audioUrl)
      audio.loop = true
      audio.volume = 0
      audio.crossOrigin = 'anonymous' // For CORS
      
      // Test if file exists and can be loaded
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true })
        audio.addEventListener('error', reject, { once: true })
        audio.load()
      })
      
      return {
        audioElement: audio,
        type: 'file',
        play: () => audio.play(),
        stop: () => {
          audio.pause()
          audio.currentTime = 0
        },
        setVolume: (vol) => {
          audio.volume = vol
        },
        fadeIn: (targetVolume, duration = 3000) => {
          audio.volume = 0
          audio.play()
          
          const steps = 50
          const stepDuration = duration / steps
          const volumeStep = targetVolume / steps
          let currentStep = 0
          
          const fadeInterval = setInterval(() => {
            currentStep++
            audio.volume = Math.min(targetVolume, currentStep * volumeStep)
            
            if (currentStep >= steps) {
              clearInterval(fadeInterval)
            }
          }, stepDuration)
          
          return fadeInterval
        },
        fadeOut: (duration = 2000) => {
          const startVolume = audio.volume
          const steps = 50
          const stepDuration = duration / steps
          const volumeStep = startVolume / steps
          let currentStep = 0
          
          const fadeInterval = setInterval(() => {
            currentStep++
            audio.volume = Math.max(0, startVolume - (currentStep * volumeStep))
            
            if (currentStep >= steps) {
              clearInterval(fadeInterval)
              audio.pause()
              audio.currentTime = 0
            }
          }, stepDuration)
          
          return fadeInterval
        }
      }
    } catch (error) {
      console.error('Could not load audio file:', audioUrl, error)
      return null
    }
  }
  
  const play = async (volume = 0.15, soundType = 'birds') => {
    
    try {
      let ambientSystem = null
      
      // Check if it's a real audio file first
      const audioUrl = musicTracks[soundType]
      if (audioUrl) {
        ambientSystem = await createAudioFilePlayer(audioUrl)
        
        if (ambientSystem) {
          ambientSystem.fadeIn(volume, 3000)
          audioElement = ambientSystem
          return true
        }
      }
      
      // Fallback to generated sounds
      switch (soundType) {
        case 'birds':
        case 'birds_generated':
          ambientSystem = createBirdsSound()
          break
        case 'ocean':
        case 'ocean_generated':
          ambientSystem = createOceanSound()
          break
        default:
          // Try as audio file first, then fallback to birds
          if (!audioUrl) {
            ambientSystem = createBirdsSound()
          }
      }
      
      if (ambientSystem && ambientSystem.gainNode) {
        const { audioContext, gainNode } = ambientSystem
        
        // Slowly fade in the ambient sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume * 0.4, audioContext.currentTime + 3)
        
        // Store reference for stopping
        audioElement = ambientSystem
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Background music error:', error)
      return false
    }
  }
  
  const stop = () => {
    
    if (audioElement) {
      // Handle audio file players
      if (audioElement.type === 'file' && audioElement.stop) {
        audioElement.stop()
      }
      // Handle Web Audio API
      else if (audioElement.audioContext) {
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
      }
      // Handle direct HTML5 audio elements
      else if (audioElement.pause) {
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
    
    // Handle audio file players
    if (audioElement.type === 'file' && audioElement.fadeOut) {
      audioElement.fadeOut(duration)
      setTimeout(() => {
        audioElement = null
      }, duration)
    }
    // Handle Web Audio API
    else if (audioElement.gainNode) {
      // Stop birds timeouts if it's birds sound
      if (audioElement.stop) {
        audioElement.stop()
      }
      
      // Fade out Web Audio API
      const { audioContext, gainNode } = audioElement
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000)
      
      setTimeout(() => stop(), duration)
    }
    // Handle direct HTML5 audio elements
    else if (audioElement.volume !== undefined) {
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
    
    // Handle audio file players
    if (audioElement.type === 'file' && audioElement.setVolume) {
      audioElement.setVolume(volume)
    }
    // Handle Web Audio API
    else if (audioElement.gainNode) {
      // For birds, use higher multiplier since chirps are short
      const multiplier = audioElement.type === 'birds' ? 0.8 : 0.3
      audioElement.gainNode.gain.setValueAtTime(volume * multiplier, audioElement.audioContext.currentTime)
    }
    // Handle direct HTML5 audio elements
    else if (audioElement.volume !== undefined) {
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