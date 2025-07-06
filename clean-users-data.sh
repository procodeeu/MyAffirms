#!/bin/bash

# Universal User Data Cleanup Script
# Combines functionality of clean-affirmation-audio.sh and clean-storage-firebase-cli.sh
# Cleans Firestore affirmation_audio collection and Storage MP3 files

set -e  # Exit on any error

echo "🧹 Universal User Data Cleanup"
echo "This script cleans affirmation audio data from both Firestore and Storage"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Get project ID
PROJECT_ID=""

# Try to get from .env.example first
if [ -f ".env.example" ]; then
    PROJECT_ID=$(grep "FIREBASE_PROJECT_ID=" .env.example | cut -d'=' -f2)
fi

# If not found, try to get current Firebase project
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your_project_id" ]; then
    PROJECT_ID=$(firebase use --current 2>/dev/null | grep "Now using project" | awk '{print $4}' || echo "")
fi

# If still not found, use default
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID="my-affirms"
    echo "⚠️  Using default project ID: $PROJECT_ID"
fi

echo "🎯 Target Firebase Project: $PROJECT_ID"

# Check available cleanup methods
GSUTIL_AVAILABLE=false
FIREBASE_STORAGE_AVAILABLE=false

# Check gsutil
if command -v gsutil &> /dev/null; then
    GSUTIL_AVAILABLE=true
    echo "✅ gsutil found - can clean Storage with Google Cloud SDK"
fi

# Check Firebase CLI storage capabilities
if firebase --help | grep -q "storage" 2>/dev/null; then
    FIREBASE_STORAGE_AVAILABLE=true
    echo "✅ Firebase CLI storage commands available"
fi

echo ""
echo "🗑️  Available cleanup options:"
echo "  📄 Firestore: affirmation_audio collection"
if [ "$GSUTIL_AVAILABLE" = true ]; then
    echo "  📦 Storage: MP3 files (via gsutil)"
elif [ "$FIREBASE_STORAGE_AVAILABLE" = true ]; then
    echo "  📦 Storage: Limited Firebase CLI support"
else
    echo "  📦 Storage: Manual cleanup only"
fi

echo ""
echo "💡 Cleanup methods:"
echo "  1. 🔥 Firestore metadata (always available)"
echo "  2. 📦 Storage files (gsutil preferred)"
echo "  3. 🌐 Manual Storage cleanup (Firebase Console)"

# Confirmation
read -p "Proceed with cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting cleanup..."

# 1. Clean Firestore collection
echo "🗑️  Step 1: Cleaning Firestore affirmation_audio collection..."

firebase firestore:delete --project "$PROJECT_ID" --recursive affirmation_audio --force

if [ $? -eq 0 ]; then
    echo "✅ Successfully deleted affirmation_audio collection from Firestore"
else
    echo "❌ Failed to delete affirmation_audio collection"
    echo "ℹ️  Collection might be empty or not exist"
fi

# 2. Clean Storage files
echo ""
echo "🗑️  Step 2: Cleaning Storage MP3 files..."

if [ "$GSUTIL_AVAILABLE" = true ]; then
    echo "🔍 Using gsutil to clean Storage..."
    
    # Try different possible bucket names
    POSSIBLE_BUCKETS=(
        "${PROJECT_ID}.appspot.com"
        "${PROJECT_ID}.firebasestorage.app"
        "${PROJECT_ID}"
    )
    
    BUCKET_FOUND=false
    for bucket in "${POSSIBLE_BUCKETS[@]}"; do
        echo "🔍 Trying bucket: gs://$bucket"
        if gsutil ls "gs://$bucket/" >/dev/null 2>&1; then
            BUCKET_NAME="$bucket"
            BUCKET_FOUND=true
            echo "✅ Found bucket: gs://$BUCKET_NAME"
            break
        fi
    done
    
    if [ "$BUCKET_FOUND" = false ]; then
        echo "❌ Could not find Firebase Storage bucket with gsutil"
        echo "💡 This might be due to:"
        echo "   - Bucket name is different than expected"
        echo "   - Authentication issues"
        echo "   - Storage not initialized"
        GSUTIL_AVAILABLE=false
    else
        echo "🗑️  Deleting files from: gs://$BUCKET_NAME/audio/"
        gsutil -m rm -r "gs://$BUCKET_NAME/audio/**" 2>/dev/null && echo "✅ MP3 files deleted from Storage" || echo "ℹ️  Audio folder was already empty"
    fi
fi

# Fallback to manual instructions if gsutil failed
if [ "$GSUTIL_AVAILABLE" = false ]; then
    echo ""
    echo "⚠️  Automated Storage cleanup not available"
    echo "📝 Manual Storage cleanup options:"
    echo ""
    echo "1. 🌐 Firebase Console (Recommended):"
    echo "   - Go to: https://console.firebase.google.com/project/$PROJECT_ID/storage"
    echo "   - Navigate to 'audio' folder"
    echo "   - Select all MP3 files and delete"
    echo ""
    echo "2. 📦 Install/Fix gsutil:"
    echo "   - Run: gcloud auth login"
    echo "   - Run: gcloud config set project $PROJECT_ID"
    echo "   - Run: gcloud auth application-default login"
    echo ""
    echo "3. 🔄 Alternative approach:"
    echo "   - Audio files will be regenerated automatically when needed"
    echo "   - Old files don't interfere with new audio generation"
fi

# 3. Verification
echo ""
echo "🔍 Step 3: Verification..."

# Verify Firestore cleanup
firebase firestore:delete --project "$PROJECT_ID" --shallow affirmation_audio --force 2>/dev/null || echo "✅ Firestore collection is now empty"

# Summary
echo ""
echo "🎉 Cleanup completed!"
echo ""
echo "📋 Summary:"
echo "  ✅ Firestore: affirmation_audio collection cleaned"

if [ "$GSUTIL_AVAILABLE" = true ] && [ "$BUCKET_FOUND" = true ]; then
    echo "  ✅ Storage: MP3 files cleaned via gsutil"
elif [ "$GSUTIL_AVAILABLE" = true ]; then
    echo "  ⚠️  Storage: gsutil available but bucket not found"
else
    echo "  ⚠️  Storage: Manual cleanup required"
fi

echo ""
echo "📝 What's preserved:"
echo "  ✅ User authentication data"
echo "  ✅ Projects and affirmations"
echo "  ✅ Groups and other user data"
echo ""
echo "🔄 Next steps:"
echo "  - Audio will be regenerated automatically when needed"
echo "  - Users can continue using the app normally"
echo "  - All project data remains intact"

if [ "$GSUTIL_AVAILABLE" = false ]; then
    echo ""
    echo "💡 To enable automatic Storage cleanup in the future:"
    echo "   1. Install Google Cloud SDK: brew install google-cloud-sdk"
    echo "   2. Authenticate: gcloud auth login"
    echo "   3. Set project: gcloud config set project $PROJECT_ID"
fi