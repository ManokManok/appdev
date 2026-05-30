import { Platform } from 'react-native';

/**
 * ONINS Symfony API (port 8000).
 *
 * USB Android: run `npm run start:android` (sets adb reverse for ports 8000 and 8081).
 * Wi‑Fi: set LAN_IP below to your PC IP from ipconfig, or set EXPO_PUBLIC_API_URL.
 *
 * Google Sign-In: opens ONINS /connect/google?platform=mobile (no app-side Google client config needed)
 */
const LAN_IP = null;

const resolveAndroidHost = () => {
  if (LAN_IP) {
    return LAN_IP;
  }

  // Physical device + `adb reverse tcp:8000 tcp:8000` → API at 127.0.0.1 on the phone
  return '127.0.0.1';
};

const resolveHost = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    try {
      const url = new URL(process.env.EXPO_PUBLIC_API_URL);
      return url.hostname;
    } catch {
      // fall through to platform defaults
    }
  }

  return Platform.select({
    android: resolveAndroidHost(),
    ios: LAN_IP ?? 'localhost',
    default: 'localhost',
  });
};

export const HOST = resolveHost();

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${HOST}:8000/api`;

export const API_WEB_URL =
  process.env.EXPO_PUBLIC_API_WEB_URL ?? `http://${HOST}:8000`;

/** Mercure hub (SSE). USB Android: adb reverse tcp:3000 tcp:3000 */
export const MERCURE_BASE_URL =
  process.env.EXPO_PUBLIC_MERCURE_URL ?? `http://${HOST}:3000/.well-known/mercure`;

export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
