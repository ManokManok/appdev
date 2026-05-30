import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { getRealtimeToken } from '../api/device';
import { useAuth } from '../../screens/auth/AuthContext';
import { MERCURE_BASE_URL } from '../../utils/apiConfig';
import { connectMercureStream } from './mercureSse';

const RealtimeContext = createContext({
  lastEvent: null,
  subscribe: () => () => {},
  connected: false,
});

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();
  const [lastEvent, setLastEvent] = useState(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Set());
  const disconnectRef = useRef(null);
  const retryTimerRef = useRef(null);

  const emit = useCallback(event => {
    setLastEvent(event);
    listenersRef.current.forEach(listener => {
      try {
        listener(event);
      } catch {
        // ignore listener errors
      }
    });
  }, []);

  const subscribe = useCallback(listener => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  useEffect(() => {
    if (!user?.token) {
      setConnected(false);
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();

    const scheduleReconnect = (delayMs = 1500) => {
      if (cancelled || retryTimerRef.current) {
        return;
      }
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        if (!cancelled) {
          connect();
        }
      }, delayMs);
    };

    const connect = async () => {
      if (cancelled) {
        return;
      }

      disconnectRef.current?.();
      disconnectRef.current = null;
      setConnected(false);

      try {
        const response = await getRealtimeToken(user.token);
        const { hubUrl, token, topics } = response.data || {};
        if (!hubUrl || !token || !topics?.length || cancelled) {
          scheduleReconnect(3000);
          return;
        }

        const baseHub = MERCURE_BASE_URL || hubUrl;
        const topicQuery = topics.map(t => `topic=${encodeURIComponent(t)}`).join('&');
        const url = `${baseHub.replace(/\/$/, '')}?${topicQuery}`;

        disconnectRef.current = connectMercureStream(url, token, {
          signal: controller.signal,
          onMessage: parsed => {
            if (!cancelled) {
              setConnected(true);
              emit(parsed);
            }
          },
          onError: () => {
            if (!cancelled) {
              setConnected(false);
              scheduleReconnect(1500);
            }
          },
        });

        setConnected(true);
      } catch {
        if (!cancelled) {
          setConnected(false);
          scheduleReconnect(3000);
        }
      }
    };

    connect();

    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active' && !cancelled) {
        connect();
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
      disconnectRef.current?.();
      disconnectRef.current = null;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      appStateSub.remove();
      setConnected(false);
    };
  }, [user?.token, emit]);

  const value = useMemo(
    () => ({
      lastEvent,
      subscribe,
      connected,
    }),
    [lastEvent, subscribe, connected]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => useContext(RealtimeContext);

/**
 * Re-run `onUpdate` when a matching Mercure event arrives.
 */
export const useRealtimeRefresh = (eventTypes, onUpdate) => {
  const { subscribe } = useRealtime();

  useEffect(() => {
    if (!onUpdate) {
      return undefined;
    }

    return subscribe(event => {
      if (!event?.type) {
        return;
      }
      const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
      if (types.some(type => event.type === type || event.type.startsWith(type))) {
        onUpdate(event);
      }
    });
  }, [subscribe, eventTypes, onUpdate]);
};
