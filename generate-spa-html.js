const fs = require('fs');
const path = require('path');

// Find the main entry JS and CSS files from the actual build output
const nuxtDir = path.join(__dirname, '.output/public/_nuxt');
let entryFile = 'entry.js'; // fallback
let entryCssFile = 'entry.css'; // fallback
let buildId = '';

try {
  // Find the largest JS file (likely the main entry)
  const jsFiles = fs.readdirSync(nuxtDir)
    .filter(file => file.endsWith('.js') && !file.includes('error'))
    .map(file => {
      const filePath = path.join(nuxtDir, file);
      const stats = fs.statSync(filePath);
      return { name: file, size: stats.size };
    })
    .sort((a, b) => b.size - a.size);
  
  if (jsFiles.length > 0) {
    entryFile = jsFiles[0].name;
  }

  // Find the main entry CSS file
  const cssFiles = fs.readdirSync(nuxtDir)
    .filter(file => file.startsWith('entry.') && file.endsWith('.css'))
    .sort();
  
  if (cssFiles.length > 0) {
    entryCssFile = cssFiles[0];
  }

  // Try to get buildId from latest.json
  const latestPath = path.join(nuxtDir, 'builds/latest.json');
  if (fs.existsSync(latestPath)) {
    const latest = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
    buildId = latest.id || '';
  }
} catch (e) {
  console.log('Could not read nuxt directory, using fallback file names');
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Affirms - Affirmations App</title>
    <meta name="description" content="Stwórz, organizuj i odtwarzaj pozytywne afirmacje. Zmień swoje życie z My Affirms.">
    
    <!-- App Icons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/svg+xml" href="/icon.svg">
    <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png">
    <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.webmanifest">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Poppins:wght@300;400;500;600;700&display=swap">
    
    <!-- Theme Color -->
    <meta name="theme-color" content="#1e40af">
    <meta name="msapplication-TileColor" content="#1e40af">
    
    <!-- Main CSS -->
    <link rel="stylesheet" href="/_nuxt/${entryCssFile}">
    
    <!-- Runtime Config -->
    <script>
        window.__NUXT__ = window.__NUXT__ || {};
        window.__NUXT__.config = {
            app: {
                baseURL: '/',
                buildAssetsDir: '/_nuxt/',
                buildId: '${buildId}',
                cdnURL: ''
            },
            public: {
                paddleEnvironment: 'sandbox',
                paddleSellerId: '',
                firebaseConfig: {
                    apiKey: "AIzaSyC4Pu_lq-5WKcvJzPRlHy2KaYdcpJ5rCPI",
                    authDomain: "my-affirms.firebaseapp.com",
                    projectId: "my-affirms",
                    storageBucket: "my-affirms.appspot.com",
                    messagingSenderId: "123456789",
                    appId: "1:123456789:web:abcdef"
                },
                i18n: {
                    baseUrl: '',
                    defaultLocale: 'en',
                    defaultDirection: 'ltr',
                    strategy: 'prefix_except_default',
                    lazy: true,
                    rootRedirect: '',
                    routesNameSeparator: '___',
                    defaultLocaleRouteNameSuffix: 'default',
                    skipSettingLocaleOnNavigate: false,
                    differentDomains: false,
                    trailingSlash: false,
                    configLocales: [
                        {
                            code: 'en',
                            iso: 'en-US',
                            file: 'en.json'
                        },
                        {
                            code: 'pl',
                            iso: 'pl-PL',
                            file: 'pl.json'
                        },
                        {
                            code: 'de',
                            iso: 'de-DE',
                            file: 'de.json'
                        }
                    ],
                    locales: {
                        en: { domain: null },
                        pl: { domain: null },
                        de: { domain: null }
                    },
                    detectBrowserLanguage: {
                        alwaysRedirect: false,
                        cookieCrossOrigin: false,
                        cookieDomain: null,
                        cookieKey: 'i18n_redirected',
                        cookieSecure: false,
                        fallbackLocale: '',
                        redirectOn: 'root',
                        useCookie: true
                    },
                    experimental: {
                        jsTsFormatResource: false
                    },
                    multiDomainLocales: false
                }
            }
        };
    </script>
</head>
<body>
    <!-- Nuxt App Mount Point -->
    <div id="__nuxt">
        <!-- Loading Placeholder -->
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif;">
            <div style="text-align: center;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #1e40af; border-radius: 50%; border-top-color: transparent; animation: spin 1s ease-in-out infinite; margin-bottom: 16px;"></div>
                <div style="color: #1e40af; font-size: 18px; font-weight: 500;">Loading My Affirms...</div>
            </div>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    </div>
    
    <!-- Main App Script -->
    <script type="module" src="/_nuxt/${entryFile}"></script>
</body>
</html>`;

// Write the 200.html file
const outputPath = path.join(__dirname, '.output/public/200.html');
fs.writeFileSync(outputPath, html);
console.log(`Generated 200.html with entry JS: ${entryFile}, CSS: ${entryCssFile}`);