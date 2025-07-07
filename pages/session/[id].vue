<template>
  <div class="min-h-screen bg-pastel-vanilla flex flex-col">
    <header class="bg-pastel-purple shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-gray-700 hover:text-gray-900">
            <ArrowLeft class="w-6 h-6" />
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 font-crimson">{{ project?.name }}</h1>
            <p class="text-sm text-gray-700 font-crimson italic opacity-90">
              {{ $t('session.title') }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-gray-700 opacity-90">{{ $t('app.welcome') }} {{ user?.email || $t('app.user_placeholder') }}</span>
          <LanguageSwitcher />
          <button @click="logout" class="text-gray-700 hover:text-gray-900">{{ $t('auth.logout') }}</button>
        </div>
      </div>
    </header>

    <main class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-2xl text-center">
        <div v-if="!isPlaying && !isFinished" class="space-y-6">
          <h2 class="text-3xl font-bold text-gray-900 font-crimson">{{ $t('session.ready_to_start') }}</h2>
          <p class="text-gray-600">
            {{ $t('session.session_contains_affirmations', { count: activeAffirmations.length }) }}
          </p>
          <button
            @click="startSession"
            :disabled="activeAffirmations.length === 0"
            class="bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 px-10 py-4 rounded-full font-medium text-lg flex items-center gap-2 mx-auto border-2 border-pastel-khaki-2 hover:border-gray-800"
          >
            <Play class="w-5 h-5" /> {{ $t('session.start') }}
          </button>
        </div>

        <div v-if="isPlaying" class="space-y-8">
          <div class="bg-pastel-dun rounded-lg p-8 min-h-[150px] flex items-center justify-center border border-pastel-cinereous">
            <p class="text-2xl text-gray-900 leading-relaxed font-crimson">
              {{ currentAffirmation?.text }}
            </p>
          </div>
          
          <div class="flex justify-center gap-4">
            <button
              @click="stopSession"
              class="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 border-2 border-red-500 hover:border-white"
            >
              <Square class="w-5 h-5" /> {{ $t('common.stop') }}
            </button>
            <button
              @click="nextAffirmation"
              class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 border-2 border-gray-600 hover:border-white"
            >
              <SkipForward class="w-5 h-5" /> {{ $t('common.next') }}
            </button>
          </div>
        </div>

        <div v-if="isFinished" class="space-y-6">
          <h2 class="text-3xl font-bold text-gray-900 font-crimson">{{ $t('session.finished_title') }}</h2>
          <p class="text-gray-600">
            {{ $t('session.finished_description') }}
          </p>
          <button
            @click="goBack"
            class="bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-800 px-10 py-4 rounded-full font-medium text-lg flex items-center gap-2 mx-auto border-2 border-pastel-khaki-2 hover:border-gray-800"
          >
            <CheckCircle class="w-5 h-5" /> {{ $t('session.finish') }}
          </button>
        </div>
      </div>
    </main>

    <footer v-if="isPlaying" class="p-4">
      <div class="max-w-2xl mx-auto">
        <div class="text-sm text-gray-600 mb-2 text-center">
          {{ $t('session.progress', { current: currentIndex + 1, total: activeAffirmations.length }) }}
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-pastel-purple h-2.5 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ArrowLeft, Play, Square, SkipForward, CheckCircle } from 'lucide-vue-next'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { user, logout: authLogout } = useAuth()
const { t, locale } = useI18n()
const { getUserProjects } = useFirestore()
const { speak, stop, isSpeaking, getLanguageMapping, getAvailableAiVoices } = useTextToSpeech()
const { play: playBackgroundMusic, stop: stopBackgroundMusic, fadeOut: fadeOutBackgroundMusic, setVolume: setMusicVolume } = useBackgroundMusic()

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref(null)
const isPlaying = ref(false)
const isFinished = ref(false)
const currentIndex = ref(0)
const currentAffirmation = ref(null)
const sessionTimeout = ref(null)

const activeAffirmations = computed(() => {
  if (!project.value || !project.value.affirmations) return []
  return project.value.affirmations.filter(a => a.isActive !== false)
})

const progress = computed(() => {
  if (!isPlaying.value || activeAffirmations.value.length === 0) return 0
  return ((currentIndex.value + 1) / activeAffirmations.value.length) * 100
})

const loadProject = async () => {
  
  if (!user.value?.uid) {
    return
  }
  
  // Najpierw spróbuj z localStorage (tam są zmergowane dane z app.vue)
  const savedProject = getProjectFromLocalStorage(projectId)
  
  if (savedProject) {
    project.value = savedProject
  } else {
    try {
      const projects = await getUserProjects()
      const firestoreProject = projects.find(p => p.id === projectId)
      
      if (firestoreProject) {
        project.value = firestoreProject
      } else {
      }
    } catch (error) {
      console.error('Session error loading project from Firestore:', error)
    }
  }
  
}

// Załaduj projekt gdy użytkownik jest dostępny
watch(user, (newUser) => {
  if (newUser) {
    loadProject()
  }
}, { immediate: true })

onMounted(() => {
  // Sync language from user profile
  const { ensureLanguageSync } = useI18nInit()
  ensureLanguageSync()
  
  // Jeśli użytkownik już jest załadowany, załaduj projekt od razu
  if (user.value) {
    loadProject()
  }
})

onUnmounted(() => {
  stop()
  
  // Stop background music when component unmounts
  stopBackgroundMusic()
  
  if (sessionTimeout.value) {
    clearTimeout(sessionTimeout.value)
  }
})

const getProjectFromLocalStorage = (id) => {
  if (!user.value?.uid) {
    return null
  }
  
  const key = `projects_${user.value.uid}`
  const saved = localStorage.getItem(key)
  
  if (saved) {
    try {
      const projects = JSON.parse(saved)
      
      const found = projects.find(p => p.id === id)
      return found
    } catch (e) {
      console.error('Session error parsing localStorage projects:', e)
      return null
    }
  }
  return null
}

const startSession = async () => {
  if (activeAffirmations.value.length === 0) return
  
  isFinished.value = false
  isPlaying.value = true
  currentIndex.value = 0
  
  // Start background music if enabled
  const settings = project.value?.sessionSettings || {}
  if (settings.backgroundMusic) {
    const musicVolume = settings.musicVolume || 0.15
    const musicType = settings.musicType || 'birds'
    
    // Use async/await for audio file loading
    try {
      await playBackgroundMusic(musicVolume, musicType)
    } catch (error) {
      console.error('Failed to start background music:', error)
    }
  }
  
  playCurrentAffirmation()
}

const getAppropriateVoiceId = (sessionSettings = {}) => {
  const currentLanguage = getLanguageMapping(locale.value)
  const voices = getAvailableAiVoices(currentLanguage)
  
  // Check if saved voice is for current language
  const savedVoiceId = sessionSettings.voiceId
  if (savedVoiceId && savedVoiceId.startsWith(currentLanguage)) {
    return savedVoiceId
  }
  
  // Check if we have a saved voice for current language in voicesByLanguage
  const savedByLanguage = sessionSettings.voicesByLanguage?.[currentLanguage]
  if (savedByLanguage && voices.find(v => v.id === savedByLanguage)) {
    return savedByLanguage
  }
  
  // Fallback to default voice for current language
  if (voices.length > 0) {
    const defaultVoice = voices.find(v => v.gender === 'female') || voices[0]
    return defaultVoice.id
  }
  
  return 'pl-PL-ZofiaNeural'
}

// Funkcja do odtwarzania afirmacji z pauzami między zdaniami używając premium głosu
const playAffirmationWithSentencePauses = async (affirmation, options) => {
  const { speechRate, sentencePause, voiceId } = options
  const sentences = affirmation.text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  const { autoGenerateAudio, playAudio } = useAffirmationAudio()
  
  for (let i = 0; i < sentences.length; i++) {
    if (!isPlaying.value) break // Sprawdź czy sesja nie została zatrzymana
    
    const sentence = sentences[i].trim()
    if (sentence) {
      // Utwórz tymczasowe ID dla zdania
      const sentenceId = `${affirmation.id}_sentence_${i}`
      const sentenceText = sentence + (sentence.match(/[.!?]$/) ? '' : '.')
      
      try {
        // Spróbuj odtworzyć pre-generowane audio dla zdania
        await playAudio(sentenceId, {
          playbackRate: speechRate,
          volume: 1.0
        }, user.value)
      } catch (error) {
        // Jeśli nie ma audio dla zdania, wygeneruj je na żywo z premium głosem
        console.log(`Generating audio for sentence: "${sentenceText}"`)
        try {
          await autoGenerateAudio(sentenceId, sentenceText, voiceId)
          // Spróbuj odtworzyć po wygenerowaniu
          await playAudio(sentenceId, {
            playbackRate: speechRate,
            volume: 1.0
          }, user.value)
        } catch (generateError) {
          // Ostateczny fallback do TTS
          console.warn('Fallback to TTS for sentence:', sentenceText)
          await speak(sentenceText, { 
            rate: speechRate, 
            voiceId: voiceId
          })
        }
      }
      
      // Dodaj pauzę między zdaniami (oprócz ostatniego)
      if (i < sentences.length - 1 && isPlaying.value) {
        await new Promise(resolve => {
          const pauseTimeout = setTimeout(resolve, sentencePause * 1000)
          // Sprawdzaj co 100ms czy sesja nie została zatrzymana
          const checkInterval = setInterval(() => {
            if (!isPlaying.value) {
              clearTimeout(pauseTimeout)
              clearInterval(checkInterval)
              resolve()
            }
          }, 100)
          
          setTimeout(() => clearInterval(checkInterval), sentencePause * 1000)
        })
      }
    }
  }
}

const playCurrentAffirmation = async () => {
  if (!isPlaying.value) return
  
  currentAffirmation.value = activeAffirmations.value[currentIndex.value]
  
  const settings = project.value?.sessionSettings || {}
  const { speechRate = 1.0, pauseDuration = 3, sentencePause = 4, repeatAffirmation = false, repeatDelay = 5 } = settings
  
  try {
    // Poczekaj na załadowanie user jeśli nie jest jeszcze dostępny
    if (!user.value) {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          unwatch()
          reject(new Error('User loading timeout'))
        }, 5000) // 5s timeout
        
        const unwatch = watch(user, (newUser) => {
          if (newUser) {
            clearTimeout(timeout)
            unwatch()
            resolve()
          }
        })
      })
    }
    
    // Sprawdź czy tekst ma wiele zdań i czy pauza jest włączona
    const sentences = currentAffirmation.value.text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const hasMultipleSentences = sentences.length > 1
    const shouldUseSentencePause = sentencePause > 0 && hasMultipleSentences
    const voiceId = getAppropriateVoiceId(settings)
    
    if (shouldUseSentencePause) {
      // Dla wielozdaniowych afirmacji z pauzami - generuj audio dla każdego zdania osobno
      await playAffirmationWithSentencePauses(currentAffirmation.value, {
        speechRate,
        sentencePause,
        voiceId
      })
    } else {
      // Użyj pre-generowanych plików audio (dla pojedynczych zdań lub gdy pauza wyłączona)
      const { playAudio } = useAffirmationAudio()
      await playAudio(currentAffirmation.value.id, {
        playbackRate: speechRate,
        volume: 1.0
      }, user.value)
    }
    
    if (repeatAffirmation && isPlaying.value) {
      sessionTimeout.value = setTimeout(async () => {
        if (isPlaying.value) {
          // Użyj tej samej logiki co przy pierwszym odtwarzaniu
          if (shouldUseSentencePause) {
            await playAffirmationWithSentencePauses(currentAffirmation.value, {
              speechRate,
              sentencePause,
              voiceId
            })
          } else {
            const { playAudio } = useAffirmationAudio()
            await playAudio(currentAffirmation.value.id, {
              playbackRate: speechRate,
              volume: 1.0
            }, user.value)
          }
          scheduleNextAffirmation(pauseDuration)
        }
      }, repeatDelay * 1000)
    } else {
      scheduleNextAffirmation(pauseDuration)
    }
  } catch (error) {
    console.error('Audio playback failed:', error)
    
    // Fallback do generowania na żywo (jeśli audio nie istnieje)
    // voiceId już zadeklarowane wyżej
    
    try {
      // W fallback zawsze używaj TTS z pauzami (jeśli są włączone)
      const voiceId = getAppropriateVoiceId(settings)
      const sentences = currentAffirmation.value.text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const hasMultipleSentences = sentences.length > 1
      const shouldUseSentencePause = sentencePause > 0 && hasMultipleSentences
      
      await speak(currentAffirmation.value.text, { 
        rate: speechRate, 
        sentencePause: shouldUseSentencePause ? sentencePause : 0,
        voiceId: voiceId
      })
      
      if (repeatAffirmation && isPlaying.value) {
        sessionTimeout.value = setTimeout(async () => {
          if (isPlaying.value) {
            await speak(currentAffirmation.value.text, { 
              rate: speechRate, 
              sentencePause: shouldUseSentencePause ? sentencePause : 0,
              voiceId: voiceId
            })
            scheduleNextAffirmation(pauseDuration)
          }
        }, repeatDelay * 1000)
      } else {
        scheduleNextAffirmation(pauseDuration)
      }
    } catch (fallbackError) {
      console.error('Fallback TTS also failed:', fallbackError)
      // Przejdź do następnej afirmacji
      scheduleNextAffirmation(pauseDuration)
    }
  }
}

const scheduleNextAffirmation = (pauseDuration) => {
  if (isPlaying.value) {
    sessionTimeout.value = setTimeout(() => {
      if (isPlaying.value) {
        nextAffirmation()
      }
    }, pauseDuration * 1000)
  }
}

const stopSession = () => {
  isPlaying.value = false
  isFinished.value = true
  stop()
  
  // Stop background music with fade out
  fadeOutBackgroundMusic()
  
  if (sessionTimeout.value) {
    clearTimeout(sessionTimeout.value)
  }
}

const nextAffirmation = () => {
  stop()
  if (sessionTimeout.value) {
    clearTimeout(sessionTimeout.value)
  }

  if (currentIndex.value < activeAffirmations.value.length - 1) {
    currentIndex.value++
    playCurrentAffirmation()
  } else {
    isPlaying.value = false
    isFinished.value = true
    
    // Stop background music when session finishes naturally
    fadeOutBackgroundMusic()
  }
}

const goBack = () => {
  router.push(`/project/${projectId}`)
}

const logout = async () => {
  await authLogout()
  router.push('/auth')
}

useHead({
  title: computed(() => t('session.page_title', { name: project.value?.name || 'Project' }))
})
</script>