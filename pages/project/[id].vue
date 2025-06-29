<template>
  <div class="min-h-screen bg-pastel-vanilla">
    <header class="bg-pastel-purple shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-gray-700 hover:text-gray-900">
            <ArrowLeft class="w-6 h-6" />
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 font-crimson">{{ project?.name }}</h1>
            <p class="text-sm text-gray-700 font-crimson italic opacity-90">
              {{ $t('app.projects.affirmations_count', { count: project?.affirmations?.length || 0 }) }}
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

    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Affirmations list -->
        <div class="lg:col-span-2 bg-pastel-khaki border-2 border-pastel-dun rounded-4xl p-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 font-crimson">{{ $t('project.affirmations_list_title') }}</h2>
              <p class="text-gray-600 mt-1">{{ $t('project.affirmations_list_description') }}</p>
            </div>
            <button
              @click="showNewAffirmationModal = true"
              class="bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-900 px-6 py-3 rounded-full font-medium flex items-center gap-2 border-2 border-pastel-khaki-2 hover:border-gray-900"
            >
              <span class="text-lg">+</span>
              {{ $t('project.add_affirmation') }}
            </button>
          </div>

          <div v-if="project?.affirmations?.length > 0" class="space-y-4">
            <div
              v-for="(affirmation, index) in project.affirmations"
              :key="affirmation.id"
              class="bg-pastel-dun border-2 border-pastel-cinereous rounded-lg p-4 flex items-center justify-between"
              :class="{ 'opacity-60': affirmation.isActive === false }"
            >
              <div class="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  :checked="affirmation.isActive !== false"
                  @change="toggleAffirmationActive(affirmation.id)"
                  class="text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 flex-shrink-0"
                  style="width: 20px; height: 20px; min-width: 20px; min-height: 20px;"
                  :title="affirmation.isActive !== false ? $t('common.active') : $t('common.inactive')"
                />
                <p 
                  class="text-gray-800"
                  :class="{ 'line-through': affirmation.isActive === false }"
                >
                  {{ affirmation.text }}
                </p>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <button
                  @click="editAffirmation(affirmation)"
                  class="text-gray-500 hover:text-gray-700 p-1"
                  :title="$t('common.edit')"
                >
                  <Pencil class="w-5 h-5" />
                </button>
                <button
                  @click="deleteAffirmation(affirmation.id)"
                  class="text-red-500 hover:text-red-700 p-1"
                  :title="$t('common.delete')"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-12">
            <div class="text-gray-400 text-6xl mb-4"><MessageSquare class="w-16 h-16" /></div>
            <h3 class="text-xl font-medium text-gray-900 mb-2 font-crimson">{{ $t('project.no_affirmations_title') }}</h3>
            <p class="text-gray-600 mb-4">{{ $t('project.no_affirmations_description') }}</p>
            <button
              @click="showNewAffirmationModal = true"
              class="bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-800 px-8 py-4 rounded-full font-medium border-2 border-pastel-khaki-2 hover:border-gray-800"
            >
              {{ $t('project.add_affirmation') }}
            </button>
          </div>
        </div>

        <!-- Session settings -->
        <div class="bg-pastel-violet border-2 border-pastel-rose rounded-4xl p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 font-crimson">{{ $t('project.session_settings_title') }}</h2>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('project.session_settings.speech_rate', { rate: sessionSettings.speechRate }) }}
              </label>
              <input
                v-model.number="sessionSettings.speechRate"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('project.session_settings.pause_duration', { duration: sessionSettings.pauseDuration }) }}
              </label>
              <input
                v-model.number="sessionSettings.pauseDuration"
                type="range"
                min="1"
                max="10"
                step="0.5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('project.session_settings.sentence_pause', { pause: sessionSettings.sentencePause }) }}
              </label>
              <input
                v-model.number="sessionSettings.sentencePause"
                type="range"
                min="1"
                max="10"
                step="0.5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <label class="flex items-center">
              <input
                v-model="sessionSettings.repeatAffirmation"
                type="checkbox"
                class="mr-2"
              />
              {{ $t('project.session_settings.repeat_affirmation') }}
            </label>
            
            <div v-if="sessionSettings.repeatAffirmation" class="mt-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('project.session_settings.repeat_delay', { delay: sessionSettings.repeatDelay }) }}
              </label>
              <input
                v-model.number="sessionSettings.repeatDelay"
                type="range"
                min="3"
                max="30"
                step="1"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('project.session_settings.voice_selection') }}
              </label>
              <select
                v-model="sessionSettings.voiceId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pastel-violet"
              >
                <option 
                  v-for="voice in availableVoices" 
                  :key="voice.id" 
                  :value="voice.id"
                >
                  {{ voice.name }} ({{ voice.gender === 'female' ? '♀' : '♂' }}) - {{ voice.description }}
                </option>
              </select>
            </div>

            <!-- Background Music Settings -->
            <div class="mt-4">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="sessionSettings.backgroundMusic"
                  class="mr-2"
                />
                Delikatna muzyka relaksacyjna w tle
              </label>
              
              <div v-if="sessionSettings.backgroundMusic" class="mt-2 space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Rodzaj dźwięków
                  </label>
                  <select
                    v-model="sessionSettings.musicType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pastel-violet"
                  >
                    <optgroup label="Dźwięki generowane">
                      <option value="birds">🐦 Śpiew ptaków o poranku</option>
                      <option value="ocean">🌊 Szum morza</option>
                    </optgroup>
                    <optgroup label="Muzyka relaksacyjna">
                      <option value="DeeperMeaning">🎵 Głębszy sens</option>
                      <option value="relaxing_music">🎵 Muzyka relaksacyjna</option>
                      <option value="meditation_music">🧘 Muzyka medytacyjna</option>
                      <option value="spa_music">🌸 Muzyka spa</option>
                    </optgroup>
                    <optgroup label="Dźwięki natury">
                      <option value="nature_sounds">🌿 Dźwięki natury</option>
                      <option value="rain_sounds">🌧️ Dźwięki deszczu</option>
                      <option value="forest_ambience">🌲 Atmosfera lasu</option>
                    </optgroup>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Głośność muzyki: {{ Math.round(sessionSettings.musicVolume * 100) }}%
                  </label>
                  <input
                    type="range"
                    v-model.number="sessionSettings.musicVolume"
                    min="0.05"
                    max="0.4"
                    step="0.05"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <button
              @click="startSession"
              :disabled="!project?.affirmations?.length"
              class="w-full bg-pastel-purple-2 hover:bg-pastel-purple disabled:bg-gray-300 text-gray-800 py-4 rounded-full font-medium flex items-center justify-center gap-2 border-2 border-pastel-purple-2 hover:border-gray-800"
            >
              <Play class="w-4 h-4" /> {{ $t('app.projects.start_session') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New/Edit Affirmation Modal -->
    <div
      v-if="showNewAffirmationModal || editingAffirmation"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeAffirmationModal"
    >
      <div
        class="bg-pastel-khaki rounded-4xl p-8 w-full max-w-md border-2 border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-medium mb-4 font-crimson">
          {{ editingAffirmation ? $t('project.modals.edit_affirmation') : $t('project.modals.new_affirmation') }}
        </h3>
        <div class="mb-4">
          <textarea
            v-model="affirmationText"
            rows="4"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            :placeholder="$t('project.modals.affirmation_placeholder')"
          ></textarea>
        </div>
        <div class="flex gap-3">
          <button
            @click="saveAffirmation"
            :disabled="!affirmationText.trim()"
            class="flex-1 bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 py-3 rounded-full font-medium"
          >
            {{ editingAffirmation ? $t('common.save') : $t('common.add') }}
          </button>
          <button
            @click="closeAffirmationModal"
            class="flex-1 border-2 border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-full font-medium"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, Pencil, Trash2, MessageSquare, Play } from 'lucide-vue-next'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { user, logout: authLogout } = useAuth()
const { t, locale } = useI18n()
const { getUserProjects, updateProject, subscribeToUserProjects } = useFirestore()
const { getAvailableAiVoices, getLanguageMapping } = useTextToSpeech()

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref(null)
const showNewAffirmationModal = ref(false)
const editingAffirmation = ref(null)
const affirmationText = ref('')

const sessionSettings = ref({
  speechRate: 1.0,
  pauseDuration: 3,
  sentencePause: 4,
  repeatAffirmation: false,
  repeatDelay: 5,
  voiceId: 'pl-PL-ZofiaNeural',
  voicesByLanguage: {}, // Store selected voices per language
  backgroundMusic: false, // Background relaxing music
  musicVolume: 0.15, // Low volume for background music
  musicType: 'birds' // Type of background music: birds, ocean
})

const availableVoices = computed(() => {
  const ttsLanguage = getLanguageMapping(locale.value)
  return getAvailableAiVoices(ttsLanguage)
})

// Watch for language changes and update voice selection
watch(locale, (newLocale) => {
  const ttsLanguage = getLanguageMapping(newLocale)
  const voices = getAvailableAiVoices(ttsLanguage)
  
  if (voices.length > 0) {
    // Check if we have a saved voice for this language
    const savedVoiceId = sessionSettings.value.voicesByLanguage[ttsLanguage]
    const savedVoiceExists = savedVoiceId && voices.find(v => v.id === savedVoiceId)
    
    if (savedVoiceExists) {
      // Use saved voice for this language
      console.log('🎤 Restoring saved voice for', ttsLanguage, ':', savedVoiceId)
      sessionSettings.value.voiceId = savedVoiceId
    } else {
      // Set default voice and save it
      const defaultVoice = voices.find(v => v.gender === 'female') || voices[0]
      console.log('🎤 Setting default voice for', ttsLanguage, ':', defaultVoice.id)
      sessionSettings.value.voiceId = defaultVoice.id
      sessionSettings.value.voicesByLanguage[ttsLanguage] = defaultVoice.id
    }
  }
})

// Watch for voice changes and save per language
watch(() => sessionSettings.value.voiceId, (newVoiceId) => {
  if (newVoiceId) {
    const ttsLanguage = getLanguageMapping(locale.value)
    console.log('🎤 Saving voice choice for', ttsLanguage, ':', newVoiceId)
    sessionSettings.value.voicesByLanguage[ttsLanguage] = newVoiceId
  }
})

let unsubscribe = null

const loadProject = async () => {
  console.log('🔍 Loading project:', projectId, 'user:', user.value?.uid)
  
  if (!user.value?.uid) {
    console.log('⏳ Waiting for user authentication...')
    return
  }
  
  // Najpierw spróbuj z localStorage (tam są zmergowane dane z app.vue)
  const loadProjectFromData = () => {
    const savedProject = getProjectFromLocalStorage(projectId)
    console.log('📱 localStorage project:', savedProject)
    if (savedProject) {
      project.value = savedProject
      console.log('📱 Project affirmations from localStorage:', savedProject.affirmations?.length || 0)
      if (savedProject.sessionSettings) {
        // Merge saved settings with default structure to preserve new properties
        sessionSettings.value = {
          ...sessionSettings.value,
          ...savedProject.sessionSettings,
          voicesByLanguage: savedProject.sessionSettings.voicesByLanguage || {}
        }
      }
      return true
    }
    return false
  }

  // Załaduj dane z localStorage
  const foundInLocalStorage = loadProjectFromData()
  
  // Jeśli nie ma w localStorage, spróbuj Firestore jako fallback
  if (!foundInLocalStorage) {
    console.log('🔄 Not found in localStorage, trying Firestore...')
    try {
      const projects = await getUserProjects()
      console.log('🔥 All Firestore projects:', projects.length)
      const firestoreProject = projects.find(p => p.id === projectId)
      console.log('🔥 Found Firestore project:', firestoreProject)
      
      if (firestoreProject) {
        project.value = firestoreProject
        console.log('🔥 Using Firestore project with affirmations:', firestoreProject.affirmations?.length || 0)
        saveProjectToLocalStorage(project.value)
      } else {
        console.log('❌ Project not found anywhere!')
      }
    } catch (error) {
      console.error('❌ Error loading project from Firestore:', error)
    }
  }

  // Subskrybuj aktualizacje z Firestore
  if (unsubscribe) unsubscribe()
  unsubscribe = subscribeToUserProjects((projects) => {
    console.log('🔔 Real-time update received, projects:', projects.length)
    const updatedProject = projects.find(p => p.id === projectId)
    if (updatedProject) {
      console.log('🔔 Updated project affirmations:', updatedProject.affirmations?.length || 0)
      project.value = {
        ...updatedProject,
        sessionSettings: project.value?.sessionSettings || updatedProject.sessionSettings
      }
      
      saveProjectToLocalStorage(project.value)
    }
  })
  
  console.log('✅ Final project loaded:', !!project.value, 'with', project.value?.affirmations?.length || 0, 'affirmations')
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
  
  // Initialize default voice for current language
  const ttsLanguage = getLanguageMapping(locale.value)
  const voices = getAvailableAiVoices(ttsLanguage)
  if (voices.length > 0) {
    const defaultVoice = voices.find(v => v.gender === 'female') || voices[0]
    if (!sessionSettings.value.voiceId || !voices.find(v => v.id === sessionSettings.value.voiceId)) {
      sessionSettings.value.voiceId = defaultVoice.id
    }
  }
})

watch(sessionSettings, (newSettings) => {
  if (project.value) {
    project.value.sessionSettings = newSettings
    saveProjectToLocalStorage(project.value)
  }
}, { deep: true })

const getProjectFromLocalStorage = (id) => {
  console.log('🔍 getProjectFromLocalStorage - user:', user.value?.uid, 'looking for ID:', id)
  if (!user.value?.uid) {
    console.log('❌ No user UID')
    return null
  }
  
  const key = `projects_${user.value.uid}`
  const saved = localStorage.getItem(key)
  console.log('📱 localStorage key:', key, 'data exists:', !!saved)
  
  if (saved) {
    try {
      const projects = JSON.parse(saved)
      console.log('📱 Found', projects.length, 'projects in localStorage')
      projects.forEach((p, i) => {
        console.log(`📱 Project ${i}: ID=${p.id}, name=${p.name}, affirmations=${p.affirmations?.length || 0}`)
      })
      
      const found = projects.find(p => p.id === id)
      console.log('📱 Project found:', !!found, found ? `with ${found.affirmations?.length || 0} affirmations` : '')
      return found
    } catch (e) {
      console.error('❌ Error parsing localStorage projects:', e)
      return null
    }
  }
  console.log('📱 No localStorage data')
  return null
}

const saveProjectToLocalStorage = (proj) => {
  if (!user.value?.uid) return
  const saved = localStorage.getItem(`projects_${user.value.uid}`)
  if (saved) {
    const projects = JSON.parse(saved)
    const index = projects.findIndex(p => p.id === proj.id)
    if (index !== -1) {
      projects[index] = proj
      localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects))
    }
  }
}

const goBack = () => {
  router.push('/app')
}

const logout = async () => {
  await authLogout()
  router.push('/auth')
}

const closeAffirmationModal = () => {
  showNewAffirmationModal.value = false
  editingAffirmation.value = null
  affirmationText.value = ''
}

const saveAffirmation = async () => {
  if (!affirmationText.value.trim()) return
  
  let updatedAffirmations
  
  if (editingAffirmation.value) {
    updatedAffirmations = project.value.affirmations.map(aff => 
      aff.id === editingAffirmation.value.id ? { ...aff, text: affirmationText.value.trim() } : aff
    )
  } else {
    const newAffirmation = {
      id: Date.now().toString(),
      text: affirmationText.value.trim(),
      createdAt: new Date().toISOString()
    }
    updatedAffirmations = [...(project.value.affirmations || []), newAffirmation]
  }
  
  try {
    await updateProject(projectId, { affirmations: updatedAffirmations })
    project.value.affirmations = updatedAffirmations
    saveProjectToLocalStorage(project.value)
    closeAffirmationModal()
  } catch (error) {
    alert(t('project.alerts.save_affirmation_failed'))
  }
}

const editAffirmation = (affirmation) => {
  editingAffirmation.value = affirmation
  affirmationText.value = affirmation.text
  showNewAffirmationModal.value = true
}

const deleteAffirmation = async (affirmationId) => {
  if (!confirm(t('project.alerts.confirm_delete_affirmation'))) return
  
  const updatedAffirmations = project.value.affirmations.filter(aff => aff.id !== affirmationId)
  
  try {
    await updateProject(projectId, { affirmations: updatedAffirmations })
    project.value.affirmations = updatedAffirmations
    saveProjectToLocalStorage(project.value)
  } catch (error) {
    alert(t('project.alerts.delete_affirmation_failed'))
  }
}

const toggleAffirmationActive = async (affirmationId) => {
  const updatedAffirmations = project.value.affirmations.map(aff => 
    aff.id === affirmationId 
      ? { ...aff, isActive: aff.isActive === false ? true : false }
      : aff
  )
  
  try {
    await updateProject(projectId, { affirmations: updatedAffirmations })
    project.value.affirmations = updatedAffirmations
    saveProjectToLocalStorage(project.value)
  } catch (error) {
    console.error('Error toggling affirmation active state:', error)
  }
}

const startSession = () => {
  if (project.value?.affirmations?.length > 0) {
    router.push(`/session/${projectId}`)
  }
}

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

useHead({
  title: computed(() => t('project.page_title', { name: project.value?.name || 'Project' }))
})
</script>