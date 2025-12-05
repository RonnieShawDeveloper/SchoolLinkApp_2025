# Firebase Functions Deployment Guide

## ⚠️ CRITICAL WARNING ⚠️

**DO NOT RUN `firebase deploy` OR `firebase deploy --only functions`**

This Firebase project (`bbms-1283c`) hosts functions for multiple applications (SchoolLink and BBMS). The local source code in this directory **ONLY** contains the `SchoolLinkEMIS` function.

If you run a standard deploy, **IT WILL DELETE ALL OTHER EXISTING FUNCTIONS IN THE CLOUD** (e.g., `emailMagistrate`, `emailBond`, etc.).

## ✅ Correct Deployment Command

To deploy changes to the SchoolLink API, you **MUST** use the following command to deploy *only* the specific function:

```bash
firebase deploy --only functions:SchoolLinkEMIS
```

## Project Structure

- `src/index.ts`: Contains the `SchoolLinkEMIS` function.
- **BBMS Functions**: These are hosted in the same Firebase project but are NOT present in this local codebase. They must be preserved.
