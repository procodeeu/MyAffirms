# Google Cloud Text-to-Speech - Rozwiazywanie Problemow

**Przewodnik diagnostyki i naprawy problemow z Google Cloud TTS API w My Affirms.**

## Najczestsze Problemy i Rozwiazania

### Problem: Nieprawidlowy Klucz API
**Objaw:** `API key not valid. Please pass a valid API key.`

**Przyczyny:**
- Brak klucza API w zmiennych srodowiskowych
- Nieprawidlowy format klucza
- Klucz nie ma uprawnien do Text-to-Speech API
- Klucz zostal uniewazniony lub wygasl

### Rozwiazanie Krok po Kroku

### 1. Check .env file
Add to `/Users/karol/Documents/GitHub/MyAffirms/.env`:

```
GOOGLE_CLOUD_API_KEY=your_actual_api_key_here
```

### 2. Generate valid API key

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select or create project "my-affirms"
3. Enable Text-to-Speech API:
   - Go to APIs & Services > Library
   - Search "Text-to-Speech API"
   - Click Enable

4. Create API Key:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy the generated key
   - Optionally restrict it to Text-to-Speech API only

5. Add to .env:
   ```
   GOOGLE_CLOUD_API_KEY=AIzaSyC-your-actual-key-here
   ```

### 3. Restart server
```bash
npm run dev
```

### 4. Alternative: Use mock mode
If you don't want to set up Google Cloud, the code will automatically fall back to Web Speech API when no valid key is configured.

## Current Status
- API key is either missing or invalid
- Server is trying to use Google TTS API but failing
- System should fall back to Web Speech API automatically