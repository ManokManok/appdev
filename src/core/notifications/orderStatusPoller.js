import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { getOrders } from '../api/customer';
import { presentOrderStatusNotification } from './orderLocalNotifications';

const NOTIFY_STATUSES = new Set(['APPROVED', 'REJECTED']);
const POLL_MS = 20_000;

/**
 * Backup when Mercure SSE is unavailable: poll orders and show tray notifications on status change.
 */
export function useOrderStatusPoller(authToken) {
  const statusesRef = useRef(new Map());
  const seededRef = useRef(false);

  useEffect(() => {
    if (!authToken) {
      statusesRef.current = new Map();
      seededRef.current = false;
      return undefined;
    }

    let cancelled = false;
    let timer = null;

    const poll = async () => {
      if (cancelled || AppState.currentState !== 'active') {
        return;
      }

      try {
        const response = await getOrders(authToken);
        const orders = response.data || [];

        for (const order of orders) {
          const id = order.id;
          const status = String(order.status ?? '').toUpperCase();
          const previous = statusesRef.current.get(id);

          if (
            seededRef.current &&
            previous &&
            previous !== status &&
            NOTIFY_STATUSES.has(status)
          ) {
            await presentOrderStatusNotification({ orderId: id, status });
          }

          statusesRef.current.set(id, status);
        }

        seededRef.current = true;
      } catch {
        // network optional — Mercure may still deliver
      }
    };

    poll();
    timer = setInterval(poll, POLL_MS);

    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        poll();
      }
    });

    return () => {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
      }
      appStateSub.remove();
      statusesRef.current = new Map();
      seededRef.current = false;
    };
  }, [authToken]);
}
