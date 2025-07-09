# My Affirms - Kompletna Dokumentacja Projektu

## Spis Tresci
1. [Przeglad Projektu](#przeglad-projektu)
2. [Architektura Techniczna](#architektura-techniczna)
3. [Funkcjonalnosci](#funkcjonalnosci)
4. [Instalacja i Konfiguracja](#instalacja-i-konfiguracja)
5. [Przewodniki Setup](#przewodniki-setup)
6. [API i Integracje](#api-i-integracje)
7. [Deployment i Maintenance](#deployment-i-maintenance)
8. [Troubleshooting](#troubleshooting)

## Przeglad Projektu

### Opis
My Affirms to zaawansowana aplikacja webowa do tworzenia, organizowania i odtwarzania pozytywnych afirmacji. Aplikacja wspiera rozwoj osobisty poprzez wykorzystanie najnowszych technologii AI Text-to-Speech.

### Kluczowe Cechy
- **Wielojezycznosc**: Obsługa 25+ jezykow europejskich
- **AI Text-to-Speech**: Integracja z Google Cloud TTS (Neural voices)
- **Progressive Web App**: Instalacja na urzadzeniach mobilnych
- **Real-time Sync**: Synchronizacja danych miedzy urzadzeniami
- **Premium System**: Model freemium z subskrypcjami Paddle
- **Offline Mode**: Podstawowe funkcje bez internetu

### Model Biznesowy
- **Freemium**: Podstawowe funkcje za darmo
- **Premium (30 PLN/miesiac)**:
  - 300,000 znakow premium TTS (Neural voices)
  - 1,200,000 znakow standard TTS
  - Unlimited projekty i afirmacje
  - Export/Import danych JSON
  - Background music i zaawansowane audio

## Architektura Techniczna

### Stack Technologiczny

#### Frontend
- **Vue.js 3** - reaktywny framework z Composition API
- **Nuxt 3** - full-stack framework z SSR/SPA
- **Tailwind CSS** - utility-first CSS framework
- **Pinia** - state management
- **Vue I18n** - internationalization
- **Lucide Vue** - ikony SVG

#### Backend & Services
- **Firebase Firestore** - NoSQL baza danych real-time
- **Firebase Authentication** - system logowania Google OAuth
- **Firebase Storage** - przechowywanie plikow audio
- **Google Cloud Text-to-Speech** - AI voices (Neural/WaveNet)
- **Paddle** - system platnosci i subskrypcji

#### DevOps
- **Firebase Hosting** - hosting statyczny z SSL
- **Firebase Emulators** - lokalne srodowisko deweloperskie
- **Playwright** - testy end-to-end
- **GitHub Actions** - CI/CD pipeline (opcjonalnie)

### Struktura Projektu

```
my-affirms/
├── components/              # Komponenty Vue.js
│   ├── AudioControls/       # Kontrolki audio
│   ├── SessionSettings/     # Ustawienia sesji
│   └── UI/                 # Komponenty interfejsu
├── composables/            # Logika biznesowa (Composition API)
│   ├── useAffirmationManager.js  # CRUD afirmacji
│   ├── useAudioManager.js        # System audio
│   ├── useTextToSpeech.js        # TTS engines
│   ├── useAuth.js               # Autentykacja
│   ├── useFirestore.js          # Baza danych
│   └── useSubscription.js       # System premium
├── pages/                  # Strony aplikacji (Nuxt routing)
│   ├── app.vue             # Dashboard glowny
│   ├── session/[id].vue    # Sesja afirmacji
│   ├── admin.vue           # Panel administracyjny
│   └── subscription.vue    # Zarzadzanie subskrypcja
├── server/api/             # API endpoints (Nuxt server)
│   ├── tts.post.js         # Google Cloud TTS
│   ├── audio/              # Operacje audio
│   └── subscription/       # Paddle webhooks
├── locales/               # Pliki tlumaczen (25+ jezykow)
└── public/                # Zasoby statyczne
```

### Kluczowe Composables

#### useAffirmationManager
Zarzadza operacjami CRUD na afirmacjach:
- Walidacja tekstu (3-1000 znakow)
- Automatyczne generowanie audio w tle
- Operacje grupowe (bulk operations)
- Real-time synchronizacja z Firebase

#### useAudioManager
Obsluguje system audio:
- Generowanie plikow audio z tekstu
- Cache'owanie i optymalizacja storage
- Merge wielu afirmacji w jeden plik
- Metadata tracking i cleanup

#### useTextToSpeech
Dual TTS engine:
- Web Speech API (darmowy, podstawowa jakosc)
- Google Cloud TTS (Premium, najwyzsza jakosc AI)
- Fallback mechanisms i error handling
- Usage tracking dla systemu premium

#### useSubscription
System premium:
- Integracja z Paddle payment system
- Monitoring limitow uzycia (znaki TTS)
- Premium features gating
- Webhook handling dla statusu subskrypcji

## Funkcjonalnosci

### Zarzadzanie Projektami
- Tworzenie projektow tematycznych
- Grupy projektow dla lepszej organizacji
- Edycja i kopiowanie projektow
- Import/Export danych JSON
- Bezpieczne usuwanie z potwierdzeniem

### System Afirmacji
- Dodawanie afirmacji z walidacja tekstu
- Edycja w czasie rzeczywistym
- Aktywacja/dezaktywacja afirmacji
- Reorderowanie drag & drop
- Operacje grupowe

### Sesje Audio
- Dual TTS engine (Web Speech + Google Cloud)
- Konfiguracja predkosci mowy (0.5x - 2.0x)
- Pauzy miedzy zdaniami (0-10 sekund)
- Tryb losowy lub sekwencyjny
- Automatyczne powtarzanie (loop mode)

### Glosy AI (Premium)
- Polskie: Zofia, Marek, Agnieszka (Neural/WaveNet)
- 25+ jezykow europejskich z natywnymi glosami
- Test glosow przed wyborem
- Kontrola parametrow glosu (pitch, speed)

### System Audio
- Generowanie audio w tle z cache'owaniem
- Merge audio - laczenie afirmacji w jeden plik
- Background music (natura, medytacja)
- Offline playback
- Storage management

## Instalacja i Konfiguracja

### Wymagania Systemowe
- Node.js 18.0.0+
- npm 9.0.0+
- Firebase CLI
- Git

### Szybka Instalacja

```bash
# Klonowanie i instalacja
git clone https://github.com/your-username/my-affirms.git
cd my-affirms
npm install

# Konfiguracja srodowiska
cp .env.example .env
# Edytuj .env z kluczami API

# Uruchomienie
npm run dev:emulators  # Terminal 1
npm run dev            # Terminal 2
```

### Konfiguracja .env

```bash
# Firebase
FIREBASE_PROJECT_ID=my-affirms
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@my-affirms.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Google Cloud TTS
GOOGLE_CLOUD_API_KEY=AIzaSyC-your-actual-key-here

# Paddle Payments
PADDLE_ENVIRONMENT=sandbox
PADDLE_SELLER_ID=your_seller_id
PADDLE_WEBHOOK_SECRET=your_webhook_secret
PADDLE_PREMIUM_MONTHLY_PRICE_ID=your_price_id
```

## Przewodniki Setup

### Google Cloud Text-to-Speech
1. Utworz projekt w Google Cloud Console
2. Wlacz Text-to-Speech API
3. Wygeneruj klucz API
4. Dodaj klucz do .env
5. Przetestuj funkcjonalnosc

**Szczegoly:** [GOOGLE_CLOUD_TTS_SETUP.md](./GOOGLE_CLOUD_TTS_SETUP.md)

### Firebase Setup
1. Utworz projekt Firebase
2. Wlacz Authentication (Google provider)
3. Skonfiguruj Firestore Database
4. Wlacz Storage
5. Skonfiguruj Hosting

**Szczegoly:** Zobacz sekcje Firebase w README.md

### Paddle Payment System
1. Zarejestruj konto Paddle
2. Skonfiguruj produkty i ceny
3. Utworz webhook endpoints
4. Skonfiguruj Firebase integration
5. Przetestuj platnosci

**Szczegoly:** [PADDLE_SETUP.md](./PADDLE_SETUP.md)

### Firebase Indexes
Skonfiguruj wymagane indeksy dla optymalnej wydajnosci:
- usage_tracking collection
- projects collection
- affirmation_audio collection

**Szczegoly:** [FIREBASE_INDEX_SETUP.md](./FIREBASE_INDEX_SETUP.md)

## API i Integracje

### Text-to-Speech API
```javascript
POST /api/tts
{
  "text": "Jestem pewny siebie",
  "voiceId": "pl-PL-ZofiaNeural",
  "rate": 1.0,
  "pitch": 0.0
}
```

### Audio Processing
```javascript
POST /api/audio/merge
{
  "audioFiles": [...],
  "pauseBetween": 2000
}
```

### Subscription Management
```javascript
POST /api/subscription/create-checkout
{
  "userId": "firebase-user-id",
  "email": "user@example.com"
}
```

## Deployment i Maintenance

### Build Produkcyjny
```bash
npm run build
npm run preview  # Test lokalny
firebase deploy  # Deploy do Firebase
```

### Monitoring
- Firebase Analytics dla user engagement
- Error tracking przez console.error
- Usage metrics dla TTS API
- Performance monitoring

### Backup i Recovery
- Automatyczne backup Firestore
- Export danych uzytkownikow
- Recovery procedures
- Data migration tools

### Skrypty Maintenance
- `npm run clean:users` - czyszczenie danych testowych
- `npm run clean:users-data` - reset srodowiska dev
- Firebase emulators dla lokalnego testowania

**Szczegoly:** [CLEANUP_SCRIPTS.md](./CLEANUP_SCRIPTS.md)

## Troubleshooting

### Najczestsze Problemy

#### 1. TTS API Errors
**Problem:** "API key not valid"
**Rozwiazanie:** 
- Sprawdz klucz w .env
- Upewnij sie ze API jest wlaczone
- Sprawdz uprawnienia klucza

#### 2. Firebase Connection Issues
**Problem:** "Firebase project not found"
**Rozwiazanie:**
```bash
firebase login
firebase use my-affirms
firebase emulators:start
```

#### 3. Audio Playback Issues
**Problem:** Audio nie gra w przegladarce
**Rozwiazanie:**
- Sprawdz autoplay policy
- Wymag user interaction
- Sprawdz format audio

#### 4. Build Errors
**Problem:** "Module not found"
**Rozwiazanie:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Debug Tools
```javascript
// Development helpers
if (process.dev) {
  window.debugAffirmations = () => console.log(affirmations.value)
  window.debugAudio = () => console.log(audioManager.getCacheInfo())
  window.debugSubscription = () => console.log(subscription.value)
}
```

### Logi i Monitoring
- Console logs dla development
- Firebase Analytics dla production
- Error tracking i reporting
- Performance metrics

## Najlepsze Praktyki

### Kod
- Uzywaj Composition API dla logiki biznesowej
- Implementuj proper error handling
- Optymalizuj performance z computed properties
- Uzywaj TypeScript annotations (JSDoc)

### Bezpieczenstwo
- Waliduj wszystkie inputy uzytkownika
- Uzywaj Firebase Security Rules
- Szyfruj sensitive data
- Implementuj rate limiting

### UX/UI
- Responsive design dla wszystkich urzadzen
- Accessibility support
- Progressive enhancement
- Offline capabilities

### Performance
- Lazy loading komponentow
- Audio caching i optimization
- Database query optimization
- CDN dla static assets

---

**Ostatnia aktualizacja:** Grudzien 2024
**Wersja dokumentacji:** 1.0
**Kontakt:** GitHub Issues dla wsparcia technicznego