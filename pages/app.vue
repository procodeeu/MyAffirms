<template>
  <div class="min-h-screen bg-pastel-vanilla relative overflow-hidden">
    <!-- Decorative bubbles in background -->
    <div class="absolute inset-0 pointer-events-none">
      <div 
        class="absolute w-96 h-96 rounded-full" 
        :style="{ 
          top: bubblePositions.bubble1.top + 'px', 
          left: bubblePositions.bubble1.left + 'px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }"
      ></div>
      <div 
        class="absolute w-80 h-80 rounded-full" 
        :style="{ 
          top: bubblePositions.bubble2.top + 'px', 
          right: bubblePositions.bubble2.right + 'px',
          backgroundColor: 'rgba(255, 252, 228, 0.6)'
        }"
      ></div>
      <div 
        class="absolute w-64 h-64 rounded-full" 
        :style="{ 
          bottom: bubblePositions.bubble3.bottom + 'px', 
          left: bubblePositions.bubble3.left + 'px',
          backgroundColor: 'rgba(248, 240, 180, 0.4)'
        }"
      ></div>
    </div>
    
    <header class="bg-pastel-purple shadow-sm relative z-10">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 font-crimson">My affirms</h1>
          <p class="text-sm text-gray-700 font-crimson italic opacity-90">{{ $t('app.tagline') }}</p>
        </div>
        <div class="flex items-center gap-4">
          <CharacterUsageCounter />
          <div v-if="isPremiumActive" class="flex items-center gap-2">
            <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span class="text-xs text-yellow-700 font-medium">{{ $t('premium.premium_tag') }}</span>
          </div>
          <span class="text-gray-700 opacity-90">{{ $t('app.welcome') }} {{ user?.email || $t('app.user_placeholder') }}</span>
          <span class="text-xs text-gray-600 opacity-60">v{{ appVersion }}</span>
          <button
            @click="goToAdmin"
            class="text-gray-700 hover:text-gray-900 px-3 py-1 rounded-full text-sm border-2 border-transparent hover:border-gray-300"
          >
            {{ $t('common.admin') }}
          </button>
          <LanguageSwitcher />
          <button
            @click="logout"
            class="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-full  border-2 border-transparent active:border-gray-800"
          >
            {{ $t('auth.logout') }}
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 py-12 relative z-10">
      
      <div class="mb-8">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 font-crimson">{{ $t('app.projects.title') }}</h2>
            <p class="text-gray-600 mt-1">{{ $t('app.projects.description') }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="showNewProjectModal = true"
              :disabled="!user"
              class="bg-pastel-khaki hover:bg-pastel-khaki-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 px-6 py-3 rounded-full font-medium flex items-center gap-2  border-2 border-pastel-khaki hover:border-gray-900 transition-colors duration-200"
            >
              <span class="text-lg">+</span>
              {{ $t('app.projects.new_project') }}
            </button>
            <button
              @click="showNewGroupModal = true"
              :disabled="!user"
              class="bg-pastel-violet hover:bg-pastel-purple disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 px-6 py-3 rounded-full font-medium flex items-center gap-2  border-2 border-pastel-violet hover:border-gray-900 transition-colors duration-200"
            >
              <Group class="w-4 h-4" />
              {{ $t('app.projects.new_group') }}
            </button>
            <button
              @click="showImportJsonModal = true"
              :disabled="!user"
              class="bg-pastel-rose hover:bg-pastel-purple disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 px-6 py-3 rounded-full font-medium flex items-center gap-2  border-2 border-pastel-rose hover:border-gray-900 transition-colors duration-200"
            >
              <Upload class="w-4 h-4" />
              Import JSON
            </button>
          </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Karty grup -->
          <div
            v-for="group in groups"
            :key="`group-${group.id}`"
            class="bg-pastel-violet border-2 border-pastel-rose rounded-4xl p-8 cursor-pointer hover:bg-pastel-purple transition-colors duration-300"
            @click="selectGroup(group)"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Group class="w-5 h-5 text-gray-700" />
                  <h3 class="text-xl font-medium text-gray-900 font-crimson">
                    {{ group.name }}
                  </h3>
                </div>
                <p class="text-gray-600 text-sm">
                  {{ $t('app.projects.projects_in_group', { count: getGroupProjectsCount(group) }) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click.stop="openGroupSettings(group)"
                  class="text-gray-400 hover:text-gray-600 p-1"
                  :title="$t('app.projects.group_settings')"
                >
                  <Settings class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div class="space-y-2">
              <div
                v-for="projectName in getGroupProjectNames(group).slice(0, 3)"
                :key="projectName"
                class="text-sm text-gray-700 bg-pastel-khaki rounded p-2 border-2 border-pastel-cinereous"
              >
                {{ projectName }}
              </div>
              <div
                v-if="getGroupProjectNames(group).length > 3"
                class="text-xs text-gray-600 text-center py-1"
              >
                +{{ getGroupProjectNames(group).length - 3 }} {{ $t('common.more') }}
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-pastel-cinereous">
              <button
                @click.stop="startGroupSession(group)"
                :disabled="!getGroupProjectsCount(group)"
                class="w-full bg-pastel-purple hover:bg-pastel-purple-2 disabled:bg-gray-300 text-gray-800 py-4 rounded-full font-medium flex items-center justify-center gap-2  border-2 border-pastel-purple hover:border-gray-800 active:border-gray-900"
              >
                <Play class="w-4 h-4" /> {{ $t('app.projects.start_group_session') }}
              </button>
            </div>
          </div>

          <!-- Project cards -->
          <div
            v-for="project in projects"
            :key="project.id"
            class="bg-pastel-khaki border-2 border-pastel-dun rounded-4xl p-8 cursor-pointer transition-colors duration-300"
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
              <div class="flex items-center gap-2">
                <button
                  @click.stop="openProjectSettings(project)"
                  class="text-gray-400 hover:text-gray-600 p-1"
                  :title="$t('app.projects.project_settings')"
                >
                  <Settings class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div class="space-y-2">
              <div
                v-for="affirmation in (project.affirmations || []).slice(0, 3)"
                :key="affirmation.id"
                class="text-sm text-gray-700 bg-pastel-dun rounded p-2 border-2 border-pastel-cinereous"
              >
                {{ affirmation.text }}
              </div>
              <div
                v-if="(project.affirmations?.length || 0) > 3"
                class="text-xs text-gray-500 text-center py-1"
              >
                +{{ (project.affirmations?.length || 0) - 3 }} {{ $t('common.more') }}
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-pastel-cinereous">
              <button
                @click.stop="startSession(project)"
                :disabled="!project.affirmations?.length"
                class="w-full bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 py-4 rounded-full font-medium flex items-center justify-center gap-2  border-2 border-pastel-khaki-2 hover:border-gray-800 active:border-gray-900"
              >
                <Play class="w-4 h-4" /> {{ $t('app.projects.start_session') }}
              </button>
            </div>
          </div>

          <div
            v-if="projects.length === 0"
            class="col-span-full text-center py-12"
          >
            <div class="text-gray-400 text-6xl mb-4"><Folder class="w-16 h-16" /></div>
            <h3 class="text-xl font-medium text-gray-900 mb-2 font-crimson">{{ $t('app.projects.no_projects_title') }}</h3>
            <p class="text-gray-600 mb-4">{{ $t('app.projects.no_projects_description') }}</p>
            <button
              @click="showNewProjectModal = true"
              class="bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-800 px-8 py-4 rounded-full font-medium  border-2 border-pastel-khaki-2 hover:border-gray-800"
            >
              {{ $t('app.projects.create_project_button') }}
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
        class="bg-pastel-khaki rounded-4xl p-8 w-full max-w-md border-2 border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-medium mb-4 font-crimson">{{ $t('app.projects.new_project') }}</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('app.modals.project_name') }}
          </label>
          <input
            v-model="newProjectName"
            type="text"
            :placeholder="getDefaultProjectName()"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            @keyup.enter="createProject"
          />
        </div>
        <div class="flex gap-3">
          <button
            @click="createProject"
            :disabled="loading"
            class="flex-1 bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 py-3 rounded-full font-medium "
          >
            {{ loading ? $t('common.creating') : $t('common.create') }}
          </button>
          <button
            @click="showNewProjectModal = false"
            class="flex-1 border-2 border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-full font-medium "
          >
            {{ $t('common.cancel') }}
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
        class="bg-pastel-khaki rounded-4xl p-8 w-full max-w-md border-2 border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-medium mb-4 font-crimson">{{ $t('app.projects.project_settings') }}</h3>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('app.modals.project_name') }}
          </label>
          <input
            v-model="editingProjectName"
            type="text"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            :placeholder="$t('app.modals.project_name_placeholder')"
            @keyup.enter="saveProjectName"
          />
        </div>

        <div class="space-y-3">
          <button
            @click="saveProjectName"
            :disabled="!editingProjectName.trim()"
            class="w-full bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 py-3 rounded-full font-medium  border-2 border-pastel-khaki-2 hover:border-gray-800"
          >
            {{ $t('common.save') }} {{ $t('app.modals.project_name') }}
          </button>
          
          <button
            @click="copyProject"
            class="w-full bg-pastel-khaki-2 hover:bg-pastel-dun text-gray-800 py-3 rounded-full font-medium flex items-center justify-center gap-2  border-2 border-pastel-khaki-2 hover:border-gray-800"
          >
            <Clipboard class="w-5 h-5" /> {{ $t('app.modals.copy_project') }}
          </button>
          
          <button
            @click="showDeleteProjectConfirm = true"
            class="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-full font-medium  border-2 border-red-500 hover:border-white"
          >
            {{ $t('app.modals.delete_project') }}
          </button>
          
          <button
            @click="closeProjectSettings"
            class="w-full border-2 border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-full font-medium  hover:border-gray-700"
          >
            {{ $t('common.cancel') }}
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
        class="bg-pastel-khaki rounded-4xl p-8 w-full max-w-md border-2 border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-medium mb-4 text-red-600">{{ $t('app.modals.delete_project_title') }}</h3>
        <div class="mb-6">
          <p class="text-gray-700 mb-3">{{ $t('app.modals.delete_project_confirm') }}</p>
          <div class="bg-gray-50 p-3 rounded border-l-4 border-red-400">
            <p class="text-gray-800 font-medium">{{ selectedProject?.name }}</p>
            <p class="text-sm text-gray-600">{{ $t('app.projects.affirmations_count', { count: selectedProject?.affirmations?.length || 0 }) }}</p>
          </div>
          <p class="text-sm text-gray-500 mt-2">{{ $t('app.modals.delete_project_warning') }}</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="confirmDeleteProject"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-full font-medium "
          >
            {{ $t('app.modals.delete_project') }}
          </button>
          <button
            @click="showDeleteProjectConfirm = false"
            class="flex-1 border-2 border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-full font-medium "
          >
            {{ $t('common.cancel') }}
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
        class="bg-pastel-khaki rounded-4xl p-8 w-full max-w-md border-2 border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-medium mb-4 font-crimson">{{ $t('app.modals.create_new_group') }}</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('app.modals.group_name') }}
          </label>
          <input
            v-model="newGroupName"
            type="text"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            :placeholder="$t('app.modals.group_name_placeholder')"
            @keyup.enter="createNewGroup"
          />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('app.modals.select_projects') }}
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
            {{ $t('app.modals.create_group_button') }}
          </button>
          <button
            @click="showNewGroupModal = false"
            class="flex-1 border-2 border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-full font-medium "
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Group settings modal -->
    <div
      v-if="showGroupSettingsModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closeGroupSettings"
    >
      <div
        class="bg-pastel-khaki rounded-4xl p-8 w-full max-w-md border-2 border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-medium mb-4">{{ $t('app.modals.group_settings_title') }}</h3>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('app.modals.group_name') }}
          </label>
          <input
            v-model="editingGroupName"
            type="text"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            :placeholder="$t('app.modals.group_name_placeholder')"
            @keyup.enter="saveGroupName"
          />
        </div>

        <div class="space-y-3">
          <button
            @click="saveGroupName"
            :disabled="!editingGroupName.trim()"
            class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-2 rounded font-medium"
          >
            {{ $t('common.save') }} {{ $t('app.modals.group_name') }}
          </button>
          
          <button
            @click="showDeleteGroupConfirm = true"
            class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium"
          >
            {{ $t('app.modals.delete_group') }}
          </button>
          
          <button
            @click="closeGroupSettings"
            class="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded font-medium"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Group deletion confirmation modal -->
    <div
      v-if="showDeleteGroupConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showDeleteGroupConfirm = false"
    >
      <div
        class="bg-pastel-khaki rounded-4xl p-8 w-full max-w-md border-2 border-pastel-cinereous"
        @click.stop
      >
        <h3 class="text-lg font-medium mb-4 text-red-600">{{ $t('app.modals.delete_group_title') }}</h3>
        <div class="mb-6">
          <p class="text-gray-700 mb-3">{{ $t('app.modals.delete_group_confirm') }}</p>
          <div class="bg-gray-50 p-3 rounded border-l-4 border-red-400">
            <p class="text-gray-800 font-medium">{{ selectedGroup?.name }}</p>
            <p class="text-sm text-gray-600">{{ $t('app.modals.projects_count', { count: getGroupProjectsCount(selectedGroup) }) }}</p>
          </div>
          <p class="text-sm text-gray-500 mt-2">{{ $t('app.modals.delete_group_warning') }}</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="confirmDeleteGroup"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium"
          >
            {{ $t('app.modals.delete_group') }}
          </button>
          <button
            @click="showDeleteGroupConfirm = false"
            class="flex-1 border-2 border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-full font-medium "
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Import JSON Modal -->
    <div v-if="showImportJsonModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-pastel-khaki rounded-4xl p-8 w-full max-w-2xl border-2 border-pastel-cinereous">
        <h3 class="text-lg font-medium mb-4 font-crimson">Import projektow i afirmacji z JSON</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Dane JSON
          </label>
          <textarea
            v-model="importJsonText"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet h-64 font-mono text-sm"
            placeholder="Wklej tutaj dane JSON..."
          ></textarea>
          <div v-if="jsonValidationError" class="text-red-600 text-sm mt-1">
            {{ jsonValidationError }}
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Przyklad formatu:</h4>
          <div class="bg-gray-100 rounded-md p-3 text-xs font-mono overflow-x-auto">
            <pre>{{ jsonExample }}</pre>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="importFromJson"
            :disabled="!importJsonText.trim() || !!jsonValidationError"
            class="flex-1 bg-pastel-purple hover:bg-pastel-purple-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 py-3 rounded-full font-medium"
          >
            Importuj
          </button>
          <button
            @click="closeImportJsonModal"
            class="flex-1 border-2 border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-full font-medium"
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
import { Settings, Folder, Clipboard, Play, Group, Plus, Upload } from 'lucide-vue-next'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const { user, logout: authLogout } = useAuth()
const { isPremiumActive } = usePremium()
const { subscribeToLanguageChanges } = useI18nInit()
const audioManager = useAudioManager()

// Calculate bubble positions based on user ID
const bubblePositions = computed(() => {
  if (!user.value?.uid) {
    return {
      bubble1: { top: 80, left: 200 },
      bubble2: { top: 160, right: 300 },
      bubble3: { bottom: 80, left: 400 }
    }
  }
  
  // Prosta funkcja hash dla stringa
  const hash = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Konwersja do 32bit
    }
    return Math.abs(hash)
  }
  
  const userHash = hash(user.value.uid)
  
  // Generowanie pozycji na podstawie hash'a
  const seed1 = (userHash * 1234567) % 1000000
  const seed2 = (userHash * 2345678) % 1000000  
  const seed3 = (userHash * 3456789) % 1000000
  
  return {
    bubble1: { 
      top: 50 + (seed1 % 200), 
      left: 100 + (seed1 % 400) 
    },
    bubble2: { 
      top: 100 + (seed2 % 250), 
      right: 50 + (seed2 % 350) 
    },
    bubble3: { 
      bottom: 50 + (seed3 % 150), 
      left: 200 + (seed3 % 500) 
    }
  }
})
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
const showImportJsonModal = ref(false)

// Import JSON state
const importJsonText = ref('')
const jsonValidationError = ref('')

const jsonExample = `
{
  "projectName": "Moj nowy projekt",
  "affirmations": [
    {
      "text": "Jestem spokojny i pewny siebie",
      "isActive": true
    },
    {
      "text": "Mam w sobie sile do dzialania", 
      "isActive": true
    }
  ]
}

{
  "projects": [
    {
      "projectName": "Projekt 1",
      "affirmations": [
        {
          "text": "Pierwsza afirmacja",
          "isActive": true
        }
      ]
    },
    {
      "projectName": "Projekt 2", 
      "affirmations": [
        {
          "text": "Druga afirmacja",
          "isActive": true
        }
      ]
    }
  ]
}`

const selectedGroup = ref(null)
const newGroupName = ref('')
const editingGroupName = ref('')
const selectedProjectsForGroup = ref([])

let unsubscribe = null
let unsubscribeGroups = null

onMounted(() => {
  subscribeToLanguageChanges()
  
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
        console.log('🔥 App.vue: Firestore projects received:', userProjects?.length || 0)
        userProjects?.forEach((p, i) => {
          console.log(`🔥 Project ${i}: ${p.name} - affirmations: ${p.affirmations?.length || 0}`)
        })
        
        const firebaseProjects = userProjects || []
        const localData = localStorage.getItem(`projects_${user.value.uid}`)
        let localProjects = []
        if (localData) {
          try {
            localProjects = JSON.parse(localData)
            console.log('📱 App.vue: localStorage projects:', localProjects.length)
          } catch (e) {
            console.error('📱 App.vue: Error parsing localStorage:', e)
          }
        }

        const mergedProjects = firebaseProjects.map(firebaseProject => {
          const localProject = localProjects.find(p => p.id === firebaseProject.id)
          console.log(`🔄 Merging project ${firebaseProject.name}: Firestore affirmations: ${firebaseProject.affirmations?.length || 0}`)
          return {
            ...firebaseProject,
            
            sessionSettings: localProject?.sessionSettings || firebaseProject.sessionSettings
          }
        })
        
        console.log('✅ App.vue: Final merged projects:', mergedProjects.length)
        mergedProjects.forEach((p, i) => {
          console.log(`✅ Merged project ${i}: ${p.name} - affirmations: ${p.affirmations?.length || 0}`)
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
  return t('app.projects.unnamed', { count })
}

const createProject = async () => {
  if (loading.value) return
  
  if (!user.value) {
    alert(t('app.alerts.auth_required_for_project'))
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
    alert(t('app.alerts.create_project_failed'))
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
    alert(t('app.alerts.save_project_name_failed'))
  }
}

const confirmDeleteProject = async () => {
  if (!selectedProject.value) return
  
  try {
    await firestoreDeleteProject(selectedProject.value.id)
    closeProjectSettings()
  } catch (error) {
    alert(t('app.alerts.delete_project_failed'))
  }
}

const copyProject = async () => {
  if (!selectedProject.value) return
  
  try {
    
    const originalProject = selectedProject.value
    const copiedProject = {
      id: Date.now().toString(),
      name: `${originalProject.name} ${t('app.projects.copy_suffix')}`,
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
      alert(t('app.alerts.project_copied', { name: originalProject.name, newName: copiedProject.name }))
    }, 100)
    
  } catch (error) {
    alert(t('app.alerts.copy_project_failed'))
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
    alert(t('app.alerts.create_group_failed'))
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
    alert(t('app.alerts.update_group_failed'))
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
    alert(t('app.alerts.delete_group_failed'))
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

const goToAdmin = () => {
  navigateTo('/admin')
}

// JSON Import functionality
watch(importJsonText, (newValue) => {
  if (!newValue.trim()) {
    jsonValidationError.value = ''
    return
  }
  
  try {
    const parsed = JSON.parse(newValue)
    
    // Check if it's multiple projects format
    if (parsed.projects && Array.isArray(parsed.projects)) {
      // Validate multiple projects format
      for (let i = 0; i < parsed.projects.length; i++) {
        const project = parsed.projects[i]
        if (!project.projectName || typeof project.projectName !== 'string') {
          jsonValidationError.value = `Projekt ${i + 1}: brak pola "projectName" lub nieprawidlowy typ`
          return
        }
        
        if (!Array.isArray(project.affirmations)) {
          jsonValidationError.value = `Projekt ${i + 1}: pole "affirmations" musi byc tablica`
          return
        }
        
        for (let j = 0; j < project.affirmations.length; j++) {
          const aff = project.affirmations[j]
          if (!aff.text || typeof aff.text !== 'string') {
            jsonValidationError.value = `Projekt ${i + 1}, afirmacja ${j + 1}: brak pola "text"`
            return
          }
          if (aff.isActive !== undefined && typeof aff.isActive !== 'boolean') {
            jsonValidationError.value = `Projekt ${i + 1}, afirmacja ${j + 1}: pole "isActive" musi byc boolean`
            return
          }
        }
      }
    } else {
      // Validate single project format
      if (!parsed.projectName || typeof parsed.projectName !== 'string') {
        jsonValidationError.value = 'Brak wymaganego pola "projectName" lub nieprawidlowy typ'
        return
      }
      
      if (!Array.isArray(parsed.affirmations)) {
        jsonValidationError.value = 'Pole "affirmations" musi byc tablica'
        return
      }
      
      for (let i = 0; i < parsed.affirmations.length; i++) {
        const aff = parsed.affirmations[i]
        if (!aff.text || typeof aff.text !== 'string') {
          jsonValidationError.value = `Afirmacja ${i + 1}: brak pola "text" lub nieprawidlowy typ`
          return
        }
        if (aff.isActive !== undefined && typeof aff.isActive !== 'boolean') {
          jsonValidationError.value = `Afirmacja ${i + 1}: pole "isActive" musi byc boolean`
          return
        }
      }
    }
    
    jsonValidationError.value = ''
  } catch (error) {
    jsonValidationError.value = 'Nieprawidlowy format JSON: ' + error.message
  }
})

const closeImportJsonModal = () => {
  showImportJsonModal.value = false
  importJsonText.value = ''
  jsonValidationError.value = ''
}

// Function to generate audio for all affirmations in a project
const generateAudioForProject = async (project) => {
  if (!project.affirmations || project.affirmations.length === 0) return
  
  console.log(`Starting audio generation for project: ${project.name} with ${project.affirmations.length} affirmations`)
  
  for (const affirmation of project.affirmations) {
    try {
      console.log(`Generating audio for affirmation: ${affirmation.id} - "${affirmation.text}"`)
      await autoGenerateAudio(affirmation.id, affirmation.text, 'pl-PL-ZofiaNeural')
      console.log(`Audio generated successfully for: ${affirmation.id}`)
      
      // Add small delay between generations to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Failed to generate audio for affirmation ${affirmation.id}:`, error)
      // Continue with next affirmation even if one fails
    }
  }
  
  console.log(`Audio generation completed for project: ${project.name}`)
}

const importFromJson = async () => {
  if (!importJsonText.value.trim() || jsonValidationError.value) return
  
  try {
    const parsed = JSON.parse(importJsonText.value)
    const newProjects = []
    
    // Check if it's multiple projects format
    if (parsed.projects && Array.isArray(parsed.projects)) {
      // Handle multiple projects
      for (let i = 0; i < parsed.projects.length; i++) {
        const projectData = parsed.projects[i]
        const newProject = {
          id: Date.now().toString() + '_' + i,
          name: projectData.projectName,
          affirmations: projectData.affirmations.map((aff, index) => ({
            id: Date.now().toString() + '_' + i + '_' + index,
            text: aff.text,
            isActive: aff.isActive !== undefined ? aff.isActive : true,
            createdAt: new Date().toISOString()
          })),
          userId: user.value.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        try {
          // Try to save to Firestore
          const projectId = await firestoreCreateProject({
            name: newProject.name,
            affirmations: newProject.affirmations
          })
          newProject.id = projectId
        } catch (error) {
          console.error('Error saving project to Firestore:', error)
          // Continue with local storage only
        }
        
        newProjects.push(newProject)
      }
    } else {
      // Handle single project format
      const newProject = {
        id: Date.now().toString(),
        name: parsed.projectName,
        affirmations: parsed.affirmations.map((aff, index) => ({
          id: Date.now().toString() + '_' + index,
          text: aff.text,
          isActive: aff.isActive !== undefined ? aff.isActive : true,
          createdAt: new Date().toISOString()
        })),
        userId: user.value.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      try {
        // Try to save to Firestore
        const projectId = await firestoreCreateProject({
          name: newProject.name,
          affirmations: newProject.affirmations
        })
        newProject.id = projectId
      } catch (error) {
        console.error('Error saving to Firestore:', error)
        // Continue with local storage only
      }
      
      newProjects.push(newProject)
    }
    
    // Don't add to projects.value here - Firestore subscription will handle it
    // This prevents duplicate entries
    
    closeImportJsonModal()
    
    // Generate audio for all imported affirmations
    setTimeout(async () => {
      console.log('Starting audio generation for imported projects...')
      for (const project of newProjects) {
        await generateAudioForProject(project)
      }
      console.log('Audio generation completed for all imported projects')
    }, 500)
    
    // Show success message
    setTimeout(() => {
      if (newProjects.length === 1) {
        alert(`Projekt "${newProjects[0].name}" zostal zaimportowany z ${newProjects[0].affirmations.length} afirmacjami! Audio jest generowane w tle.`)
        navigateTo(`/project/${newProjects[0].id}`)
      } else {
        const totalAffirmations = newProjects.reduce((sum, p) => sum + p.affirmations.length, 0)
        alert(`Zaimportowano ${newProjects.length} projektow z laczna liczba ${totalAffirmations} afirmacji! Audio jest generowane w tle.`)
      }
    }, 100)
    
  } catch (error) {
    jsonValidationError.value = 'Blad podczas importu: ' + error.message
  }
}

definePageMeta({
  middleware: 'auth'
})

const { t } = useI18n()

useHead({
  title: computed(() => t('app.page_title'))
})
</script>