# API Documentation - My Affirms

## Overview

My Affirms provides several API endpoints for text-to-speech generation, audio processing, and subscription management.

## Authentication

All API endpoints use Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### Text-to-Speech API

#### POST /api/tts

Generates audio from text using Google Cloud Text-to-Speech.

**Request Body:**
```json
{
  "text": "Your affirmation text here",
  "voiceId": "pl-PL-ZofiaNeural",
  "rate": 1.0,
  "pitch": 0.0
}
```

**Response:**
```json
{
  "success": true,
  "audioContent": "base64-encoded-audio-data",
  "characterCount": 25,
  "voiceType": "premium"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "API_KEY_NOT_CONFIGURED",
  "message": "Google Cloud API key not configured"
}
```

### Audio Processing APIs

#### POST /api/audio/merge

Merges multiple audio files into a single file.

**Request Body:**
```json
{
  "audioFiles": [
    {
      "id": "affirmation-1",
      "audioContent": "base64-audio-1"
    },
    {
      "id": "affirmation-2", 
      "audioContent": "base64-audio-2"
    }
  ],
  "pauseBetween": 2000
}
```

#### POST /api/audio/upload

Uploads audio file to Firebase Storage.

**Request Body:**
```json
{
  "audioContent": "base64-audio-data",
  "fileName": "affirmation-123.mp3",
  "userId": "user-id"
}
```

#### GET /api/audio/proxy

Proxies audio files from Firebase Storage with proper headers.

**Query Parameters:**
- `url`: Firebase Storage URL
- `userId`: User ID for authorization

### Subscription APIs

#### POST /api/subscription/create-checkout

Creates Paddle checkout session for premium subscription.

**Request Body:**
```json
{
  "userId": "firebase-user-id",
  "email": "user@example.com",
  "priceId": "paddle-price-id"
}
```

#### POST /api/subscription/cancel

Cancels active subscription.

**Request Body:**
```json
{
  "subscriptionId": "paddle-subscription-id"
}
```

#### POST /api/webhook/paddle

Handles Paddle webhook events for subscription updates.

**Webhook Events:**
- `subscription.created`
- `subscription.updated` 
- `subscription.canceled`
- `transaction.completed`
- `transaction.payment_failed`

## Rate Limits

- **TTS API**: 100 requests/minute per user
- **Audio Processing**: 50 requests/minute per user
- **Subscription APIs**: 10 requests/minute per user

## Error Codes

| Code | Description |
|------|-------------|
| `API_KEY_NOT_CONFIGURED` | Google Cloud API key missing |
| `INVALID_VOICE_ID` | Unsupported voice ID |
| `TEXT_TOO_LONG` | Text exceeds maximum length |
| `USAGE_LIMIT_EXCEEDED` | User exceeded usage limits |
| `SUBSCRIPTION_REQUIRED` | Premium subscription required |
| `INVALID_AUDIO_FORMAT` | Unsupported audio format |
| `STORAGE_ERROR` | Firebase Storage error |
| `WEBHOOK_VERIFICATION_FAILED` | Invalid webhook signature |

## Usage Examples

### JavaScript/TypeScript

```javascript
// TTS Generation
const generateAudio = async (text, voiceId) => {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await user.getIdToken()}`
    },
    body: JSON.stringify({
      text,
      voiceId,
      rate: 1.0,
      pitch: 0.0
    })
  })
  
  const result = await response.json()
  return result
}

// Audio Merging
const mergeAudio = async (audioFiles) => {
  const response = await fetch('/api/audio/merge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await user.getIdToken()}`
    },
    body: JSON.stringify({
      audioFiles,
      pauseBetween: 2000
    })
  })
  
  return await response.json()
}
```

### cURL Examples

```bash
# Generate TTS Audio
curl -X POST https://your-domain.com/api/tts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "text": "I am confident and successful",
    "voiceId": "pl-PL-ZofiaNeural",
    "rate": 1.0,
    "pitch": 0.0
  }'

# Create Subscription Checkout
curl -X POST https://your-domain.com/api/subscription/create-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "userId": "firebase-user-id",
    "email": "user@example.com",
    "priceId": "paddle-price-id"
  }'
```

## SDK Integration

### Vue.js Composable

```javascript
// composables/useApi.js
export const useApi = () => {
  const { user } = useAuth()
  
  const callApi = async (endpoint, options = {}) => {
    const token = await user.value?.getIdToken()
    
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return await response.json()
  }
  
  return { callApi }
}
```

## Monitoring and Analytics

### Request Logging

All API requests are logged with:
- Timestamp
- User ID
- Endpoint
- Response time
- Status code
- Error details (if any)

### Usage Metrics

Track the following metrics:
- TTS character usage per user
- API response times
- Error rates by endpoint
- Subscription conversion rates

### Health Checks

Monitor endpoint health:
- `/api/health` - Basic health check
- `/api/tts/health` - Google Cloud TTS connectivity
- `/api/subscription/health` - Paddle API connectivity

---

*Last updated: December 2024*
*Version: 1.0*