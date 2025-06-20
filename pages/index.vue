<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Affirmations App</h1>
        <p class="text-gray-600">Create and play your personal affirmations</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="text-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            {{ isPlaying ? 'Now Playing' : 'Ready to Start' }}
          </h2>
          
          <div v-if="currentAffirmation" class="bg-blue-50 rounded-lg p-4 mb-4">
            <p class="text-lg text-gray-900">{{ currentAffirmation.text }}</p>
          </div>
          
          <div class="flex justify-center gap-4">
            <button
              v-if="!isPlaying"
              @click="startSession"
              :disabled="activeAffirmations.length === 0"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Play class="w-4 h-4" /> Start Session
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
              ⏭ Next
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Affirmation</h3>
        <div class="flex gap-2">
          <input
            v-model="newAffirmationText"
            type="text"
            placeholder="Enter your affirmation..."
            class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="addAffirmation"
          />
          <button
            @click="addAffirmation"
            :disabled="!newAffirmationText.trim()"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium"
          >
            Add
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Your Affirmations ({{ activeAffirmations.length }})
        </h3>
        
        <div class="space-y-3">
          <div
            v-for="affirmation in store.affirmations"
            :key="affirmation.id"
            class="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div class="flex-1">
              <p :class="affirmation.isActive ? 'text-gray-900' : 'text-gray-400 line-through'">
                {{ affirmation.text }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="store.toggleAffirmation(affirmation.id)"
                :class="affirmation.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'"
                class="px-2 py-1 rounded font-medium"
              >
                {{ affirmation.isActive ? '<Check class="w-4 h-4" />' : '<Circle class="w-4 h-4" />' }}
              </button>
              <button
                @click="deleteAffirmation(affirmation.id)"
                class="text-red-600 hover:text-red-800 px-2 py-1 rounded"
              >
                🗑
              </button>
            </div>
          </div>
          
          <div v-if="store.affirmations.length === 0" class="text-center py-8">
            <p class="text-gray-500">No affirmations yet. Add your first one above!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play, Check, Circle } from 'lucide-vue-next'

const store = useAffirmationsStore()
const newAffirmationText = ref('')
const isPlaying = ref(false)
const currentIndex = ref(0)

const activeAffirmations = computed(() => 
  store.affirmations.filter(a => a.isActive)
)

const currentAffirmation = computed(() => 
  activeAffirmations.value[currentIndex.value]
)

const synth = ref(null)
const currentUtterance = ref(null)

onMounted(() => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synth.value = window.speechSynthesis
  }
})

const addAffirmation = () => {
  if (newAffirmationText.value.trim()) {
    store.addAffirmation(newAffirmationText.value.trim())
    newAffirmationText.value = ''
  }
}

const deleteAffirmation = (id) => {
  store.deleteAffirmation(id)
}

const speak = (text) => {
  return new Promise((resolve) => {
    if (!synth.value) {
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
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
    await new Promise(resolve => setTimeout(resolve, 2000))
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

useHead({
  title: 'Affirmations App'
})
</script>