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
            >
              <div class="flex-1">
                <p class="text-gray-800">{{ affirmation.text }}</p>
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
const { t } = useI18n()
const { getProjectById, updateProject } = useFirestore()

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
  repeatAffirmation: false,
  repeatDelay: 5
})

let unsubscribe = null

onMounted(async () => {
  
  const savedProject = getProjectFromLocalStorage(projectId)
  if (savedProject) {
    project.value = savedProject
    if (savedProject.sessionSettings) {
      sessionSettings.value = savedProject.sessionSettings
    }
  }

  try {
    const firestoreProject = await getProjectById(projectId)
    if (firestoreProject) {
      project.value = {
        ...firestoreProject,
        sessionSettings: project.value?.sessionSettings || firestoreProject.sessionSettings
      }
    }
  } catch (error) {
    }
})

watch(sessionSettings, (newSettings) => {
  if (project.value) {
    project.value.sessionSettings = newSettings
    saveProjectToLocalStorage(project.value)
  }
}, { deep: true })

const getProjectFromLocalStorage = (id) => {
  if (!user.value?.uid) return null
  const saved = localStorage.getItem(`projects_${user.value.uid}`)
  if (saved) {
    const projects = JSON.parse(saved)
    return projects.find(p => p.id === id)
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
  } catch (error) {
    alert(t('project.alerts.delete_affirmation_failed'))
  }
}

const startSession = () => {
  if (project.value?.affirmations?.length > 0) {
    router.push(`/session/${projectId}`)
  }
}

useHead({
  title: computed(() => t('project.page_title', { name: project.value?.name || 'Project' }))
})
</script>