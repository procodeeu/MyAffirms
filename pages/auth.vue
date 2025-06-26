<template>
  <div class="min-h-screen bg-pastel-vanilla flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-pastel-dun rounded-4xl p-10 border-2 border-pastel-cinereous">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2 font-crimson">My affirms</h1>
        <p class="text-gray-600">{{ $t('auth.login_to_continue') }}</p>
      </div>

      <div v-if="!isRegistering" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.email') }}</label>
          <input
            v-model="email"
            type="email"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            :placeholder="$t('auth.email_placeholder')"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.password') }}</label>
          <input
            v-model="password"
            type="password"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            :placeholder="$t('auth.password_placeholder')"
          />
        </div>

        <button
          @click="signInWithEmail"
          :disabled="authLoading"
          class="w-full bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 py-3 rounded-full font-medium  border-2 border-pastel-khaki-2 hover:border-gray-800"
        >
          {{ authLoading ? $t('auth.logging_in') : $t('auth.login_button') }}
        </button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-pastel-dun text-gray-500">{{ $t('common.or') }}</span>
          </div>
        </div>

        <button
          @click="signInWithGoogle"
          :disabled="authLoading"
          class="w-full border-2 border-gray-300 hover:bg-pastel-khaki-2 text-gray-700 py-3 rounded-full font-medium flex items-center justify-center gap-2  hover:border-gray-700"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ $t('auth.continue_with_google') }}
        </button>

        <button
          @click="signInWithDemo"
          :disabled="authLoading"
          class="w-full bg-pastel-violet hover:bg-pastel-purple text-gray-800 py-3 rounded-full font-medium  border-2 border-pastel-violet hover:border-gray-800"
        >
          {{ $t('auth.demo_login') }}
        </button>

        <div class="text-center">
          <button
            @click="isRegistering = true"
            class="text-gray-600 hover:text-gray-800 text-sm"
          >
            {{ $t('auth.no_account_register') }}
          </button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.email') }}</label>
          <input
            v-model="email"
            type="email"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            :placeholder="$t('auth.email_placeholder')"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.password') }}</label>
          <input
            v-model="password"
            type="password"
            class="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pastel-violet"
            :placeholder="$t('auth.password_placeholder')"
          />
        </div>

        <button
          @click="signUpWithEmail"
          :disabled="authLoading"
          class="w-full bg-pastel-khaki-2 hover:bg-pastel-dun disabled:bg-gray-300 text-gray-800 py-3 rounded-full font-medium  border-2 border-pastel-khaki-2 hover:border-gray-800"
        >
          {{ authLoading ? $t('auth.registering') : $t('auth.register_button') }}
        </button>

        <div class="text-center">
          <button
            @click="isRegistering = false"
            class="text-gray-600 hover:text-gray-800 text-sm"
          >
            {{ $t('auth.have_account_login') }}
          </button>
        </div>
      </div>

      <div v-if="authError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-red-700 text-sm">{{ authError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { 
  signInWithEmail: authSignInWithEmail,
  signUpWithEmail: authSignUpWithEmail,
  signInWithGoogle: authSignInWithGoogle,
  signInWithDemo: authSignInWithDemo,
  loading: authLoading,
  error: authError,
  user
} = useAuth()

const email = ref('')
const password = ref('')
const isRegistering = ref(false)

watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/app')
  }
})

const signInWithEmail = async () => {
  if (!email.value || !password.value) return
  
  const result = await authSignInWithEmail(email.value, password.value)
  if (result.success) {
    await navigateTo('/app')
  }
}

const signUpWithEmail = async () => {
  if (!email.value || !password.value) return
  
  const result = await authSignUpWithEmail(email.value, password.value)
  if (result.success) {
    await navigateTo('/app')
  }
}

const signInWithGoogle = async () => {
  const result = await authSignInWithGoogle()
  if (result.success) {
    await navigateTo('/app')
  }
}

const signInWithDemo = async () => {
  try {
    const result = await authSignInWithDemo()
    if (result.success) {
      await navigateTo('/app')
    }
  } catch (error) {
    }
}

useHead({
  title: 'Logowanie - My affirms'
})
</script>