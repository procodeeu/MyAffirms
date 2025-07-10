import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Card, Button, IconButton } from 'react-native-paper'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SessionScreen() {
  const { id } = useLocalSearchParams()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAffirmation, setCurrentAffirmation] = useState(0)

  const sampleAffirmations = [
    "I am confident and capable",
    "I attract success in everything I do", 
    "I am worthy of love and respect",
    "I trust in my ability to overcome challenges",
    "I am grateful for all the opportunities in my life"
  ]

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // Here you would integrate with TTS
  }

  const handleNext = () => {
    if (currentAffirmation < sampleAffirmations.length - 1) {
      setCurrentAffirmation(currentAffirmation + 1)
    }
  }

  const handlePrevious = () => {
    if (currentAffirmation > 0) {
      setCurrentAffirmation(currentAffirmation - 1)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.sessionTitle}>
          Session {id}
        </Text>

        <Card style={styles.affirmationCard}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.counter}>
              {currentAffirmation + 1} of {sampleAffirmations.length}
            </Text>
            <Text variant="headlineMedium" style={styles.affirmationText}>
              {sampleAffirmations[currentAffirmation]}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.controls}>
          <IconButton
            icon="skip-previous"
            size={32}
            iconColor="#03DAC6"
            onPress={handlePrevious}
            disabled={currentAffirmation === 0}
          />
          
          <IconButton
            icon={isPlaying ? "pause-circle" : "play-circle"}
            size={64}
            iconColor="#BB86FC"
            onPress={handlePlayPause}
          />
          
          <IconButton
            icon="skip-next"
            size={32}
            iconColor="#03DAC6"
            onPress={handleNext}
            disabled={currentAffirmation === sampleAffirmations.length - 1}
          />
        </View>

        <View style={styles.settings}>
          <Text variant="bodyMedium" style={styles.settingsTitle}>
            Session Settings
          </Text>
          <Text variant="bodySmall" style={styles.settingItem}>
            Speed: Normal
          </Text>
          <Text variant="bodySmall" style={styles.settingItem}>
            Pause between: 3 seconds
          </Text>
          <Text variant="bodySmall" style={styles.settingItem}>
            Voice: Default
          </Text>
        </View>

        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back to Projects
        </Button>
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
  sessionTitle: {
    color: '#BB86FC',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: 'bold',
  },
  affirmationCard: {
    marginBottom: 32,
    backgroundColor: '#121212',
    minHeight: 150,
    justifyContent: 'center',
  },
  counter: {
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 16,
  },
  affirmationText: {
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  settings: {
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  settingsTitle: {
    color: '#BB86FC',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  settingItem: {
    color: '#E0E0E0',
    marginBottom: 4,
  },
  backButton: {
    borderColor: '#03DAC6',
  },
})