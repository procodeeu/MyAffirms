// Audio Merger - łączenie wielu plików audio w jeden za pomocą AudioContext
export const useAudioMerger = () => {
  const isProcessing = ref(false)
  const progress = ref(0)
  const error = ref(null)

  // Sprawdź czy urządzenie to mobile
  const isMobile = computed(() => {
    if (process.client) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    return false
  })

  // Pobierz i zdekoduj pojedynczy plik audio
  const fetchAndDecodeAudio = async (audioContext, url) => {
    try {
      console.log('🎵 Fetching audio:', url)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      console.log('✅ Audio decoded:', {
        duration: audioBuffer.duration,
        channels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate
      })
      
      return audioBuffer
    } catch (err) {
      console.error('❌ Error fetching/decoding audio:', err)
      throw err
    }
  }

  // Połącz wiele AudioBuffer w jeden
  const mergeAudioBuffers = (audioContext, audioBuffers, pauseBetween = 1.0) => {
    if (!audioBuffers.length) {
      throw new Error('No audio buffers to merge')
    }

    // Oblicz całkowitą długość z pauzami
    const pauseSamples = Math.floor(pauseBetween * audioContext.sampleRate)
    const totalSamples = audioBuffers.reduce((sum, buffer) => {
      return sum + buffer.length + pauseSamples
    }, 0) - pauseSamples // Usuń ostatnią pauzę

    // Znajdź maksymalną liczbę kanałów
    const maxChannels = Math.max(...audioBuffers.map(buffer => buffer.numberOfChannels))
    
    console.log('🔧 Merging audio:', {
      buffers: audioBuffers.length,
      totalDuration: totalSamples / audioContext.sampleRate,
      channels: maxChannels,
      pauseBetween
    })

    // Stwórz nowy bufor
    const mergedBuffer = audioContext.createBuffer(
      maxChannels,
      totalSamples,
      audioContext.sampleRate
    )

    // Skopiuj dane z każdego bufora
    let offset = 0
    audioBuffers.forEach((buffer, index) => {
      for (let channel = 0; channel < maxChannels; channel++) {
        const sourceChannel = Math.min(channel, buffer.numberOfChannels - 1)
        const sourceData = buffer.getChannelData(sourceChannel)
        const targetData = mergedBuffer.getChannelData(channel)
        
        // Skopiuj dane audio
        targetData.set(sourceData, offset)
      }
      
      offset += buffer.length
      
      // Dodaj pauzę (oprócz ostatniego)
      if (index < audioBuffers.length - 1) {
        // Pauza jest już wypełniona zerami (cisza)
        offset += pauseSamples
      }
      
      // Aktualizuj progress
      progress.value = ((index + 1) / audioBuffers.length) * 80 // 80% na mergowanie
    })

    console.log('✅ Audio buffers merged successfully')
    return mergedBuffer
  }

  // Konwertuj AudioBuffer do WAV Blob
  const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16

    let result
    if (numChannels === 2) {
      result = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
    } else {
      result = buffer.getChannelData(0)
    }

    const bufferLength = result.length * 2
    const wavBuffer = new ArrayBuffer(44 + bufferLength)
    const view = new DataView(wavBuffer)

    // WAV header
    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + bufferLength, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * 2, true)
    view.setUint16(32, numChannels * 2, true)
    view.setUint16(34, bitDepth, true)
    writeString(view, 36, 'data')
    view.setUint32(40, bufferLength, true)

    let offset = 44
    for (let i = 0; i < result.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, result[i]))
      s = s < 0 ? s * 0x8000 : s * 0x7FFF
      view.setInt16(offset, s, true)
    }

    return new Blob([view], { type: 'audio/wav' })
  }

  // Pomocnicza funkcja do interleave stereo
  const interleave = (left, right) => {
    const length = left.length + right.length
    const result = new Float32Array(length)

    let index = 0
    let inputIndex = 0

    while (index < length) {
      result[index++] = left[inputIndex]
      result[index++] = right[inputIndex]
      inputIndex++
    }
    return result
  }

  // Główna funkcja łączenia audio z URL-i
  const mergeAudioFromUrls = async (audioUrls, options = {}) => {
    const { pauseBetween = 1.0, outputFormat = 'wav' } = options
    
    if (!audioUrls || !audioUrls.length) {
      throw new Error('No audio URLs provided')
    }

    isProcessing.value = true
    progress.value = 0
    error.value = null

    try {
      console.log('🎵 Starting audio merge process:', {
        urls: audioUrls.length,
        pauseBetween,
        outputFormat
      })

      // Stwórz AudioContext
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Pobierz i zdekoduj wszystkie pliki audio
      const audioBuffers = []
      for (let i = 0; i < audioUrls.length; i++) {
        const buffer = await fetchAndDecodeAudio(audioContext, audioUrls[i])
        audioBuffers.push(buffer)
        
        // Aktualizuj progress (70% na pobieranie)
        progress.value = ((i + 1) / audioUrls.length) * 70
      }

      // Połącz bufory
      const mergedBuffer = mergeAudioBuffers(audioContext, audioBuffers, pauseBetween)
      
      // Konwertuj do wybranego formatu
      let blob
      if (outputFormat === 'wav') {
        blob = audioBufferToWav(mergedBuffer)
        progress.value = 100
      } else {
        throw new Error(`Unsupported output format: ${outputFormat}`)
      }

      // Stwórz URL do pobrania
      const url = URL.createObjectURL(blob)
      
      console.log('✅ Audio merge completed:', {
        duration: mergedBuffer.duration,
        size: blob.size,
        format: outputFormat
      })

      return {
        blob,
        url,
        duration: mergedBuffer.duration,
        size: blob.size,
        format: outputFormat
      }

    } catch (err) {
      error.value = err.message
      console.error('❌ Audio merge failed:', err)
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  // Sprawdź czy można użyć AudioContext
  const isAudioContextSupported = computed(() => {
    if (process.client) {
      return !!(window.AudioContext || window.webkitAudioContext)
    }
    return false
  })

  // Cleanup function
  const cleanup = () => {
    isProcessing.value = false
    progress.value = 0
    error.value = null
  }

  return {
    // State
    isProcessing: readonly(isProcessing),
    progress: readonly(progress),
    error: readonly(error),
    isMobile,
    isAudioContextSupported,

    // Methods
    mergeAudioFromUrls,
    audioBufferToWav,
    cleanup
  }
}