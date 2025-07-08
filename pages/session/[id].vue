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
            {{ $t('session.session_contains_affirmations', { count: activeAffirmations?.length || 0 }) }}
          </p>
          <button
            @click="startSession"
            :disabled="(activeAffirmations?.length || 0) === 0"
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
          {{ $t('session.progress', { current: currentIndex + 1, total: activeAffirmations?.length || 0 }) }}
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-pastel-purple h-2.5 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </footer>
    
    <!-- Background Audio Controls - temporarily disabled -->
    <!-- <BackgroundAudioControls :show-debug-info="true" /> -->
  </div>
</template>

<script setup>
import { ArrowLeft, Play, Square, SkipForward, CheckCircle } from 'lucide-vue-next'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'
import BackgroundAudioControls from '~/components/BackgroundAudioControls.vue'
// import { useBackgroundAudioSession } from '~/composables/useBackgroundAudioSession'

const { user, logout: authLogout } = useAuth()
const { useLogger } = await import('~/composables/useLogger.js')
const logger = useLogger()
const { t, locale } = useI18n()
const { getUserProjects } = useFirestore()
// const backgroundAudioSession = useBackgroundAudioSession()
const sessionAudioManager = useSessionAudioManager()

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref(null)

// Use session audio manager
const { 
  isPlaying, 
  isFinished, 
  currentAffirmation, 
  currentIndex, 
  progress,
  startAudioSession,
  stopAudioSession,
  nextAudioAffirmation
} = sessionAudioManager

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
  // Stop any active audio session
  if (isPlaying.value) {
    stopAudioSession()
  }
})

const startSession = async () => {
  if ((activeAffirmations.value?.length || 0) === 0) return
  
  const settings = project.value?.sessionSettings || {}
  
  try {
    await startAudioSession(activeAffirmations.value, settings)
  } catch (error) {
    console.error('Failed to start session:', error)
    // Optionally show user-friendly error message
  }
}

// Voice selection logic moved to Session Audio Manager

// Sentence pause logic moved to Session Audio Manager

// Affirmation playback logic moved to Session Audio Manager

// Scheduling logic moved to Session Audio Manager

const stopSession = async () => {
  await stopAudioSession()
}

const nextAffirmation = async () => {
  await nextAudioAffirmation()
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