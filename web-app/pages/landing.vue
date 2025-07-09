<template>
  <div class="min-h-screen bg-pastel-vanilla">
    
    <header class="">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="/logo-my-affirms.svg" alt="My Affirms" class="h-8 w-auto" />
            <div>
              <h1 class="text-xl font-bold text-gray-800">{{ $t('landing.demo_title') }}</h1>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="$router.push('/auth')"
              class="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-full font-medium  border-2 border-gray-800"
            >
              {{ $t('auth.login') }}
            </button>
            <LanguageSwitcher />
            <button
              @click="$router.push('/auth')"
              class="text-gray-700 hover:text-gray-900 px-6 py-3 rounded-full font-medium  border-2 border-transparent active:border-gray-800"
            >
              {{ $t('auth.register_button') }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-8">
      
      <!-- Demo project selection -->
      <div class="bg-pastel-violet border-2 border-pastel-rose rounded-4xl p-8 mb-8 max-w-md mx-auto">
        <h3 class="text-base font-medium text-gray-900 mb-4">{{ $t('landing.select_category') }}</h3>
        <div class="space-y-2">
          <button
            v-for="project in demoProjects"
            :key="project.id"
            @click="selectProject(project)"
            :class="selectedProject?.id === project.id ? 'bg-pastel-purple text-gray-800' : 'bg-pastel-khaki text-gray-800 hover:bg-pastel-khaki-2'"
            class="w-full px-4 py-3 rounded-full font-medium transition-all duration-200 border-2 border-transparent hover:border-gray-800"
          >
            {{ project.name }}
          </button>
        </div>
      </div>

      <!-- Interfejs sesji -->
      <div v-if="selectedProject" class="bg-pastel-khaki border-2 border-pastel-dun rounded-4xl p-10 mb-8 max-w-2xl mx-auto">
        <div class="text-center mb-6">
          <h2 class="text-xl font-medium text-gray-900 mb-4">
            {{ isPlaying ? $t('landing.session.in_progress') : $t('landing.session.ready_to_start') }}
          </h2>
          
          <div v-if="currentAffirmation" class="bg-pastel-dun rounded-lg p-6 mb-6 border border-pastel-cinereous">
            <p class="text-base text-gray-900 leading-relaxed">{{ currentAffirmation.text }}</p>
          </div>
          
          <div v-if="activeAffirmations.length > 0" class="mb-4">
            <div class="text-sm text-gray-600 mb-2">
              {{ $t('landing.session.progress') }} {{ currentIndex + 1 }} / {{ activeAffirmations.length }}
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
              class="bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 px-10 py-4 rounded-full font-medium text-base flex items-center gap-2  border-2 border-pastel-khaki-2 hover:border-gray-800"
            >
              <Play class="w-4 h-4" /> {{ $t('app.projects.start_session') }}
            </button>
            
            <button
              v-if="isPlaying"
              @click="stopSession"
              class="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2  border-2 border-red-500 hover:border-white"
            >
              <Square class="w-4 h-4" /> {{ $t('common.stop') }}
            </button>
            
            <button
              v-if="isPlaying"
              @click="nextAffirmation"
              class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-medium flex items-center gap-2  border-2 border-gray-600 hover:border-white"
            >
              <SkipForward class="w-4 h-4" /> {{ $t('common.next') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Ustawienia sesji -->
      <div v-if="selectedProject" class="bg-pastel-khaki rounded-4xl p-8 max-w-md mx-auto mb-8 border-2 border-pastel-cinereous">
        <h3 class="text-base font-medium text-gray-900 mb-4">{{ $t('project.session_settings_title') }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('project.session_settings.speech_rate', { rate: speechRate }) }}
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
              {{ $t('project.session_settings.pause_duration', { duration: pauseDuration }) }}
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
            {{ $t('project.session_settings.repeat_affirmation') }}
          </label>
          
          <div v-if="repeatAffirmation" class="mt-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('project.session_settings.repeat_delay', { delay: repeatDelay }) }}
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
      <div class="bg-pastel-dun rounded-4xl p-8 max-w-md mx-auto text-center border-2 border-pastel-cinereous">
        <h3 class="text-base font-medium text-gray-900 mb-2">{{ $t('landing.cta.like_it') }}</h3>
        <p class="text-gray-600 mb-4">{{ $t('landing.cta.create_account') }}</p>
        <button
          @click="$router.push('/auth')"
          class="bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-800 px-8 py-4 rounded-full font-medium w-full  border-2 border-pastel-khaki-2 hover:border-gray-800"
        >
          {{ $t('landing.cta.start_free') }}
        </button>
      </div>
      
      <!-- Build Version Footer -->
      <div class="text-center mt-8 mb-4">
        <div class="text-xs text-gray-500">
          Build: {{ BUILD_VERSION }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play, Square, SkipForward } from 'lucide-vue-next'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'
import { BUILD_VERSION } from '~/utils/version.js'

// Sync language from user profile
const { ensureLanguageSync } = useI18nInit()
onMounted(() => {
  ensureLanguageSync()
})

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