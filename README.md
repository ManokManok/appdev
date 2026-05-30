# APPDEV — ONINS Mobile App

React Native customer app for the **ONINS** Symfony backend (`../ONINS`). The mobile app uses the same JWT API, MySQL database, and repair services as the website.

## Run the full stack

### One command (recommended)

From the `APPDEV` folder:

```bash
npm run dev
```

This starts **MySQL** (Docker), **ONINS API** (port 8000), then **Metro** (port 8081) in the same terminal. Keep that window open while developing.

**USB Android (API + Metro + install on phone):**

```bash
npm run dev:android
```

Connect the phone with USB debugging on before running. Metro opens in a second window; the app builds and installs in the first.

You can also double-click `start.bat` in the APPDEV folder (same as `npm run dev`).

### Manual steps (optional)

```bash
npm run api:start   # API + MySQL only
npm start           # Metro only
npm run start:android   # USB device + adb reverse (Metro must already be running)
```

`npm start` runs **React Native Metro** (`react-native start`), not Expo CLI. It frees stale ports 8081–8090 first.

`npm run start:android` runs `adb reverse` for ports **8000** (API) and **8081** (Metro), then `react-native run-android --no-packager` (reuses Metro from `npm start` on 8081; no second bundler prompt).

1. Enable **USB debugging** on the phone and connect the cable.
2. Confirm `adb devices` lists your device.
3. Use the **development build** on the phone (`com.yes`), not Expo Go.

API URL on the device: `http://127.0.0.1:8000/api` (via `adb reverse`). For Wi‑Fi only, set `LAN_IP` in `src/utils/apiConfig.js`.

Stop old Expo/Metro processes:

```bash
npm run stop:expo
```

### Android release build

From the **APPDEV** folder (not `android/`):

```bash
npm run android:release   # APK at android/app/build/outputs/apk/release/app-release.apk
npm run android:bundle    # AAB for Google Play at android/app/build/outputs/bundle/release/app-release.aab
```

Release builds embed the JS bundle via Gradle (Metro does not need to be running). For production Play Store uploads, configure a release keystore in `android/app/build.gradle` (the project currently signs release with the debug keystore for local testing).

### iOS (macOS only)

```bash
npm run ios
```

## API connection

All screens use one HTTP client (`src/core/api/client.js`) and base URL from `src/utils/apiConfig.js`:

| Environment | Host |
|-------------|------|
| Expo Go (phone, same Wi‑Fi) | Auto from Metro `debuggerHost` |
| Android emulator | `10.0.2.2` |
| Manual override | Set `LAN_IP` in `apiConfig.js` or `EXPO_PUBLIC_API_URL` in `.env` |
| iOS simulator | `localhost` |

Symfony must be running at **http://localhost:8000** with API under `/api`.

Optional `.env` (copy from `.env.example`):

- `EXPO_PUBLIC_API_URL` — full API base, e.g. `http://192.168.1.5:8000/api`
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` — same as `GOOGLE_CLIENT_ID` in ONINS for Google Sign-In

## Demo login (same as ONINS customer account)

- **Email:** `customer@onins.com`
- **Password:** `customer123`

Staff/admin accounts are blocked on mobile (web dashboard only).

## Realtime & push notifications

| Type | How it works |
|------|----------------|
| **FCM push** | Phone shows a system notification when an order is approved/rejected (requires Firebase + `google-services.json` on Android) |
| **Mercure (in-app)** | Services, orders, bookings, and payments refresh automatically when the admin changes data |

USB Android: `npm run start:android` forwards API (**8000**), Metro (**8081**), and Mercure (**3000**).

Optional `.env`: `EXPO_PUBLIC_MERCURE_URL` if not using `127.0.0.1:3000`.

## Features (ONINS customer API)

| Feature | API |
|---------|-----|
| Login / register | `POST /api/login`, `POST /api/register` |
| Google Sign-In | `POST /api/auth/google` (needs `EXPO_PUBLIC_GOOGLE_CLIENT_ID`) |
| Services catalog | `GET /api/products` |
| Orders | `GET` / `POST /api/orders`, pay via `POST /api/payments` |
| Bookings | `GET` / `POST /api/bookings` (creates linked order) |
| Payments history | `GET /api/payments` |
| Profile | `GET` / `PUT /api/profile` |
| Session | JWT in AsyncStorage; auto logout on 401 |

Bottom tabs: Services, Orders, Bookings, Payments, Profile. Staff/admin accounts are blocked (web dashboard only).

## Tech stack

- **Expo SDK 55** + **React Native 0.83** (Expo Go compatible)
- Run with `npm start` → Expo Go (no Android emulator required)

## Project structure

- `src/core/api/` — API clients (`auth.js`, `customer.js`, `client.js`)
- `src/screens/auth/` — Login, Register, AuthContext
- `src/screens/` — Home (services), Orders, Bookings, Payments, Profile
- `src/navigations/` — Auth stack + main tab navigator
