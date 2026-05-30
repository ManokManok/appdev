import { useEffect } from 'react';
import { useAuth } from '../../screens/auth/AuthContext';
import { useRealtime } from '../realtime/RealtimeContext';
import {
  ensureNotificationReady,
  markOrderNotificationShown,
  presentBookingNotification,
  presentOrderStatusNotification,
  presentPaymentNotification,
} from './orderLocalNotifications';
import { useOrderStatusPoller } from './orderStatusPoller';
import { setupPushNotifications } from './pushNotifications';

const handleOrderEvent = payload => {
  if (!payload) {
    return;
  }

  const status = String(payload.status ?? '').toUpperCase();
  if (status === 'PAID') {
    return;
  }

  presentOrderStatusNotification(payload);
};

const handleBookingEvent = payload => {
  if (!payload) {
    return;
  }

  presentBookingNotification(payload);
};

const handlePaymentEvent = payload => {
  if (!payload) {
    return;
  }

  presentPaymentNotification(payload);
};

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { subscribe } = useRealtime();

  useOrderStatusPoller(user?.token);

  useEffect(() => {
    ensureNotificationReady();
  }, []);

  useEffect(() => {
    if (!user?.token) {
      return undefined;
    }

    let cleanupPush = () => {};

    setupPushNotifications(user.token, {
      onNotificationOpen: (notification, _fromTap) => {
        const data = notification?.request?.content?.data ?? {};
        if (data.type === 'order.updated' && data.orderId && data.status) {
          markOrderNotificationShown(data.orderId, data.status);
        }
      },
    }).then(unsub => {
      cleanupPush = unsub || (() => {});
    });

    const unsubscribeRealtime = subscribe(event => {
      switch (event?.type) {
        case 'order.updated':
          handleOrderEvent(event.payload);
          break;
        case 'booking.updated':
          handleBookingEvent(event.payload);
          break;
        case 'payment.created':
          handlePaymentEvent(event.payload);
          break;
        default:
          break;
      }
    });

    return () => {
      cleanupPush();
      unsubscribeRealtime();
    };
  }, [user?.token, subscribe]);
};
