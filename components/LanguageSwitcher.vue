<template>
  <div class="relative" ref="dropdownRef">
    <button 
      @click="toggleDropdown" 
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200/50 transition-colors"
      :class="{ 'bg-gray-100': isOpen }"
      :key="locale"
      ref="buttonRef"
    >
      <span class="text-xl">{{ currentLocale?.flag }}</span>
      <span class="text-sm font-medium text-gray-700">{{ currentLocale?.name }}</span>
      <ChevronDown class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>
    
    <Teleport to="body">
      <div 
        v-if="isOpen" 
        class="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto"
        :style="dropdownStyle"
        style="z-index: 10000;"
      >
        <div class="py-1">
          <button
            v-for="localeOption in availableLocales"
            :key="localeOption.code"
            @click="selectLocale(localeOption.code)"
            class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            :class="{ 'bg-gray-100 font-medium': localeOption.code === locale }"
          >
            <span class="text-lg">{{ localeOption.flag }}</span>
            <span class="text-sm">{{ localeOption.name }}</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next'

const { locale, setLocale, locales, $i18n, t } = useI18n()
const { updateLanguage, getUserLanguage } = useUserProfile()
const { user } = useAuth()

const isOpen = ref(false)
const dropdownRef = ref(null)
const buttonRef = ref(null)

const dropdownStyle = computed(() => {
  if (!buttonRef.value || !isOpen.value) return {}
  
  const rect = buttonRef.value.getBoundingClientRect()
  return {
    top: rect.bottom + 8 + 'px',
    right: window.innerWidth - rect.right + 'px'
  }
})

const localeMetadata = {
  'en': { name: 'English', flag: '🇬🇧' },
  'pl': { name: 'Polski', flag: '🇵🇱' },
  'de': { name: 'Deutsch', flag: '🇩🇪' }
}

const availableLocales = computed(() => {
  // Handle both string array and object array formats
  if (!locales.value || !Array.isArray(locales.value)) {
    // Fallback to default locales if not available
    return Object.keys(localeMetadata).map(localeCode => ({
      code: localeCode,
      ...localeMetadata[localeCode]
    }))
  }
  
  const localesList = locales.value.map(locale => {
    if (typeof locale === 'string') {
      return locale
    } else {
      return locale.code || locale
    }
  })
  
  return localesList.map(localeCode => ({
    code: localeCode,
    ...localeMetadata[localeCode]
  }))
})

const currentLocale = computed(() => {
  const metadata = localeMetadata[locale.value]
  return {
    code: locale.value,
    name: metadata?.name || locale.value.toUpperCase(),
    flag: metadata?.flag || '🏳️'
  }
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLocale = async (localeCode) => {
  if (localeCode === locale.value) {
    isOpen.value = false
    return
  }
  
  setLocale(localeCode)
  isOpen.value = false
  
  // Cache in localStorage immediately for instant loading
  localStorage.setItem('user_language', localeCode)
  
  if (user.value) {
    try {
      await updateLanguage(localeCode)
    } catch (error) {
      console.error('Error saving language preference:', error)
    }
  }
  
  // Force refresh the page to ensure language switch works
  await nextTick()
}


// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event) => {
    // Check if click is outside both the button and dropdown
    const clickedButton = buttonRef.value && buttonRef.value.contains(event.target)
    const clickedDropdown = event.target.closest('[style*="z-index: 10000"]')
    
    if (!clickedButton && !clickedDropdown) {
      isOpen.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

// Update dropdown position when window resizes
onMounted(() => {
  const handleResize = () => {
    if (isOpen.value) {
      // Force recomputation of dropdown position
      nextTick()
    }
  }
  
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize)
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleResize)
  })
})
</script>
