<template>
  <div class="min-h-screen bg-pastel-vanilla">
    
    <header class="bg-pastel-purple shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="text-center">
          <button
            @click="$router.back()"
            class="text-gray-700 hover:text-gray-900 opacity-90 hover:opacity-100 mb-4 inline-flex items-center gap-2 transition-colors"
          >
            <ChevronLeft class="w-4 h-4" /> Powrót do projektu
          </button>
          <div class="text-sm text-gray-700 font-crimson italic opacity-90 mb-2">My affirms</div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            {{ project?.name || 'Sesja Afirmacji' }}
          </h1>
        </div>
      </div>
    </header>
    
    <div class="container mx-auto px-4 py-8">

      <div class="bg-pastel-dun rounded-3xl p-10 mb-8 max-w-2xl mx-auto border border-pastel-cinereous">
        <div class="text-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            {{ isPlaying ? 'Trwa sesja' : 'Gotowy do rozpoczęcia' }}
          </h2>
          
          <div v-if="currentAffirmation" class="bg-pastel-dun rounded-lg p-6 mb-6 border border-pastel-cinereous">
            <p class="text-lg text-gray-900 leading-relaxed">{{ currentAffirmation.text }}</p>
          </div>
          
          <div v-if="activeAffirmations.length > 0" class="mb-4">
            <div class="text-sm text-gray-600 mb-2">
              Postęp: {{ currentIndex + 1 }} / {{ activeAffirmations.length }}
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-pastel-purple h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(currentIndex + 1) / activeAffirmations.length * 100}%` }"
              ></div>
            </div>
          </div>
          
          <div class="flex justify-center gap-4">
            <button
              v-if="!isPlaying"
              @click="startSession"
              :disabled="activeAffirmations.length === 0"
              class="bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 px-10 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 "
            >
              <Play class="w-4 h-4" /> Rozpocznij sesję
            </button>
            
            <button
              v-if="isPlaying"
              @click="stopSession"
              class="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-2"
            >
              <Square class="w-4 h-4" /> Stop
            </button>
            
            <button
              v-if="isPlaying"
              @click="nextAffirmation"
              class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-2"
            >
              <SkipForward class="w-4 h-4" /> Next
            </button>
          </div>
        </div>
      </div>

      <div class="bg-pastel-khaki rounded-3xl p-8 max-w-md mx-auto border border-pastel-cinereous">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Ustawienia sesji</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Speech rate: {{ speechRate }}x 
              <span v-if="speechRate == 0.8" class="text-green-600 font-medium">(natural - {{ (speechRate * 100).toFixed(0) }}% of full speed)</span>
              <span v-else-if="speechRate < 0.8" class="text-blue-600">{{ (speechRate * 100).toFixed(0) }}% of full speed</span>
              <span v-else class="text-orange-600">{{ (speechRate * 100).toFixed(0) }}% of full speed</span>
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
              <span class="text-green-600 font-medium">0.8x (natural - 80%)</span>
              <span>1.6x (160%)</span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pause between affirmations: {{ pauseDuration }}s
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
              Repeat each affirmation twice
            </label>
            
            <div v-if="repeatAffirmation" class="mt-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Delay before repeat: {{ repeatDelay }}s
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
          
          <div v-if="isFeatureEnabled('aiTts')" class="border-t border-gray-200 pt-4">
            <div class="flex items-center justify-between mb-3">
              <label class="text-sm font-medium text-gray-700">
                TTS Voice Quality
              </label>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span class="text-xs text-yellow-700 font-medium">PREMIUM</span>
              </div>
            </div>
            
            <label class="flex items-center text-sm font-medium text-gray-700 mb-2">
              <input
                v-model="useAiTts"
                type="checkbox"
                class="mr-2"
                @change="saveSettings"
              />
              Use AI TTS (higher voice quality)
            </label>
            
            <div v-if="useAiTts" class="mt-3 space-y-3">
              <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div class="text-xs text-blue-700">
                  <div class="font-medium mb-1">AI TTS Premium active:</div>
                  <div>• Different voice character simulation</div>
                  <div>• Optimized parameters for each voice</div>
                  <div>• AI processing delay</div>
                  <div class="mt-2 text-xs opacity-75">
                    <span v-if="ttsInfo.apiConfigured" class="text-green-600">✓ Google Cloud API configured</span>
                    <span v-else class="text-yellow-600">⚠ Demo mode - configure API key in .env for real Google Cloud TTS</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Select AI voice
                </label>
                <select 
                  v-model="aiVoiceId" 
                  @change="saveSettings"
                  class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option v-for="voice in getAvailableAiVoices()" :key="voice.id" :value="voice.id">
                    {{ voice.name }} - {{ voice.description }}
                  </option>
                </select>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="testCurrentVoice"
                  :disabled="testingVoice"
                  class="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 disabled:opacity-50 flex items-center"
                >
                  <Volume2 class="w-3 h-3 mr-1" />{{ testingVoice ? 'Testing...' : 'Test voice' }}
                </button>
                
                <button
                  @click="showCacheInfo"
                  class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 flex items-center"
                >
                  <BarChart3 class="w-3 h-3 mr-1" />Cache ({{ cacheSize }})
                </button>
                
                <button
                  @click="clearAudioCache"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 flex items-center"
                >
                  <Trash2 class="w-3 h-3 mr-1" />Clear cache
                </button>
              </div>
            </div>
          </div>
          
          <!-- TTS Info -->
          <div class="border-t border-gray-200 pt-4 mt-4">
            <details class="text-sm">
              <summary class="cursor-pointer text-gray-600 hover:text-gray-800">
                TTS Engine Information
              </summary>
              <div class="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600">
                <div v-if="ttsInfoLoaded" class="space-y-1">
                  <div><strong>Engine:</strong> {{ ttsInfo.engine }}</div>
                  <div><strong>Premium Status:</strong> {{ ttsInfo.isPremium ? 'Active' : 'Inactive' }}</div>
                  <div><strong>Available voices:</strong> {{ ttsInfo.availableVoices }}</div>
                  <div><strong>Polish voices:</strong> {{ ttsInfo.polishVoices }}</div>
                  <div><strong>Best PL voice:</strong> {{ ttsInfo.bestPolishVoice }}</div>
                  
                  <div v-if="ttsInfo.polishVoicesList?.length > 0" class="mt-2">
                    <strong>Available Polish voices:</strong>
                    <div class="ml-2 mt-1 space-y-1">
                      <div v-for="voice in ttsInfo.polishVoicesList" :key="voice.name" class="text-xs">
                        • {{ voice.name }} ({{ voice.lang }}) 
                        <span v-if="voice.localService" class="text-green-600">- local</span>
                        <span v-else class="text-blue-600">- online</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    @click="refreshTtsInfo" 
                    class="mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 flex items-center"
                  >
                    <RotateCcw class="w-3 h-3 mr-1" />Refresh TTS info
                  </button>
                </div>
                <div v-else class="text-gray-500">Loading information...</div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play, ChevronLeft, Volume2, BarChart3, Trash2, RotateCcw, Info, Square, SkipForward } from 'lucide-vue-next'

const route = useRoute()
const { user } = useAuth()
const { getUserProjects } = useFirestore()
const { isFeatureEnabled } = usePremium()
const { speak: ttsSpeak, getTtsInfo, getAvailableAiVoices, testVoice, getCacheInfo, clearCache } = useTextToSpeech()

const project = ref(null)
const isPlaying = ref(false)
const currentIndex = ref(0)

const defaultSettings = {
  speechRate: 0.8,
  pauseDuration: 15,
  repeatAffirmation: false,
  repeatDelay: 5,
  useAiTts: false,
  aiVoiceId: 'pl-PL-ZofiaNeural'
}

const speechRate = ref(defaultSettings.speechRate)
const pauseDuration = ref(defaultSettings.pauseDuration)
const repeatAffirmation = ref(defaultSettings.repeatAffirmation)
const repeatDelay = ref(defaultSettings.repeatDelay)
const useAiTts = ref(defaultSettings.useAiTts)
const aiVoiceId = ref(defaultSettings.aiVoiceId)

const activeAffirmations = computed(() => 
  project.value?.affirmations?.filter(a => a.isActive) || []
)

const currentAffirmation = computed(() => 
  activeAffirmations.value[currentIndex.value]
)

const synth = ref(null)
const currentUtterance = ref(null)

const ttsInfo = ref({})
const ttsInfoLoaded = ref(false)
const testingVoice = ref(false)
const cacheSize = ref(0)

const loadProject = async () => {
  try {
    if (user.value?.uid) {
      const saved = localStorage.getItem(`projects_${user.value.uid}`)
      if (saved) {
        const projects = JSON.parse(saved)
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
    useAiTts.value = Boolean(project.value.sessionSettings.useAiTts ?? defaultSettings.useAiTts)
    aiVoiceId.value = project.value.sessionSettings.aiVoiceId ?? defaultSettings.aiVoiceId
  } else {
    speechRate.value = defaultSettings.speechRate
    pauseDuration.value = defaultSettings.pauseDuration
    repeatAffirmation.value = defaultSettings.repeatAffirmation
    repeatDelay.value = defaultSettings.repeatDelay
    useAiTts.value = defaultSettings.useAiTts
    aiVoiceId.value = defaultSettings.aiVoiceId
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
    repeatDelay: repeatDelay.value,
    useAiTts: useAiTts.value,
    aiVoiceId: aiVoiceId.value
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
  
  try {
    ttsInfo.value = await getTtsInfo()
    ttsInfoLoaded.value = true
    updateCacheSize()
  } catch (error) {
    console.error('Error loading TTS info:', error)
    ttsInfoLoaded.value = true
  }
})

const speak = async (text) => {
  try {
    const options = {
      rate: speechRate.value,
      lang: 'pl-PL',
      useAi: useAiTts.value && isFeatureEnabled('aiTts'),
      voiceId: aiVoiceId.value
    }
    
    return await ttsSpeak(text, options)
  } catch (error) {
    console.error('TTS Error:', error)
    return Promise.resolve()
  }
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

const refreshTtsInfo = async () => {
  try {
    ttsInfoLoaded.value = false
    ttsInfo.value = await getTtsInfo()
    ttsInfoLoaded.value = true
    updateCacheSize()
  } catch (error) {
    console.error('Error refreshing TTS info:', error)
    ttsInfoLoaded.value = true
  }
}

const updateCacheSize = () => {
  try {
    const cacheInfo = getCacheInfo()
    cacheSize.value = cacheInfo.size
  } catch (error) {
    cacheSize.value = 0
  }
}

const testCurrentVoice = async () => {
  if (testingVoice.value || !useAiTts.value) return
  
  try {
    testingVoice.value = true
    const sampleText = "Hello! This is a premium voice test. Do you like its natural sound?"
    
    await testVoice(aiVoiceId.value, sampleText)
    updateCacheSize()
  } catch (error) {
    console.error('Voice test failed:', error)
    alert('Voice test failed. Check premium settings.')
  } finally {
    testingVoice.value = false
  }
}

const showCacheInfo = () => {
  const cacheInfo = getCacheInfo()
  alert(`TTS Cache:\n\nNumber of items: ${cacheInfo.size}\n\nSaved fragments:\n${cacheInfo.keys.slice(0, 5).join('\n')}\n${cacheInfo.size > 5 ? '\n... and more' : ''}`)
}

const clearAudioCache = () => {
  if (confirm('Are you sure you want to clear audio cache? All saved voice fragments will be removed.')) {
    clearCache()
    updateCacheSize()
    alert('Cache has been cleared.')
  }
}

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: `Sesja: ${project.value?.name || 'Afirmacje'} - My affirms`
})
</script>