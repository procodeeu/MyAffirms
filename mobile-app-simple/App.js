import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const affirmations = [
    "I am confident and capable",
    "I attract success in everything I do",
    "I am worthy of love and respect", 
    "I trust in my ability to overcome challenges",
    "I am grateful for all opportunities in my life"
  ];

  const projects = [
    { id: 1, name: 'Self Confidence', count: 5 },
    { id: 2, name: 'Career Success', count: 8 },
    { id: 3, name: 'Health & Wellness', count: 3 }
  ];

  const HomeScreen = () => (
    <View style={styles.screen}>
      <Text style={styles.title}>My Affirms</Text>
      <Text style={styles.subtitle}>Transform your mindset with personalized affirmations</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Create, organize, and listen to positive affirmations that help you build confidence and achieve your goals.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => setCurrentScreen('projects')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Features:</Text>
        <Text style={styles.feature}>• Create personalized affirmations</Text>
        <Text style={styles.feature}>• Organize into themed projects</Text>
        <Text style={styles.feature}>• Simple and intuitive interface</Text>
        <Text style={styles.feature}>• Works offline</Text>
      </View>
    </View>
  );

  const ProjectsScreen = () => (
    <View style={styles.screen}>
      <Text style={styles.title}>My Projects</Text>
      <Text style={styles.subtitle}>Organize your affirmations by theme</Text>

      <ScrollView style={styles.projectsList}>
        {projects.map((project) => (
          <View key={project.id} style={styles.card}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectInfo}>{project.count} affirmations</Text>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setCurrentScreen('session')}
            >
              <Text style={styles.buttonText}>Start Session</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.buttonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );

  const SessionScreen = () => (
    <View style={styles.screen}>
      <Text style={styles.title}>Session</Text>
      
      <View style={styles.affirmationCard}>
        <Text style={styles.counter}>
          {currentAffirmation + 1} of {affirmations.length}
        </Text>
        <Text style={styles.affirmationText}>
          {affirmations[currentAffirmation]}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, currentAffirmation === 0 && styles.disabled]}
          onPress={() => currentAffirmation > 0 && setCurrentAffirmation(currentAffirmation - 1)}
        >
          <Text style={styles.controlText}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.playText}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, currentAffirmation === affirmations.length - 1 && styles.disabled]}
          onPress={() => currentAffirmation < affirmations.length - 1 && setCurrentAffirmation(currentAffirmation + 1)}
        >
          <Text style={styles.controlText}>⏭</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settings}>
        <Text style={styles.settingsTitle}>Session Settings</Text>
        <Text style={styles.settingItem}>Speed: Normal</Text>
        <Text style={styles.settingItem}>Pause between: 3 seconds</Text>
        <Text style={styles.settingItem}>Voice: Default</Text>
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentScreen('projects')}
      >
        <Text style={styles.buttonText}>← Back to Projects</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScreen = () => {
    switch(currentScreen) {
      case 'home': return <HomeScreen />;
      case 'projects': return <ProjectsScreen />;
      case 'session': return <SessionScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#121212" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  screen: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#BB86FC',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  cardText: {
    color: '#E0E0E0',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#BB86FC',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  secondaryButton: {
    backgroundColor: '#03DAC6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  backButton: {
    backgroundColor: '#444444',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  features: {
    marginTop: 16,
  },
  featuresTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  feature: {
    color: '#E0E0E0',
    fontSize: 16,
    marginBottom: 8,
  },
  projectsList: {
    flex: 1,
    marginBottom: 20,
  },
  projectName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectInfo: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  affirmationCard: {
    backgroundColor: '#121212',
    padding: 24,
    borderRadius: 12,
    marginBottom: 32,
    minHeight: 150,
    justifyContent: 'center',
  },
  counter: {
    color: '#E0E0E0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  affirmationText: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 32,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  controlButton: {
    backgroundColor: '#03DAC6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  playButton: {
    backgroundColor: '#BB86FC',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  controlText: {
    fontSize: 20,
    color: '#000000',
  },
  playText: {
    fontSize: 24,
    color: '#000000',
  },
  disabled: {
    backgroundColor: '#444444',
    opacity: 0.5,
  },
  settings: {
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  settingsTitle: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 4,
  },
});