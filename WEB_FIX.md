# 🔧 Web Version Fix

## 🚨 Problem
- 500 Internal Server Error
- MIME type 'application/json' not executable
- Expo Router bundle issues

## ✅ Rozwiązanie

### 1. Zainstaluj Web Dependencies
```bash
cd mobile-app
npx expo install react-dom react-native-web
```

### 2. Wyczyść Cache i Restart
```bash
cd mobile-app
pkill -f expo
npx expo start --web --clear
```

### 3. Jeśli nadal błędy, spróbuj tunnel mode
```bash
cd mobile-app
npx expo start --tunnel --clear
```

## 🎯 Alternatywne Rozwiązania

### Opcja A: Tunnel Mode (Rekomendowane)
```bash
cd mobile-app
npx expo start --tunnel
# Zeskanuj QR kod w Expo Go
```

### Opcja B: Uproszczona Web Config
Jeśli web nadal nie działa, możemy wyłączyć web support i skupić się na mobile.

### Opcja C: Development Build
```bash
cd mobile-app
npx expo run:android
# LUB
npx expo run:ios
```

**Spróbuj najpierw tunnel mode - powinien działać najlepiej!**