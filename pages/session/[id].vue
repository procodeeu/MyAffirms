<template>
  <div class="min-h-screen bg-brand-bg">
    
    <header class="bg-brand-blue shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="text-center">
          <button
            @click="$router.back()"
            class="text-white hover:text-white opacity-90 hover:opacity-100 mb-4 inline-block"
          >
            ← Powrót do projektu
          </button>
          <div class="text-sm text-white font-crimson italic opacity-90 mb-2">My affirms</div>
          <h1 class="text-3xl font-bold text-white mb-2">
            {{ project?.name || 'Sesja Afirmacji' }}
          </h1>
        </div>
      </div>
    </header>
    
    <div class="container mx-auto px-4 py-8">

      <div class="bg-white rounded-lg shadow-lg p-8 mb-6 max-w-2xl mx-auto">
        <div class="text-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            {{ isPlaying ? 'Trwa sesja' : 'Gotowy do rozpoczęcia' }}
          </h2>
          
          <div v-if="currentAffirmation" class="bg-blue-50 rounded-lg p-6 mb-6">
            <p class="text-lg text-gray-900 leading-relaxed">{{ currentAffirmation.text }}</p>
          </div>
          
          <div v-if="activeAffirmations.length > 0" class="mb-4">
            <div class="text-sm text-gray-600 mb-2">
              Postęp: {{ currentIndex + 1 }} / {{ activeAffirmations.length }}
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(currentIndex + 1) / activeAffirmations.length * 100}%` }"
              ></div>
            </div>
          </div>
          
          <div class="flex justify-center gap-4">
            <button
              v-if="!isPlaying"
              @click="startSession"
              :disabled="activeAffirmations.length === 0"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium text-lg"
            >
              <Play class="w-4 h-4" /> Rozpocznij sesję
            </button>
            
            <button
              v-if="isPlaying"
              @click="stopSession"
              class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              ⏹ Stop
            </button>
            
            <button
              v-if="isPlaying"
              @click="nextAffirmation"
              class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              ⏭ Następna
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Ustawienia sesji</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prędkość mowy: {{ speechRate }}x 
              <span v-if="speechRate == 0.8" class="text-green-600 font-medium">(naturalna - {{ (speechRate * 100).toFixed(0) }}% prędkości pełnej)</span>
              <span v-else-if="speechRate < 0.8" class="text-blue-600">{{ (speechRate * 100).toFixed(0) }}% prędkości pełnej</span>
              <span v-else class="text-orange-600">{{ (speechRate * 100).toFixed(0) }}% prędkości pełnej</span>
            </label>
            <input
              v-model.number="speechRate"
              type="range"
              min="0.4"
              max="1.6"
              step="0.1"
              class="w-full"
              @input="() => nextTick(() => saveSettings())"
              @change="() => nextTick(() => saveSettings())"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.4x (40%)</span>
              <span class="text-green-600 font-medium">0.8x (naturalna - 80%)</span>
              <span>1.6x (160%)</span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pauza między afirmacjami: {{ pauseDuration }}s
            </label>
            <input
              v-model.number="pauseDuration"
              type="range"
              min="3"
              max="30"
              step="1"
              class="w-full"
              @input="saveSettings"
              @change="saveSettings"
            />
          </div>
          
          <div>
            <label class="flex items-center text-sm font-medium text-gray-700 mb-2">
              <input
                v-model="repeatAffirmation"
                type="checkbox"
                class="mr-2"
                @change="saveSettings"
              />
              Powtarzaj każdą afirmację drugi raz
            </label>
            
            <div v-if="repeatAffirmation" class="ml-6 mt-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Opóźnienie przed powtórzeniem: {{ repeatDelay }}s
              </label>
              <input
                v-model.number="repeatDelay"
                type="range"
                min="3"
                max="30"
                step="1"
                class="w-full"
                @input="saveSettings"
                @change="saveSettings"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play } from 'lucide-vue-next'

const route = useRoute()
const { user } = useAuth()
const { getUserProjects } = useFirestore()

const project = ref(null)
const isPlaying = ref(false)
const currentIndex = ref(0)

const defaultSettings = {
  speechRate: 0.8,
  pauseDuration: 15,
  repeatAffirmation: false,
  repeatDelay: 5
}

const speechRate = ref(defaultSettings.speechRate)
const pauseDuration = ref(defaultSettings.pauseDuration)
const repeatAffirmation = ref(defaultSettings.repeatAffirmation)
const repeatDelay = ref(defaultSettings.repeatDelay)

const activeAffirmations = computed(() => 
  project.value?.affirmations?.filter(a => a.isActive) || []
)

const currentAffirmation = computed(() => 
  activeAffirmations.value[currentIndex.value]
)

const synth = ref(null)
const currentUtterance = ref(null)

const loadProject = async () => {
  try {
    if (user.value?.uid) {
      const saved = localStorage.getItem(`projects_${user.value.uid}`)
      if (saved) {
        const projects = JSON.parse(saved)
        ))
        project.value = projects.find(p => p.id === route.params.id)
        } else {
        }
    }

    if (!project.value) {
      try {
        const projects = await getUserProjects()
        project.value = projects.find(p => p.id === route.params.id)
        } catch (firebaseError) {
        }
    }

    if (project.value) {
      loadSettings()
    }
  } catch (error) {
    }
}

const loadSettings = () => {
  if (isSavingSettings) {
    return
  }
  
  isLoadingSettings = true
  if (project.value?.sessionSettings) {
    speechRate.value = Number(project.value.sessionSettings.speechRate ?? defaultSettings.speechRate)
    pauseDuration.value = Number(project.value.sessionSettings.pauseDuration ?? defaultSettings.pauseDuration)
    repeatAffirmation.value = Boolean(project.value.sessionSettings.repeatAffirmation ?? defaultSettings.repeatAffirmation)
    repeatDelay.value = Number(project.value.sessionSettings.repeatDelay ?? defaultSettings.repeatDelay)
  } else {
    speechRate.value = defaultSettings.speechRate
    pauseDuration.value = defaultSettings.pauseDuration
    repeatAffirmation.value = defaultSettings.repeatAffirmation
    repeatDelay.value = defaultSettings.repeatDelay
  }
  
  isLoadingSettings = false
}

let isSavingSettings = false
let isLoadingSettings = false

const saveSettings = async () => {
  if (!project.value || isSavingSettings || isLoadingSettings) {
    return
  }
  
  isSavingSettings = true
  
  const settings = {
    speechRate: speechRate.value,
    pauseDuration: pauseDuration.value,
    repeatAffirmation: repeatAffirmation.value,
    repeatDelay: repeatDelay.value
  }

  if (project.value.sessionSettings) {
    Object.assign(project.value.sessionSettings, settings)
  } else {
    project.value.sessionSettings = settings
  }

  if (user.value?.uid) {
    try {
      const saved = localStorage.getItem(`projects_${user.value.uid}`)
      if (saved) {
        const projects = JSON.parse(saved)
        const projectIndex = projects.findIndex(p => p.id === project.value.id)
        if (projectIndex !== -1) {
          projects[projectIndex].sessionSettings = settings
          localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects))
        }
      }
    } catch (error) {
      }
  }

  clearTimeout(saveSettings.timeout)
  saveSettings.timeout = setTimeout(async () => {
    if (user.value?.uid && project.value?.id) {
      try {
        const { updateProject } = useFirestore()
        await updateProject(project.value.id, { sessionSettings: settings })
      } catch (error) {
        
        if (!error.message?.includes('not authenticated')) {
          }
      }
    }
    isSavingSettings = false
  }, 1000)

  setTimeout(() => {
    isSavingSettings = false
  }, 100)
}

watchEffect(() => {
  if (user.value) {
    loadProject()
  }
})

watch(() => project.value?.id, (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    loadSettings()
  }
})

onMounted(async () => {
  
  if (user.value) {
    await loadProject()
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synth.value = window.speechSynthesis
  }
})

const speak = (text) => {
  return new Promise((resolve) => {
    if (!synth.value) {
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechRate.value
    utterance.onend = () => {
      resolve()
    }
    utterance.onerror = (error) => {
      resolve()
    }
    utterance.onstart = () => {
      }
    
    currentUtterance.value = utterance
    synth.value.speak(utterance)
  })
}

const startSession = async () => {
  if (activeAffirmations.value.length === 0) {
    return
  }
  
  isPlaying.value = true
  currentIndex.value = 0
  
  await playCurrentAffirmation()
}

const playCurrentAffirmation = async () => {
  if (!isPlaying.value || !currentAffirmation.value) {
    return
  }
  
  await speak(currentAffirmation.value.text)

  if (isPlaying.value && repeatAffirmation.value) {
    await new Promise(resolve => setTimeout(resolve, repeatDelay.value * 1000))
    
    if (isPlaying.value) {
      await speak(currentAffirmation.value.text)
    }
  }
  
  if (isPlaying.value) {
    await new Promise(resolve => setTimeout(resolve, pauseDuration.value * 1000))
    nextAffirmation()
  }
}

const nextAffirmation = async () => {
  if (!isPlaying.value) return
  
  currentIndex.value++
  
  if (currentIndex.value >= activeAffirmations.value.length) {
    stopSession()
  } else {
    await playCurrentAffirmation()
  }
}

const stopSession = () => {
  isPlaying.value = false
  currentIndex.value = 0
  
  if (synth.value && synth.value.speaking) {
    synth.value.cancel()
  }
}

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: `Sesja: ${project.value?.name || 'Afirmacje'} - My affirms`
})
</script>