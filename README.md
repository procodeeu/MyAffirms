# My Affirms - Monorepo

**My Affirms** to zaawansowana aplikacja do tworzenia, organizowania i odtwarzania pozytywnych afirmacji, dostępna jako aplikacja webowa (Nuxt + Vue) i mobilna (React Native + Expo).

## 🏗️ Architektura Monorepo

```
my-affirms/
├── web-app/           # Aplikacja webowa (Nuxt 3 + Vue 3)
├── mobile-app/        # Aplikacja mobilna (React Native + Expo)
├── shared/            # Wspólna logika, typy, konfiguracja
│   ├── firebase/      # Firebase composables i konfiguracja
│   ├── tts/           # Text-to-Speech logika
│   ├── validators/    # Walidatory danych
│   ├── utils/         # Funkcje pomocnicze
│   └── config/        # ESLint, Prettier konfiguracja
├── package.json       # Yarn Workspaces + TurboRepo
└── turbo.json         # Konfiguracja TurboRepo
```

## 🚀 Szybki Start

### Wymagania
- Node.js 18+
- Yarn 4.0+
- Expo CLI (dla mobile-app)

### Instalacja
```bash
# Klonowanie repozytorium
git clone https://github.com/your-username/my-affirms.git
cd my-affirms

# Instalacja wszystkich zależności
yarn install

# Konfiguracja środowiska
cp .env.example .env
# Edytuj .env z właściwymi kluczami API
```

## 📱 Uruchamianie Aplikacji

### Aplikacja Webowa
```bash
# Development server
yarn dev:web

# Z emulatorami Firebase
yarn workspace @my-affirms/web-app run dev:full

# Build produkcyjny
yarn build:web
```

### Aplikacja Mobilna
```bash
# Development server
yarn dev:mobile

# Android
yarn workspace @my-affirms/mobile-app run android

# iOS
yarn workspace @my-affirms/mobile-app run ios

# Web (Expo Web)
yarn workspace @my-affirms/mobile-app run web
```

### Wszystkie Aplikacje
```bash
# Uruchom wszystkie w trybie dev
yarn dev

# Build wszystkich
yarn build

# Linting wszystkich
yarn lint
```

## 🛠️ Komendy TurboRepo

```bash
# Development
yarn dev:web          # Tylko web-app
yarn dev:mobile       # Tylko mobile-app
yarn dev              # Wszystkie aplikacje

# Build
yarn build            # Build wszystkich
yarn build:web        # Tylko web-app
yarn build:mobile     # Tylko mobile-app

# Linting i formatowanie
yarn lint             # Lint wszystkich
yarn lint:fix         # Fix wszystkich

# Testowanie
yarn test             # Testy wszystkich
yarn test:e2e         # E2E testy (web-app)

# Czyszczenie
yarn clean            # Wyczyść cache i build artifacts
yarn clean:users      # Wyczyść dane testowe (web-app)
```

## 📦 Workspaces

### @my-affirms/web-app
- **Framework**: Nuxt 3 + Vue 3
- **Styling**: Tailwind CSS
- **Features**: PWA, SSR/SPA, Firebase integration
- **Port**: 3000

### @my-affirms/mobile-app  
- **Framework**: React Native + Expo
- **UI Library**: React Native Paper (Dark Theme)
- **Features**: Cross-platform, Firebase integration
- **Platforms**: iOS, Android, Web

### @my-affirms/shared
- **Firebase**: Composables, konfiguracja, typy
- **TTS**: Text-to-Speech logika i głosy
- **Validators**: Walidacja danych
- **Utils**: Funkcje pomocnicze
- **Config**: ESLint, Prettier

## 🔧 Konfiguracja Środowiska

### Firebase (.env)
```bash
FIREBASE_PROJECT_ID=my-affirms
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@my-affirms.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Google Cloud TTS
```bash
GOOGLE_CLOUD_API_KEY=AIzaSyC-your-actual-key-here
```

### Paddle Payments
```bash
PADDLE_ENVIRONMENT=sandbox
PADDLE_SELLER_ID=your_seller_id
PADDLE_WEBHOOK_SECRET=your_webhook_secret
PADDLE_PREMIUM_MONTHLY_PRICE_ID=your_price_id
```

## 🎨 Design System

### Web App (Tailwind CSS)
- **Primary**: Pastel Purple (#E6E6FA)
- **Secondary**: Pastel Khaki (#F0E68C)
- **Accent**: Pastel Rose (#FFB6C1)
- **Background**: Pastel Vanilla (#F3E5AB)

### Mobile App (React Native Paper Dark)
- **Primary**: #BB86FC (Vibrant Purple)
- **Secondary**: #03DAC6 (Teal)
- **Surface**: #121212 (Dark Gray)
- **Background**: #0A0A0A (Almost Black)
- **Accent Colors**: Colorful and contrasting buttons

## 🔄 Workflow Development

1. **Shared Logic**: Dodaj nowe funkcje do `shared/`
2. **Web App**: Importuj z `@my-affirms/shared`
3. **Mobile App**: Importuj z `@my-affirms/shared`
4. **Testing**: Test w obu aplikacjach
5. **Build**: `yarn build` dla wszystkich

## 📚 Dokumentacja

- **[Web App Setup](./web-app/README.md)** - Szczegóły aplikacji webowej
- **[Mobile App Setup](./mobile-app/README.md)** - Szczegóły aplikacji mobilnej
- **[Shared Library](./shared/README.md)** - Dokumentacja wspólnej biblioteki
- **[Firebase Setup](./FIREBASE_SETUP.md)** - Konfiguracja Firebase
- **[TTS Setup](./GOOGLE_CLOUD_TTS_SETUP.md)** - Google Cloud TTS
- **[Payments Setup](./PADDLE_SETUP.md)** - Paddle integration

## 🧪 Testowanie

```bash
# Unit tests
yarn test

# E2E tests (web-app)
yarn test:e2e

# Linting
yarn lint

# Type checking
yarn workspace @my-affirms/mobile-app run tsc
```

## 🚀 Deployment

### Web App
```bash
yarn build:web
firebase deploy
```

### Mobile App
```bash
# Android
yarn workspace @my-affirms/mobile-app run build:android

# iOS  
yarn workspace @my-affirms/mobile-app run build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**My Affirms** - Transform your mindset with personalized affirmations 🌟