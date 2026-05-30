import { AppState, NativeModules, Platform } from 'react-native';

/**
 * After Google OAuth opens the system browser, Android suspends the app and the
 * Metro WebSocket drops. When the user returns, wait for the socket to come back
 * instead of racing a reload while disconnected.
 */
export function initUsbMetroBridge() {
  if (!__DEV__ || Platform.OS !== 'android') {
    return () => {};
  }

  let wasBackground = false;

  const subscription = AppState.addEventListener('change', nextState => {
    if (nextState === 'background' || nextState === 'inactive') {
      wasBackground = true;
      return;
    }

    if (nextState !== 'active' || !wasBackground) {
      return;
    }

    wasBackground = false;

    // Re-open the packager socket; do not call DevSettings.reload() here.
    const devSettings = NativeModules.DevSettings;
    if (devSettings?.setIsDebuggingRemotely) {
      devSettings.setIsDebuggingRemotely(true);
    }
  });

  return () => subscription.remove();
}
