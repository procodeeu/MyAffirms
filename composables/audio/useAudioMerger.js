// Audio Merger - laczenie wielu plikow audio w jeden za pomoca AudioContext
export const useAudioMerger = () => {
  const isProcessing = ref(false)
  const progress = ref(0)
  const error = ref(null)

  // Sprawdz czy urzadzenie to mobile
  const isMobile = computed(() => {
    if (process.client) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    return false
  })

  // Pobierz i zdekoduj pojedynczy plik audio - CORS fix
  const fetchAndDecodeAudio = async (audioContext, url) => {
    try {
      console.log('Fetching audio:', url)
      
      // Uzyj server proxy dla Firebase Storage - rozwiazuje CORS
      const proxyUrl = `/api/audio/proxy?url=${encodeURIComponent(url)}`
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'audio/*,*/*;q=0.9'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      
      // Sprobuj zdekodowac audio z obsluga bledow dla mobilnych urzadzen
      let audioBuffer
      try {
        // Nowoczesna metoda Promise-based
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      } catch (decodeError) {
        console.warn('Modern decodeAudioData failed, trying legacy callback method:', decodeError)
        
        // Fallback dla starszych urzadzen - callback-based
        audioBuffer = await new Promise((resolve, reject) => {
          audioContext.decodeAudioData(
            arrayBuffer.slice(), // Klonuj buffer
            (decodedData) => resolve(decodedData),
            (error) => {
              console.error('Legacy decodeAudioData also failed:', error)
              reject(new Error(`Audio decoding failed: ${error?.message || 'Unknown error'}`))
            }
          )
        })
      }
      
      console.log('Audio decoded:', {
        duration: audioBuffer.duration,
        channels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate
      })
      
      return audioBuffer
    } catch (err) {
      console.error('Error fetching/decoding audio:', err)
      
      // Jesli to problem z dekodowaniem, sprobuj inne podejscie
      if (err.name === 'EncodingError' || err.message.includes('decode')) {
        console.warn('Audio decoding failed, this might be due to unsupported format or corrupted file')
        throw new Error(`Audio file cannot be decoded. This may be due to an unsupported format or corrupted file. Original error: ${err.message}`)
      }
      
      throw err
    }
  }

  // Polacz wiele AudioBuffer w jeden
  const mergeAudioBuffers = (audioContext, audioBuffers, pauseBetween = 0) => {
    if (!audioBuffers.length) {
      throw new Error('No audio buffers to merge')
    }

    // Oblicz calkowity czas
    const totalDuration = audioBuffers.reduce((sum, buffer, index) => {
      return sum + buffer.duration + (index < audioBuffers.length - 1 ? pauseBetween : 0)
    }, 0)

    // Uzyj najwyzszej czestotliwosci probkowania
    const sampleRate = Math.max(...audioBuffers.map(buffer => buffer.sampleRate))
    const numberOfChannels = Math.max(...audioBuffers.map(buffer => buffer.numberOfChannels))

    // Utworz nowy buffer
    const mergedBuffer = audioContext.createBuffer(
      numberOfChannels,
      Math.ceil(totalDuration * sampleRate),
      sampleRate
    )

    let currentOffset = 0

    // Skopiuj kazdy buffer
    audioBuffers.forEach((buffer, bufferIndex) => {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const mergedChannelData = mergedBuffer.getChannelData(channel)
        
        if (channel < buffer.numberOfChannels) {
          const bufferChannelData = buffer.getChannelData(channel)
          
          // Resample jesli potrzebne
          if (buffer.sampleRate === sampleRate) {
            mergedChannelData.set(bufferChannelData, currentOffset)
          } else {
            // Prosty resampling
            const ratio = buffer.sampleRate / sampleRate
            const resampledLength = Math.floor(bufferChannelData.length / ratio)
            
            for (let i = 0; i < resampledLength; i++) {
              const sourceIndex = Math.floor(i * ratio)
              mergedChannelData[currentOffset + i] = bufferChannelData[sourceIndex]
            }
          }
        }
      }

      // Przejdz do nastepnego buffera z pauza
      currentOffset += Math.ceil(buffer.duration * sampleRate)
      if (bufferIndex < audioBuffers.length - 1) {
        currentOffset += Math.ceil(pauseBetween * sampleRate)
      }
    })

    return mergedBuffer
  }

  // Konwertuj AudioBuffer do WAV
  const audioBufferToWav = (audioBuffer) => {
    const numberOfChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const length = audioBuffer.length
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2)
    const view = new DataView(arrayBuffer)

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * numberOfChannels * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numberOfChannels * 2, true)
    view.setUint16(32, numberOfChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * numberOfChannels * 2, true)

    // Audio data
    let offset = 44
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        offset += 2
      }
    }

    return arrayBuffer
  }

  // Sprawdz czy AudioContext jest dostepny
  const isAudioContextSupported = computed(() => {
    if (!process.client) return false
    return !!(window.AudioContext || window.webkitAudioContext)
  })

  // Glowna funkcja laczenia audio z URL-ow
  const mergeAudioFromUrls = async (urls, options = {}) => {
    if (!urls || urls.length === 0) {
      throw new Error('No URLs provided for merging')
    }

    if (!isAudioContextSupported.value) {
      throw new Error('AudioContext not supported in this browser')
    }

    const {
      pauseBetween = 0,
      outputFormat = 'wav'
    } = options

    isProcessing.value = true
    error.value = null
    progress.value = 0

    try {
      console.log('Starting audio merge process:', {
        urls: urls.length,
        pauseBetween,
        outputFormat
      })

      // Utworz AudioContext
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const audioContext = new AudioContextClass()

      // Pobierz i zdekoduj wszystkie pliki audio
      const audioBuffers = []
      const failedUrls = []
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        try {
          const audioBuffer = await fetchAndDecodeAudio(audioContext, url)
          audioBuffers.push(audioBuffer)
        } catch (decodeError) {
          console.warn(`Failed to decode audio ${i + 1}/${urls.length}:`, decodeError)
          failedUrls.push({ url, error: decodeError.message })
          // Kontynuuj z nastepnym plikiem zamiast przerywac caly proces
        }
        
        progress.value = ((i + 1) / urls.length) * 50 // 50% za pobieranie
      }
      
      // Sprawdz czy udalo sie zdekodowac chociaz jeden plik
      if (audioBuffers.length === 0) {
        const errorMessage = `No audio files could be decoded. Failed files: ${failedUrls.length}`
        console.error(errorMessage, failedUrls)
        throw new Error(`${errorMessage}. This may be due to unsupported audio format or device limitations.`)
      }
      
      if (failedUrls.length > 0) {
        console.warn(`${failedUrls.length} audio files failed to decode but continuing with ${audioBuffers.length} successful files`)
      }

      console.log('All audio files decoded, starting merge...')

      // Polacz wszystkie buffery
      const mergedBuffer = mergeAudioBuffers(audioContext, audioBuffers, pauseBetween)
      
      progress.value = 75

      console.log('Audio merged, converting to output format...')

      // Konwertuj do wybranego formatu
      let blob
      let mimeType

      if (outputFormat === 'wav') {
        const wavArrayBuffer = audioBufferToWav(mergedBuffer)
        blob = new Blob([wavArrayBuffer], { type: 'audio/wav' })
        mimeType = 'audio/wav'
      } else {
        throw new Error(`Unsupported output format: ${outputFormat}`)
      }

      progress.value = 90

      // Utworz URL do pobrania
      const url = URL.createObjectURL(blob)
      
      progress.value = 100

      console.log('Audio merge completed successfully:', {
        duration: mergedBuffer.duration,
        size: blob.size,
        format: outputFormat
      })

      // Zamknij AudioContext
      await audioContext.close()

      return {
        url,
        blob,
        duration: mergedBuffer.duration,
        size: blob.size,
        mimeType
      }

    } catch (err) {
      console.error('Audio merge failed:', err)
      error.value = err.message
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  return {
    // State
    isProcessing: readonly(isProcessing),
    progress: readonly(progress),
    error: readonly(error),
    
    // Computed
    isMobile,
    isAudioContextSupported,
    
    // Methods
    mergeAudioFromUrls
  }
}