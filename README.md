# KakinadaMart SaaS

A small React + Vite + Firebase shopping PWA demo designed around a clean separation between the public customer store and a private admin area.

## Architecture

- `/` — public customer store; no customer login
- `/cart` — local customer cart
- `/checkout` — customer details are collected only at checkout
- `/admin/login` — separate admin entry point
- `/admin` — authenticated admin dashboard
- Firestore — products and orders
- Firebase Authentication — admin login
- Firebase Hosting — SPA hosting
- No Cloud Functions required for this demo

## Firebase setup

1. Create a Firebase Web App.
2. Enable Email/Password Authentication.
3. Create a Firestore database.
4. Copy `.env.example` to `.env` and add the Firebase Web App configuration.
5. Create the first admin user in Firebase Authentication.
6. Create an `admins/{uid}` document in Firestore for that user's UID.
7. Deploy `firestore.rules` before using the admin dashboard in production.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The project intentionally keeps customer access login-free. Admin authentication is isolated behind `/admin/login`, and Firestore rules independently enforce admin write access.
