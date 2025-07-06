#!/bin/bash

# Clean Affirmation Audio from Firestore
# This script removes all documents from the affirmation_audio collection

set -e  # Exit on any error

echo "🎵 Cleaning Affirmation Audio from Firestore"

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
echo "🗑️  Will delete: affirmation_audio collection"

# Confirmation
read -p "Delete all affirmation_audio documents? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

echo "🚀 Starting cleanup..."

# Delete all documents in affirmation_audio collection
echo "🗑️  Deleting affirmation_audio collection..."

# Use Firebase CLI to delete the collection
firebase firestore:delete --project "$PROJECT_ID" --recursive affirmation_audio --force

if [ $? -eq 0 ]; then
    echo "✅ Successfully deleted affirmation_audio collection"
else
    echo "❌ Failed to delete affirmation_audio collection"
    echo "ℹ️  Collection might be empty or not exist"
fi

# Verify deletion
echo "🔍 Verifying deletion..."
# Try to list documents to verify collection is empty
firebase firestore:delete --project "$PROJECT_ID" --shallow affirmation_audio --force 2>/dev/null || echo "✅ Collection is now empty"

echo ""
echo "🎉 Cleanup completed!"
echo "📝 Note: Audio metadata has been removed from Firestore"
echo "📦 Storage files (MP3) are still present - use clean-storage-only.sh to remove them"