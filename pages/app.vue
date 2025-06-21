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
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
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
                  @click.stop="editProject(project)"
                  class="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✏️
                </button>
                <button
                  @click.stop="deleteProject(project.id)"
                  class="text-gray-400 hover:text-red-600 p-1"
                >
                  🗑️
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
  </div>
</template>

<script setup>
import { Folder, Play } from 'lucide-vue-next'

const { user, logout: authLogout } = useAuth()
const { 
  subscribeToUserProjects,
  createProject: firestoreCreateProject,
  deleteProject: firestoreDeleteProject
} = useFirestore()

const projects = ref([])
const showNewProjectModal = ref(false)
const newProjectName = ref('')
const loading = ref(false)

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
      projects.value = JSON.parse(saved)
    }

    try {
      unsubscribe = subscribeToUserProjects((userProjects) => {
        const currentProjects = projects.value || []
        const firebaseProjects = userProjects || []

        const projectMap = new Map()

        currentProjects.forEach(p => projectMap.set(p.id, p))

        firebaseProjects.forEach(p => projectMap.set(p.id, p))
        
        const mergedProjects = Array.from(projectMap.values())
        projects.value = mergedProjects
        
        localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(mergedProjects))
      })
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
  
  loading.value = true
  try {
    const name = newProjectName.value.trim() || getDefaultProjectName()
    const newProject = {
      id: Date.now().toString(),
      name,
      affirmations: [],
      userId: user.value?.uid,
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

const editProject = (project) => {
  navigateTo(`/project/${project.id}/edit`)
}

const deleteProject = async (projectId) => {
  if (!confirm('Czy na pewno chcesz usunąć ten projekt?')) return
  
  try {
    await firestoreDeleteProject(projectId)
  } catch (error) {
    alert('Failed to delete project')
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