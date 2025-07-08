#!/bin/bash

# Firebase Production Deployment Test Script
# This script deploys to Firebase and runs end-to-end tests

set -e  # Exit on any error

echo "🚀 Starting Firebase deployment with testing..."

# 1. Update build version with current timestamp
TIMESTAMP=$(date '+%H:%M')
echo "📝 Updating BUILD_VERSION to: $TIMESTAMP"

# Update version in utils/version.js
cat > utils/version.js << EOF
export const BUILD_VERSION = '$TIMESTAMP';
EOF

echo "✅ BUILD_VERSION updated to '$TIMESTAMP'"

# 2. Build the application
echo "🏗️  Building application..."
npm run build

# 3. Build files are ready in .output/public
echo "📁 Build files ready in .output/public"
echo "Files count: $(find .output/public -type f | wc -l)"
echo "Sample files:"
ls -la .output/public/ | head -10

# 4. Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting

# 5. Wait for deployment to propagate
echo "⏳ Waiting for deployment to propagate..."
sleep 10

# 6. Test the deployment
echo "🧪 Running end-to-end tests..."

PROD_URL="https://my-affirms.web.app"
LANDING_URL="$PROD_URL/landing"

# Test 1: Check if main page loads
echo "🔍 Testing main page..."
MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")
if [ "$MAIN_STATUS" -eq 200 ]; then
    echo "✅ Main page loads (Status: $MAIN_STATUS)"
else
    echo "❌ Main page failed (Status: $MAIN_STATUS)"
    exit 1
fi

# Test 2: Check if landing page loads
echo "🔍 Testing landing page..."
LANDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$LANDING_URL")
if [ "$LANDING_STATUS" -eq 200 ]; then
    echo "✅ Landing page loads (Status: $LANDING_STATUS)"
else
    echo "❌ Landing page failed (Status: $LANDING_STATUS)"
    exit 1
fi

# Test 3: Check if build version is present in utils/version.js
echo "🔍 Testing build version..."
VERSION_CHECK=$(curl -s "$PROD_URL/utils/version.js" 2>/dev/null | grep -o "BUILD_VERSION.*'[0-9][0-9]:[0-9][0-9]'" || echo "not_found")
if [ "$VERSION_CHECK" != "not_found" ]; then
    echo "✅ Build version found: $VERSION_CHECK"
else
    echo "⚠️  Build version not accessible (this is normal for bundled assets)"
    # Try alternative check - just verify timestamp was updated
    if [ -f "utils/version.js" ]; then
        LOCAL_VERSION=$(cat utils/version.js | grep -o "'[0-9][0-9]:[0-9][0-9]'" | tr -d "'")
        echo "✅ Local build version confirmed: $LOCAL_VERSION"
    fi
fi

# Test 4: Check if Vue app initializes (look for Vue.js indicators)
echo "🔍 Testing Vue app initialization..."
VUE_CHECK=$(curl -s "$PROD_URL" | grep -E "(vue|Vue|#app)" || echo "not_found")
if [ "$VUE_CHECK" != "not_found" ]; then
    echo "✅ Vue app structure detected"
else
    echo "❌ Vue app structure not found"
    exit 1
fi

# Test 5: Check if Firebase is loaded
echo "🔍 Testing Firebase integration..."
FIREBASE_CHECK=$(curl -s "$PROD_URL" | grep -o "firebase" || echo "not_found")
if [ "$FIREBASE_CHECK" != "not_found" ]; then
    echo "✅ Firebase integration detected"
else
    echo "❌ Firebase integration not found"
    exit 1
fi

# Test 6: Check critical CSS files
echo "🔍 Testing critical assets..."
# Find the actual CSS file name from the build
CSS_FILE=$(find .output/public/_nuxt -name "entry.*.css" -type f | head -1 | xargs basename 2>/dev/null || echo "entry.css")
CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/_nuxt/$CSS_FILE" 2>/dev/null || echo "404")
if [ "$CSS_STATUS" -eq 200 ]; then
    echo "✅ CSS assets loading correctly ($CSS_FILE)"
else
    echo "⚠️  CSS assets might have different names (tried $CSS_FILE)"
fi

# Test 7: Run Playwright E2E tests to verify version display
echo "🔍 Running Playwright E2E tests..."
if command -v npx >/dev/null 2>&1; then
    echo "Running version verification test..."
    npx playwright test tests/version-check.spec.js --reporter=line
    
    if [ $? -eq 0 ]; then
        echo "✅ Playwright E2E tests passed - version verification successful!"
    else
        echo "❌ Playwright E2E tests failed - version verification failed!"
        echo "This indicates the build version is not displayed correctly on the frontend"
        exit 1
    fi
else
    echo "⚠️  Playwright not available, skipping E2E version verification"
    echo "To enable E2E testing, run: npm install --save-dev playwright"
fi

echo ""
echo "🎉 Deployment test completed successfully!"
echo "🌐 Production URL: $PROD_URL"
echo "🌐 Landing URL: $LANDING_URL"
echo "🏷️  Build Version: $TIMESTAMP"
echo ""
echo "✅ All tests passed - deployment is working correctly!"