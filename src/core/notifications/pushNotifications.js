import { AppState, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { registerFcmToken } from '../api/device';
import { markOrderNotificationShown } from './orderLocalNotifications';

const ANDROID_CHANNEL_ORDERS = 'orders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ORDERS, {
      name: 'Order updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

async function registerTokenWithBackend(authToken) {
  const devicePush = await Notifications.getDevicePushTokenAsync();
  const fcmToken = devicePush?.data;
  if (fcmToken) {
    await registerFcmToken(authToken, fcmToken);
  }
  return fcmToken;
}

/**
 * Register native FCM/APNs token with ONINS and set up listeners.
 * Safe to call when Firebase is not configured — registration is skipped gracefully.
 */
export async function setupPushNotifications(authToken, { onNotificationOpen } = {}) {
  if (!authToken || !Device.isDevice) {
    return () => {};
  }

  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return () => {};
  }

  const tryRegister = async () => {
    try {
      await registerTokenWithBackend(authToken);
    } catch {
      // Missing google-services.json or permissions — Mercure in-app updates still work
    }
  };

  await tryRegister();

  const appStateSub = AppState.addEventListener('change', state => {
    if (state === 'active') {
      tryRegister();
    }
  });

  const receivedSub = Notifications.addNotificationReceivedListener(notification => {
    const data = notification?.request?.content?.data ?? {};
    if (data.type === 'order.updated' && data.orderId && data.status) {
      markOrderNotificationShown(data.orderId, data.status);
    }

    if (typeof onNotificationOpen === 'function') {
      onNotificationOpen(notification, false);
    }
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
    if (typeof onNotificationOpen === 'function') {
      onNotificationOpen(response.notification, true);
    }
  });

  return () => {
    appStateSub.remove();
    receivedSub.remove();
    responseSub.remove();
  };
}
