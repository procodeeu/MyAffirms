<template>
  <div class="min-h-screen bg-gray-50">
    
    <header class="bg-brand-blue shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="$router.back()"
            class="text-white hover:text-white opacity-90 hover:opacity-100"
          >
            ← Powrót
          </button>
          <div>
            <div class="text-xs text-white font-crimson italic opacity-90">My affirms</div>
            <h1 class="text-2xl font-bold text-white">{{ project?.name || 'Projekt' }}</h1>
          </div>
        </div>
        <button
          @click="startSession"
          :disabled="!activeAffirmations.length"
          class="bg-white hover:bg-gray-100 disabled:bg-gray-300 text-brand-blue px-4 py-2 rounded-lg font-medium"
        >
          <Play class="w-4 h-4" /> Rozpocznij sesję
        </button>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 py-8">
      <div v-if="loading" class="text-center py-8">
        <p>Ładowanie...</p>
      </div>

      <div v-else-if="!project" class="text-center py-8">
        <p class="text-gray-500">Projekt nie został znaleziony</p>
      </div>

      <div v-else>
        
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Dodaj nową afirmację</h3>
          <div class="space-y-3">
            <textarea
              v-model="newAffirmationText"
              rows="2"
              placeholder="Wprowadź swoją afirmację...&#10;Możesz napisać kilka linii tekstu."
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px]"
              @keyup.ctrl.enter="addAffirmation"
            ></textarea>
            <div class="flex justify-between items-center">
              <p class="text-xs text-gray-500">Użyj Ctrl+Enter aby szybko dodać</p>
              <button
                @click="addAffirmation"
                :disabled="!newAffirmationText.trim()"
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium"
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Afirmacje ({{ project.affirmations?.length || 0 }})
          </h3>
          
          <div class="space-y-3">
            <div
              v-for="(affirmation, index) in project.affirmations"
              :key="affirmation.id"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragover.prevent
              @drop="handleDrop($event, index)"
              @dragenter.prevent
              @dragend="draggedIndex = null"
              :class="{
                'border-blue-400 shadow-md bg-blue-50': draggedIndex === index,
                'border-gray-200': draggedIndex !== index
              }"
              class="rounded-lg p-4 flex items-center justify-between cursor-move hover:border-blue-300 transition-all duration-200"
            >
              <div class="flex items-center gap-3 flex-1">
                <div class="text-gray-400 text-sm select-none">⋮⋮</div>
                <div class="flex-1">
                  <p :class="affirmation.isActive ? 'text-gray-900' : 'text-gray-400 line-through'">
                    {{ affirmation.text }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click.stop="toggleAffirmation(affirmation.id)"
                  :class="affirmation.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'"
                  class="px-2 py-1 rounded font-medium"
                  title="Przełącz aktywność"
                >
                  {{ affirmation.isActive ? '<Check class="w-4 h-4" />' : '<Circle class="w-4 h-4" />' }}
                </button>
                <div class="relative">
                  <button
                    @click.stop="toggleActionMenu(affirmation.id)"
                    class="text-gray-400 hover:text-gray-600 px-2 py-1 rounded"
                    title="Menu akcji"
                    data-menu-trigger
                  >
                    ⋯
                  </button>
                  <div
                    v-if="activeActionMenu === affirmation.id"
                    class="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32"
                  >
                    <button
                      @click.stop="startEditingAffirmation(affirmation.id)"
                      class="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      ✏️ Edytuj
                    </button>
                    <button
                      @click.stop="deleteAffirmation(affirmation.id)"
                      class="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      🗑 Usuń
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="!project.affirmations?.length" class="text-center py-8">
              <p class="text-gray-500">Brak afirmacji. Dodaj pierwszą powyżej!</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="cancelAffirmationEdit"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4">Edytuj afirmację</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tekst afirmacji
          </label>
          <textarea
            v-model="editingAffirmationText"
            rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Wprowadź tekst afirmacji..."
            @keyup.ctrl.enter="saveAffirmationEdit(editingAffirmationId)"
          ></textarea>
        </div>
        <div class="flex gap-3">
          <button
            @click="saveAffirmationEdit(editingAffirmationId)"
            :disabled="!editingAffirmationText.trim()"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 rounded font-medium"
          >
            Zapisz
          </button>
          <button
            @click="cancelAffirmationEdit"
            class="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded font-medium"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="cancelAffirmationDelete"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 text-red-600">Usuń afirmację</h3>
        <div class="mb-6">
          <p class="text-gray-700 mb-3">Czy na pewno chcesz usunąć tę afirmację?</p>
          <div class="bg-gray-50 p-3 rounded border-l-4 border-red-400">
            <p class="text-gray-800 italic">{{ deletingAffirmationText }}</p>
          </div>
          <p class="text-sm text-gray-500 mt-2">Ta operacja jest nieodwracalna.</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="confirmAffirmationDelete"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium"
          >
            Usuń
          </button>
          <button
            @click="cancelAffirmationDelete"
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
import { Play, Check, Circle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { getUserProjects, updateProject } = useFirestore()

const project = ref(null)
const loading = ref(true)
const newAffirmationText = ref('')

const draggedIndex = ref(null)

const activeActionMenu = ref(null)

const editingAffirmationId = ref(null)
const editingAffirmationText = ref('')
const showEditModal = ref(false)

const deletingAffirmationId = ref(null)
const deletingAffirmationText = ref('')
const showDeleteModal = ref(false)

const activeAffirmations = computed(() => 
  project.value?.affirmations?.filter(a => a.isActive) || []
)

const loadProject = async () => {
  try {
    if (user.value?.uid) {
      const saved = localStorage.getItem(`projects_${user.value.uid}`)
      if (saved) {
        const projects = JSON.parse(saved)
        project.value = projects.find(p => p.id === route.params.id)
        }
    }

    if (!project.value) {
      try {
        const projects = await getUserProjects()
        project.value = projects.find(p => p.id === route.params.id)
        } catch (firebaseError) {
        }
    }
    
    } catch (error) {
    } finally {
    loading.value = false
  }
}

watchEffect(() => {
  if (user.value) {
    loadProject()
  }
})

onMounted(() => {
  if (user.value) {
    loadProject()
  }
})

const addAffirmation = async () => {
  if (!newAffirmationText.value.trim() || !project.value) return
  
  const newAffirmation = {
    id: Date.now().toString(),
    text: newAffirmationText.value.trim(),
    isActive: true,
    createdAt: new Date().toISOString()
  }
  
  const updatedAffirmations = [
    ...(project.value.affirmations || []),
    newAffirmation
  ]
  
  try {
    
    try {
      await updateProject(project.value.id, { affirmations: updatedAffirmations })
    } catch (firebaseError) {
      }

    project.value.affirmations = updatedAffirmations

    if (user.value?.uid) {
      const saved = localStorage.getItem(`projects_${user.value.uid}`)
      if (saved) {
        const projects = JSON.parse(saved)
        const projectIndex = projects.findIndex(p => p.id === project.value.id)
        if (projectIndex !== -1) {
          projects[projectIndex] = { ...project.value }
          localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects))
        }
      }
    }
    
    newAffirmationText.value = ''
  } catch (error) {
    alert('Failed to add affirmation')
  }
}

const toggleAffirmation = async (affirmationId) => {
  if (!project.value) return
  
  const updatedAffirmations = project.value.affirmations.map(affirmation =>
    affirmation.id === affirmationId
      ? { ...affirmation, isActive: !affirmation.isActive }
      : affirmation
  )
  
  try {
    
    try {
      await updateProject(project.value.id, { affirmations: updatedAffirmations })
    } catch (firebaseError) {
      }

    project.value.affirmations = updatedAffirmations

    if (user.value?.uid) {
      const saved = localStorage.getItem(`projects_${user.value.uid}`)
      if (saved) {
        const projects = JSON.parse(saved)
        const projectIndex = projects.findIndex(p => p.id === project.value.id)
        if (projectIndex !== -1) {
          projects[projectIndex] = { ...project.value }
          localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects))
        }
      }
    }
  } catch (error) {
    }
}

const deleteAffirmation = (affirmationId) => {
  const affirmation = project.value.affirmations.find(a => a.id === affirmationId)
  if (affirmation) {
    deletingAffirmationId.value = affirmationId
    deletingAffirmationText.value = affirmation.text
    showDeleteModal.value = true
    activeActionMenu.value = null
  }
}

const confirmAffirmationDelete = async () => {
  if (!project.value || !deletingAffirmationId.value) return
  
  const updatedAffirmations = project.value.affirmations.filter(
    affirmation => affirmation.id !== deletingAffirmationId.value
  )
  
  try {
    
    try {
      await updateProject(project.value.id, { affirmations: updatedAffirmations })
    } catch (firebaseError) {
      }

    project.value.affirmations = updatedAffirmations

    if (user.value?.uid) {
      const saved = localStorage.getItem(`projects_${user.value.uid}`)
      if (saved) {
        const projects = JSON.parse(saved)
        const projectIndex = projects.findIndex(p => p.id === project.value.id)
        if (projectIndex !== -1) {
          projects[projectIndex] = { ...project.value }
          localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects))
        }
      }
    }
  } catch (error) {
    } finally {
    deletingAffirmationId.value = null
    deletingAffirmationText.value = ''
    showDeleteModal.value = false
  }
}

const cancelAffirmationDelete = () => {
  deletingAffirmationId.value = null
  deletingAffirmationText.value = ''
  showDeleteModal.value = false
}

const startSession = () => {
  if (activeAffirmations.value.length > 0) {
    router.push(`/session/${project.value.id}`)
  }
}

const handleDragStart = (event, index) => {
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', event.target)
}

const handleDrop = async (event, dropIndex) => {
  event.preventDefault()
  
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    draggedIndex.value = null
    return
  }
  
  const affirmations = [...project.value.affirmations]
  const draggedItem = affirmations[draggedIndex.value]

  affirmations.splice(draggedIndex.value, 1)

  const newDropIndex = draggedIndex.value < dropIndex ? dropIndex - 1 : dropIndex

  affirmations.splice(newDropIndex, 0, draggedItem)
  
  ))

  project.value.affirmations = affirmations
  project.value.updatedAt = new Date().toISOString()
  
  await nextTick()

  try {
    await updateProject(project.value.id, { affirmations })
    } catch (error) {
    }

  if (user.value?.uid) {
    const saved = localStorage.getItem(`projects_${user.value.uid}`)
    if (saved) {
      const projects = JSON.parse(saved)
      const projectIndex = projects.findIndex(p => p.id === project.value.id)
      if (projectIndex !== -1) {
        projects[projectIndex] = { ...project.value }
        localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects))
        }
    }
  }
  
  draggedIndex.value = null
}

const toggleActionMenu = (affirmationId) => {
  activeActionMenu.value = activeActionMenu.value === affirmationId ? null : affirmationId
  }

onMounted(() => {
  document.addEventListener('click', (event) => {
    
    if (!event.target.closest('[data-menu-trigger]')) {
      activeActionMenu.value = null
    }
  })
})

const startEditingAffirmation = (affirmationId) => {
  const affirmation = project.value.affirmations.find(a => a.id === affirmationId)
  if (affirmation) {
    editingAffirmationId.value = affirmationId
    editingAffirmationText.value = affirmation.text
    showEditModal.value = true
    activeActionMenu.value = null

    nextTick(() => {
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.focus()
        textarea.select()
      }
    })
  }
}

const saveAffirmationEdit = async (affirmationId) => {
  if (!editingAffirmationText.value.trim()) {
    cancelAffirmationEdit()
    return
  }
  
  try {
    
    const affirmationIndex = project.value.affirmations.findIndex(a => a.id === affirmationId)
    if (affirmationIndex !== -1) {
      project.value.affirmations[affirmationIndex].text = editingAffirmationText.value.trim()
      project.value.updatedAt = new Date().toISOString()
      
      )

      try {
        await updateProject(project.value.id, { 
          affirmations: project.value.affirmations,
          updatedAt: project.value.updatedAt
        })
        } catch (error) {
        }

      if (user.value?.uid) {
        const saved = localStorage.getItem(`projects_${user.value.uid}`)
        if (saved) {
          const projects = JSON.parse(saved)
          const projectIndex = projects.findIndex(p => p.id === project.value.id)
          if (projectIndex !== -1) {
            projects[projectIndex] = { ...project.value }
            localStorage.setItem(`projects_${user.value.uid}`, JSON.stringify(projects))
            }
        }
      }
    }
  } catch (error) {
    } finally {
    editingAffirmationId.value = null
    editingAffirmationText.value = ''
    showEditModal.value = false
  }
}

const cancelAffirmationEdit = () => {
  editingAffirmationId.value = null
  editingAffirmationText.value = ''
  showEditModal.value = false
}

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: `${project.value?.name || 'Projekt'} - My affirms`
})
</script>