# Google Cloud Text-to-Speech API Setup

## Step-by-step Instructions

### 1. Create a project in Google Cloud Console
1. Go to https://console.cloud.google.com
2. Click "Select a project" and "New Project"
3. Name your project (e.g. "MyAffirms-TTS")
4. Click "Create"

### 2. Enable Google Cloud Text-to-Speech API
1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Cloud Text-to-Speech API"
3. Click on the API and select "ENABLE"

### 3. Create an API key
1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "API key"
3. Copy the generated API key
4. (Optional) Click "RESTRICT KEY" and limit to Text-to-Speech API for security

### 4. Configure the key in your application
1. Open the `.env` file in the project root directory
2. Find the line: `GOOGLE_CLOUD_API_KEY=your_actual_api_key_here`
3. Replace `your_actual_api_key_here` with your actual API key

### 5. Restart the application
```bash
npm run dev
```

## Testing
1. Go to an affirmation session
2. Enable "Use AI TTS (higher voice quality)"
3. Select different voices (Zofia, Marek, Agnieszka)
4. Click "🔊 Test voice" - you should hear clear differences

## Cost
- Google Cloud TTS: ~$4 per 1 million characters
- For normal usage this will be a few cents per month

## Security
- **Never commit API keys to Git**
- The `.env` file is already in `.gitignore`
- In production, use server environment variables

## Troubleshooting
1. **Error 400**: Check if API is enabled
2. **Error 403**: Check API key and restrictions
3. **Error 429**: Rate limit exceeded - wait or increase quota

## Voice Mapping
- **Zofia (Wavenet-A)**: Natural female voice
- **Marek (Wavenet-B)**: Warm male voice  
- **Agnieszka (Wavenet-C)**: Expressive female voice

## Fallback Behavior
If the API key is not configured or there's an error, the system automatically falls back to enhanced Web Speech API with voice parameter simulation.