# Refactoring Status - Web App Imports

## ✅ ZAKOŃCZONE

### Shared Library
- ✅ Utworzono `@my-affirms/shared` z wszystkimi modułami
- ✅ Firebase composables w `shared/firebase/`
- ✅ TTS logika w `shared/tts/`
- ✅ Validators w `shared/validators/`
- ✅ Utils w `shared/utils/`
- ✅ Config (ESLint, Prettier) w `shared/config/`

### Web App Package Configuration
- ✅ Zaktualizowano `web-app/package.json` z dependency na `@my-affirms/shared`
- ✅ Skonfigurowano ESLint extending shared config
- ✅ Skonfigurowano Prettier extending shared config

### Composables Refactoring (CZĘŚCIOWO)
- ✅ `useFirestore.js` - dodano import COLLECTIONS, STORAGE_PATHS
- ✅ `useFirestore.js` - zaktualizowano collection names do używania COLLECTIONS
- ✅ `useTextToSpeech.js` - dodano import shared TTS config
- ❌ `useProjectManager.js` - wymaga aktualizacji importu useFirestore
- ❌ `useGroupManager.js` - wymaga aktualizacji importu useFirestore
- ❌ `useAffirmationManager.js` - wymaga dodania validators z shared

## 🔄 DO DOKOŃCZENIA

### 1. Composables Internal Imports
```bash
# Te pliki wymagają aktualizacji:
web-app/composables/useProjectManager.js
web-app/composables/useGroupManager.js
web-app/composables/useAffirmationManager.js
web-app/composables/useSessionAudioManager.js
web-app/composables/useSessionSettings.js
```

### 2. Pages i Components
```bash
# Sprawdzić importy w:
web-app/pages/*.vue
web-app/components/*.vue
web-app/plugins/*.js
```

### 3. Konkretne Aktualizacje Potrzebne

#### useProjectManager.js
```javascript
// ZMIENIĆ:
import { useFirestore } from './useFirestore'
// NA:
import { useFirestore } from '@my-affirms/shared'
```

#### useGroupManager.js
```javascript
// ZMIENIĆ:
import { useFirestore } from './useFirestore'
// NA:
import { useFirestore } from '@my-affirms/shared'
```

#### useAffirmationManager.js
```javascript
// DODAĆ:
import { validateAffirmationText, validateAffirmationData } from '@my-affirms/shared'
```

### 4. Pages/Components Updates
Sprawdzić wszystkie pliki .vue czy używają:
- `~/composables/useAuth` → `@my-affirms/shared`
- `~/composables/useFirestore` → `@my-affirms/shared`
- `~/composables/useTextToSpeech` → `@my-affirms/shared`

## 🛠️ Komendy do Wykonania

```bash
# 1. Dokończ refactoring composables
find web-app/composables -name "*.js" -exec sed -i 's|from '\''./useFirestore'\''|from '\''@my-affirms/shared'\''|g' {} \;

# 2. Sprawdź importy w pages
grep -r "~/composables/use" web-app/pages/

# 3. Sprawdź importy w components  
grep -r "~/composables/use" web-app/components/

# 4. Test aplikacji
cd web-app && yarn dev
```

## 📋 Checklist

- [ ] Zaktualizować wszystkie internal imports w composables/
- [ ] Sprawdzić i zaktualizować importy w pages/
- [ ] Sprawdzić i zaktualizować importy w components/
- [ ] Sprawdzić i zaktualizować importy w plugins/
- [ ] Przetestować aplikację web-app
- [ ] Przetestować build aplikacji
- [ ] Sprawdzić czy wszystkie funkcje działają

## 🎯 Cel Końcowy

Wszystkie importy powinny używać `@my-affirms/shared` zamiast lokalnych ścieżek, co umożliwi:
- Współdzielenie logiki między web-app i mobile-app
- Łatwiejsze maintenance
- Lepszą organizację kodu
- Type safety (w przyszłości z TypeScript)