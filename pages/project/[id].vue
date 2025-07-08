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
          <CharacterUsageCounter />
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

          <div v-if="project?.affirmations?.length > 0" class="space-y-2">
            <template v-for="(affirmation, index) in project.affirmations" :key="affirmation.id">
              <!-- Drop indicator line - always present, invisible when not needed -->
              <div 
                class="h-1 rounded-full mx-4 transition-all duration-200 ease-out"
                :class="dragOver === index && dragging !== affirmation.id ? 
                  'bg-blue-500 shadow-lg' : 'bg-transparent'"
                style="background: linear-gradient(90deg, #3b82f6, #60a5fa);"
                :style="dragOver === index && dragging !== affirmation.id ? 
                  'background: linear-gradient(90deg, #3b82f6, #60a5fa);' : 
                  'background: transparent;'"
              ></div>
              
              <div
                class="affirmation-item border-2 rounded-lg transition-all duration-300 ease-out relative"
                :class="{ 
                  'bg-gray-100 border-gray-300 opacity-70': affirmation.isActive === false,
                  'bg-pastel-dun border-pastel-cinereous': affirmation.isActive !== false,
                  'dragging scale-105 shadow-xl bg-blue-50 border-blue-300': dragging === affirmation.id,
                  'hover:shadow-md hover:-translate-y-0.5': dragging !== affirmation.id && !generatingAudioIds.has(affirmation.id),
                  'pointer-events-none': generatingAudioIds.has(affirmation.id)
                }"
              >
                <!-- Main affirmation row -->
                <div 
                  class="p-4 flex items-center justify-between cursor-move"
                  :draggable="!generatingAudioIds.has(affirmation.id)"
                  @dragstart="handleDragStart($event, affirmation, index)"
                  @dragend="handleDragEnd"
                  @dragover.prevent="handleDragOver($event, index)"
                  @dragleave="handleDragLeave"
                  @drop.prevent="handleDrop($event, index)"
                >
                  <div class="flex items-center gap-3 flex-1">
                    <!-- Menu toggle button -->
                    <button
                      @click.stop="toggleMenu(affirmation.id)"
                      class="text-gray-400 hover:text-gray-600 p-1 transition-transform duration-200"
                      :class="{ 'rotate-180': expandedMenus.has(affirmation.id) }"
                      :disabled="generatingAudioIds.has(affirmation.id)"
                    >
                      <ChevronDown class="w-4 h-4" />
                    </button>
                    
                    <!-- Drag handle -->
                    <div class="cursor-move text-gray-400 hover:text-gray-600">
                      <GripVertical class="w-4 h-4" />
                    </div>
                    
                    <!-- Affirmation text -->
                    <p 
                      class="flex-1 transition-colors duration-200"
                      :class="affirmation.isActive === false ? 'text-gray-400' : 'text-gray-800'"
                    >
                      {{ affirmation.text }}
                    </p>
                  </div>
                </div>

                <!-- Expanded menu -->
                <div 
                  v-if="expandedMenus.has(affirmation.id)"
                  class="border-t border-pastel-cinereous bg-pastel-khaki bg-opacity-30 p-4 space-y-3"
                >
                  <!-- Audio Info -->
                  <div v-if="audioMetadata.has(affirmation.id)" class="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-gray-700">{{ $t('project.audio_info') }}</span>
                      <button
                        @click="playAffirmationAudio(affirmation.id)"
                        class="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        :disabled="playingAudio === affirmation.id || generatingAudioIds.has(affirmation.id)"
                      >
                        <Volume2 class="w-4 h-4" />
                        {{ playingAudio === affirmation.id ? $t('project.playing') : $t('project.play_audio') }}
                      </button>
                    </div>
                    <div class="text-xs text-gray-600">
                      <div class="flex items-center justify-between">
                        <span>{{ $t('project.voice_used') }}:</span>
                        <span class="font-medium">{{ audioMetadata.get(affirmation.id)?.voiceName || audioMetadata.get(affirmation.id)?.voiceId }}</span>
                      </div>
                      <div class="flex items-center justify-between mt-1">
                        <span>{{ $t('project.voice_type') }}:</span>
                        <span class="font-medium capitalize">{{ audioMetadata.get(affirmation.id)?.voiceType }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Active/Inactive Switch -->
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">{{ $t('project.affirmation_status') }}</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        :checked="affirmation.isActive !== false"
                        @change="toggleAffirmationActive(affirmation.id)"
                        class="sr-only peer"
                        :disabled="generatingAudioIds.has(affirmation.id)"
                      />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      <span class="ml-3 text-sm text-gray-700">
                        {{ affirmation.isActive !== false ? $t('common.active') : $t('common.inactive') }}
                      </span>
                    </label>
                  </div>

                  <!-- Action buttons -->
                  <div class="flex items-center gap-3">
                    <button
                      @click="editAffirmation(affirmation)"
                      class="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                      :disabled="generatingAudioIds.has(affirmation.id)"
                    >
                      <Pencil class="w-4 h-4" />
                      {{ $t('common.edit') }}
                    </button>
                    <button
                      @click="deleteAffirmation(affirmation.id)"
                      class="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                      :disabled="generatingAudioIds.has(affirmation.id)"
                    >
                      <Trash2 class="w-4 h-4" />
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </div>
                
                <!-- Preloader overlay -->
                <div 
                  v-if="generatingAudioIds.has(affirmation.id)"
                  class="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 bg-opacity-95 rounded-lg flex items-center justify-center z-10 backdrop-blur-sm border-2 border-blue-200"
                >
                  <div class="flex flex-col items-center gap-4 p-4">
                    <!-- Animated spinner with multiple rings -->
                    <div class="relative">
                      <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                      <div class="absolute inset-0 animate-spin rounded-full h-10 w-10 border-4 border-purple-400 border-t-transparent" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
                      <div class="absolute inset-2 animate-pulse rounded-full h-6 w-6 bg-gradient-to-r from-blue-400 to-purple-400 opacity-60"></div>
                    </div>
                    
                    <!-- Text and progress indicator -->
                    <div class="text-center">
                      <div class="text-sm font-semibold text-blue-800 mb-1">🎵 {{ $t('project.generating_audio') }}</div>
                      <div class="text-xs text-blue-600">{{ $t('project.please_wait') }}</div>
                    </div>
                    
                    <!-- Animated dots -->
                    <div class="flex space-x-1">
                      <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                      <div class="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Drop indicator at the end - always present, invisible when not needed -->
              <div 
                v-if="index === project.affirmations.length - 1"
                class="h-1 rounded-full mx-4 transition-all duration-200 ease-out"
                :class="dragOver === project.affirmations.length ? 
                  'bg-blue-500 shadow-lg' : 'bg-transparent'"
                :style="dragOver === project.affirmations.length ? 
                  'background: linear-gradient(90deg, #3b82f6, #60a5fa);' : 
                  'background: transparent;'"
              ></div>
            </template>
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
                :value="sessionSettings.speechRate"
                @input="updateSessionSettings({ speechRate: parseFloat($event.target.value) })"
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
                :value="sessionSettings.pauseDuration"
                @input="updateSessionSettings({ pauseDuration: parseFloat($event.target.value) })"
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
                :value="sessionSettings.sentencePause"
                @input="updateSessionSettings({ sentencePause: parseFloat($event.target.value) })"
                type="range"
                min="1"
                max="10"
                step="0.5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <label class="flex items-center">
              <input
                :checked="sessionSettings.repeatAffirmation"
                @change="updateSessionSettings({ repeatAffirmation: $event.target.checked })"
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
                :value="sessionSettings.repeatDelay"
                @input="updateSessionSettings({ repeatDelay: parseFloat($event.target.value) })"
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
                :value="sessionSettings.voiceId"
                @change="updateSessionSettings({ voiceId: $event.target.value })"
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
                  :checked="sessionSettings.backgroundMusic"
                  @change="updateSessionSettings({ backgroundMusic: $event.target.checked })"
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
                    :value="sessionSettings.musicType"
                    @change="updateSessionSettings({ musicType: $event.target.value })"
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
                    :value="sessionSettings.musicVolume"
                    @input="updateSessionSettings({ musicVolume: parseFloat($event.target.value) })"
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
import { ArrowLeft, Pencil, Trash2, MessageSquare, Play, GripVertical, ChevronDown, Volume2 } from 'lucide-vue-next'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { user, logout: authLogout } = useAuth()
const { t, locale } = useI18n()
const { getUserProjects, updateProject, subscribeToUserProjects } = useFirestore()
const { getAvailableAiVoices, getLanguageMapping } = useTextToSpeech()
const audioManager = useAudioManager()
const affirmationManager = useAffirmationManager()
const sessionSettingsManager = useSessionSettings({
  onUpdate: (newSettings) => {
    if (project.value) {
      project.value.sessionSettings = newSettings
      saveProjectToLocalStorage(project.value)
    }
  }
})

// Stan generowania audio dla poszczególnych afirmacji
const generatingAudioIds = ref(new Set())

// Stan rozwijanego menu dla każdej afirmacji
const expandedMenus = ref(new Set())

// Stan metadanych audio dla afirmacji
const audioMetadata = ref(new Map())

// Stan odtwarzania audio
const playingAudio = ref(null)

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref(null)
const showNewAffirmationModal = ref(false)
const editingAffirmation = ref(null)
const affirmationText = ref('')

// Drag and drop state
const dragging = ref(null)
const dragOver = ref(null)
const draggedItem = ref(null)
const draggedIndex = ref(null)

// Use session settings from manager
const { 
  settings: sessionSettings, 
  availableVoices,
  updateSettings: updateSessionSettings,
  loadSettings: loadSessionSettings,
  handleLanguageChange: handleSettingsLanguageChange
} = sessionSettingsManager

// Language change handling is now managed by sessionSettingsManager

let unsubscribe = null

const loadProject = async () => {
  if (!user.value?.uid) {
    return
  }
  
  // Najpierw spróbuj z localStorage (tam są zmergowane dane z app.vue)
  const loadProjectFromData = () => {
    const savedProject = getProjectFromLocalStorage(projectId)
    if (savedProject) {
      project.value = savedProject
      if (savedProject.sessionSettings) {
        // Load settings using session settings manager
        loadSessionSettings(savedProject.sessionSettings)
      }
      return true
    }
    return false
  }

  // Załaduj dane z localStorage
  const foundInLocalStorage = loadProjectFromData()
  
  // Jeśli nie ma w localStorage, spróbuj Firestore jako fallback
  if (!foundInLocalStorage) {
    try {
      const projects = await getUserProjects()
      const firestoreProject = projects.find(p => p.id === projectId)
      
      if (firestoreProject) {
        project.value = firestoreProject
        saveProjectToLocalStorage(project.value)
      }
    } catch (error) {
      console.error('Error loading project from Firestore:', error)
    }
  }

  // Subskrybuj aktualizacje z Firestore
  if (unsubscribe) unsubscribe()
  unsubscribe = subscribeToUserProjects((projects) => {
    const updatedProject = projects.find(p => p.id === projectId)
    if (updatedProject) {
      // Preserve local affirmations order if we just added/modified something
      const shouldPreserveOrder = project.value && 
        project.value.affirmations && 
        updatedProject.affirmations &&
        project.value.affirmations.length === updatedProject.affirmations.length
      
      if (shouldPreserveOrder) {
        // Only update metadata, keep current affirmations order
        project.value = {
          ...project.value,
          name: updatedProject.name,
          updatedAt: updatedProject.updatedAt,
          sessionSettings: project.value?.sessionSettings || updatedProject.sessionSettings
        }
      } else {
        // Full update for new/deleted affirmations
        project.value = {
          ...updatedProject,
          sessionSettings: project.value?.sessionSettings || updatedProject.sessionSettings
        }
      }
      
      saveProjectToLocalStorage(project.value)
    }
  })

  // Auto-generuj audio dla afirmacji które go nie mają
  if (project.value?.affirmations?.length > 0) {
    await generateMissingAudio()
  }
}

// Flag to prevent duplicate audio generation
const isGeneratingMissingAudio = ref(false)

// Funkcja do generowania brakującego audio używając Audio Manager
const generateMissingAudio = async () => {
  if (!project.value?.affirmations || !user.value || isGeneratingMissingAudio.value) return
  
  isGeneratingMissingAudio.value = true
  
  // Zdefiniuj poza try-catch żeby była dostępna w finally
  let affirmationsNeedingAudio = []
  
  try {
    const currentVoiceId = sessionSettings.value.voiceId || 'pl-PL-ZofiaStandard'
    
    console.log(`🔍 Checking audio for ${project.value.affirmations.length} affirmations...`)
    
    // Sprawdź które afirmacje potrzebują audio
    affirmationsNeedingAudio = []
    
    for (const affirmation of project.value.affirmations) {
      try {
        const validation = await audioManager.validateAffirmationAudio(affirmation)
        
        if (!validation.isValid) {
          console.log(`🎵 Affirmation needs audio generation: ${affirmation.id}`)
          affirmationsNeedingAudio.push(affirmation)
          generatingAudioIds.value.add(affirmation.id)
        } else {
          console.log(`✅ Audio already valid for: ${affirmation.id}`)
        }
      } catch (error) {
        console.error(`❌ Error validating audio for ${affirmation.id}:`, error)
        // Dodaj do listy na wszelki wypadek
        affirmationsNeedingAudio.push(affirmation)
        generatingAudioIds.value.add(affirmation.id)
      }
    }
    
    if (affirmationsNeedingAudio.length === 0) {
      console.log('✅ All affirmations have valid audio')
      return
    }
    
    console.log(`🎵 Generating audio for ${affirmationsNeedingAudio.length} affirmations`)
    
    // Użyj Audio Manager do batch generation
    const result = await audioManager.createProjectAudio(affirmationsNeedingAudio, currentVoiceId)
    
    // Zaktualizuj afirmacje z wynikami
    if (result.success > 0) {
      const updatedAffirmations = [...project.value.affirmations]
      
      for (const resultItem of result.results) {
        if (resultItem.success) {
          const affIndex = updatedAffirmations.findIndex(aff => aff.id === resultItem.affirmationId)
          if (affIndex !== -1) {
            updatedAffirmations[affIndex] = {
              ...updatedAffirmations[affIndex],
              sentenceIds: resultItem.sentenceIds,
              sentenceCount: resultItem.sentenceCount
            }
          }
        }
      }
      
      project.value.affirmations = updatedAffirmations
      await updateProject(projectId, { affirmations: updatedAffirmations })
      saveProjectToLocalStorage(project.value)
      
      console.log(`✅ Updated ${result.success} affirmations with sentence IDs`)
    }
    
    console.log(`🏁 Audio generation completed: ${result.success} success, ${result.errors} errors`)
    
  } catch (error) {
    console.error('❌ Audio generation failed:', error)
  } finally {
    // Usuń wszystkie z listy generujących się audio
    affirmationsNeedingAudio.forEach(aff => {
      generatingAudioIds.value.delete(aff.id)
    })
    isGeneratingMissingAudio.value = false
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
  
  // Initialize default voice for current language
  const ttsLanguage = getLanguageMapping(locale.value)
  const voices = getAvailableAiVoices(ttsLanguage)
  if (voices.length > 0) {
    const defaultVoice = voices.find(v => v.gender === 'female') || voices[0]
    if (!sessionSettings.value.voiceId || !voices.find(v => v.id === sessionSettings.value.voiceId)) {
      updateSessionSettings({ voiceId: defaultVoice.id })
    }
  }
})

// Settings persistence is now handled by sessionSettingsManager onUpdate callback

const getProjectFromLocalStorage = (id) => {
  if (!user.value?.uid) {
    return null
  }
  
  const key = `projects_${user.value.uid}`
  const saved = localStorage.getItem(key)
  
  if (saved) {
    try {
      const projects = JSON.parse(saved)
      return projects.find(p => p.id === id)
    } catch (e) {
      console.error('Error parsing localStorage projects:', e)
      return null
    }
  }
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

// Drag and drop handlers
const handleDragStart = (event, affirmation, index) => {
  dragging.value = affirmation.id
  draggedItem.value = affirmation
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target.outerHTML)
  
  // Add a semi-transparent effect
  setTimeout(() => {
    event.target.style.opacity = '0.5'
  }, 0)
}

const handleDragEnd = (event) => {
  event.target.style.opacity = '1'
  dragging.value = null
  dragOver.value = null
  draggedItem.value = null
  draggedIndex.value = null
}

const handleDragOver = (event, index) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  
  if (draggedIndex.value !== null) {
    // Support dropping at the end of the list
    const rect = event.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    
    if (event.clientY > midpoint && index === project.value.affirmations.length - 1) {
      dragOver.value = project.value.affirmations.length
    } else if (draggedIndex.value !== index) {
      dragOver.value = index
    }
  }
}

const handleDragLeave = () => {
  dragOver.value = null
}

const handleDrop = async (event, dropIndex) => {
  event.preventDefault()
  dragOver.value = null
  
  // Handle dropping at end of list
  const finalDropIndex = dragOver.value === project.value.affirmations.length ? 
    project.value.affirmations.length - 1 : dropIndex
  
  if (draggedIndex.value === null || draggedIndex.value === finalDropIndex) {
    return
  }
  
  // Reorder affirmations array
  const affirmations = [...project.value.affirmations]
  const draggedAffirmation = affirmations[draggedIndex.value]
  
  // Remove from old position
  affirmations.splice(draggedIndex.value, 1)
  
  // Insert at new position  
  const newIndex = dragOver.value === project.value.affirmations.length + 1 ? 
    affirmations.length : 
    (finalDropIndex > draggedIndex.value ? finalDropIndex : finalDropIndex)
  affirmations.splice(newIndex, 0, draggedAffirmation)
  
  try {
    // Use Affirmation Manager to reorder
    const result = await affirmationManager.reorderAffirmations(projectId, affirmations)
    
    // Update local state
    project.value.affirmations = result.updatedAffirmations
    saveProjectToLocalStorage(project.value)
    
  } catch (error) {
    console.error('Error reordering affirmations:', error)
    // Optionally show error message to user
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
  
  const currentVoiceId = sessionSettings.value.voiceId || 'pl-PL-ZofiaStandard'
  
  try {
    let result
    
    if (editingAffirmation.value) {
      // EDYCJA
      const affirmationId = editingAffirmation.value.id
      generatingAudioIds.value.add(affirmationId)
      
      result = await affirmationManager.updateAffirmation(
        projectId, 
        affirmationId, 
        affirmationText.value.trim(),
        {
          currentProject: project.value,
          autoGenerateAudio: true,
          voiceId: currentVoiceId,
          onAudioGenerated: (id, audioResult) => {
            // Update project with sentence IDs
            const updatedAffirmations = project.value.affirmations.map(aff => 
              aff.id === id 
                ? { ...aff, sentenceIds: audioResult.sentenceIds, sentenceCount: audioResult.sentenceCount }
                : aff
            )
            project.value.affirmations = updatedAffirmations
            saveProjectToLocalStorage(project.value)
            generatingAudioIds.value.delete(id)
          },
          onAudioError: (id, error) => {
            console.error('Audio generation failed:', error)
            generatingAudioIds.value.delete(id)
          }
        }
      )
    } else {
      // NOWA AFIRMACJA
      result = await affirmationManager.createAffirmation(
        projectId, 
        affirmationText.value.trim(),
        {
          currentProject: project.value,
          autoGenerateAudio: true,
          voiceId: currentVoiceId,
          onAudioGenerated: (id, audioResult) => {
            // Update project with sentence IDs
            const updatedAffirmations = project.value.affirmations.map(aff => 
              aff.id === id 
                ? { ...aff, sentenceIds: audioResult.sentenceIds, sentenceCount: audioResult.sentenceCount }
                : aff
            )
            project.value.affirmations = updatedAffirmations
            saveProjectToLocalStorage(project.value)
            generatingAudioIds.value.delete(id)
          },
          onAudioError: (id, error) => {
            console.error('Audio generation failed:', error)
            generatingAudioIds.value.delete(id)
          }
        }
      )
      
      // Add to generating list for new affirmations
      generatingAudioIds.value.add(result.affirmation.id)
    }
    
    // Update local project state
    project.value.affirmations = result.updatedAffirmations
    saveProjectToLocalStorage(project.value)
    
    closeAffirmationModal()
    
  } catch (error) {
    console.error('Failed to save affirmation:', error)
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
  
  try {
    const result = await affirmationManager.deleteAffirmation(
      projectId, 
      affirmationId,
      {
        currentProject: project.value
      }
    )
    
    // Update local project state
    project.value.affirmations = result.updatedAffirmations
    saveProjectToLocalStorage(project.value)
    
  } catch (error) {
    console.error('Failed to delete affirmation:', error)
    alert(t('project.alerts.delete_affirmation_failed'))
  }
}

const toggleMenu = async (affirmationId) => {
  if (expandedMenus.value.has(affirmationId)) {
    expandedMenus.value.delete(affirmationId)
  } else {
    expandedMenus.value.add(affirmationId)
    
    // Załaduj metadane audio gdy menu się otwiera
    if (!audioMetadata.value.has(affirmationId)) {
      await loadAudioMetadata(affirmationId)
    }
  }
}

const loadAudioMetadata = async (affirmationId) => {
  try {
    console.log('🔍 Loading audio metadata for affirmation:', affirmationId)
    const { getAudioMetadata } = useAffirmationAudio()
    const metadata = await getAudioMetadata(affirmationId)
    
    console.log('📊 Retrieved metadata:', metadata)
    
    if (metadata) {
      audioMetadata.value.set(affirmationId, metadata)
      console.log('✅ Metadata stored for affirmation:', affirmationId)
    } else {
      console.log('⚠️ No metadata found for affirmation:', affirmationId)
    }
  } catch (error) {
    console.error('❌ Error loading audio metadata:', error)
  }
}

const playAffirmationAudio = async (affirmationId) => {
  try {
    playingAudio.value = affirmationId
    
    // Użyj URL z metadanych zamiast getAudioUrl
    const metadata = audioMetadata.value.get(affirmationId)
    if (!metadata || !metadata.downloadUrl) {
      throw new Error('No audio URL available in metadata')
    }
    
    console.log('🎵 Playing audio from URL:', metadata.downloadUrl)
    
    // Odtwórz bezpośrednio z URL
    const audio = new Audio(metadata.downloadUrl)
    audio.volume = 0.8
    audio.playbackRate = 1.0
    
    await new Promise((resolve, reject) => {
      audio.onended = resolve
      audio.onerror = reject
      audio.play().catch(reject)
    })
    
    playingAudio.value = null
  } catch (error) {
    console.error('Error playing audio:', error)
    playingAudio.value = null
    // Opcjonalnie pokaż komunikat o błędzie
  }
}

const toggleAffirmationActive = async (affirmationId) => {
  try {
    const result = await affirmationManager.toggleAffirmationActive(
      projectId, 
      affirmationId,
      {
        currentProject: project.value
      }
    )
    
    // Update local project state
    project.value.affirmations = result.updatedAffirmations
    saveProjectToLocalStorage(project.value)
    
  } catch (error) {
    console.error('Failed to toggle affirmation active state:', error)
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