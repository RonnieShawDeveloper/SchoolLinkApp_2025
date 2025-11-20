# SchoolLink App

The SchoolLink App is a security and attendance application for schools. It allows authorized personnel to scan student ID cards with QR codes to verify their enrollment status and record their attendance.

## Features

- **Secure Login:** Users must authenticate to access the application.
- **School Selection:** Before scanning, users select the school they are currently at.
- **QR Code Scanning:** The app uses the device's camera to scan QR codes on student ID cards.
- **Student Verification:** After a successful scan, the app communicates with the EMIS (Education Management Information System) to verify the student's enrollment at the selected school.
- **Visual Confirmation:** The student's photo, name, and institution are displayed for visual confirmation.
- **Attendance Marking:** Authorized users can mark the student as present.
- **Live Reports:** View live attendance reports.
- **Manual Entry:** Manually enter student information if QR code scanning is not possible.

## Technologies Used

- **Angular:** A platform for building mobile and desktop web applications.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **ZXing Ngx-Scanner:** An Angular wrapper for the ZXing library for barcode scanning.
- **SweetAlert2:** A library for creating beautiful and responsive alerts.
- **Firebase:** Used for hosting the application.

## Getting Started

### Prerequisites

- Node.js and npm installed.
- Angular CLI installed (`npm install -g @angular/cli`).

### Installation

1. Clone the repository: `git clone <repository-url>`
2. Install dependencies: `npm install`

### Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Building

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Deploy to Firebase Hosting

Prerequisites:
- You have a Firebase project (project ID appears in the Firebase Console).
- You are logged in with the Firebase CLI on your machine: `npm i -g firebase-tools` (or use `npx` as shown below) and `firebase login`.
- The included `.firebaserc` maps the hosting target `schoollinkapp` to the project `bbms-1283c`. If your Firebase project ID differs, update `.firebaserc` accordingly or run the target command in the steps below.

Quick deploy (uses npx so you don't need a global install):
- Production deploy to the configured hosting target:
  1. `npm run deploy`
     - This runs `ng build` and then `npx firebase-tools deploy --only hosting:schoollinkapp`.

- Preview deploy (temporary URL via Firebase Hosting channels):
  1. `npm run deploy:preview`
     - This runs `ng build` and then `npx firebase-tools hosting:channel:deploy`.

If you need to point the hosting target to your own Firebase project ID:
1. `firebase login` (if not already logged in)
2. `firebase use <your-project-id>` (optional, to set the default project locally)
3. `firebase target:apply hosting schoollinkapp <your-project-id>`

Notes:
- The app is configured as an Angular PWA with service worker (`ngsw-config.json`).
- `firebase.json` sets `public` to `dist/school-link-app/browser` and rewrites all routes to `/index.html` for SPA routing.
- Cache headers are set to `no-cache` for easier updates; you can adjust these in `firebase.json` if desired.
