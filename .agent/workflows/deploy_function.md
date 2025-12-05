---
description: Deploy the SchoolLink Cloud Function safely
---
# Deploy SchoolLink Cloud Function

**CRITICAL WARNING**: This project shares a Firebase environment with other apps.
**NEVER** run `firebase deploy --only functions` as it will delete other production functions.

1. Navigate to the functions directory:
   ```bash
   cd functions
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy **ONLY** the SchoolLinkEMIS function:
   ```bash
   firebase deploy --only functions:SchoolLinkEMIS
   ```
