# 🔧 Mobile App Troubleshooting

## 🚨 Problem z Yarn PnP i Expo

### Błąd:
```
Error: @expo/cli tried to access metro, but it isn't declared in its dependencies
Error: @react-native-firebase/app tried to access @expo/config-plugins
```

### Przyczyna:
Yarn PnP (Plug'n'Play) ma problemy z Expo i React Native Firebase dependencies.

## 🛠️ Rozwiązania

### Opcja 1: Uruchom Bezpośrednio (ZALECANE)
```bash
# Przejdź do mobile-app
cd mobile-app

# Uruchom bezpośrednio Expo
npx expo start

# Lub użyj yarn bezpośrednio
yarn start
```

### Opcja 2: Wyłącz Yarn PnP
Dodaj do `.yarnrc.yml`:
```yaml
nodeLinker: node-modules
```

### Opcja 3: Uproszczona Konfiguracja
Usuń Firebase dependencies na razie i skup się na podstawowej aplikacji:

```json
// mobile-app/package.json - uproszczone dependencies
{
  "dependencies": {
    "@my-affirms/shared": "workspace:*",
    "expo": "~52.0.0",
    "expo-router": "~4.0.0", 
    "react": "18.3.1",
    "react-native": "0.76.5",
    "react-native-paper": "^5.12.3",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "4.2.0"
  }
}
```

## 🎯 Aktualne Komendy Działające

### Web App (DZIAŁA):
```bash
yarn dev:web          # ✅ Działa
cd web-app && yarn dev # ✅ Działa
```

### Mobile App (OBEJŚCIE):
```bash
cd mobile-app && npx expo start  # ✅ Powinno działać
cd mobile-app && yarn start      # ✅ Powinno działać
```

### Shared Library (DZIAŁA):
```bash
# Importy działają w web-app:
import { useFirestore } from '@my-affirms/shared'  # ✅
import { COLLECTIONS } from '@my-affirms/shared'   # ✅
import { ttsConfig } from '@my-affirms/shared'     # ✅
```

## 📱 Mobile App Status

### ✅ GOTOWE:
- React Native + Expo project struktura
- React Native Paper z dark theme
- Expo Router navigation
- Custom dark theme (#BB86FC, #03DAC6, #121212)
- ESLint/Prettier config
- Babel aliases dla importów

### 🔄 DO NAPRAWY:
- Yarn PnP compatibility z Expo
- Firebase integration (dodać później)
- TurboRepo integration dla mobile-app

## 🚀 Następne Kroki

1. **Test Mobile App Bezpośrednio**:
   ```bash
   cd mobile-app
   npx expo start
   ```

2. **Sprawdź czy UI działa** - dark theme, navigation

3. **Dodaj Firebase później** gdy podstawowa aplikacja działa

4. **Opcjonalnie przełącz na node-modules** zamiast PnP

## 💡 Zalecenie

**Użyj mobile-app bezpośrednio na razie:**
- `cd mobile-app && npx expo start` 
- Przetestuj UI i navigation
- Dodaj Firebase integration później
- TurboRepo dla mobile-app można naprawić później

**Monorepo nadal działa dla:**
- ✅ Web app przez TurboRepo
- ✅ Shared library
- ✅ Linting i build tasks
- ⚠️ Mobile app bezpośrednio (bez TurboRepo na razie)

**To nie blokuje rozwoju - możesz pracować nad obiema aplikacjami!** 🎉