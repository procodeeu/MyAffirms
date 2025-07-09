<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h3 class="text-xl font-semibold text-gray-900 mb-6 font-crimson">
      {{ $t('project.session_settings.title') }}
    </h3>
    
    <div class="space-y-6">
      <!-- Voice Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('project.session_settings.voice') }}
        </label>
        <select 
          :value="settings.voiceId" 
          @change="updateSetting('voiceId', $event.target.value)"
          class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pastel-purple focus:border-transparent"
        >
          <option v-for="voice in availableVoices" :key="voice.id" :value="voice.id">
            {{ voice.name }} ({{ voice.gender === 'female' ? $t('project.session_settings.female') : $t('project.session_settings.male') }})
          </option>
        </select>
      </div>

      <!-- Speech Rate -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('project.session_settings.speech_rate') }}: {{ speechRateDisplay }}
        </label>
        <input 
          type="range" 
          :value="settings.speechRate" 
          @input="updateSetting('speechRate', parseFloat($event.target.value))"
          min="0.5" 
          max="2.0" 
          step="0.1" 
          class="w-full accent-pastel-purple"
        >
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>{{ $t('project.session_settings.slow') }}</span>
          <span>{{ $t('project.session_settings.normal') }}</span>
          <span>{{ $t('project.session_settings.fast') }}</span>
        </div>
      </div>

      <!-- Pause Duration -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('project.session_settings.pause_duration') }}: {{ pauseDurationDisplay }}
        </label>
        <input 
          type="range" 
          :value="settings.pauseDuration" 
          @input="updateSetting('pauseDuration', parseInt($event.target.value))"
          min="0" 
          max="10" 
          step="1" 
          class="w-full accent-pastel-purple"
        >
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>0s</span>
          <span>5s</span>
          <span>10s</span>
        </div>
      </div>

      <!-- Sentence Pause -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('project.session_settings.sentence_pause') }}: {{ sentencePauseDisplay }}
        </label>
        <input 
          type="range" 
          :value="settings.sentencePause" 
          @input="updateSetting('sentencePause', parseInt($event.target.value))"
          min="0" 
          max="10" 
          step="1" 
          class="w-full accent-pastel-purple"
        >
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>{{ $t('project.session_settings.no_pause') }}</span>
          <span>5s</span>
          <span>10s</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          {{ $t('project.session_settings.sentence_pause_help') }}
        </p>
      </div>

      <!-- Repeat Affirmation -->
      <div class="flex items-start space-x-3">
        <input 
          type="checkbox" 
          :checked="settings.repeatAffirmation" 
          @change="updateSetting('repeatAffirmation', $event.target.checked)"
          class="mt-1 rounded border-gray-300 text-pastel-purple focus:ring-pastel-purple"
        >
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700">
            {{ $t('project.session_settings.repeat_affirmation') }}
          </label>
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('project.session_settings.repeat_affirmation_help') }}
          </p>
        </div>
      </div>

      <!-- Repeat Delay (shown only when repeat is enabled) -->
      <div v-if="settings.repeatAffirmation" class="ml-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('project.session_settings.repeat_delay') }}: {{ repeatDelayDisplay }}
        </label>
        <input 
          type="range" 
          :value="settings.repeatDelay" 
          @input="updateSetting('repeatDelay', parseInt($event.target.value))"
          min="1" 
          max="30" 
          step="1" 
          class="w-full accent-pastel-purple"
        >
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>1s</span>
          <span>15s</span>
          <span>30s</span>
        </div>
      </div>

      <!-- Background Music -->
      <div class="border-t pt-6">
        <div class="flex items-start space-x-3 mb-4">
          <input 
            type="checkbox" 
            :checked="settings.backgroundMusic" 
            @change="updateSetting('backgroundMusic', $event.target.checked)"
            class="mt-1 rounded border-gray-300 text-pastel-purple focus:ring-pastel-purple"
          >
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700">
              {{ $t('project.session_settings.background_music') }}
            </label>
            <p class="text-xs text-gray-500 mt-1">
              {{ $t('project.session_settings.background_music_help') }}
            </p>
          </div>
        </div>

        <!-- Music Settings (shown only when background music is enabled) -->
        <div v-if="settings.backgroundMusic" class="ml-6 space-y-4">
          <!-- Music Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('project.session_settings.music_type') }}
            </label>
            <select 
              :value="settings.musicType" 
              @change="updateSetting('musicType', $event.target.value)"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pastel-purple focus:border-transparent"
            >
              <optgroup v-for="(types, category) in musicCategories" :key="category" :label="getCategoryLabel(category)">
                <option v-for="musicType in types" :key="musicType.value" :value="musicType.value">
                  {{ musicType.label }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Music Volume -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('project.session_settings.music_volume') }}: {{ musicVolumeDisplay }}
            </label>
            <input 
              type="range" 
              :value="settings.musicVolume" 
              @input="updateSetting('musicVolume', parseFloat($event.target.value))"
              min="0.05" 
              max="0.5" 
              step="0.05" 
              class="w-full accent-pastel-purple"
            >
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>{{ $t('project.session_settings.quiet') }}</span>
              <span>{{ $t('project.session_settings.medium') }}</span>
              <span>{{ $t('project.session_settings.loud') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="border-t pt-6">
        <button
          @click="resetToDefaults"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          {{ $t('project.session_settings.reset_to_defaults') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  availableVoices: {
    type: Array,
    required: true
  },
  musicCategories: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-setting', 'reset-settings'])

const { t } = useI18n()

// === COMPUTED DISPLAY VALUES ===

const speechRateDisplay = computed(() => {
  const rate = props.settings.speechRate
  if (rate < 0.8) return `${rate}x (${t('project.session_settings.slow')})`
  if (rate > 1.2) return `${rate}x (${t('project.session_settings.fast')})`
  return `${rate}x (${t('project.session_settings.normal')})`
})

const pauseDurationDisplay = computed(() => {
  const duration = props.settings.pauseDuration
  if (duration === 0) return t('project.session_settings.no_pause')
  return `${duration}s`
})

const sentencePauseDisplay = computed(() => {
  const pause = props.settings.sentencePause
  if (pause === 0) return t('project.session_settings.no_pause')
  return `${pause}s`
})

const repeatDelayDisplay = computed(() => {
  return `${props.settings.repeatDelay}s`
})

const musicVolumeDisplay = computed(() => {
  const volume = Math.round(props.settings.musicVolume * 100)
  return `${volume}%`
})

// === METHODS ===

const updateSetting = (key, value) => {
  emit('update-setting', key, value)
}

const resetToDefaults = () => {
  emit('reset-settings')
}

const getCategoryLabel = (category) => {
  const labels = {
    generated: t('project.session_settings.music_category_generated'),
    relaxing: t('project.session_settings.music_category_relaxing'),
    nature: t('project.session_settings.music_category_nature')
  }
  return labels[category] || category
}
</script>

<style scoped>
/* Custom slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-track {
  background: #e5e7eb;
  height: 6px;
  border-radius: 3px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #a855f7;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-moz-range-track {
  background: #e5e7eb;
  height: 6px;
  border-radius: 3px;
  border: none;
}

input[type="range"]::-moz-range-thumb {
  background: #a855f7;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

/* Focus states */
input[type="range"]:focus {
  outline: none;
}

input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
}

input[type="range"]:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
}
</style>