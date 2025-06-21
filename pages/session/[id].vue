<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      
      <div class="text-center mb-8">
        <button
          @click="$router.back()"
          class="text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Powrót do projektu
        </button>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ project?.name || 'Sesja Afirmacji' }}
        </h1>
      </div>

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
            </label>
            <input
              v-model="speechRate"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              class="w-full"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pauza między afirmacjami: {{ pauseDuration }}s
            </label>
            <input
              v-model="pauseDuration"
              type="range"
              min="1"
              max="10"
              step="1"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play } from 'lucide-vue-next'

const route = useRoute()
const { getUserProjects } = useFirestore()

const project = ref(null)
const isPlaying = ref(false)
const currentIndex = ref(0)
const speechRate = ref(0.9)
const pauseDuration = ref(2)

const activeAffirmations = computed(() => 
  project.value?.affirmations?.filter(a => a.isActive) || []
)

const currentAffirmation = computed(() => 
  activeAffirmations.value[currentIndex.value]
)

const synth = ref(null)
const currentUtterance = ref(null)

onMounted(async () => {
  
  try {
    const projects = await getUserProjects()
    project.value = projects.find(p => p.id === route.params.id)
  } catch (error) {
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
    utterance.onerror = () => {
      resolve()
    }
    
    currentUtterance.value = utterance
    synth.value.speak(utterance)
  })
}

const startSession = async () => {
  if (activeAffirmations.value.length === 0) return
  
  isPlaying.value = true
  currentIndex.value = 0
  
  await playCurrentAffirmation()
}

const playCurrentAffirmation = async () => {
  if (!isPlaying.value || !currentAffirmation.value) return
  
  await speak(currentAffirmation.value.text)
  
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
  title: `Sesja: ${project.value?.name || 'Afirmacje'} - MyAffirms`
})
</script>