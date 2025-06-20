export default defineNuxtRouteMiddleware((to) => {
  const { user, loading } = useAuth()

  if (loading.value) {
    return
  }

  if (!user.value) {
    return navigateTo('/auth')
  }
})