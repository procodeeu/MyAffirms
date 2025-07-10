# 🔧 Mobile App Troubleshooting - IOException

## 🚨 Problem
`java.io.IOException: Failed to download remote update` w Expo Go na Samsung M15

## 🔍 Możliwe Przyczyny
1. **Problemy sieciowe** - firewall, proxy, słabe WiFi
2. **Cache Expo** - stary cache powoduje konflikty
3. **Wersja Expo Go** - niekompatybilna wersja
4. **Metro bundler** - problemy z bundlerem
5. **Konfiguracja sieci** - różne sieci telefon/komputer

## 🛠️ Rozwiązania do Wypróbowania

### 1. Tunnel Mode (Najlepsze dla problemów sieciowych)
```bash
cd mobile-app
npx expo start --tunnel
```
**Dlaczego:** Używa ngrok tunnel, omija problemy z lokalną siecią

### 2. Localhost Mode
```bash
cd mobile-app
npx expo start --localhost
```
**Dlaczego:** Wymusza lokalne połączenie

### 3. Wyczyść Cache
```bash
cd mobile-app
npx expo start --clear
# LUB
npx expo r -c
```

### 4. Sprawdź Expo Doctor
```bash
cd mobile-app
npx expo doctor
```

### 5. iOS Simulator (Jeśli masz Mac)
```bash
cd mobile-app
npx expo start
# Naciśnij 'i' w konsoli
```

### 6. Web Version
```bash
cd mobile-app
npx expo start
# Naciśnij 'w' w konsoli
```

### 7. Zaktualizuj Expo Go
- Usuń i zainstaluj ponownie Expo Go z Google Play
- Sprawdź czy masz najnowszą wersję

### 8. Sprawdź Sieć
- Upewnij się że telefon i komputer są w tej samej sieci WiFi
- Wyłącz VPN jeśli używasz
- Sprawdź czy firewall nie blokuje

### 9. Alternatywne Uruchomienie
```bash
cd mobile-app
npx expo start --dev-client
# LUB
npx expo start --web
```

## 🎯 Rekomendowane Kroki

### Krok 1: Tunnel Mode
```bash
cd mobile-app
npx expo start --tunnel --clear
```
Tunnel mode często rozwiązuje problemy sieciowe.

### Krok 2: Web Version (Backup)
```bash
cd mobile-app
npx expo start
# Naciśnij 'w' - otwiera w przeglądarce
```

### Krok 3: iOS Simulator (Jeśli Mac)
```bash
cd mobile-app
npx expo start
# Naciśnij 'i' - otwiera iOS simulator
```

## 📱 Alternatywne Testowanie

### 1. Expo Web
- Działa w przeglądarce
- Identyczny kod React Native
- Dobry do testowania UI/UX

### 2. iOS Simulator
- Jeśli masz Mac
- Pełna funkcjonalność
- Szybsze niż fizyczne urządzenie

### 3. Android Emulator
```bash
# Jeśli masz Android Studio
cd mobile-app
npx expo start
# Naciśnij 'a' - otwiera Android emulator
```

## 🔧 Debug Commands

```bash
# Sprawdź status Expo
npx expo whoami
npx expo doctor

# Wyczyść wszystko
npx expo start --clear --reset-cache

# Tunnel z debug
npx expo start --tunnel --dev --minify false

# Sprawdź logi
npx expo start --verbose
```

## 💡 Szybkie Testy

### Test 1: Web Version
```bash
cd mobile-app
yarn dev
# Naciśnij 'w' gdy się uruchomi
```

### Test 2: Tunnel Mode
```bash
cd mobile-app
npx expo start --tunnel
# Zeskanuj nowy QR kod
```

### Test 3: Localhost
```bash
cd mobile-app
npx expo start --localhost
# Sprawdź czy działa lokalnie
```

## 🎯 Następne Kroki

1. **Spróbuj tunnel mode** - `npx expo start --tunnel`
2. **Jeśli nie działa, test web** - naciśnij 'w'
3. **Sprawdź iOS simulator** - naciśnij 'i' (jeśli Mac)
4. **Zaktualizuj Expo Go** na telefonie
5. **Sprawdź sieć WiFi** - ta sama dla telefonu i komputera

**Które rozwiązanie chcesz wypróbować najpierw?**