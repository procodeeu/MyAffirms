import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

export const useAuth = () => {
  const { $firebase } = useNuxtApp()
  const user = ref(null)
  const loading = ref(true)
  const error = ref('')

  onMounted(() => {
    if ($firebase?.auth) {
      onAuthStateChanged($firebase.auth, (firebaseUser) => {
        user.value = firebaseUser
        loading.value = false
      })
    } else {
      loading.value = false
    }
  })

  const signInWithEmail = async (email, password) => {
    if (!$firebase?.auth) {
      return { success: false, error: 'Firebase not initialized' }
    }
    
    try {
      error.value = ''
      loading.value = true
      
      const userCredential = await signInWithEmailAndPassword($firebase.auth, email, password)
      user.value = userCredential.user
      
      return { success: true, user: userCredential.user }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const signUpWithEmail = async (email, password) => {
    try {
      error.value = ''
      loading.value = true
      
      const userCredential = await createUserWithEmailAndPassword($firebase.auth, email, password)
      user.value = userCredential.user
      
      return { success: true, user: userCredential.user }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const signInWithGoogle = async () => {
    try {
      error.value = ''
      loading.value = true
      
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup($firebase.auth, provider)
      user.value = userCredential.user
      
      return { success: true, user: userCredential.user }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await signOut($firebase.auth)
      user.value = null
      await navigateTo('/landing')
    } catch (err) {
      error.value = 'Błąd wylogowania'
    }
  }

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Nie znaleziono użytkownika z tym adresem email'
      case 'auth/wrong-password':
        return 'Nieprawidłowe hasło'
      case 'auth/email-already-in-use':
        return 'Ten adres email jest już używany'
      case 'auth/weak-password':
        return 'Hasło jest za słabe'
      case 'auth/invalid-email':
        return 'Nieprawidłowy adres email'
      case 'auth/popup-closed-by-user':
        return 'Logowanie zostało anulowane'
      default:
        return 'Wystąpił błąd. Spróbuj ponownie.'
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout
  }
}