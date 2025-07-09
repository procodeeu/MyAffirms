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
        <div v-if="!mergedAudioUrl && !isPreparingMergedAudio" class="space-y-6">
          <h2 class="text-3xl font-bold text-gray-900 font-crimson">{{ $t('session.ready_to_start') }}</h2>
          <p class="text-gray-600">
            {{ $t('session.session_contains_affirmations', { count: activeAffirmations?.length || 0 }) }}
          </p>
          
          <!-- Info o unified audio -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">
              🎵 {{ $t('session.merging_all_affirmations') }}
            </p>
            <p class="text-xs text-blue-600 mt-2" v-if="!isAudioContextSupported">
              ⚠️ Audio merging may not work on this device. If it fails, please use individual playback from the project page.
            </p>
          </div>
          
          <button
            @click="handlePrepareSession"
            :disabled="(activeAffirmations?.length || 0) === 0"
            class="bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 px-10 py-4 rounded-full font-medium text-lg flex items-center gap-2 mx-auto border-2 border-pastel-khaki-2 hover:border-gray-800"
          >
            <Play class="w-5 h-5" /> {{ $t('session.prepare') }}
          </button>
        </div>

        <!-- Loading state podczas przygotowywania merged audio -->
        <div v-if="isPreparingMergedAudio" class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-900 font-crimson">Przygotowywanie audio...</h2>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div class="flex items-center justify-center space-x-3">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p class="text-blue-800">Łączenie plików audio...</p>
            </div>
            <p class="text-sm text-blue-600 mt-2 text-center">
              Optymalizacja dla urządzeń mobilnych
            </p>
          </div>
        </div>

        <!-- Natywny odtwarzacz HTML5 gdy audio jest gotowe -->
        <div v-if="mergedAudioUrl && !isPreparingMergedAudio" class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-900 font-crimson">Audio gotowe do odtwarzania</h2>
          
          <div class="bg-green-50 border border-green-200 rounded-lg p-6">
            <p class="text-green-800 mb-4 text-center">
              ✅ Wszystkie afirmacje zostały połączone w jeden plik audio
            </p>
            
            <!-- Natywny odtwarzacz HTML5 z kontrolkami -->
            <audio 
              :src="mergedAudioUrl" 
              controls 
              preload="metadata"
              class="w-full max-w-md mx-auto"
              style="height: 54px;"
            >
              Twoja przeglądarka nie obsługuje odtwarzacza audio.
            </audio>
            
            <p class="text-sm text-green-600 mt-4 text-center">
              💡 Odtwarzacz działa w tle nawet po wygaszeniu ekranu
            </p>
          </div>
          
          <button
            @click="stopSession"
            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-medium mx-auto flex items-center gap-2"
          >
            🔄 Przygotuj nową sesję
          </button>
        </div>

        <!-- Sekcja zakończenia - opcjonalnie można zachować -->
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

    <!-- Footer usunięty - teraz używamy natywnego odtwarzacza -->
    
    <!-- Background Audio Controls - now using unified audio -->
    <BackgroundAudioControls :show-debug-info="true" />
  </div>
</template>

<script setup>
import { ArrowLeft, Play, Square, SkipForward, CheckCircle } from 'lucide-vue-next'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'
import BackgroundAudioControls from '~/components/BackgroundAudioControls.vue'
// import { useBackgroundAudioSession } from '~/composables/useBackgroundAudioSession'

const { user, logout: authLogout } = useAuth()
const { t, locale } = useI18n()
const { getUserProjects } = useFirestore()
// const backgroundAudioSession = useBackgroundAudioSession()
const unifiedAudioSession = useUnifiedAudioSession()

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref(null)

// Use unified audio session (merged audio dla wszystkich urządzeń)
const { 
  isPlaying, 
  isFinished,
  isPreparingMergedAudio,
  activeAffirmations: sessionAffirmations,
  mergedAudioUrl,
  progress,
  prepareSession,
  stopSession,
  isAudioContextSupported
} = unifiedAudioSession

// Helper function - define before use
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

const activeAffirmations = computed(() => {
  if (!project.value?.affirmations) return []
  return project.value.affirmations.filter(a => a.isActive !== false)
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
  // Cleanup merged audio URL when leaving
  stopSession()
})

// Handler for preparing session with unified audio
const handlePrepareSession = async () => {
  if (!activeAffirmations.value?.length) {
    console.warn('No active affirmations to prepare session')
    return
  }

  try {
    console.log('Preparing unified audio session', {
      projectId: projectId,
      affirmationsCount: activeAffirmations.value.length
    })

    // Get session settings (you can extend this)
    const sessionSettings = {
      sentencePause: 0.5,
      affirmationPause: 2.0,
      speechRate: 1.0,
      ...project.value?.sessionSettings
    }

    await prepareSession(activeAffirmations.value, sessionSettings)
  } catch (error) {
    console.error('Failed to prepare unified session:', error)
    
    // Pokaz uzytkownikowi przyjazny komunikat o bledzie
    if (error.message.includes('decode') || error.message.includes('AudioContext')) {
      alert('Audio merging is not supported on this device. Please go back to the project page and use individual affirmation playback instead.')
    } else {
      alert(`Failed to prepare audio session: ${error.message}`)
    }
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