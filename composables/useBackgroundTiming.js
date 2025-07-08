// Background Timing - system timing który działa w tle na urządzeniach mobilnych
export const useBackgroundTiming = () => {
  
  // Tworzy ciche audio o określonej długości dla timing
  const createSilentAudio = (durationSeconds) => {
    const audio = new Audio()
    
    // Tworzymy data URL z cichym audio o określonej długości
    const sampleRate = 44100
    const numSamples = Math.floor(sampleRate * durationSeconds)
    const arrayBuffer = new ArrayBuffer(44 + numSamples * 2) // WAV header + data
    const view = new DataView(arrayBuffer)
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + numSamples * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, 1, true) // mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // byte rate
    view.setUint16(32, 2, true) // block align
    view.setUint16(34, 16, true) // bits per sample
    writeString(36, 'data')
    view.setUint32(40, numSamples * 2, true)
    
    // Silent data (wszystkie zera)
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true)
    }
    
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' })
    audio.src = URL.createObjectURL(blob)
    audio.volume = 0 // Upewnij się że jest ciche
    
    return audio
  }
  
  // Delay który działa w tle używając audio
  const backgroundDelay = (durationSeconds) => {
    return new Promise((resolve, reject) => {
      const silentAudio = createSilentAudio(durationSeconds)
      
      silentAudio.addEventListener('ended', () => {
        console.log(`✅ Background delay completed: ${durationSeconds}s`)
        URL.revokeObjectURL(silentAudio.src) // Cleanup
        resolve()
      })
      
      silentAudio.addEventListener('error', (error) => {
        console.warn('⚠️ Silent audio failed, falling back to setTimeout:', error)
        URL.revokeObjectURL(silentAudio.src) // Cleanup
        // Fallback do setTimeout
        setTimeout(resolve, durationSeconds * 1000)
      })
      
      silentAudio.play().catch(error => {
        console.warn('⚠️ Silent audio play failed, falling back to setTimeout:', error)
        URL.revokeObjectURL(silentAudio.src) // Cleanup
        // Fallback do setTimeout
        setTimeout(resolve, durationSeconds * 1000)
      })
    })
  }
  
  // Alternatywna metoda używająca Web Audio API
  const webAudioDelay = (durationSeconds) => {
    return new Promise((resolve) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        // Tworzymy ciche audio buffer
        const sampleRate = audioContext.sampleRate
        const numSamples = Math.floor(sampleRate * durationSeconds)
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
        
        // Buffer jest już wypełniony zerami (ciche)
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        source.connect(audioContext.destination)
        
        source.onended = () => {
          console.log(`✅ Web Audio delay completed: ${durationSeconds}s`)
          audioContext.close()
          resolve()
        }
        
        source.start()
      } catch (error) {
        console.warn('⚠️ Web Audio API failed, falling back to setTimeout:', error)
        setTimeout(resolve, durationSeconds * 1000)
      }
    })
  }
  
  // Główna funkcja delay z automatycznym wyborem metody
  const delay = async (durationSeconds) => {
    console.log(`⏰ Starting background delay: ${durationSeconds}s`)
    
    // Spróbuj najpierw Web Audio API (lepsze dla background)
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        await webAudioDelay(durationSeconds)
        return
      } catch (error) {
        console.warn('⚠️ Web Audio delay failed, trying silent audio:', error)
      }
    }
    
    // Fallback do silent audio
    try {
      await backgroundDelay(durationSeconds)
    } catch (error) {
      console.warn('⚠️ All background methods failed, using setTimeout:', error)
      await new Promise(resolve => setTimeout(resolve, durationSeconds * 1000))
    }
  }
  
  return {
    delay,
    backgroundDelay,
    webAudioDelay,
    createSilentAudio
  }
}