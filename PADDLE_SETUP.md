# Konfiguracja Paddle Payment + Firebase

## Wymagania

1. **Firebase**: Projekt Firebase skonfigurowany z Firestore i Storage
2. **Konto Paddle**: Musisz się zarejestrować na [paddle.com](https://paddle.com)
3. **Konto Sandbox**: Dodatkowe konto sandbox do testów
4. **Zweryfikowana domena**: Dla konta produkcyjnego

## Kroki instalacji

### 1. Rejestracja konta Paddle

1. Idź na [paddle.com](https://paddle.com) i zarejestruj konto
2. Wypełnij wszystkie wymagane informacje o firmie
3. Poczekaj na weryfikację (może potrwać kilka dni)

### 2. Konfiguracja konta Sandbox

1. Utwórz konto sandbox na [sandbox-vendors.paddle.com](https://sandbox-vendors.paddle.com)
2. Potwierdź email
3. Skonfiguruj podstawowe ustawienia

### 3. Utworzenie produktu i ceny

W panelu Paddle (sandbox):

1. Idź do **Products** > **Create Product**
2. Utwórz produkt "MyAffirms Premium"
3. Dodaj cenę miesięczną: 30 PLN
4. Zapisz **Price ID** - będzie potrzebny w konfiguracji

### 4. Konfiguracja API

1. Idź do **Developer Tools** > **Authentication**
2. Utwórz nowy API Key
3. Zapisz **Seller ID** z ustawień konta

### 5. Konfiguracja Webhook

1. Idź do **Developer Tools** > **Notifications**
2. Dodaj nowy webhook endpoint: `https://twoja-domena.com/api/webhook/paddle`
3. Wybierz eventy:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `transaction.completed`
   - `transaction.payment_failed`
4. Zapisz **Webhook Secret**

### 6. Konfiguracja Firebase Service Account

1. W konsoli Firebase idź do Settings > Service Accounts
2. Wygeneruj nowy klucz prywatny (JSON)
3. Skopiuj wartości do `.env`

### 7. Konfiguracja zmiennych środowiskowych

Skopiuj `.env.example` do `.env` i wypełnij:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=my-affirms
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@my-affirms.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----

# Paddle Configuration
PADDLE_ENVIRONMENT=sandbox
PADDLE_SELLER_ID=your_seller_id_here
PADDLE_WEBHOOK_SECRET=your_webhook_secret_here
PADDLE_PREMIUM_MONTHLY_PRICE_ID=your_price_id_here
```

### 8. Konfiguracja Firebase Security Rules

W Firebase Console skonfiguruj Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Subskrypcje - tylko właściciel
    match /subscriptions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Śledzenie użycia - tylko właściciel
    match /usage_tracking/{usageId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
    
    // Audio afirmacji - tylko właściciel
    match /affirmation_audio/{audioId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}
```

I Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 9. Testowanie

1. Uruchom aplikację w trybie deweloperskim
2. Przejdź do `/subscription`
3. Kliknij "Wykup teraz"
4. Użyj testowych danych karty:
   - Numer: `4000000000000002`
   - CVV: `123`
   - Data: dowolna w przyszłości

## Przejście na produkcję

1. Zmień `PADDLE_ENVIRONMENT=live`
2. Zmień wszystkie klucze API na produkcyjne
3. Zaktualizuj webhook URL na produkcyjny
4. Przetestuj płatności z prawdziwymi kartami

## Model subskrypcji

- **Cena**: 30 PLN/miesiąc
- **Limity**:
  - 300,000 znaków premium (Neural/WaveNet voices)
  - 1,200,000 znaków standard (Standard voices)
- **Funkcje**: Dostęp do wszystkich głosów TTS, bez reklam
- **Odnowienie**: Automatyczne co miesiąc

## Koszty głosów

- **Premium (WaveNet)**: $16/1M znaków
- **Standard**: $4/1M znaków
- **Miesięczny koszt przy pełnym wykorzystaniu**: ~$9.60 USD
- **Marża**: ~$13.40 USD (65% marża)

## Wsparcie

- Dokumentacja Paddle: [developer.paddle.com](https://developer.paddle.com)
- Testowe karty: [developer.paddle.com/paddlejs/test-payments](https://developer.paddle.com/paddlejs/test-payments)