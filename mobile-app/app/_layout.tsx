import { Stack } from 'expo-router'
import { PaperProvider, MD3DarkTheme } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

// Simple dark theme
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    onPrimary: '#000000',
    secondary: '#03DAC6',
    surface: '#121212',
    onSurface: '#FFFFFF',
    background: '#0A0A0A',
    onBackground: '#FFFFFF',
  }
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={darkTheme}>
        <StatusBar style="light" backgroundColor="#121212" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#121212',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'My Affirms' }} />
          <Stack.Screen name="projects" options={{ title: 'Projects' }} />
          <Stack.Screen name="session/[id]" options={{ title: 'Session' }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  )
}