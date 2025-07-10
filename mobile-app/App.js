import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, AppState, Vibration, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import audioConfig from './assets/audio-config.json';

// Define background task
const BACKGROUND_AFFIRMATION_TASK = 'background-affirmation-task';

TaskManager.defineTask(BACKGROUND_AFFIRMATION_TASK, async () => {
  try {
    console.log('Background task running - keeping app alive');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [pauseBetween, setPauseBetween] = useState(3);
  const sessionRef = useRef({ isActive: false, currentIndex: 0 });
  const intervalRef = useRef(null);
  const soundRef = useRef(null);

  // Setup audio, notifications and background tasks
  useEffect(() => {
    const setupApp = async () => {
      try {
        // Audio setup for background playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        // Notifications setup
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });
        
        const { status } = await Notifications.requestPermissionsAsync();
        console.log('Notification permission status:', status);
        
        // Register background task for keeping app alive
        try {
          await BackgroundFetch.registerTaskAsync(BACKGROUND_AFFIRMATION_TASK, {
            minimumInterval: 15000, // 15 seconds minimum
            stopOnTerminate: false,
            startOnBoot: true,
          });
          console.log('Background task registered successfully');
        } catch (bgError) {
          console.log('Background task registration failed:', bgError);
        }
        
      } catch (error) {
        console.log('App setup error:', error);
      }
    };
    setupApp();
  }, []);

  const affirmations = audioConfig.affirmations;

  const projects = [
    { id: 1, name: 'Pewnosc Siebie', count: 7 },
    { id: 2, name: 'Sukces w Karierze', count: 8 },
    { id: 3, name: 'Zdrowie i Wellness', count: 3 }
  ];

  const playCurrentAffirmation = async () => {
    try {
      console.log('Playing affirmation:', currentAffirmation, affirmations[currentAffirmation].text);
      setIsPlaying(true);
      
      // Vibrate at start
      Vibration.vibrate(200);
      
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      // Load and play audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: affirmations[currentAffirmation].url },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0
        }
      );
      
      soundRef.current = sound;
      
      // Handle playback completion
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          console.log('Audio finished, session active:', sessionRef.current.isActive);
          setIsPlaying(false);
          
          if (sessionRef.current.isActive) {
            if (currentAffirmation < affirmations.length - 1) {
              console.log('Moving to next affirmation after', pauseBetween, 'seconds');
              Vibration.vibrate([500, 200, 500]);
              
              const intervalId = setInterval(() => {
                if (sessionRef.current.isActive) {
                  clearInterval(intervalId);
                  const nextIndex = currentAffirmation + 1;
                  sessionRef.current.currentIndex = nextIndex;
                  setCurrentAffirmation(nextIndex);
                } else {
                  clearInterval(intervalId);
                }
              }, pauseBetween * 1000);
            } else {
              console.log('Session completed');
              Vibration.vibrate([200, 100, 200, 100, 200]);
              stopSession();
            }
          }
        }
        
        if (status.error) {
          console.log('Audio error:', status.error);
          setIsPlaying(false);
          stopSession();
        }
      });
      
    } catch (error) {
      console.log('Audio loading error:', error);
      setIsPlaying(false);
      stopSession();
    }
  };

  const stopSession = async () => {
    sessionRef.current.isActive = false;
    setIsSessionActive(false);
    setIsPlaying(false);
    
    // Stop audio
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.log('Error stopping audio:', error);
      }
    }
    
    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Cancel notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    deactivateKeepAwake();
  };

  const playAffirmation = async () => {
    if (isSessionActive || isPlaying) {
      stopSession();
    } else {
      // Start session
      sessionRef.current.isActive = true;
      sessionRef.current.currentIndex = currentAffirmation;
      setIsSessionActive(true);
      activateKeepAwakeAsync();
      
      // Show persistent notification to keep app in foreground
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Sesja Afirmacji Aktywna",
          body: "Aplikacja dziala w tle. Dotknij aby powrocic.",
          sound: false,
          priority: 'high',
        },
        trigger: null,
      });
      
      Vibration.vibrate(800);
      playCurrentAffirmation();
    }
  };

  // Auto-play when affirmation changes
  useEffect(() => {
    console.log('useEffect triggered - currentAffirmation:', currentAffirmation, 'isSessionActive:', isSessionActive, 'isPlaying:', isPlaying);
    if (isSessionActive && !isPlaying && sessionRef.current.isActive) {
      console.log('Auto-playing next affirmation');
      playCurrentAffirmation();
    }
  }, [currentAffirmation]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log('App state changed to:', nextAppState);
      if (nextAppState === 'background' && isSessionActive) {
        console.log('App backgrounded but session should continue');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isSessionActive]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopSession();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const HomeScreen = () => (
    <View style={styles.screen}>
      <Text style={styles.title}>Moje Afirmacje</Text>
      <Text style={styles.subtitle}>Przeksztalc swoje myslenie dzieki spersonalizowanym afirmacjom</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Tworz, organizuj i sluchaj pozytywnych afirmacji, ktore pomoga Ci budowac pewnosc siebie i osiagac cele.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => setCurrentScreen('projects')}
      >
        <Text style={styles.buttonText}>Zacznij</Text>
      </TouchableOpacity>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Funkcje:</Text>
        <Text style={styles.feature}>• Tworzenie spersonalizowanych afirmacji</Text>
        <Text style={styles.feature}>• Organizacja w tematyczne projekty</Text>
        <Text style={styles.feature}>• Automatyczne sesje</Text>
        <Text style={styles.feature}>• Dziala w tle</Text>
      </View>
    </View>
  );

  const ProjectsScreen = () => (
    <View style={styles.screen}>
      <Text style={styles.title}>Moje Projekty</Text>
      <Text style={styles.subtitle}>Organizuj swoje afirmacje wedlug tematow</Text>

      <ScrollView style={styles.projectsList}>
        {projects.map((project) => (
          <View key={project.id} style={styles.card}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectInfo}>{project.count} afirmacji</Text>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setCurrentScreen('session')}
            >
              <Text style={styles.buttonText}>Rozpocznij Sesje</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.buttonText}>← Powrot do Glownej</Text>
      </TouchableOpacity>
    </View>
  );

  const SessionScreen = () => (
    <View style={styles.screen}>
      <Text style={styles.title}>Sesja</Text>
      
      <View style={styles.affirmationCard}>
        <Text style={styles.counter}>
          {currentAffirmation + 1} z {affirmations.length}
        </Text>
        <Text style={styles.affirmationText}>
          {affirmations[currentAffirmation].text}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, currentAffirmation === 0 && styles.disabled]}
          onPress={() => {
            if (currentAffirmation > 0) {
              setCurrentAffirmation(currentAffirmation - 1);
              sessionRef.current.currentIndex = currentAffirmation - 1;
            }
          }}
        >
          <Text style={styles.controlText}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playButton}
          onPress={playAffirmation}
        >
          <Text style={styles.playText}>
            {isSessionActive ? 'STOP' : (isPlaying ? 'PAUZA' : 'PLAY')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, currentAffirmation === affirmations.length - 1 && styles.disabled]}
          onPress={() => {
            if (currentAffirmation < affirmations.length - 1) {
              setCurrentAffirmation(currentAffirmation + 1);
              sessionRef.current.currentIndex = currentAffirmation + 1;
            }
          }}
        >
          <Text style={styles.controlText}>⏭</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settings}>
        <Text style={styles.settingsTitle}>Ustawienia Sesji</Text>
        <Text style={styles.settingItem}>Predkosc: Normalna</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingItem}>Pauza miedzy: {pauseBetween}s</Text>
          <View style={styles.pauseControls}>
            <TouchableOpacity 
              style={styles.pauseButton}
              onPress={() => setPauseBetween(Math.max(1, pauseBetween - 1))}
            >
              <Text style={styles.pauseButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.pauseButton}
              onPress={() => setPauseBetween(Math.min(10, pauseBetween + 1))}
            >
              <Text style={styles.pauseButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.settingItem}>Glos: Google TTS</Text>
        {isSessionActive && (
          <Text style={styles.sessionStatus}>🔄 Auto-sesja aktywna</Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentScreen('projects')}
      >
        <Text style={styles.buttonText}>← Powrot do Projektow</Text>
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
      <StatusBar style="light" />
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
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pauseControls: {
    flexDirection: 'row',
    gap: 8,
  },
  pauseButton: {
    backgroundColor: '#03DAC6',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionStatus: {
    color: '#03DAC6',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
});