# My Affirms

My Affirms is a web application for creating, organizing and playing positive affirmations to strengthen self-confidence and motivation.

## Business Idea

The application was created in response to growing demand for tools supporting personal development and wellbeing. My Affirms enables users to:

- **Personalize affirmation practice** - everyone can create affirmations tailored to their goals
- **Systematic practice** - organizing affirmations into thematic projects facilitates regular exercises
- **Accessibility** - the app works in browser and can be installed as PWA on mobile
- **Privacy** - user data is stored securely in Firebase

The application has monetization potential through:
- Freemium model (basic features free, advanced paid)
- Premium subscriptions with additional features (more projects, analytics, export)
- Integrations with other wellness applications

## Features

### Project Management
- Create thematic projects (e.g. "Self-confidence", "Career", "Health")
- Edit project names
- Copy projects
- Delete projects with confirmation

### Affirmations
- Add custom affirmations to projects
- Edit and delete affirmations
- View all affirmations in project

### Playback Sessions
- Play affirmations using Web Speech API
- Configure speed and pauses between affirmations
- Random or sequential mode
- Pause and resume sessions

### Technical Features
- User authentication via Google
- Data synchronization between devices
- Offline mode with local storage
- Progressive Web App (PWA) - mobile installation
- Responsive design

## Technology Stack

- **Frontend**: Vue.js 3 + Nuxt 3
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Hosting**: Netlify
- **PWA**: Vite PWA plugin

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
│   └── useFirestore.js    # Database operations
├── stores/
│   └── affirmations.js    # Application state (Pinia)
├── middleware/
│   └── auth.js            # Authentication middleware
└── plugins/
    └── firebase.client.js # Firebase initialization
```

## Installation and Setup

### Requirements
- Node.js 18+
- Firebase account with Authentication and Firestore enabled

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