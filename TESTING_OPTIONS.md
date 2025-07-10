# 📱 Opcje Testowania Mobile App

## 🌐 Web Version (DZIAŁA TERAZ!)
```bash
cd mobile-app
npx expo start --web
```
**Korzyści:**
- ✅ Działa w przeglądarce
- ✅ Identyczny UI jak na telefonie
- ✅ React Native Paper components
- ✅ Nawigacja Expo Router
- ✅ Responsive design

## 🔧 Tunnel Mode (Po instalacji ngrok)
```bash
npm install -g @expo/ngrok
cd mobile-app
npx expo start --tunnel
```
**Korzyści:**
- ✅ Omija problemy sieciowe
- ✅ Działa na prawdziwym telefonie
- ✅ Pełna funkcjonalność native

## 🖥️ iOS Simulator (Jeśli Mac)
```bash
cd mobile-app
npx expo start
# Naciśnij 'i' w konsoli
```

## 🎯 Rekomendacja

### 1. **Web Version** (Najszybsze testowanie)
- Otwórz w przeglądarce
- Przetestuj UI i nawigację
- Sprawdź dark theme
- Przetestuj wszystkie ekrany

### 2. **Tunnel Mode** (Dla telefonu)
- Po instalacji ngrok
- Zeskanuj QR kod
- Test na prawdziwym urządzeniu

### 3. **Development Workflow**
```bash
# Szybkie testowanie UI
npx expo start --web

# Testowanie na telefonie  
npx expo start --tunnel

# iOS testing (jeśli Mac)
npx expo start # + naciśnij 'i'
```

## 📋 Co Testować

### Web Version:
- [ ] Home screen loading
- [ ] Navigation do Projects
- [ ] Projects list display
- [ ] Navigation do Session
- [ ] Session controls
- [ ] Dark theme colors
- [ ] Responsive layout

### Mobile (po tunnel):
- [ ] Touch interactions
- [ ] Native navigation
- [ ] Performance
- [ ] Real device testing

**Spróbuj najpierw web version - powinna działać od razu!**