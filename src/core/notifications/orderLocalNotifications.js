import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const ANDROID_CHANNEL_ORDERS = 'orders';
const NOTIFY_STATUSES = new Set(['APPROVED', 'REJECTED', 'PAID', 'CANCELLED']);
const NOTIFY_BOOKING_STATUSES = new Set(['CONFIRMED', 'CANCELLED']);

let channelReady = false;

/** Avoid duplicate tray entries when FCM and Mercure fire for the same update. */
const recentKeys = new Map();
const DEDUPE_MS = 8000;

export async function ensureNotificationReady() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  const granted = finalStatus === 'granted';

  if (granted && Platform.OS === 'android' && !channelReady) {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ORDERS, {
      name: 'Order updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default',
      enableVibrate: true,
    });
    channelReady = true;
  }

  return granted;
}

export function buildOrderNotificationContent(payload) {
  const status = String(payload?.status ?? '').toUpperCase();
  if (!NOTIFY_STATUSES.has(status)) {
    return null;
  }

  const orderId = payload?.orderId ?? payload?.order_id;
  const title = (() => {
    switch (status) {
      case 'APPROVED':
        return 'Order approved';
      case 'REJECTED':
        return 'Order rejected';
      case 'PAID':
        return 'Payment received';
      case 'CANCELLED':
        return 'Order cancelled';
      default:
        return 'Order update';
    }
  })();

  const body = (() => {
    switch (status) {
      case 'APPROVED':
        return `Order #${orderId} was approved.`;
      case 'REJECTED':
        return `Order #${orderId} was rejected.`;
      case 'PAID':
        return `Order #${orderId} is now paid.`;
      case 'CANCELLED':
        return `Order #${orderId} was cancelled.`;
      default:
        return `Order #${orderId} status: ${status}`;
    }
  })();

  return {
    title,
    body,
    status,
    orderId: orderId != null ? String(orderId) : '',
  };
}

function shouldPresent(orderId, status) {
  const key = `${orderId}:${status}`;
  const now = Date.now();
  const last = recentKeys.get(key);
  if (last != null && now - last < DEDUPE_MS) {
    return false;
  }
  recentKeys.set(key, now);
  return true;
}

/**
 * Show an immediate native notification (system tray) for order status updates.
 */
export async function presentOrderStatusNotification(payload) {
  const content = buildOrderNotificationContent(payload);
  if (!content || !shouldPresent(content.orderId, content.status)) {
    return;
  }

  const ready = await ensureNotificationReady();
  if (!ready) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      data: {
        type: 'order.updated',
        orderId: content.orderId,
        status: content.status,
      },
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ORDERS } : {}),
    },
    trigger: null,
  });
}

/**
 * Mark an order update as already shown (e.g. from FCM) to skip Mercure duplicate.
 */
export function markOrderNotificationShown(orderId, status) {
  const key = `${orderId}:${String(status).toUpperCase()}`;
  recentKeys.set(key, Date.now());
}

export function buildBookingNotificationContent(payload) {
  const status = String(payload?.status ?? '').toUpperCase();
  if (!NOTIFY_BOOKING_STATUSES.has(status)) {
    return null;
  }

  const bookingId = payload?.bookingId ?? payload?.booking_id;
  const title = status === 'CONFIRMED' ? 'Booking confirmed' : 'Booking update';
  const body =
    status === 'CONFIRMED'
      ? `Booking #${bookingId} is confirmed.`
      : `Booking #${bookingId} status: ${status}`;

  return {
    title,
    body,
    status,
    bookingId: bookingId != null ? String(bookingId) : '',
  };
}

export async function presentBookingNotification(payload) {
  const content = buildBookingNotificationContent(payload);
  if (!content || !shouldPresent(content.bookingId, content.status)) {
    return;
  }

  const ready = await ensureNotificationReady();
  if (!ready) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      data: {
        type: 'booking.updated',
        bookingId: content.bookingId,
        status: content.status,
      },
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ORDERS } : {}),
    },
    trigger: null,
  });
}

export async function presentPaymentNotification(payload) {
  const orderId = payload?.orderId ?? payload?.order_id;
  if (orderId == null) {
    return;
  }

  const key = `payment:${orderId}`;
  const now = Date.now();
  const last = recentKeys.get(key);
  if (last != null && now - last < DEDUPE_MS) {
    return;
  }
  recentKeys.set(key, now);

  const ready = await ensureNotificationReady();
  if (!ready) {
    return;
  }

  const amount = payload?.amount;
  const body =
    amount != null
      ? `Payment of ₱${Number(amount).toFixed(2)} for order #${orderId} was successful.`
      : `Payment for order #${orderId} was successful.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Payment recorded',
      body,
      data: {
        type: 'payment.created',
        orderId: String(orderId),
        paymentId: payload?.paymentId != null ? String(payload.paymentId) : '',
      },
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ORDERS } : {}),
    },
    trigger: null,
  });
}
