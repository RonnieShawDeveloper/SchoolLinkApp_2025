---
description: Deploy the SchoolLink Cloud Function safely
---
# Deploy SchoolLink Cloud Function

// turbo-all

## ⚠️ CRITICAL WARNING ⚠️

This Firebase project (`bbms-1283c`) hosts functions for **MULTIPLE APPLICATIONS**:
- **SchoolLink** (this app) - `SchoolLinkEMIS`
- **BBMS** (Bail Bond Management System) - `emailMagistrate`, `emailBond`, etc.

**NEVER** run `firebase deploy --only functions` as it will **DELETE** all other production functions!

---

## Pre-Deployment Checklist

1. Verify you are in the correct project directory:
   ```bash
   cd h:\Projects\Angular Projects\SchoolLinkApp_2025
   ```

2. Check Firebase login status:
   ```bash
   npx firebase-tools login:list
   ```

3. Confirm the active Firebase project is correct:
   ```bash
   npx firebase-tools use
   ```
   Expected output: `bbms-1283c`

---

## Deployment Steps

4. Navigate to the functions directory:
   ```bash
   cd functions
   ```

5. Install dependencies (if needed):
   ```bash
   npm install
   ```

6. Build the TypeScript project:
   ```bash
   npm run build
   ```

7. Deploy **ONLY** the SchoolLinkEMIS function:
   ```bash
   npx firebase-tools deploy --only functions:SchoolLinkEMIS
   ```

---

## Post-Deployment Verification

8. Verify the function is deployed and running:
   ```bash
   npx firebase-tools functions:list
   ```

9. Test the function endpoint (optional):
   - Base URL: `https://us-central1-bbms-1283c.cloudfunctions.net/SchoolLinkEMIS`
   - Test login: POST to `/login` with test credentials

---

## Rollback (if needed)

If something goes wrong, you can view previous versions in the Firebase Console:
- Go to: https://console.firebase.google.com/project/bbms-1283c/functions
- Check the function logs for any errors
