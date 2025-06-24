<template>
  <div class="min-h-screen bg-gradient-to-br from-sky-300 to-emerald-300">
    
    <header class="bg-brand-blue shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-white font-crimson italic opacity-90">My affirms</div>
            <h1 class="text-2xl font-bold text-white">Demo Afirmacji</h1>
          </div>
          <button
            @click="$router.push('/auth')"
            class="bg-white hover:bg-gray-100 text-brand-blue px-4 py-2 rounded-lg font-medium"
          >
            Zaloguj się
          </button>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-8">
      
      <!-- Wybór projektu demo -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6 max-w-md mx-auto">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Wybierz kategorię afirmacji</h3>
        <div class="space-y-2">
          <button
            v-for="project in demoProjects"
            :key="project.id"
            @click="selectProject(project)"
            :class="selectedProject?.id === project.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
            class="w-full px-4 py-3 rounded-lg font-medium transition-colors"
          >
            {{ project.name }}
          </button>
        </div>
      </div>

      <!-- Interfejs sesji -->
      <div v-if="selectedProject" class="bg-white rounded-lg shadow-lg p-8 mb-6 max-w-2xl mx-auto">
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
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium text-lg flex items-center gap-2"
            >
              <Play class="w-4 h-4" /> Rozpocznij sesję
            </button>
            
            <button
              v-if="isPlaying"
              @click="stopSession"
              class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <Square class="w-4 h-4" /> Stop
            </button>
            
            <button
              v-if="isPlaying"
              @click="nextAffirmation"
              class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <SkipForward class="w-4 h-4" /> Następna
            </button>
          </div>
        </div>
      </div>

      <!-- Ustawienia sesji -->
      <div v-if="selectedProject" class="bg-white rounded-lg shadow p-6 max-w-md mx-auto mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Ustawienia sesji</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prędkość mowy: {{ speechRate }}x
            </label>
            <input
              v-model.number="speechRate"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pauza między afirmacjami: {{ pauseDuration }}s
            </label>
            <input
              v-model.number="pauseDuration"
              type="range"
              min="1"
              max="10"
              step="0.5"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <label class="flex items-center">
            <input
              v-model="repeatAffirmation"
              type="checkbox"
              class="mr-2"
            />
            Powtarzaj każdą afirmację drugi raz
          </label>
          
          <div v-if="repeatAffirmation" class="mt-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Opóźnienie przed powtórzeniem: {{ repeatDelay }}s
            </label>
            <input
              v-model.number="repeatDelay"
              type="range"
              min="3"
              max="30"
              step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <!-- Call to action -->
      <div class="bg-white/95 rounded-lg shadow-lg p-6 max-w-md mx-auto text-center">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Podoba Ci się?</h3>
        <p class="text-gray-600 mb-4">Utwórz konto i stwórz własne afirmacje!</p>
        <button
          @click="$router.push('/auth')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium w-full"
        >
          Zacznij za darmo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play, Square, SkipForward } from 'lucide-vue-next'

const demoProjects = ref([
  {
    id: 'relacje',
    name: 'Relacje międzyludzkie',
    affirmations: [
      { id: 1, text: 'Jestem godny miłości i szacunku', isActive: true },
      { id: 2, text: 'Buduję zdrowe i harmonijne relacje', isActive: true },
      { id: 3, text: 'Komunikuję się jasno i ze zrozumieniem', isActive: true },
      { id: 4, text: 'Przyciągam pozytywnych ludzi do mojego życia', isActive: true }
    ]
  },
  {
    id: 'zdrowie',
    name: 'Zdrowie i dobre samopoczucie',
    affirmations: [
      { id: 1, text: 'Moje ciało jest silne i zdrowe', isActive: true },
      { id: 2, text: 'Każdego dnia czuję się lepiej', isActive: true },
      { id: 3, text: 'Dbam o siebie z miłością i troską', isActive: true },
      { id: 4, text: 'Mam energię na wszystko co ważne', isActive: true }
    ]
  },
  {
    id: 'finanse',
    name: 'Finanse i sukces',
    affirmations: [
      { id: 1, text: 'Pieniądze płyną do mnie z łatwością', isActive: true },
      { id: 2, text: 'Jestem otwarty na nowe możliwości zarobkowe', isActive: true },
      { id: 3, text: 'Zasługuję na finansową stabilność', isActive: true },
      { id: 4, text: 'Moje finanse rosną każdego dnia', isActive: true }
    ]
  }
])

const selectedProject = ref(null)
const isPlaying = ref(false)
const currentIndex = ref(0)
const currentAffirmation = ref(null)

const speechRate = ref(1.0)
const pauseDuration = ref(3)
const repeatAffirmation = ref(false)
const repeatDelay = ref(5)

const activeAffirmations = computed(() => {
  if (!selectedProject.value) return []
  return selectedProject.value.affirmations.filter(a => a.isActive)
})

const selectProject = (project) => {
  selectedProject.value = project
  currentIndex.value = 0
  currentAffirmation.value = null
  isPlaying.value = false
}

const startSession = async () => {
  if (activeAffirmations.value.length === 0) return
  
  isPlaying.value = true
  currentIndex.value = 0
  
  for (let i = 0; i < activeAffirmations.value.length; i++) {
    if (!isPlaying.value) break
    
    currentIndex.value = i
    currentAffirmation.value = activeAffirmations.value[i]
    
    await speakText(currentAffirmation.value.text)
    
    if (repeatAffirmation.value && isPlaying.value) {
      await new Promise(resolve => setTimeout(resolve, repeatDelay.value * 1000))
      if (isPlaying.value) {
        await speakText(currentAffirmation.value.text)
      }
    }
    
    if (i < activeAffirmations.value.length - 1 && isPlaying.value) {
      await new Promise(resolve => setTimeout(resolve, pauseDuration.value * 1000))
    }
  }
  
  isPlaying.value = false
  currentAffirmation.value = null
}

const stopSession = () => {
  isPlaying.value = false
  window.speechSynthesis.cancel()
  currentAffirmation.value = null
}

const nextAffirmation = () => {
  window.speechSynthesis.cancel()
  if (currentIndex.value < activeAffirmations.value.length - 1) {
    currentIndex.value++
    currentAffirmation.value = activeAffirmations.value[currentIndex.value]
    speakText(currentAffirmation.value.text)
  } else {
    stopSession()
  }
}

const speakText = (text) => {
  return new Promise((resolve) => {
    if (!isPlaying.value) {
      resolve()
      return
    }
    
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechRate.value
    utterance.lang = 'pl-PL'
    
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    
    window.speechSynthesis.speak(utterance)
  })
}

useHead({
  title: 'My affirms - Demo Afirmacji',
  meta: [
    { 
      name: 'description', 
      content: 'Wypróbuj afirmacje w praktyce. Wybierz kategorię i rozpocznij swoją pierwszą sesję afirmacji.' 
    }
  ]
})
</script>