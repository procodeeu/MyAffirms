<template>
  <div class="min-h-screen bg-pastel-vanilla">
    
    <header class="bg-pastel-purple shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 font-crimson">My affirms</h1>
          <p class="text-sm text-gray-700 font-crimson italic opacity-90">Affirmations that reveal, not just heal</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-gray-700 opacity-90">Witaj, {{ user?.email || 'Użytkowniku' }}</span>
          <span class="text-xs text-gray-600 opacity-60">v{{ appVersion }}</span>
          <button
            @click="logout"
            class="text-gray-700 hover:text-gray-900 opacity-90 hover:opacity-100 transition-colors"
          >
            Wyloguj
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 py-12">
      
      <div class="mb-8">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 font-crimson">Twoje projekty</h2>
            <p class="text-gray-600 mt-1">Organizuj afirmacje w tematyczne kolekcje</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="showNewProjectModal = true"
              :disabled="!user"
              class="bg-pastel-khaki hover:bg-pastel-khaki-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-colors duration-200"
            >
              <span class="text-lg">+</span>
              Nowy projekt
            </button>
            <button
              @click="showNewGroupModal = true"
              :disabled="!user"
              class="bg-pastel-violet hover:bg-pastel-purple disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-colors duration-200"
            >
              <Users class="w-4 h-4" />
              Nowa grupa
            </button>
          </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Karty grup -->
          <div
            v-for="group in groups"
            :key="`group-${group.id}`"
            class="bg-pastel-violet border border-pastel-rose rounded-2xl p-8 cursor-pointer hover:bg-pastel-purple transition-colors duration-300"
            @click="selectGroup(group)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Users class="w-5 h-5 text-gray-700" />
                  <h3 class="text-xl font-semibold text-gray-900 font-crimson">
                    {{ group.name }}
                  </h3>
                </div>
                <p class="text-gray-600 text-sm">
                  {{ getGroupProjectsCount(group) }} projektów w grupie
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click.stop="openGroupSettings(group)"
                  class="text-gray-400 hover:text-gray-600 p-1"
                  title="Ustawienia grupy"
                >
                  <Settings class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div class="space-y-2">
              <div
                v-for="projectName in getGroupProjectNames(group).slice(0, 3)"
                :key="projectName"
                class="text-sm text-gray-700 bg-pastel-khaki rounded p-2 border border-pastel-cinereous"
              >
                {{ projectName }}
              </div>
              <div
                v-if="getGroupProjectNames(group).length > 3"
                class="text-xs text-gray-600 text-center py-1"
              >
                +{{ getGroupProjectNames(group).length - 3 }} więcej
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-pastel-cinereous">
              <button
                @click.stop="startGroupSession(group)"
                :disabled="!getGroupProjectsCount(group)"
                class="w-full bg-pastel-purple hover:bg-pastel-purple-2 disabled:bg-gray-300 text-gray-800 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <Play class="w-4 h-4" /> Rozpocznij sesję grupową
              </button>
            </div>
          </div>

          <!-- Karty projektów -->
          <div
            v-for="project in projects"
            :key="project.id"
            class="bg-pastel-khaki border border-pastel-dun rounded-2xl p-8 cursor-pointer transition-colors duration-300"
            @click="selectProject(project)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900 mb-2 font-crimson">
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
                class="text-sm text-gray-700 bg-pastel-dun rounded p-2 border border-pastel-cinereous"
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

            <div class="mt-4 pt-4 border-t border-pastel-cinereous">
              <button
                @click.stop="startSession(project)"
                :disabled="!project.affirmations?.length"
                class="w-full bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
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
            <h3 class="text-xl font-medium text-gray-900 mb-2 font-crimson">Brak projektów</h3>
            <p class="text-gray-600 mb-4">Stwórz swój pierwszy projekt afirmacji</p>
            <button
              @click="showNewProjectModal = true"
              class="bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-800 px-8 py-4 rounded-2xl font-semibold transition-colors duration-200"
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
        class="bg-pastel-khaki rounded-3xl p-8 w-full max-w-md border border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 font-crimson">Nowy projekt</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nazwa projektu
          </label>
          <input
            v-model="newProjectName"
            type="text"
            :placeholder="getDefaultProjectName()"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            @keyup.enter="createProject"
          />
        </div>
        <div class="flex gap-3">
          <button
            @click="createProject"
            :disabled="loading"
            class="flex-1 bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 py-3 rounded-2xl font-semibold transition-colors duration-200"
          >
            {{ loading ? 'Tworzenie...' : 'Utwórz' }}
          </button>
          <button
            @click="showNewProjectModal = false"
            class="flex-1 border border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-2xl font-semibold transition-colors duration-200"
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
        class="bg-pastel-khaki rounded-3xl p-8 w-full max-w-md border border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 font-crimson">Ustawienia projektu</h3>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nazwa projektu
          </label>
          <input
            v-model="editingProjectName"
            type="text"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            placeholder="Wprowadź nazwę projektu..."
            @keyup.enter="saveProjectName"
          />
        </div>

        <div class="space-y-3">
          <button
            @click="saveProjectName"
            :disabled="!editingProjectName.trim()"
            class="w-full bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 py-3 rounded-2xl font-semibold transition-colors duration-200"
          >
            Zapisz nazwę
          </button>
          
          <button
            @click="copyProject"
            class="w-full bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-800 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <Clipboard class="w-5 h-5" /> Kopiuj projekt
          </button>
          
          <button
            @click="showDeleteProjectConfirm = true"
            class="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-semibold transition-colors duration-200"
          >
            Usuń projekt
          </button>
          
          <button
            @click="closeProjectSettings"
            class="w-full border border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-2xl font-semibold transition-colors duration-200"
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
        class="bg-pastel-khaki rounded-3xl p-8 w-full max-w-md border border-pastel-cinereous"
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
            class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-semibold transition-colors duration-200"
          >
            Usuń projekt
          </button>
          <button
            @click="showDeleteProjectConfirm = false"
            class="flex-1 border border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-2xl font-semibold transition-colors duration-200"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>

    <!-- Modal nowej grupy -->
    <div
      v-if="showNewGroupModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showNewGroupModal = false"
    >
      <div
        class="bg-pastel-khaki rounded-3xl p-8 w-full max-w-md border border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 font-crimson">Utwórz nową grupę</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nazwa grupy
          </label>
          <input
            v-model="newGroupName"
            type="text"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            placeholder="Wprowadź nazwę grupy..."
            @keyup.enter="createNewGroup"
          />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Wybierz projekty
          </label>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <label
              v-for="project in projects"
              :key="project.id"
              class="flex items-center"
            >
              <input
                v-model="selectedProjectsForGroup"
                :value="project.id"
                type="checkbox"
                class="mr-2"
              />
              {{ project.name }}
            </label>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            @click="createNewGroup"
            :disabled="!newGroupName.trim()"
            class="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2 rounded font-medium"
          >
            Utwórz grupę
          </button>
          <button
            @click="showNewGroupModal = false"
            class="flex-1 border border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-2xl font-semibold transition-colors duration-200"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>

    <!-- Modal ustawień grupy -->
    <div
      v-if="showGroupSettingsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeGroupSettings"
    >
      <div
        class="bg-pastel-khaki rounded-3xl p-8 w-full max-w-md border border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4">Ustawienia grupy</h3>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nazwa grupy
          </label>
          <input
            v-model="editingGroupName"
            type="text"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            placeholder="Wprowadź nazwę grupy..."
            @keyup.enter="saveGroupName"
          />
        </div>

        <div class="space-y-3">
          <button
            @click="saveGroupName"
            :disabled="!editingGroupName.trim()"
            class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2 rounded font-medium"
          >
            Zapisz nazwę
          </button>
          
          <button
            @click="showDeleteGroupConfirm = true"
            class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium"
          >
            Usuń grupę
          </button>
          
          <button
            @click="closeGroupSettings"
            class="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded font-medium"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>

    <!-- Modal potwierdzenia usunięcia grupy -->
    <div
      v-if="showDeleteGroupConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showDeleteGroupConfirm = false"
    >
      <div
        class="bg-pastel-khaki rounded-3xl p-8 w-full max-w-md border border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 text-red-600">Usuń grupę</h3>
        <div class="mb-6">
          <p class="text-gray-700 mb-3">Czy na pewno chcesz usunąć grupę?</p>
          <div class="bg-gray-50 p-3 rounded border-l-4 border-red-400">
            <p class="text-gray-800 font-medium">{{ selectedGroup?.name }}</p>
            <p class="text-sm text-gray-600">{{ getGroupProjectsCount(selectedGroup) }} projektów</p>
          </div>
          <p class="text-sm text-gray-500 mt-2">Ta operacja jest nieodwracalna. Projekty pozostaną nienaruszone.</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="confirmDeleteGroup"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium"
          >
            Usuń grupę
          </button>
          <button
            @click="showDeleteGroupConfirm = false"
            class="flex-1 border border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-2xl font-semibold transition-colors duration-200"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>

    <PWAInstallPrompt />
  </div>
</template>

<script setup>
import { Settings, Folder, Clipboard, Play, Users, Plus } from 'lucide-vue-next'

const { user, logout: authLogout } = useAuth()
const { 
  subscribeToUserProjects,
  createProject: firestoreCreateProject,
  deleteProject: firestoreDeleteProject,
  updateProject,
  subscribeToUserGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addProjectToGroup,
  removeProjectFromGroup
} = useFirestore()

import { BUILD_VERSION } from '~/utils/version.js'
const appVersion = ref(BUILD_VERSION)

const projects = ref([])
const groups = ref([])
const showNewProjectModal = ref(false)
const newProjectName = ref('')
const loading = ref(false)

const showProjectSettingsModal = ref(false)
const showDeleteProjectConfirm = ref(false)
const selectedProject = ref(null)
const editingProjectName = ref('')

const showNewGroupModal = ref(false)
const showGroupSettingsModal = ref(false)
const showDeleteGroupConfirm = ref(false)
const selectedGroup = ref(null)
const newGroupName = ref('')
const editingGroupName = ref('')
const selectedProjectsForGroup = ref([])

let unsubscribe = null
let unsubscribeGroups = null

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
      projects.value = localProjects
    } else {
      }

    try {
      unsubscribe = subscribeToUserProjects((userProjects) => {
        const firebaseProjects = userProjects || []
        const localData = localStorage.getItem(`projects_${user.value.uid}`)
        let localProjects = []
        if (localData) {
          try {
            localProjects = JSON.parse(localData)
          } catch (e) {
            }
        }

        const mergedProjects = firebaseProjects.map(firebaseProject => {
          const localProject = localProjects.find(p => p.id === firebaseProject.id)
          return {
            ...firebaseProject,
            
            sessionSettings: localProject?.sessionSettings || firebaseProject.sessionSettings
          }
        })
        
        projects.value = mergedProjects
        
        localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(mergedProjects))
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

watchEffect(() => {
  if (user.value) {
    if (unsubscribeGroups) {
      unsubscribeGroups()
    }

    try {
      unsubscribeGroups = subscribeToUserGroups((userGroups) => {
        groups.value = userGroups || []
      })
    } catch (error) {
      console.error('Error subscribing to groups:', error)
    }
  } else {
    groups.value = []
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  if (unsubscribeGroups) {
    unsubscribeGroups()
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

const getGroupProjectsCount = (group) => {
  if (!group?.projectIds) return 0
  return group.projectIds.length
}

const getGroupProjectNames = (group) => {
  if (!group?.projectIds) return []
  return group.projectIds
    .map(id => projects.value.find(p => p.id === id)?.name)
    .filter(Boolean)
}

const createNewGroup = async () => {
  if (!newGroupName.value.trim()) return
  
  try {
    loading.value = true
    
    const groupData = {
      name: newGroupName.value.trim(),
      projectIds: selectedProjectsForGroup.value
    }
    
    await createGroup(groupData)
    
    newGroupName.value = ''
    selectedProjectsForGroup.value = []
    showNewGroupModal.value = false
  } catch (error) {
    console.error('Failed to create group:', error)
    alert('Nie udało się utworzyć grupy')
  } finally {
    loading.value = false
  }
}

const openGroupSettings = (group) => {
  selectedGroup.value = group
  editingGroupName.value = group.name
  showGroupSettingsModal.value = true
}

const closeGroupSettings = () => {
  showGroupSettingsModal.value = false
  showDeleteGroupConfirm.value = false
  selectedGroup.value = null
  editingGroupName.value = ''
}

const saveGroupName = async () => {
  if (!editingGroupName.value.trim() || !selectedGroup.value) return
  
  try {
    await updateGroup(selectedGroup.value.id, {
      name: editingGroupName.value.trim()
    })
    
    closeGroupSettings()
  } catch (error) {
    console.error('Failed to update group:', error)
    alert('Nie udało się zaktualizować grupy')
  }
}

const confirmDeleteGroup = async () => {
  if (!selectedGroup.value) return
  
  try {
    await deleteGroup(selectedGroup.value.id)
    showDeleteGroupConfirm.value = false
    closeGroupSettings()
  } catch (error) {
    console.error('Failed to delete group:', error)
    alert('Nie udało się usunąć grupy')
  }
}

const selectGroup = (group) => {
  navigateTo(`/group/${group.id}`)
}

const startGroupSession = (group) => {
  console.log('Starting group session for:', group.name)
  // navigateTo(`/group-session/${group.id}`)
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