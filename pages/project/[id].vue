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
          <div class="flex gap-2">
            <input
              v-model="newAffirmationText"
              type="text"
              placeholder="Wprowadź swoją afirmację..."
              class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="addAffirmation"
            />
            <button
              @click="addAffirmation"
              :disabled="!newAffirmationText.trim()"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium"
            >
              Dodaj
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Afirmacje ({{ project.affirmations?.length || 0 }})
          </h3>
          
          <div class="space-y-3">
            <div
              v-for="affirmation in project.affirmations"
              :key="affirmation.id"
              class="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div class="flex-1">
                <p :class="affirmation.isActive ? 'text-gray-900' : 'text-gray-400 line-through'">
                  {{ affirmation.text }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="toggleAffirmation(affirmation.id)"
                  :class="affirmation.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'"
                  class="px-2 py-1 rounded font-medium"
                >
                  {{ affirmation.isActive ? '<Check class="w-4 h-4" />' : '<Circle class="w-4 h-4" />' }}
                </button>
                <button
                  @click="deleteAffirmation(affirmation.id)"
                  class="text-red-600 hover:text-red-800 px-2 py-1 rounded"
                >
                  🗑
                </button>
              </div>
            </div>
            
            <div v-if="!project.affirmations?.length" class="text-center py-8">
              <p class="text-gray-500">Brak afirmacji. Dodaj pierwszą powyżej!</p>
            </div>
          </div>
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

const deleteAffirmation = async (affirmationId) => {
  if (!project.value || !confirm('Czy na pewno chcesz usunąć tę afirmację?')) return
  
  const updatedAffirmations = project.value.affirmations.filter(
    affirmation => affirmation.id !== affirmationId
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

const startSession = () => {
  if (activeAffirmations.value.length > 0) {
    router.push(`/session/${project.value.id}`)
  }
}

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: `${project.value?.name || 'Projekt'} - My affirms`
})
</script>