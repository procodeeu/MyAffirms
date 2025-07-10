import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button, FAB } from 'react-native-paper'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProjectsScreen() {
  const sampleProjects = [
    { id: 1, name: 'Self Confidence', affirmationsCount: 5 },
    { id: 2, name: 'Career Success', affirmationsCount: 8 },
    { id: 3, name: 'Health & Wellness', affirmationsCount: 3 },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          My Projects
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Organize your affirmations by theme
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {sampleProjects.map((project) => (
          <Card key={project.id} style={styles.projectCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.projectName}>
                {project.name}
              </Text>
              <Text variant="bodyMedium" style={styles.projectInfo}>
                {project.affirmationsCount} affirmations
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button 
                mode="outlined" 
                onPress={() => router.push(`/session/${project.id}`)}
                style={styles.actionButton}
              >
                Start Session
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Add new project logic
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#BB86FC',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#E0E0E0',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  projectCard: {
    marginBottom: 16,
    backgroundColor: '#121212',
  },
  projectName: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  projectInfo: {
    color: '#E0E0E0',
  },
  actionButton: {
    borderColor: '#03DAC6',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#03DAC6',
  },
})