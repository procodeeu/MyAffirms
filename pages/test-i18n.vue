<template>
  <div class="p-4">
    <h1>i18n Test Page</h1>
    <p>Current locale: {{ locale }}</p>
    <p>Available locales: {{ locales }}</p>
    
    <div class="mt-4">
      <h2>Test translations:</h2>
      <p>app.projects.title: "{{ $t('app.projects.title') }}"</p>
      <p>app.welcome: "{{ $t('app.welcome') }}"</p>
      <p>common.save: "{{ $t('common.save') }}"</p>
    </div>
    
    <div class="mt-4">
      <h2>Switch language:</h2>
      <button @click="setLocale('en')" class="mr-2 px-4 py-2 bg-blue-500 text-white">English</button>
      <button @click="setLocale('pl')" class="mr-2 px-4 py-2 bg-blue-500 text-white">Polski</button>
      <button @click="setLocale('de')" class="mr-2 px-4 py-2 bg-blue-500 text-white">Deutsch</button>
    </div>
    
    <div class="mt-4">
      <h2>Debug info:</h2>
      <p>i18n available: {{ !!$i18n }}</p>
      <p>Messages available: {{ !!messages }}</p>
      <p>Current messages keys: {{ currentKeys }}</p>
    </div>
  </div>
</template>

<script setup>
const { locale, locales, setLocale, t } = useI18n()
const { $i18n } = useNuxtApp()

const messages = computed(() => {
  try {
    return $i18n?.messages || {}
  } catch (e) {
    return {}
  }
})

const currentKeys = computed(() => {
  try {
    const currentMessages = messages.value[locale.value] || {}
    return Object.keys(currentMessages)
  } catch (e) {
    return []
  }
})

console.log('Test page - Current locale:', locale.value)
console.log('Test page - Available locales:', locales.value)
console.log('Test page - i18n object:', $i18n)
</script>