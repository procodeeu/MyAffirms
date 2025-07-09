import { Stack } from 'expo-router'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { darkTheme } from '../utils/theme'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={darkTheme}>
        <StatusBar style="light" backgroundColor={darkTheme.colors.surface} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: darkTheme.colors.surface,
            },
            headerTintColor: darkTheme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'My Affirms' }} />
          <Stack.Screen name="auth" options={{ title: 'Login' }} />
          <Stack.Screen name="projects" options={{ title: 'Projects' }} />
          <Stack.Screen name="session/[id]" options={{ title: 'Session' }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  )
}