import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button, Card, useTheme } from 'react-native-paper'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const theme = useTheme()

  const handleGetStarted = () => {
    router.push('/auth')
  }

  const handleViewProjects = () => {
    router.push('/projects')
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card style={[styles.welcomeCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
              My Affirms
            </Text>
            <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
              Transform your mindset with personalized affirmations
            </Text>
            <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              Create, organize, and listen to positive affirmations that help you build confidence and achieve your goals.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.onPrimary }}
          >
            Get Started
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleViewProjects}
            style={[styles.button, { borderColor: theme.colors.outline }]}
            labelStyle={{ color: theme.colors.primary }}
          >
            View Projects
          </Button>
        </View>

        <View style={styles.featuresContainer}>
          <Text variant="titleMedium" style={[styles.featuresTitle, { color: theme.colors.onSurface }]}>
            Features:
          </Text>
          <Text style={[styles.feature, { color: theme.colors.onSurfaceVariant }]}>
            • Create personalized affirmations
          </Text>
          <Text style={[styles.feature, { color: theme.colors.onSurfaceVariant }]}>
            • Organize into themed projects
          </Text>
          <Text style={[styles.feature, { color: theme.colors.onSurfaceVariant }]}>
            • AI-powered text-to-speech
          </Text>
          <Text style={[styles.feature, { color: theme.colors.onSurfaceVariant }]}>
            • Sync across all devices
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  welcomeCard: {
    marginBottom: 32,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 8,
  },
  featuresContainer: {
    marginTop: 16,
  },
  featuresTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  feature: {
    marginBottom: 8,
    fontSize: 16,
  },
})