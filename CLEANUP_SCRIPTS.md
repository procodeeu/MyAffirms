# 🧹 Firebase Data Cleanup Scripts

Kompletny zestaw skryptów do czyszczenia danych Firebase podczas developmentu i maintenance.

## 📋 Dostępne Skrypty

### 1. `clean-all-data.sh` - Kompletne Czyszczenie
**⚠️ NIEBEZPIECZNY: Usuwa WSZYSTKIE dane użytkowników!**

```bash
./clean-all-data.sh
```

**Co usuwa:**
- 📁 Wszystkie projekty użytkowników
- 👥 Wszystkie grupy
- 🎵 Wszystkie metadane audio
- 👤 Wszystkie profile użytkowników
- 📊 Wszystkie dane tracking
- 📦 Wszystkie pliki MP3 z Storage

---

### 2. `clean-dev-data.sh` - Szybkie Czyszczenie Dev
**Szybkie czyszczenie z minimalnym potwierdzeniem**

```bash
./clean-dev-data.sh
```

**Funkcje:**
- ⚡ Szybkie potwierdzenie (y/N)
- 🎯 Te same usunięcia co pełny skrypt
- 🔄 Idealne do cykli developmentu

---

### 3. `clean-storage-only.sh` - Tylko Pliki Audio
**Usuwa tylko pliki audio, zachowuje dane projektów**

```bash
./clean-storage-only.sh
```

**Co usuwa:**
- 🎵 Wszystkie pliki MP3 z Storage
- 📄 Metadane audio z Firestore

**Co zachowuje:**
- 📁 Wszystkie projekty i afirmacje
- 👥 Wszystkie grupy
- 👤 Profile użytkowników

---

### 4. `clean-affirmation-audio.sh` - Kompletne Czyszczenie Audio
**Usuwa kolekcję affirmation_audio ORAZ pliki MP3**

```bash
./clean-affirmation-audio.sh
```

**Co usuwa:**
- 📄 Wszystkie dokumenty w `affirmation_audio`
- 🎵 Wszystkie pliki MP3 z Storage (jeśli gsutil dostępne)

**Co zachowuje:**
- 📁 Wszystkie projekty i afirmacje
- 👥 Wszystkie grupy
- 👤 Profile użytkowników
- 📊 Dane tracking

**Funkcje:**
- 🔍 Auto-wykrywa dostępność gsutil
- 📦 Czyści zarówno Firestore jak i Storage
- ⚠️ Graceful fallback jeśli gsutil brakuje

---

### 5. `clean-affirmation-audio-node.js` - Wersja Node.js
**Node.js script dla niezawodnego czyszczenia**

```bash
./clean-affirmation-audio-node.js
```

**Funkcje:**
- 🔄 Batch deletion dla dużych kolekcji
- 📊 Progress tracking z licznikiem dokumentów
- 🛡️ Lepsze error handling
- ✅ Weryfikacja po usunięciu

---

### 6. `clean-affirmation-audio-simple.sh` - Wersja REST API
**Bezpośrednie wywołania Firebase REST API**

```bash
./clean-affirmation-audio-simple.sh
```

**Funkcje:**
- 🌐 Używa Firebase REST API bezpośrednio
- 📋 Listuje dokumenty przed usunięciem
- 📊 Pokazuje progress usuwania
- 🔑 Używa Firebase CLI access token

---

## 📋 Porównanie Skryptów

| Skrypt | Firestore | Storage | Potwierdzenie | Metoda | Czas |
|--------|-----------|---------|---------------|---------|------|
| `clean-all-data.sh` | Wszystko | Wszystko | "DELETE ALL DATA" | Firebase CLI | Wolny |
| `clean-dev-data.sh` | Wszystko | Wszystko | y/N | Firebase CLI | Szybki |
| `clean-storage-only.sh` | Tylko audio | Tylko MP3 | y/N | gsutil + CLI | Średni |
| `clean-affirmation-audio.sh` | Audio metadata | MP3 (jeśli gsutil) | y/N | Firebase CLI + gsutil | Szybki |
| `clean-affirmation-audio-node.js` | Audio metadata | Nic | y/N | Node.js + Admin SDK | Średni |
| `clean-affirmation-audio-simple.sh` | Audio metadata | Nic | y/N | REST API + curl | Szybki |

### 🎯 Kiedy Użyć Którego Skryptu

- **`clean-all-data.sh`** - Kompletny reset przed produkcją lub major changes
- **`clean-dev-data.sh`** - Szybkie czyszczenie podczas codziennego developmentu  
- **`clean-storage-only.sh`** - Regeneracja wszystkich plików audio z nowymi ustawieniami
- **`clean-affirmation-audio.sh`** - **ZALECANE** - kompletne czyszczenie audio (metadata + pliki)
- **`clean-affirmation-audio-node.js`** - Duże kolekcje audio (>1000 dokumentów)
- **`clean-affirmation-audio-simple.sh`** - Gdy Firebase CLI nie działa

### 🚨 Poziomy Ryzyka

| Poziom | Skrypty | Opis |
|--------|---------|------|
| 🔴 **WYSOKIE** | `clean-all-data.sh` | Usuwa WSZYSTKIE dane użytkowników |
| 🟡 **ŚREDNIE** | `clean-dev-data.sh`, `clean-storage-only.sh` | Usuwa dane użytkowników ale zachowuje auth |
| 🟢 **NISKIE** | `clean-affirmation-audio-*` | Usuwa tylko audio, łatwe do regeneracji |

---

## 🛠️ Wymagania

### Wymagane Narzędzia

1. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Google Cloud SDK** (dla czyszczenia storage)
   ```bash
   # macOS:
   brew install google-cloud-sdk
   # Lub pobierz z: https://cloud.google.com/sdk/docs/install
   ```

3. **Node.js** (dla wersji Node.js)
   ```bash
   # Sprawdź czy masz Node.js
   node --version
   ```

### Wymagane Uprawnienia

- **Firestore Admin** - do usuwania kolekcji
- **Storage Admin** - do usuwania plików
- **Firebase Admin** - dla pełnego dostępu

---

## 🚀 Przykłady Użycia

### Codzienne Development
```bash
# Szybkie czyszczenie audio podczas developmentu
./clean-affirmation-audio.sh
```

### Duże Kolekcje
```bash
# Dla >1000 dokumentów audio z progress tracking
./clean-affirmation-audio-node.js
```

### Kompletny Reset
```bash
# Przed major testingiem (OSTROŻNIE!)
./clean-all-data.sh
```

### Problemy z Firebase CLI
```bash
# Backup solution gdy CLI nie działa
./clean-affirmation-audio-simple.sh
```

---

## 🔧 Rozwiązywanie Problemów

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "Not logged in to Firebase"
```bash
firebase login
```

### "gsutil not found"
```bash
# macOS:
brew install google-cloud-sdk
# Lub: https://cloud.google.com/sdk/docs/install
```

### "Permission denied"
```bash
chmod +x clean-*.sh
```

### "error: unknown option '--yes'"
✅ **Naprawione!** Wszystkie skrypty używają teraz `--force` zamiast `--yes`

---

## 📝 Notatki

- **Backup Ważnych Danych**: Te skrypty są destrukcyjne i nieodwracalne
- **Środowisko Testowe**: Używaj najpierw na dev/staging
- **Wpływ na Użytkowników**: Użytkownicy będą musieli odtworzyć projekty
- **Regeneracja Audio**: Wszystkie pliki audio będą musiały być wygenerowane ponownie
- **Local Storage**: localStorage przeglądarki nie jest dotknięte

---

## ✅ Status Skryptów

- ✅ **`clean-all-data.sh`** - Naprawiony, gotowy
- ✅ **`clean-dev-data.sh`** - Naprawiony, gotowy  
- ✅ **`clean-storage-only.sh`** - Gotowy
- ✅ **`clean-affirmation-audio.sh`** - **ZALECANY** - kompletny, z MP3
- ✅ **`clean-affirmation-audio-node.js`** - Gotowy
- ✅ **`clean-affirmation-audio-simple.sh`** - Gotowy