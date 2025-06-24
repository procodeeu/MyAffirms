<template>
  <div class="min-h-screen bg-pastel-vanilla">
    
    <header class="bg-pastel-purple shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="$router.back()"
            class="text-gray-700 hover:text-gray-900 opacity-90 hover:opacity-100 inline-flex items-center gap-2 transition-colors"
          >
            <ChevronLeft class="w-4 h-4" /> Powrót
          </button>
          <div>
            <div class="text-xs text-gray-700 font-crimson italic opacity-90">My affirms</div>
            <h1 class="text-2xl font-bold text-gray-800">{{ group?.name || 'Grupa' }}</h1>
          </div>
        </div>
        <button
          @click="startGroupSession"
          :disabled="!hasActiveAffirmations"
          class="bg-pastel-violet hover:bg-pastel-purple disabled:bg-gray-300 text-gray-800 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 "
        >
          <Play class="w-4 h-4" /> Rozpocznij sesję grupową
        </button>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 py-8">
      <div v-if="loading" class="text-center py-8">
        <p>Ładowanie...</p>
        <p v-if="!user" class="text-sm text-gray-500 mt-2">Oczekiwanie na uwierzytelnienie...</p>
      </div>

      <div v-else-if="!group" class="text-center py-8">
        <p class="text-gray-500">Grupa nie została znaleziona</p>
      </div>

      <div v-else>
        <div class="bg-pastel-violet border border-pastel-rose rounded-lg shadow p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plus class="w-5 h-5 text-gray-700" />
              Dodaj projekty do grupy
            </h3>
            <button
              @click="showAddProjectSection = !showAddProjectSection"
              class="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronDown :class="showAddProjectSection ? 'rotate-180' : ''" class="w-5 h-5 transition-transform" />
            </button>
          </div>
          
          <div v-if="showAddProjectSection" class="space-y-3">
            <div v-if="!availableProjects.length" class="text-center py-4 text-gray-500">
              Wszystkie projekty są już w tej grupie
            </div>
            <div v-else>
              <div
                v-for="project in availableProjects"
                :key="project.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <Folder class="w-4 h-4 text-gray-500" />
                  <span class="text-gray-900">{{ project.name }}</span>
                  <span class="text-sm text-gray-500">({{ project.affirmations?.length || 0 }} afirmacji)</span>
                </div>
                <button
                  @click="addProject(project.id)"
                  class="bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-800 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 "
                >
                  <Plus class="w-3 h-3" /> Dodaj
                </button>
              </div>
            </div>
          </div>
        </div>

        <div 
          v-for="project in groupProjects" 
          :key="project.id"
          class="bg-pastel-khaki border border-pastel-dun rounded-lg shadow p-6 mb-6"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Folder class="w-5 h-5 text-gray-700" />
              {{ project.name }} ({{ getActiveAffirmationsCount(project) }})
            </h3>
            
            <div class="relative">
              <button
                @click="toggleProjectMenu(project.id)"
                class="text-gray-400 hover:text-gray-600 p-1"
                title="Opcje projektu"
              >
                <MoreVertical class="w-5 h-5" />
              </button>
              
              <div
                v-if="activeProjectMenu === project.id"
                class="absolute right-0 top-8 bg-pastel-dun border border-gray-200 rounded-lg shadow-lg z-10 min-w-48"
              >
                <div class="py-1">
                  <button
                    @click="moveProject(project.id, 'up')"
                    :disabled="!canMoveUp(project.id)"
                    class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <ChevronUp class="w-4 h-4" />
                    Przesuń do góry
                  </button>
                  <button
                    @click="moveProject(project.id, 'down')"
                    :disabled="!canMoveDown(project.id)"
                    class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <ChevronDown class="w-4 h-4" />
                    Przesuń do dołu
                  </button>
                  <div class="border-t border-gray-100"></div>
                  <button
                    @click="removeProject(project.id)"
                    class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <X class="w-4 h-4" />
                    Usuń z grupy
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="affirmation in project.affirmations || []"
              :key="affirmation.id"
              class="border border-gray-200 rounded-lg p-4 flex items-center justify-between transition-all duration-200"
              :class="affirmation.isActive ? 'bg-pastel-dun' : 'bg-gray-50'"
            >
              <div class="flex items-center gap-3 flex-1">
                <div class="flex-1">
                  <p :class="affirmation.isActive ? 'text-gray-900' : 'text-gray-400 line-through'">
                    {{ affirmation.text }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <button
                  @click="toggleAffirmation(project.id, affirmation.id)"
                  class="relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
                  :class="affirmation.isActive ? 'bg-green-600' : 'bg-gray-300'"
                  title="Przełącz aktywność"
                >
                  <span
                    class="inline-block h-2.5 w-2.5 transform rounded-full bg-pastel-vanilla transition-transform duration-200"
                    :class="affirmation.isActive ? 'translate-x-3.5' : 'translate-x-0.5'"
                  ></span>
                </button>
              </div>
            </div>
            
            <div v-if="!project.affirmations?.length" class="text-center py-8 text-gray-500">
              Ten projekt nie zawiera żadnych afirmacji
            </div>
          </div>
        </div>

        <div v-if="!groupProjects.length" class="text-center py-8">
          <p class="text-gray-500">Ta grupa nie zawiera żadnych projektów</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Play, ChevronLeft, Folder, ChevronUp, ChevronDown, MoreVertical, Plus, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { 
  getUserGroups,
  getUserProjects,
  updateProject,
  moveProjectInGroup,
  addProjectToGroup,
  removeProjectFromGroup
} = useFirestore()

const group = ref(null)
const groupProjects = ref([])
const loading = ref(true)
const allProjects = ref([])
const availableProjects = ref([])
const activeProjectMenu = ref(null)
const showAddProjectSection = ref(false)

const hasActiveAffirmations = computed(() => {
  return groupProjects.value.some(project => 
    project.affirmations?.some(affirmation => affirmation.isActive)
  )
})

const loadGroup = async () => {
  try {
    loading.value = true
    
    console.log('Loading group with ID:', route.params.id)
    
    const groups = await getUserGroups()
    console.log('Available groups:', groups)
    
    group.value = groups.find(g => g.id === route.params.id)
    console.log('Found group:', group.value)
    
    if (!group.value) {
      console.log('Group not found!')
      return
    }
    
    allProjects.value = await getUserProjects()
    console.log('All projects:', allProjects.value)
    console.log('Group project IDs:', group.value.projectIds)
    
    const projectsInGroup = allProjects.value.filter(project => 
      group.value.projectIds?.includes(project.id)
    )
    
    groupProjects.value = projectsInGroup.sort((a, b) => {
      const orderA = group.value.projectOrder?.[a.id] ?? 999
      const orderB = group.value.projectOrder?.[b.id] ?? 999
      return orderA - orderB
    })
    
    console.log('Sorted group projects:', groupProjects.value)
    
    availableProjects.value = allProjects.value.filter(project => 
      !group.value.projectIds?.includes(project.id)
    )
    
  } catch (error) {
    console.error('Error loading group:', error)
  } finally {
    loading.value = false
  }
}

const getActiveAffirmationsCount = (project) => {
  if (!project.affirmations) return 0
  return project.affirmations.filter(a => a.isActive).length
}

const toggleAffirmation = async (projectId, affirmationId) => {
  try {
    const project = groupProjects.value.find(p => p.id === projectId)
    if (!project) return
    
    const affirmationIndex = project.affirmations.findIndex(a => a.id === affirmationId)
    if (affirmationIndex === -1) return
    
    project.affirmations[affirmationIndex].isActive = !project.affirmations[affirmationIndex].isActive
    
    await updateProject(projectId, {
      affirmations: project.affirmations,
      updatedAt: new Date().toISOString()
    })
    
    if (user.value?.uid) {
      const localData = localStorage.getItem(`projects_${user.value.uid}`)
      if (localData) {
        const localProjects = JSON.parse(localData)
        const localProjectIndex = localProjects.findIndex(p => p.id === projectId)
        if (localProjectIndex !== -1) {
          localProjects[localProjectIndex] = project
          localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(localProjects))
        }
      }
    }
  } catch (error) {
    console.error('Error toggling affirmation:', error)
    const project = groupProjects.value.find(p => p.id === projectId)
    if (project) {
      const affirmationIndex = project.affirmations.findIndex(a => a.id === affirmationId)
      if (affirmationIndex !== -1) {
        project.affirmations[affirmationIndex].isActive = !project.affirmations[affirmationIndex].isActive
      }
    }
  }
}

const startGroupSession = () => {
  if (hasActiveAffirmations.value) {
    console.log('Starting group session for:', group.value.name)
  }
}

const toggleProjectMenu = (projectId) => {
  activeProjectMenu.value = activeProjectMenu.value === projectId ? null : projectId
}

const moveProject = async (projectId, direction) => {
  try {
    await moveProjectInGroup(group.value.id, projectId, direction)
    await loadGroup()
    activeProjectMenu.value = null
  } catch (error) {
    console.error('Error moving project:', error)
  }
}

const removeProject = async (projectId) => {
  try {
    await removeProjectFromGroup(group.value.id, projectId)
    await loadGroup()
    activeProjectMenu.value = null
  } catch (error) {
    console.error('Error removing project:', error)
  }
}

const addProject = async (projectId) => {
  try {
    await addProjectToGroup(group.value.id, projectId)
    await loadGroup()
  } catch (error) {
    console.error('Error adding project:', error)
  }
}

const getProjectIndex = (projectId) => {
  return groupProjects.value.findIndex(p => p.id === projectId)
}

const canMoveUp = (projectId) => {
  return getProjectIndex(projectId) > 0
}

const canMoveDown = (projectId) => {
  return getProjectIndex(projectId) < groupProjects.value.length - 1
}

onMounted(() => {
  if (user.value) {
    loadGroup()
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    activeProjectMenu.value = null
  }
}

watch(user, (newUser) => {
  if (newUser) {
    console.log('User logged in, loading group...')
    loadGroup()
  }
}, { immediate: true })

watch(() => route.params.id, () => {
  if (user.value) {
    loadGroup()
  }
})

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: computed(() => `${group.value?.name || 'Grupa'} - My affirms`)
})
</script>