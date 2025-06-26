<template>
  <button @click="toggleLocale" class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200/50">
    <div v-if="locale === 'pl'" class="w-6 h-6">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
        <rect width="900" height="600" fill="#fff"/>
        <rect width="900" height="300" y="300" fill="#dc143c"/>
      </svg>
    </div>
    <div v-if="locale === 'en'" class="w-6 h-6">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
        <clipPath id="a">
          <path d="M0 0v30h60V0z"/>
        </clipPath>
        <clipPath id="b">
          <path d="M30 15h30v15zv15H0zH0V0h30z"/>
        </clipPath>
        <g clip-path="url(#a)">
          <path d="M0 0v30h60V0z" fill="#012169"/>
          <path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/>
          <path d="M0 0l60 30m0-30L0 30" clip-path="url(#b)" stroke="#C8102E" stroke-width="4"/>
          <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/>
          <path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/>
        </g>
      </svg>
    </div>
  </button>
</template>

<script setup>
const { locale, setLocale } = useI18n()
const { updateLanguage, getUserLanguage } = useUserProfile()
const { user } = useAuth()

const toggleLocale = async () => {
  const newLocale = locale.value === 'pl' ? 'en' : 'pl'
  setLocale(newLocale)
  
  if (user.value) {
    try {
      await updateLanguage(newLocale)
    } catch (error) {
      console.error('Error saving language preference:', error)
    }
  }
}
</script>
