# My Affirms - Aplikacja do Afirmacji Pozytywnych

**My Affirms** to nowoczesna aplikacja webowa do tworzenia, organizowania i odtwarzania pozytywnych afirmacji, wspierająca rozwój osobisty i wzmacnianie pewności siebie.

## 🎯 Cel Biznesowy

Aplikacja została stworzona w odpowiedzi na rosnące zapotrzebowanie na narzędzia wspierające rozwój osobisty i wellbeing. My Affirms umożliwia użytkownikom:

### 🌟 Kluczowe Korzyści
- **Personalizacja praktyki afirmacji** - każdy może tworzyć afirmacje dopasowane do swoich celów
- **Systematyczna praktyka** - organizowanie afirmacji w projekty tematyczne ułatwia regularne ćwiczenia
- **Dostępność** - aplikacja działa w przeglądarce i może być zainstalowana jako PWA na urządzeniach mobilnych
- **Prywatność** - dane użytkowników są bezpiecznie przechowywane w Firebase
- **Wielojęzyczność** - obsługa 25+ języków europejskich
- **Zaawansowane TTS** - integracja z Google Cloud Text-to-Speech dla najwyższej jakości głosów

### 💰 Model Monetyzacji
- **Freemium** - podstawowe funkcje dostępne za darmo
- **Premium (30 PLN/miesiąc)** - zaawansowane funkcje:
  - Dostęp do głosów Neural/WaveNet (najwyższa jakość AI)
  - 300,000 znaków premium miesięcznie
  - 1,200,000 znaków standard miesięcznie
  - Brak ograniczeń w liczbie projektów
  - Eksport danych
- **Integracje** z innymi aplikacjami wellness

## 🚀 Funkcjonalności

### 📁 Zarządzanie Projektami
- **Tworzenie projektów tematycznych** (np. "Pewność siebie", "Kariera", "Zdrowie")
- **Grupy projektów** - organizacja projektów w kategorie
- **Edycja i kopiowanie** projektów
- **Import/Export** danych w formacie JSON
- **Usuwanie z potwierdzeniem** - bezpieczne zarządzanie danymi

### ✨ System Afirmacji
- **Dodawanie niestandardowych afirmacji** do projektów
- **Edycja i usuwanie** afirmacji w czasie rzeczywistym
- **Aktywacja/dezaktywacja** poszczególnych afirmacji
- **Reorderowanie** afirmacji metodą drag & drop
- **Operacje grupowe** - masowe włączanie/wyłączanie afirmacji
- **Walidacja tekstu** - kontrola długości i poprawności

### 🎵 Sesje Odtwarzania
- **Dual TTS Engine**:
  - Web Speech API (darmowy)
  - Google Cloud TTS (Premium) - najwyższa jakość AI
- **Konfiguracja odtwarzania**:
  - Prędkość mowy (0.5x - 2.0x)
  - Pauzy między zdaniami (0-10 sekund)
  - Tryb losowy lub sekwencyjny
  - Pauza i wznowienie sesji
- **Wybór głosów AI** (Premium):
  - Zofia, Marek, Agnieszka (Neural/WaveNet)
  - Obsługa 25+ języków europejskich
  - Test głosów przed wyborem

### 🎧 Zaawansowany System Audio
- **Generowanie audio** w tle z automatycznym cache'owaniem
- **Merge audio** - łączenie wielu afirmacji w jeden plik
- **Metadata tracking** - śledzenie wygenerowanych plików
- **Storage management** - automatyczne czyszczenie starych plików
- **Background music** - opcjonalna muzyka relaksacyjna

### 👥 Zarządzanie Użytkownikami
- **Autentykacja Google** - bezpieczne logowanie
- **Profile użytkowników** - personalizacja ustawień
- **Synchronizacja między urządzeniami** - dostęp z każdego miejsca
- **System premium** - zarządzanie subskrypcjami Paddle
- **Tracking użycia** - monitorowanie limitów znaków

### 🌍 Wielojęzyczność i Dostępność
- **25+ języków europejskich** (Polski, Angielski, Niemiecki, Francuski, itp.)
- **Progressive Web App (PWA)** - instalacja na urządzeniach mobilnych
- **Responsive design** - optymalizacja dla wszystkich ekranów
- **Offline mode** - podstawowe funkcje bez internetu
- **Accessibility** - wsparcie dla czytników ekranu

### ⚙️ Funkcje Techniczne
- **Real-time synchronizacja** z Firebase Firestore
- **Bezpieczne przechowywanie** w Firebase Storage
- **Admin panel** - zarządzanie aplikacją
- **Monitoring i logi** - śledzenie błędów i wydajności
- **Automatyczne backup** - ochrona przed utratą danych
- **Version control** - śledzenie wersji aplikacji

## 🛠️ Stack Technologiczny

### Frontend
- **Vue.js 3** - reaktywny framework JavaScript
- **Nuxt 3** - full-stack framework z SSR/SPA
- **Tailwind CSS** - utility-first CSS framework
- **Pinia** - state management
- **Vue I18n** - internationalization
- **Lucide Vue** - ikony SVG

### Backend & Services
- **Firebase Firestore** - baza danych NoSQL w czasie rzeczywistym
- **Firebase Authentication** - system logowania Google
- **Firebase Storage** - przechowywanie plików audio
- **Google Cloud Text-to-Speech** - generowanie mowy AI
- **Paddle** - system płatności i subskrypcji

### DevOps & Deployment
- **Nuxt 3 SPA** - Single Page Application
- **Firebase Hosting** - hosting statyczny
- **GitHub Actions** - CI/CD (opcjonalnie)
- **Firebase Emulators** - lokalne środowisko deweloperskie

### Narzędzia Deweloperskie
- **Playwright** - testy end-to-end
- **ESLint** - linting kodu JavaScript
- **Prettier** - formatowanie kodu
- **Firebase Tools** - zarządzanie projektem Firebase

## 📋 Architektura Aplikacji

### 🏗️ Struktura Projektu
```
my-affirms/
├── components/          # Komponenty Vue.js
│   ├── AudioControls/   # Kontrolki audio
│   ├── SessionSettings/ # Ustawienia sesji
│   └── UI/             # Komponenty interfejsu
├── composables/        # Logika biznesowa (Composition API)
│   ├── useAffirmationManager.js  # Zarządzanie afirmacjami
│   ├── useAudioManager.js        # System audio
│   ├── useTextToSpeech.js        # TTS engine
│   ├── useAuth.js               # Autentykacja
│   ├── useFirestore.js          # Baza danych
│   └── useSubscription.js       # System premium
├── pages/              # Strony aplikacji (Nuxt routing)
│   ├── app.vue         # Główna aplikacja
│   ├── session/[id].vue # Sesja afirmacji
│   ├── admin.vue       # Panel administracyjny
│   └── subscription.vue # Zarządzanie subskrypcją
├── server/api/         # API endpoints (Nuxt server)
│   ├── tts.post.js     # Google Cloud TTS
│   ├── audio/          # Operacje audio
│   └── subscription/   # Paddle webhooks
├── locales/           # Pliki tłumaczeń (25+ języków)
└── public/            # Zasoby statyczne
```

### 🔄 Przepływ Danych
1. **Autentykacja** → Google OAuth → Firebase Auth
2. **Dane użytkownika** → Firestore (projekty, afirmacje, ustawienia)
3. **Audio** → Google Cloud TTS → Firebase Storage
4. **Płatności** → Paddle → Webhook → Firestore (subskrypcje)
5. **Synchronizacja** → Real-time listeners → Reactive UI

### 🎯 Kluczowe Composables

#### `useAffirmationManager`
- Zarządzanie CRUD operacjami na afirmacjach
- Walidacja danych wejściowych
- Automatyczne generowanie audio w tle
- Operacje grupowe (bulk operations)

#### `useAudioManager` 
- Generowanie plików audio z tekstu
- Cache'owanie i optymalizacja storage
- Merge wielu afirmacji w jeden plik
- Metadata tracking i cleanup

#### `useTextToSpeech`
- Dual engine: Web Speech API + Google Cloud TTS
- Obsługa 25+ języków i głosów AI
- Fallback mechanisms i error handling
- Usage tracking dla systemu premium

#### `useSubscription`
- Integracja z Paddle payment system
- Monitoring limitów użycia (znaki TTS)
- Premium features gating
- Webhook handling dla statusu subskrypcji

## Project Structure

```
├── pages/
│   ├── index.vue          # Redirect to landing
│   ├── landing.vue        # Main page
│   ├── auth.vue           # Google authentication
│   ├── app.vue            # Projects list (dashboard)
│   ├── project/[id].vue   # Project details and affirmations
│   └── session/[id].vue   # Affirmation playback session
├── components/
│   └── PWAInstallPrompt.vue # PWA installation prompt
├── composables/
│   ├── useAuth.js         # User authentication
│   ├── useFirestore.js    # Database operations
│   ├── usePremium.js      # Premium user management
│   └── useTextToSpeech.js # TTS with Google Cloud integration
├── stores/
│   └── affirmations.js    # Application state (Pinia)
├── middleware/
│   └── auth.js            # Authentication middleware
├── server/
│   └── api/
│       └── tts.post.js    # Google Cloud TTS API endpoint
└── plugins/
    └── firebase.client.js # Firebase initialization
```

## Installation and Setup

### Requirements
- Node.js 18+
- Firebase account with Authentication and Firestore enabled
- Google Cloud account with Text-to-Speech API (for premium features)

### Local Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Run with Firebase emulators
npm run dev:full
```

### Build and Deploy

```bash
# Production build
npm run build

# Preview build
npm run preview

# Generate static site
npm run generate
```

## Premium Features Setup

### Google Cloud Text-to-Speech API
For premium AI voice features, see detailed setup instructions:
[Google Cloud TTS Setup Guide](./GOOGLE_CLOUD_TTS_SETUP.md)

This enables:
- High-quality AI voices (Wavenet)
- Multiple voice characters (Zofia, Marek, Agnieszka)
- Significantly better voice quality than Web Speech API

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Project name: "MyAffirms.com"
4. Project ID: "myaffirms-com" (or leave automatic)
5. Google Analytics: Leave enabled
6. Analytics account: Choose your account or create new
7. Click "Create project"

### Step 2: Configure Web App

After creating the project:

1. In Firebase Console click the `</>` icon (Web)
2. App nickname: "MyAffirms Web App"
3. Check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "myaffirms-com.firebaseapp.com",
  projectId: "myaffirms-com",
  storageBucket: "myaffirms-com.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### Step 3: Authentication Setup

1. In Firebase Console: Build → Authentication
2. Click "Get started"
3. "Sign-in method" tab
4. Enable providers:

#### Google Provider:
- Click Google
- Enable
- Project support email: choose yours
- Save

#### Email/Password Provider:
- Click Email/Password
- Enable first toggle (Email/Password)
- Optionally enable second (Email link - passwordless)
- Save

### Step 4: Firestore Database

1. Build → Firestore Database
2. Create database
3. Start in test mode (for now)
4. Choose location: europe-west3 (Frankfurt) - closest to Poland
5. Done

### Step 5: Storage

1. Build → Storage
2. Get started
3. Start in test mode
4. Choose location: europe-west3 (Frankfurt)
5. Done

### Step 6: Hosting Setup

1. Build → Hosting
2. Get started
3. Next steps will be done from the application

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Google OAuth Setup

### Step 1: Google Cloud Console Setup

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create new project or select existing:
   - Click project dropdown in top menu
   - Click "New Project"
   - Name: "MyAffirms.com"

3. Enable Google Sign-In API:
   - In side menu: APIs & Services → Library
   - Search: "Google Identity"
   - Click "Google Identity" and "Enable"

4. Create OAuth 2.0 credentials:
   - APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If you don't have OAuth consent screen configured:
     - Click "Configure Consent Screen"
     - Choose "External"
     - App name: "MyAffirms.com"
     - User support email: your email
     - Developer contact email: your email
     - Save and Continue (skip other steps)

5. Configure OAuth Client:
   - Application type: "Web application"
   - Name: "MyAffirms.com Localhost"
   - Authorized JavaScript origins: `http://localhost:8080`
   - Authorized redirect URIs: `http://localhost:8080`
   - Click "Create"

6. Copy Client ID:
   - After creation popup will show with Client ID
   - Copy Client ID (long string starting with numbers)

### Step 2: Update Application

Open file `index.html` and find line:
```html
data-client_id="YOUR_GOOGLE_CLIENT_ID"
```

Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID from Google Console.

### Step 3: Test

1. Run server: `python3 -m http.server 8080`
2. Open: http://localhost:8080
3. Click "Sign in with Google" button
4. Login with your Google account
5. Check if you see your photo and name in top right corner

### Features after login:
- Automatic saving of affirmations to localStorage with user ID
- Each user has their own set of affirmations
- Data is preserved between sessions
- Ability to logout and switch accounts

### Security:
- Client ID is public and safe to place in code
- Data is stored locally in browser
- Google verifies user identity

## License

The source code is available under MIT license. The application is an open-source project supporting the personal development community.

## Contact

The application is developed as a commercial project. For business inquiries or collaboration, contact via GitHub Issues.