# 🚀 My Affirms - Przewodnik Deweloperski

## 📋 Spis Treści
1. [Szybki Start](#szybki-start)
2. [Architektura Aplikacji](#architektura-aplikacji)
3. [Konfiguracja Środowiska](#konfiguracja-środowiska)
4. [Struktura Kodu](#struktura-kodu)
5. [Najlepsze Praktyki](#najlepsze-praktyki)
6. [Testowanie](#testowanie)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## 🚀 Szybki Start

### Wymagania Systemowe
- **Node.js**: 18.0.0 lub nowszy
- **npm**: 9.0.0 lub nowszy
- **Git**: Najnowsza wersja
- **Firebase CLI**: `npm install -g firebase-tools`

### Instalacja w 5 Krokach

```bash
# 1. Klonowanie repozytorium
git clone https://github.com/your-username/my-affirms.git
cd my-affirms

# 2. Instalacja zależności
npm install

# 3. Konfiguracja środowiska
cp .env.example .env
# Edytuj .env z właściwymi kluczami

# 4. Uruchomienie emulatorów Firebase
npm run dev:emulators

# 5. Start aplikacji (w nowym terminalu)
npm run dev
```

### Pierwsze Uruchomienie
1. Otwórz http://localhost:3000
2. Kliknij "Login with Google"
3. Utwórz pierwszy projekt
4. Dodaj kilka afirmacji
5. Przetestuj sesję audio

## 🏗️ Architektura Aplikacji

### Wzorce Architektoniczne

#### 1. Composition API Pattern
```javascript
// composables/useAffirmationManager.js
export const useAffirmationManager = () => {
  // Logika biznesowa oddzielona od UI
  const createAffirmation = async (projectId, text, options) => {
    // Walidacja → Zapis → Audio generation
  }
  
  return { createAffirmation, updateAffirmation, deleteAffirmation }
}
```

#### 2. Repository Pattern
```javascript
// composables/useFirestore.js
export const useFirestore = () => {
  // Abstrakcja nad Firebase operations
  const updateProject = async (projectId, data) => {
    // Firebase-specific logic hidden
  }
  
  return { updateProject, getProject, deleteProject }
}
```

#### 3. Strategy Pattern (TTS)
```javascript
// composables/useTextToSpeech.js
const speak = async (text, options) => {
  if (isAiTtsEnabled.value) {
    return await speakWithAiTts(text, options)
  } else {
    return await speakWithWebSpeech(text, options)
  }
}
```

### Przepływ Danych

```mermaid
graph TD
    A[User Action] --> B[Vue Component]
    B --> C[Composable]
    C --> D[Firebase/API]
    D --> E[Real-time Update]
    E --> F[Reactive UI]
```

## ⚙️ Konfiguracja Środowiska

### Zmienne Środowiskowe (.env)

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=my-affirms
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@my-affirms.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Google Cloud TTS
GOOGLE_CLOUD_API_KEY=AIzaSyC-your-actual-key-here

# Paddle Payment System
PADDLE_ENVIRONMENT=sandbox
PADDLE_SELLER_ID=your_seller_id
PADDLE_WEBHOOK_SECRET=your_webhook_secret
PADDLE_PREMIUM_MONTHLY_PRICE_ID=your_price_id

# Development
NODE_ENV=development
NUXT_PUBLIC_APP_VERSION=1.0.0
```

### Firebase Emulators Setup

```bash
# firebase.json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

## 📁 Struktura Kodu

### Organizacja Plików

```
my-affirms/
├── 📁 components/           # Vue Components
│   ├── 🎵 AudioControls/    # Audio playback controls
│   ├── ⚙️ SessionSettings/  # Session configuration
│   ├── 📊 CharacterUsage/   # Premium usage tracking
│   └── 🌐 LanguageSwitcher/ # I18n language picker
│
├── 📁 composables/          # Business Logic (Composition API)
│   ├── 🎯 useAffirmationManager.js  # CRUD operations
│   ├── 🎵 useAudioManager.js        # Audio generation/storage
│   ├── 🗣️ useTextToSpeech.js        # TTS engines
│   ├── 👤 useAuth.js               # Authentication
│   ├── 🗄️ useFirestore.js          # Database operations
│   ├── 💎 useSubscription.js       # Premium features
│   └── 📁 audio/                   # Audio-specific composables
│
├── 📁 pages/               # Nuxt.js Routes
│   ├── 🏠 index.vue        # Redirect to landing
│   ├── 🎯 landing.vue      # Marketing page
│   ├── 🔐 auth.vue         # Login/Register
│   ├── 📱 app.vue          # Main dashboard
│   ├── 📁 project/[id].vue # Project details
│   ├── 📁 session/[id].vue # Audio session
│   ├── ⚙️ admin.vue        # Admin panel
│   └── 💳 subscription.vue # Premium management
│
├── 📁 server/api/          # Backend Endpoints
│   ├── 🗣️ tts.post.js      # Google Cloud TTS
│   ├── 📁 audio/           # Audio operations
│   │   ├── merge.post.js   # Audio merging
│   │   ├── upload.post.js  # File uploads
│   │   └── proxy.get.js    # Audio proxy
│   └── 📁 subscription/    # Payment webhooks
│
├── 📁 locales/            # I18n Translations (25+ languages)
│   ├── 🇵🇱 pl.json        # Polish
│   ├── 🇬🇧 en.json        # English
│   ├── 🇩🇪 de.json        # German
│   └── ...                # 22+ more languages
│
└── 📁 utils/              # Helper Functions
    ├── version.js         # Version management
    └── ...
```

### Konwencje Nazewnictwa

#### Pliki i Foldery
- **Components**: PascalCase (`AudioControls.vue`)
- **Composables**: camelCase z prefixem `use` (`useAffirmationManager.js`)
- **Pages**: kebab-case (`session-settings.vue`)
- **API Routes**: kebab-case (`tts.post.js`)

#### Zmienne i Funkcje
```javascript
// ✅ Dobre
const isAudioPlaying = ref(false)
const createNewProject = async () => {}
const AUDIO_CACHE_DURATION = 3600000

// ❌ Złe
const audioplay = ref(false)
const newproj = async () => {}
const cache_time = 3600000
```

## 🎯 Najlepsze Praktyki

### 1. Composables Design

```javascript
// ✅ Dobry composable
export const useAffirmationManager = () => {
  // 1. Reactive state
  const isLoading = ref(false)
  const error = ref(null)
  
  // 2. Business logic
  const createAffirmation = async (projectId, text, options = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Validation
      const validatedText = validateAffirmationText(text)
      
      // Business logic
      const result = await performCreate(projectId, validatedText, options)
      
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // 3. Return interface
  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Actions
    createAffirmation,
    updateAffirmation,
    deleteAffirmation
  }
}
```

### 2. Error Handling

```javascript
// ✅ Comprehensive error handling
try {
  const result = await riskyOperation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  
  // User-friendly error messages
  const userMessage = getUserFriendlyMessage(error)
  
  // Track errors for monitoring
  trackError(error, { context: 'affirmation-creation' })
  
  return { success: false, error: userMessage }
}
```

### 3. Performance Optimization

```javascript
// ✅ Lazy loading i code splitting
const AdminPanel = defineAsyncComponent(() => import('~/components/AdminPanel.vue'))

// ✅ Computed properties dla expensive operations
const filteredAffirmations = computed(() => {
  return affirmations.value.filter(aff => aff.isActive)
})

// ✅ Debouncing dla user input
const debouncedSearch = useDebounceFn(searchAffirmations, 300)
```

### 4. Type Safety (JSDoc)

```javascript
/**
 * Creates a new affirmation in the specified project
 * @param {string} projectId - The project ID
 * @param {string} text - The affirmation text (3-1000 chars)
 * @param {Object} options - Additional options
 * @param {boolean} options.autoGenerateAudio - Generate audio automatically
 * @param {string} options.voiceId - Voice ID for TTS
 * @returns {Promise<{success: boolean, affirmation?: Object, error?: string}>}
 */
const createAffirmation = async (projectId, text, options = {}) => {
  // Implementation
}
```

## 🧪 Testowanie

### Unit Tests (Playwright)

```javascript
// tests/affirmation-manager.spec.js
import { test, expect } from '@playwright/test'

test.describe('Affirmation Manager', () => {
  test('should create affirmation with valid text', async ({ page }) => {
    await page.goto('/app')
    await page.click('[data-testid="create-project"]')
    await page.fill('[data-testid="project-name"]', 'Test Project')
    await page.click('[data-testid="save-project"]')
    
    await page.fill('[data-testid="affirmation-text"]', 'I am confident and strong')
    await page.click('[data-testid="add-affirmation"]')
    
    await expect(page.locator('[data-testid="affirmation-item"]')).toContainText('I am confident and strong')
  })
})
```

### Integration Tests

```javascript
// tests/tts-integration.spec.js
test('should generate audio with Google Cloud TTS', async ({ page }) => {
  // Mock API response
  await page.route('/api/tts', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, audioContent: 'base64audio...' })
    })
  })
  
  await page.goto('/session/test-project')
  await page.click('[data-testid="play-session"]')
  
  await expect(page.locator('[data-testid="audio-player"]')).toBeVisible()
})
```

### Test Commands

```bash
# Wszystkie testy
npm run test:e2e

# Specific test file
npm run test:e2e tests/affirmation-manager.spec.js

# Debug mode
npm run test:e2e -- --debug

# Headed mode (z UI)
npm run test:e2e -- --headed
```

## 🚀 Deployment

### Production Build

```bash
# 1. Build aplikacji
npm run build

# 2. Preview lokalnie
npm run preview

# 3. Deploy do Firebase
firebase deploy
```

### Environment-Specific Configs

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-only
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
    
    // Client-exposed
    public: {
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID
      }
    }
  }
})
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
      
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: my-affirms
```

## 🔧 Troubleshooting

### Częste Problemy

#### 1. Firebase Connection Issues
```bash
# Problem: "Firebase project not found"
# Rozwiązanie:
firebase login
firebase use my-affirms
firebase emulators:start
```

#### 2. TTS API Errors
```bash
# Problem: "API key not valid"
# Sprawdź:
echo $GOOGLE_CLOUD_API_KEY
# Upewnij się, że klucz jest w .env i ma odpowiednie uprawnienia
```

#### 3. Build Errors
```bash
# Problem: "Module not found"
# Rozwiązanie:
rm -rf node_modules package-lock.json
npm install
```

#### 4. Audio Playback Issues
```javascript
// Problem: Audio nie gra w niektórych przeglądarkach
// Rozwiązanie: Sprawdź autoplay policy
const playAudio = async () => {
  try {
    await audio.play()
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // Pokaż user interaction prompt
      showPlayButton()
    }
  }
}
```

### Debug Tools

```javascript
// Development helpers
if (process.dev) {
  // Global debug helpers
  window.debugAffirmations = () => console.log(affirmations.value)
  window.debugAudio = () => console.log(audioManager.getCacheInfo())
  window.debugSubscription = () => console.log(subscription.value)
}
```

### Monitoring i Logi

```javascript
// composables/useLogger.js
export const useLogger = () => {
  const log = (level, message, context = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // Development: Console
    if (process.dev) {
      console[level](message, context)
    }
    
    // Production: Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      sendToMonitoring(logEntry)
    }
  }
  
  return { log, error: (msg, ctx) => log('error', msg, ctx) }
}
```

---

## 📚 Dodatkowe Zasoby

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Nuxt 3 Documentation](https://nuxt.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud TTS API](https://cloud.google.com/text-to-speech/docs)
- [Paddle Developer Docs](https://developer.paddle.com/)

---

*Ostatnia aktualizacja: Grudzień 2024*
*Wersja przewodnika: 1.0*