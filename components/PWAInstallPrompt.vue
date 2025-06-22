<template>
  <div v-if="showInstallPrompt" class="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 md:left-auto md:w-80">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h3 class="font-semibold text-sm">Zainstaluj My Affirms</h3>
        <p class="text-xs opacity-90 mt-1">Dodaj do ekranu głównego dla łatwego dostępu</p>
      </div>
      <div class="flex gap-2 ml-4">
        <button
          @click="installPWA"
          class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
        >
          Zainstaluj
        </button>
        <button
          @click="dismissPrompt"
          class="text-white opacity-75 hover:opacity-100 text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const showInstallPrompt = ref(false)
let deferredPrompt = null

onMounted(() => {
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallPrompt.value = true
  })

  window.addEventListener('appinstalled', () => {
    showInstallPrompt.value = false
    deferredPrompt = null
  })
})

const installPWA = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    }
  
  deferredPrompt = null
  showInstallPrompt.value = false
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  deferredPrompt = null
}
</script>