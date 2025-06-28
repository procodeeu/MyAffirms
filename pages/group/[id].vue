<template>
  <div class="min-h-screen bg-pastel-vanilla">
    <header class="bg-pastel-purple shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-gray-700 hover:text-gray-900">
            <ArrowLeft class="w-6 h-6" />
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 font-crimson">{{ group?.name }}</h1>
            <p class="text-sm text-gray-700 font-crimson italic opacity-90">
              {{ $t('group.projects_in_group', { count: projectsInGroup.length }) }}
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
      <div class="mb-8">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 font-crimson">{{ $t('group.title') }}</h2>
            <p class="text-gray-600 mt-1">{{ $t('group.description') }}</p>
          </div>
          <button
            @click="showAddProjectModal = true"
            class="bg-pastel-khaki hover:bg-pastel-khaki-2 text-gray-900 px-6 py-3 rounded-full font-medium flex items-center gap-2 border-2 border-pastel-khaki hover:border-gray-900"
          >
            <span class="text-lg">+</span>
            {{ $t('group.add_project') }}
          </button>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="project in projectsInGroup"
            :key="project.id"
            class="bg-pastel-khaki border-2 border-pastel-dun rounded-4xl p-8 cursor-pointer"
            @click="selectProject(project)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-medium text-gray-900 mb-2 font-crimson">
                  {{ project.name }}
                </h3>
                <p class="text-gray-600 text-sm">
                  {{ $t('app.projects.affirmations_count', { count: project.affirmations?.length || 0 }) }}
                </p>
              </div>
              <button
                @click.stop="removeProjectFromGroup(project.id)"
                class="text-red-500 hover:text-red-700 p-1"
                :title="$t('group.remove_from_group')"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            v-if="projectsInGroup.length === 0"
            class="col-span-full text-center py-12"
          >
            <div class="text-gray-400 text-6xl mb-4"><Folder class="w-16 h-16" /></div>
            <h3 class="text-xl font-medium text-gray-900 mb-2 font-crimson">{{ $t('group.no_projects_title') }}</h3>
            <p class="text-gray-600 mb-4">{{ $t('group.no_projects_description') }}</p>
            <button
              @click="showAddProjectModal = true"
              class="bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-800 px-8 py-4 rounded-full font-medium border-2 border-pastel-khaki-2 hover:border-gray-800"
            >
              {{ $t('group.add_project') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add project to group modal -->
    <div
      v-if="showAddProjectModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showAddProjectModal = false"
    >
      <div
        class="bg-pastel-khaki rounded-4xl p-8 w-full max-w-md border-2 border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-medium mb-4">{{ $t('group.add_projects_to_group') }}</h3>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('group.select_projects_to_add') }}
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <label
              v-for="project in availableProjects"
              :key="project.id"
              class="flex items-center"
            >
              <input
                v-model="selectedProjectsToAdd"
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
            @click="addProjectsToGroup"
            :disabled="selectedProjectsToAdd.length === 0"
            class="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2 rounded font-medium"
          >
            {{ $t('group.add_selected') }}
          </button>
          <button
            @click="showAddProjectModal = false"
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
import { ArrowLeft, Folder, X } from 'lucide-vue-next'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { user, logout: authLogout } = useAuth()
const { t } = useI18n()
const { 
  getUserGroups,
  subscribeToUserProjects, 
  updateGroup 
} = useFirestore()

const route = useRoute()
const router = useRouter()
const groupId = route.params.id

const group = ref(null)
const allProjects = ref([])
const projectsInGroup = ref([])
const availableProjects = ref([])

const showAddProjectModal = ref(false)
const selectedProjectsToAdd = ref([])

let unsubscribeProjects = null

const loadGroup = async () => {
  console.log('🔍 Loading group:', groupId, 'user:', user.value?.uid)
  
  if (!user.value?.uid) {
    console.log('⏳ Waiting for user authentication...')
    return
  }
  
  try {
    const groups = await getUserGroups()
    console.log('🔥 All groups:', groups.length)
    const foundGroup = groups.find(g => g.id === groupId)
    console.log('🔥 Found group:', foundGroup)
    
    if (foundGroup) {
      group.value = foundGroup
      console.log('✅ Group loaded:', foundGroup.name, 'with', foundGroup.projectIds?.length || 0, 'projects')
    } else {
      console.log('❌ Group not found!')
    }
  } catch (error) {
    console.error('❌ Error loading group:', error)
  }
  
  // Subskrybuj projekty
  if (unsubscribeProjects) unsubscribeProjects()
  unsubscribeProjects = subscribeToUserProjects((userProjects) => {
    console.log('🔔 Projects updated:', userProjects?.length || 0)
    allProjects.value = userProjects || []
    updateProjectLists()
  })
}

// Załaduj grupę gdy użytkownik jest dostępny
watch(user, (newUser) => {
  if (newUser) {
    loadGroup()
  }
}, { immediate: true })

onMounted(() => {
  // Jeśli użytkownik już jest załadowany, załaduj grupę od razu
  if (user.value) {
    loadGroup()
  }
})

onUnmounted(() => {
  if (unsubscribeProjects) {
    unsubscribeProjects()
  }
})

watch([group, allProjects], () => {
  updateProjectLists()
})

const updateProjectLists = () => {
  console.log('🔄 updateProjectLists: group exists:', !!group.value, 'allProjects:', allProjects.value.length)
  console.log('🔄 Group projectIds:', group.value?.projectIds)
  
  if (group.value && allProjects.value.length > 0) {
    projectsInGroup.value = allProjects.value.filter(p => group.value.projectIds?.includes(p.id))
    availableProjects.value = allProjects.value.filter(p => !group.value.projectIds?.includes(p.id))
    console.log('✅ Projects in group:', projectsInGroup.value.length, 'Available:', availableProjects.value.length)
  } else {
    console.log('⏳ Waiting for group and projects data...')
  }
}

const goBack = () => {
  router.push('/app')
}

const logout = async () => {
  await authLogout()
  router.push('/auth')
}

const selectProject = (project) => {
  router.push(`/project/${project.id}`)
}

const addProjectsToGroup = async () => {
  if (selectedProjectsToAdd.value.length === 0) return
  
  try {
    const newProjectIds = [...(group.value.projectIds || []), ...selectedProjectsToAdd.value]
    await updateGroup(groupId, { projectIds: newProjectIds })
    
    selectedProjectsToAdd.value = []
    showAddProjectModal.value = false
  } catch (error) {
    console.error('Failed to add projects to group:', error)
    alert(t('group.alerts.add_projects_failed'))
  }
}

const removeProjectFromGroup = async (projectId) => {
  if (!confirm(t('group.alerts.confirm_remove_project'))) return
  
  try {
    const newProjectIds = group.value.projectIds.filter(id => id !== projectId)
    await updateGroup(groupId, { projectIds: newProjectIds })
  } catch (error) {
    console.error('Failed to remove project from group:', error)
    alert(t('group.alerts.remove_project_failed'))
  }
}

useHead({
  title: computed(() => t('group.page_title', { name: group.value?.name || 'Group' }))
})
</script>