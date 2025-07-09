import { MD3DarkTheme } from 'react-native-paper'

// Custom dark theme for My Affirms
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors - vibrant and contrasting
    primary: '#BB86FC',
    onPrimary: '#000000',
    primaryContainer: '#3700B3',
    onPrimaryContainer: '#FFFFFF',
    
    // Secondary colors - complementary
    secondary: '#03DAC6',
    onSecondary: '#000000',
    secondaryContainer: '#018786',
    onSecondaryContainer: '#FFFFFF',
    
    // Surface colors - dark background
    surface: '#121212',
    onSurface: '#FFFFFF',
    surfaceVariant: '#1E1E1E',
    onSurfaceVariant: '#E0E0E0',
    
    // Background
    background: '#0A0A0A',
    onBackground: '#FFFFFF',
    
    // Error colors
    error: '#CF6679',
    onError: '#000000',
    errorContainer: '#B00020',
    onErrorContainer: '#FFFFFF',
    
    // Outline
    outline: '#444444',
    outlineVariant: '#666666',
    
    // Custom colors for affirmations
    affirmationCard: '#1E1E1E',
    affirmationText: '#E0E0E0',
    playButton: '#03DAC6',
    pauseButton: '#FF6B6B',
    stopButton: '#FFA726',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
  },
  // Custom spacing and typography
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 24,
  }
}

export type AppTheme = typeof darkTheme