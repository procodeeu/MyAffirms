// Audio Playback - odpowiedzialny tylko za odtwarzanie audio
export const useAudioPlayback = () => {
  const activeAudioElements = ref([])
  const isStopped = ref(false)

  // Odtwórz audio z URL
  const playAudioFromUrl = async (audioUrl, options = {}) => {
    if (!audioUrl) {
      throw new Error('No audio URL provided')
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio()
      
      // Dodaj do aktywnych elementów
      activeAudioElements.value.push(audio)

      audio.onloadstart = () => {
        console.log('🎵 Audio loading started')
      }

      audio.oncanplay = () => {
        console.log('🎵 Audio can start playing')
      }

      audio.onended = () => {
        console.log('✅ Audio playback finished')
        removeFromActiveElements(audio)
        resolve()
      }

      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e)
        removeFromActiveElements(audio)
        reject(new Error('Audio playback failed'))
      }

      // Obsługa zatrzymania podczas odtwarzania
      audio.onpause = () => {
        if (isStopped.value) {
          removeFromActiveElements(audio)
        }
      }

      // Ustaw opcje audio
      if (options.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume))
      }

      if (options.playbackRate !== undefined) {
        audio.playbackRate = Math.max(0.25, Math.min(4, options.playbackRate))
      }

      // Załaduj i odtwórz - dodaj timestamp żeby uniknąć cache
      const urlWithTimestamp = audioUrl + '?t=' + Date.now()
      audio.src = urlWithTimestamp
      audio.load()

      audio.play().catch(reject)
    })
  }

  // Odtwórz sekwencję audio z pauzami
  const playAudioSequence = async (audioUrls, options = {}) => {
    const { sentencePause = 0, speechRate = 1.0, postSequencePause = 0 } = options;

    for (let i = 0; i < audioUrls.length; i++) {
      if (isStopped.value) break;

      const audioUrl = audioUrls[i];
      
      try {
        await playAudioFromUrl(audioUrl, {
          playbackRate: speechRate,
          volume: 1.0
        });
      } catch (error) {
        console.warn(`⚠️ Failed to play audio ${i + 1}:`, error);
      }

      if (i < audioUrls.length - 1 && sentencePause > 0 && !isStopped.value) {
        await playSilence(sentencePause);
      }
    }

    // Play pause after the entire sequence is done
    if (!isStopped.value && postSequencePause > 0) {
      console.log(`Playing post-sequence pause of ${postSequencePause}s`);
      await playSilence(postSequencePause);
    }
  };

  const playSilence = async (duration) => {
    if (isStopped.value) return;
    console.log(`Playing silence for ${duration}s`);
    const silenceUrl = '/audio/silence/longchirp-88445.mp3';
    try {
      await playAudioFromUrl(silenceUrl);
    } catch (error) {
      console.warn('Failed to play silence audio, falling back to timeout', error);
      await new Promise(resolve => setTimeout(resolve, duration * 1000));
    }
  };

  // Usuń audio element z aktywnych
  const removeFromActiveElements = (audio) => {
    const index = activeAudioElements.value.indexOf(audio)
    if (index > -1) {
      activeAudioElements.value.splice(index, 1)
    }
  }

  // Zatrzymaj wszystkie aktywne audio
  const stopAllAudio = () => {
    isStopped.value = true

    activeAudioElements.value.forEach(audio => {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch (error) {
        console.warn('⚠️ Error stopping audio element:', error)
      }
    })

    activeAudioElements.value = []
  }

  // Reset stopped flag
  const resetStoppedFlag = () => {
    isStopped.value = false
  }

  return {
    // State
    activeAudioCount: computed(() => activeAudioElements.value.length),
    isStopped: readonly(isStopped),

    // Methods
    playAudioFromUrl,
    playAudioSequence,
    stopAllAudio,
    resetStoppedFlag
  }
}