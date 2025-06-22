<template>
  <div class="min-h-screen bg-gray-50">
    
    <header class="bg-brand-blue shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white font-crimson">My affirms</h1>
          <p class="text-sm text-white font-crimson italic opacity-90">Affirmations that reveal, not just heal</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-white opacity-90">Witaj, {{ user?.email || 'Użytkowniku' }}</span>
          <span class="text-xs text-white opacity-60">v{{ appVersion }}</span>
          <button
            @click="logout"
            class="text-white hover:text-white opacity-90 hover:opacity-100"
          >
            Wyloguj
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-8">
      
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Twoje projekty</h2>
            <p class="text-gray-600 mt-1">Organizuj afirmacje w tematyczne kolekcje</p>
          </div>
          <button
            @click="showNewProjectModal = true"
            :disabled="!user"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <span class="text-lg">+</span>
            Nowy projekt
          </button>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="project in projects"
            :key="project.id"
            class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            @click="selectProject(project)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  {{ project.name }}
                </h3>
                <p class="text-gray-600 text-sm">
                  {{ project.affirmations?.length || 0 }} afirmacji
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click.stop="openProjectSettings(project)"
                  class="text-gray-400 hover:text-gray-600 p-1"
                  title="Ustawienia projektu"
                >
                  <Settings class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div class="space-y-2">
              <div
                v-for="affirmation in (project.affirmations || []).slice(0, 3)"
                :key="affirmation.id"
                class="text-sm text-gray-600 bg-gray-50 rounded p-2"
              >
                {{ affirmation.text }}
              </div>
              <div
                v-if="(project.affirmations?.length || 0) > 3"
                class="text-xs text-gray-500 text-center py-1"
              >
                +{{ (project.affirmations?.length || 0) - 3 }} więcej
              </div>
            </div>

            <div class="mt-4 pt-4 border-t">
              <button
                @click.stop="startSession(project)"
                :disabled="!project.affirmations?.length"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded font-medium"
              >
                <Play class="w-4 h-4" /> Rozpocznij sesję
              </button>
            </div>
          </div>

          <div
            v-if="projects.length === 0"
            class="col-span-full text-center py-12"
          >
            <div class="text-gray-400 text-6xl mb-4"><Folder class="w-16 h-16" /></div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">Brak projektów</h3>
            <p class="text-gray-600 mb-4">Stwórz swój pierwszy projekt afirmacji</p>
            <button
              @click="showNewProjectModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Utwórz projekt
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showNewProjectModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showNewProjectModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4">Nowy projekt</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nazwa projektu
          </label>
          <input
            v-model="newProjectName"
            type="text"
            :placeholder="getDefaultProjectName()"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="createProject"
          />
        </div>
        <div class="flex gap-3">
          <button
            @click="createProject"
            :disabled="loading"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded font-medium"
          >
            {{ loading ? 'Tworzenie...' : 'Utwórz' }}
          </button>
          <button
            @click="showNewProjectModal = false"
            class="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded font-medium"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showProjectSettingsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeProjectSettings"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4">Ustawienia projektu</h3>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nazwa projektu
          </label>
          <input
            v-model="editingProjectName"
            type="text"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Wprowadź nazwę projektu..."
            @keyup.enter="saveProjectName"
          />
        </div>

        <div class="space-y-3">
          <button
            @click="saveProjectName"
            :disabled="!editingProjectName.trim()"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded font-medium"
          >
            Zapisz nazwę
          </button>
          
          <button
            @click="copyProject"
            class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium flex items-center justify-center gap-2"
          >
            <Clipboard class="w-5 h-5" /> Kopiuj projekt
          </button>
          
          <button
            @click="showDeleteProjectConfirm = true"
            class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium"
          >
            Usuń projekt
          </button>
          
          <button
            @click="closeProjectSettings"
            class="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded font-medium"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteProjectConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showDeleteProjectConfirm = false"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 text-red-600">Usuń projekt</h3>
        <div class="mb-6">
          <p class="text-gray-700 mb-3">Czy na pewno chcesz usunąć projekt?</p>
          <div class="bg-gray-50 p-3 rounded border-l-4 border-red-400">
            <p class="text-gray-800 font-medium">{{ selectedProject?.name }}</p>
            <p class="text-sm text-gray-600">{{ selectedProject?.affirmations?.length || 0 }} afirmacji</p>
          </div>
          <p class="text-sm text-gray-500 mt-2">Ta operacja jest nieodwracalna. Wszystkie afirmacje zostaną usunięte.</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="confirmDeleteProject"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium"
          >
            Usuń projekt
          </button>
          <button
            @click="showDeleteProjectConfirm = false"
            class="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded font-medium"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Settings, Folder, Clipboard, Play } from 'lucide-vue-next'

const { user, logout: authLogout } = useAuth()
const { 
  subscribeToUserProjects,
  createProject: firestoreCreateProject,
  deleteProject: firestoreDeleteProject,
  updateProject
} = useFirestore()

const appVersion = ref(`${Date.now()}`)

const projects = ref([])
const showNewProjectModal = ref(false)
const newProjectName = ref('')
const loading = ref(false)

const showProjectSettingsModal = ref(false)
const showDeleteProjectConfirm = ref(false)
const selectedProject = ref(null)
const editingProjectName = ref('')

let unsubscribe = null

onMounted(() => {
  
  setTimeout(() => {
    if (user.value?.uid) {
      const saved = localStorage.getItem(`projects_${user.value.uid}`)
      if (saved) {
        projects.value = JSON.parse(saved)
      }
    }
  }, 100)
})

watchEffect(() => {
  if (user.value) {
    if (unsubscribe) {
      unsubscribe()
    }

    const saved = localStorage.getItem(`projects_${user.value.uid}`)
    if (saved) {
      const localProjects = JSON.parse(saved)
      ))
      projects.value = localProjects
    } else {
      }

    try {
      unsubscribe = subscribeToUserProjects((userProjects) => {
        ))

        const firebaseProjects = userProjects || []
        projects.value = firebaseProjects
        
        localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(firebaseProjects))
        })
      
      if (unsubscribe) {
        } else {
        }
    } catch (error) {
      }
  } else {
    projects.value = []
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

const getDefaultProjectName = () => {
  const count = projects.value.length + 1
  return `Bez nazwy ${count}`
}

const createProject = async () => {
  if (loading.value) return
  
  if (!user.value) {
    alert('Authentication required to create project')
    return
  }
  
  loading.value = true
  try {
    const name = newProjectName.value.trim() || getDefaultProjectName()
    const newProject = {
      id: Date.now().toString(),
      name,
      affirmations: [],
      userId: user.value.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    try {
      
      const projectId = await firestoreCreateProject({
        name,
        affirmations: []
      })
      newProject.id = projectId
      } catch (firebaseError) {
      projects.value.push(newProject)
      
      localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects.value))
      }
    
    newProjectName.value = ''
    showNewProjectModal.value = false

    navigateTo(`/project/${newProject.id}`)
  } catch (error) {
    alert('Failed to create project')
  } finally {
    loading.value = false
  }
}

const selectProject = (project) => {
  navigateTo(`/project/${project.id}`)
}

const openProjectSettings = (project) => {
  selectedProject.value = project
  editingProjectName.value = project.name
  showProjectSettingsModal.value = true
}

const closeProjectSettings = () => {
  showProjectSettingsModal.value = false
  showDeleteProjectConfirm.value = false
  selectedProject.value = null
  editingProjectName.value = ''
}

const saveProjectName = async () => {
  if (!editingProjectName.value.trim() || !selectedProject.value) return
  
  try {
    const updatedProject = {
      ...selectedProject.value,
      name: editingProjectName.value.trim(),
      updatedAt: new Date().toISOString()
    }

    try {
      await updateProject(selectedProject.value.id, { 
        name: updatedProject.name,
        updatedAt: updatedProject.updatedAt
      })
      } catch (error) {
      }

    const projectIndex = projects.value.findIndex(p => p.id === selectedProject.value.id)
    if (projectIndex !== -1) {
      projects.value[projectIndex] = updatedProject
    }

    if (user.value?.uid) {
      localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects.value))
      }
    
    closeProjectSettings()
  } catch (error) {
    alert('Failed to save project name')
  }
}

const confirmDeleteProject = async () => {
  if (!selectedProject.value) return
  
  try {
    await firestoreDeleteProject(selectedProject.value.id)
    closeProjectSettings()
  } catch (error) {
    alert('Failed to delete project')
  }
}

const copyProject = async () => {
  if (!selectedProject.value) return
  
  try {
    
    const originalProject = selectedProject.value
    const copiedProject = {
      id: Date.now().toString(),
      name: `${originalProject.name} (kopia)`,
      affirmations: originalProject.affirmations ? [...originalProject.affirmations].map(affirmation => ({
        ...affirmation,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5), 
        createdAt: new Date().toISOString()
      })) : [],
      userId: user.value.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    try {
      const projectId = await firestoreCreateProject({
        name: copiedProject.name,
        affirmations: copiedProject.affirmations
      })
      copiedProject.id = projectId
      } catch (firebaseError) {
      projects.value.push(copiedProject)
      
      localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects.value))
      }
    
    closeProjectSettings()

    setTimeout(() => {
      alert(`Project "${originalProject.name}" copied as "${copiedProject.name}"`)
    }, 100)
    
  } catch (error) {
    alert('Failed to copy project')
  }
}

const startSession = (project) => {
  if (project.affirmations?.length > 0) {
    navigateTo(`/session/${project.id}`)
  }
}

const logout = async () => {
  await authLogout()
}

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Moje projekty - My affirms'
})
</script>