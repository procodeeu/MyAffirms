import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button, Card } from 'react-native-paper'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const handleGetStarted = () => {
    router.push('/projects')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Text variant="headlineLarge" style={styles.title}>
              My Affirms
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Transform your mindset with personalized affirmations
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Create, organize, and listen to positive affirmations that help you build confidence and achieve your goals.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.button}
          >
            Get Started
          </Button>
        </View>

        <View style={styles.featuresContainer}>
          <Text variant="titleMedium" style={styles.featuresTitle}>
            Features:
          </Text>
          <Text style={styles.feature}>
            • Create personalized affirmations
          </Text>
          <Text style={styles.feature}>
            • Organize into themed projects
          </Text>
          <Text style={styles.feature}>
            • AI-powered text-to-speech
          </Text>
          <Text style={styles.feature}>
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
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  welcomeCard: {
    marginBottom: 32,
    backgroundColor: '#121212',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#BB86FC',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    color: '#E0E0E0',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 8,
    backgroundColor: '#BB86FC',
  },
  featuresContainer: {
    marginTop: 16,
  },
  featuresTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  feature: {
    marginBottom: 8,
    fontSize: 16,
    color: '#E0E0E0',
  },
})