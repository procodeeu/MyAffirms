// Simple debug script - paste in browser console
console.log('=== DEBUGGING AUDIO CONTROLS ===')

// Check if component exists
const audioControls = document.querySelector('[data-v-*]') // Look for Vue components
console.log('Vue components found:', document.querySelectorAll('[data-v-*]').length)

// Check if SimpleAudioControls is rendered
const simpleControls = document.querySelector('div[class*="fixed bottom-4"]')
console.log('Fixed bottom elements:', simpleControls)

// Check Vue app instance
if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('Vue DevTools available')
} else {
  console.log('Vue DevTools not available')
}

// Check for any errors
console.log('Recent errors:', window.onerror)

console.log('=== END DEBUG ===')