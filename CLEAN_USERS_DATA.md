# 🧹 Clean Users Data Script

Uniwersalny skrypt do czyszczenia danych audio użytkowników z Firebase.

## 📋 Opis

`clean-users-data.sh` to kompleksowy skrypt z dwoma trybami:

### 🎵 **Tryb Audio (BEZPIECZNY)**
- 🗑️ Usuwa kolekcję `affirmation_audio` z Firestore
- 📦 Usuwa pliki MP3 z Firebase Storage
- 🛡️ **ZACHOWUJE** wszystkie projekty, grupy i dane użytkowników
- 🔄 Umożliwia regenerację audio gdy będzie potrzebne

### 📁 **Tryb Pełny (DESTRUKCYJNY)**
- 🗑️ Usuwa **WSZYSTKIE** projekty użytkowników
- 👥 Usuwa **WSZYSTKIE** grupy
- 👤 Usuwa profile użytkowników
- 📊 Usuwa dane tracking
- 🎵 Usuwa audio (metadata + pliki MP3)
- ⚠️ **WYMAGA** potwierdzenia "DELETE ALL PROJECTS"

## 🚀 Użycie

```bash
./clean-users-data.sh
```

## 🎯 Co Robi

### 🎵 **Tryb Audio (Opcja 1 - BEZPIECZNY):**

**✅ Usuwa:**
- 📄 Kolekcję `affirmation_audio` z Firestore
- 🎵 Pliki MP3 z folderu `audio/` w Storage

**🛡️ Zachowuje:**
- 📁 **WSZYSTKIE** projekty użytkowników
- 💬 **WSZYSTKIE** afirmacje
- 👥 **WSZYSTKIE** grupy
- 👤 Profile użytkowników
- 🔐 Dane uwierzytelniania
- 📊 Dane tracking

### 📁 **Tryb Pełny (Opcja 2 - DESTRUKCYJNY):**

**❌ Usuwa:**
- 📁 **WSZYSTKIE** projekty użytkowników
- 💬 **WSZYSTKIE** afirmacje
- 👥 **WSZYSTKIE** grupy
- 👤 **WSZYSTKIE** profile użytkowników
- 📊 **WSZYSTKIE** dane tracking
- 📄 Kolekcję `affirmation_audio`
- 🎵 Pliki MP3 z Storage

**🛡️ Zachowuje:**
- 🔐 Dane uwierzytelniania (użytkownicy mogą się logować)

## 🔧 Funkcje

### **Automatyczne Wykrywanie:**
- 🔍 Automatycznie znajduje prawdziwą nazwę Firebase Storage bucket
- ⚙️ Wykrywa dostępne narzędzia (gsutil, Firebase CLI)
- 🎯 Adaptuje się do środowiska

### **Inteligentne Czyszczenie Storage:**
1. **Próbuje gsutil** (najlepsze rozwiązanie)
2. **Sprawdza różne nazwy bucket:**
   - `project-id.appspot.com`
   - `project-id.firebasestorage.app`
   - `project-id`
3. **Fallback do instrukcji manual** jeśli automatyczne nie działa

### **Bezpieczeństwo:**
- ✅ Potwierdzenie przed wykonaniem
- ✅ Weryfikacja po czyszczeniu
- ✅ Graceful error handling
- ✅ Szczegółowe logi

## 📊 Przykład Działania

### 🎵 **Tryb Audio (Bezpieczny):**

```bash
./clean-users-data.sh

🧹 Universal User Data Cleanup
🎯 Target Firebase Project: my-affirms
✅ gsutil found - can clean Storage with Google Cloud SDK

🗑️  Available cleanup options:
  📄 Audio: affirmation_audio collection
  📁 Projects: user projects collection
  👥 Groups: user groups collection
  📦 Storage: MP3 files (via gsutil)

⚠️  CHOOSE CLEANUP LEVEL:
  1. 🎵 Audio only (SAFE - keeps projects and groups)
  2. 📁 Projects + Groups + Audio (DESTRUCTIVE - removes user data)
  3. ❌ Cancel

Select option (1/2/3): 1
✅ Selected: Audio cleanup only (SAFE)

🚀 Starting cleanup...

🗑️  Step 1: Cleaning Firestore affirmation_audio collection...
Deleted 14 docs (Infinity docs/s)
✅ Successfully deleted affirmation_audio collection from Firestore

🗑️  Step 2: Cleaning Storage MP3 files...
🔍 Trying bucket: gs://my-affirms.appspot.com
🔍 Trying bucket: gs://my-affirms.firebasestorage.app
✅ Found bucket: gs://my-affirms.firebasestorage.app
🗑️  Deleting files from: gs://my-affirms.firebasestorage.app/audio/
✅ MP3 files deleted from Storage

🔍 Final Step: Verification...
✅ Firestore collection is now empty

🎉 Cleanup completed!

📋 Summary:
  ✅ Audio: affirmation_audio collection cleaned
  ✅ Storage: MP3 files cleaned via gsutil

📝 What's preserved:
  ✅ User authentication data
  ✅ Projects and affirmations
  ✅ Groups and other user data
```

### 📁 **Tryb Pełny (Destrukcyjny):**

```bash
Select option (1/2/3): 2
⚠️  Selected: Full cleanup (DESTRUCTIVE)

🚨 WARNING: This will delete ALL user projects and groups!
   Users will need to recreate all their data

Type 'DELETE ALL PROJECTS' to confirm: DELETE ALL PROJECTS

🚀 Starting cleanup...

🗑️  Step 1: Cleaning user projects and groups...
  📁 Deleting projects collection...
  ✅ Projects deleted
  👥 Deleting groups collection...
  ✅ Groups deleted
  👤 Deleting user profiles...
  ✅ User profiles deleted
  📊 Deleting usage tracking...
  ✅ Usage tracking deleted

🗑️  Step 2: Cleaning Firestore affirmation_audio collection...
✅ Successfully deleted affirmation_audio collection from Firestore

🗑️  Step 3: Cleaning Storage MP3 files...
✅ MP3 files deleted from Storage

🔍 Final Step: Verification...
✅ Firestore collection is now empty

🎉 Cleanup completed!

📋 Summary:
  ✅ Projects: All user projects deleted
  ✅ Groups: All user groups deleted
  ✅ Profiles: User profiles deleted
  ✅ Tracking: Usage tracking deleted
  ✅ Audio: affirmation_audio collection cleaned
  ✅ Storage: MP3 files cleaned via gsutil

📝 What's preserved:
  ✅ User authentication data
  ⚠️  Projects and groups: DELETED
  ⚠️  User profiles: DELETED
```

## 🛠️ Wymagania

### **Wymagane:**
- Firebase CLI (`npm install -g firebase-tools`)
- Zalogowanie do Firebase (`firebase login`)

### **Opcjonalne (ale zalecane):**
- Google Cloud SDK (`brew install google-cloud-sdk`)
- Autoryzacja gsutil (`gcloud auth login`)

## 🔧 Rozwiązywanie Problemów

### **"Firebase CLI not found"**
```bash
npm install -g firebase-tools
firebase login
```

### **"Not logged in to Firebase"**
```bash
firebase login
```

### **"Could not find Firebase Storage bucket"**
1. Sprawdź Firebase Console: `https://console.firebase.google.com/project/PROJECT_ID/storage`
2. Zaloguj się do Google Cloud:
   ```bash
   gcloud auth login
   gcloud config set project PROJECT_ID
   gcloud auth application-default login
   ```

### **"gsutil not available"**
```bash
# macOS:
brew install google-cloud-sdk

# Lub pobierz z:
# https://cloud.google.com/sdk/docs/install
```

## 🎯 Kiedy Używać

### **Idealny Do:**
- 🔄 Regeneracji wszystkich plików audio
- 🧪 Czyszczenia przed testami audio
- 🛠️ Rozwiązywania problemów z audio
- 📦 Czyszczenia orphaned files

### **Bezpieczny Ponieważ:**
- ✅ Nie dotyka projektów użytkowników
- ✅ Nie usuwa afirmacji
- ✅ Audio regeneruje się automatycznie
- ✅ Użytkownicy mogą dalej korzystać z app

## 🔄 Po Czyszczeniu

1. **Audio będzie regenerowane** automatycznie gdy użytkownik:
   - Edytuje afirmację
   - Rozpoczyna sesję
   - Importuje nowe projekty

2. **Użytkownicy mogą normalnie korzystać** z aplikacji
3. **Wszystkie dane projektów pozostają** nienaruszone

## 📝 Notatki

- Skrypt jest **niedestrukcyjny** dla głównych danych
- **Regeneracja audio** jest automatyczna
- **Storage cleanup** wymaga gsutil dla pełnej funkcjonalności
- **Manual cleanup** zawsze dostępny przez Firebase Console

---

## 🆚 Porównanie z Innymi Skryptami

| Funkcja | `clean-users-data.sh` | `clean-dev-data.sh` | `clean-all-data.sh` |
|---------|----------------------|-------------------|-------------------|
| **Bezpieczeństwo** | 🟢 Wysokie | 🔴 Niskie | 🔴 Bardzo niskie |
| **Projekty** | ✅ Zachowane | ❌ Usunięte | ❌ Usunięte |
| **Audio** | ❌ Usunięte | ❌ Usunięte | ❌ Usunięte |
| **Regeneracja** | ✅ Automatyczna | ❌ Manual | ❌ Manual |
| **Użycie** | Codzienne | Development | Reset kompletny |