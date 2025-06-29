# Firebase Index Setup

## Required Indexes for Usage Collections

### 1. Index for `usage_tracking` Collection (Current Error)

**Auto-create link:** 
https://console.firebase.google.com/v1/r/project/my-affirms/firestore/indexes?create_composite=ClFwcm9qZWN0cy9teS1hZmZpcm1zL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy91c2FnZV90cmFja2luZy9pbmRleGVzL18QARoLCgd1c2VyX2lkEAEaDgoKY3JlYXRlZF9hdBABGgwKCF9fbmFtZV9fEAE

**Manual setup:**
- Collection: `usage_tracking`
- Fields:
  1. `user_id` (Ascending) 
  2. `created_at` (Ascending)
  3. `__name__` (Ascending)

### 2. Index for `usage` Collection (Previous Error)

**Auto-create link:**
https://console.firebase.google.com/v1/r/project/my-affirms/firestore/indexes?create_composite=Cltwcm9qZWN0cy9teS1hZmZpcm1zL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy91c2FnZS9pbmRleGVzL18QARoLCgd1c2VyX2lkEAEaDgoKY3JlYXRlZF9hdBABGgwKCF9fbmFuZV9fEAE

**Manual setup:**
- Collection: `usage`
- Fields:
  1. `user_id` (Ascending) 
  2. `created_at` (Ascending)
  3. `__name__` (Ascending)

## Quick Fix - Corrected Link

**Click this corrected link to create the `usage_tracking` index:**
https://console.firebase.google.com/v1/r/project/my-affirms/firestore/indexes?create_composite=ClFwcm9qZWN0cy9teS1hZmZpcm1zL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy91c2FnZV90cmFja2luZy9pbmRleGVzL18QARoLCgd1c2VyX2lkEAEaDgoKY3JlYXRlZF9hdBABGgwKCF9fbmFtZV9fEAE

## Manual Setup (Alternative)

Go to Firebase Console → Firestore → Indexes:
https://console.firebase.google.com/v1/r/project/my-affirms/firestore/indexes

Create composite index manually:
- Collection: `usage_tracking`
- Fields:
  1. `user_id` (Ascending)
  2. `created_at` (Ascending) 
  3. `__name__` (Ascending) ← **IMPORTANT: Double underscore + name + double underscore**