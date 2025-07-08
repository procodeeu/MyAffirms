// Simple Service Worker integration - step by step approach
export const useSimpleServiceWorker = () => {
  const isSupported = ref(false)
  const isRegistered = ref(false)
  const error = ref(null)

  const checkSupport = () => {
    isSupported.value = 'serviceWorker' in navigator
    return isSupported.value
  }

  const register = async () => {
    if (!checkSupport()) {
      error.value = 'Service Worker not supported'
      console.error('Service Worker not supported')
      return false
    }

    try {
      console.log('Registering Service Worker...')
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      isRegistered.value = true
      console.log('Service Worker registered successfully:', registration)
      
      return true
    } catch (err) {
      error.value = err.message
      console.error('Service Worker registration failed:', err)
      return false
    }
  }

  const sendMessage = (type, data = {}) => {
    if (!navigator.serviceWorker.controller) {
      console.warn('No Service Worker controller available')
      return
    }

    navigator.serviceWorker.controller.postMessage({ type, data })
  }

  return {
    isSupported: readonly(isSupported),
    isRegistered: readonly(isRegistered),
    error: readonly(error),
    checkSupport,
    register,
    sendMessage
  }
}