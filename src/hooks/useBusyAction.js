import { useCallback, useState } from 'react';

/**
 * Wrap async actions with a busy key so buttons disable instantly (no double-submit lag).
 */
export const useBusyAction = () => {
  const [busyKey, setBusyKey] = useState(null);

  const run = useCallback(async (key, action) => {
    if (busyKey != null) {
      return undefined;
    }

    setBusyKey(key);
    try {
      return await action();
    } finally {
      setBusyKey(null);
    }
  }, [busyKey]);

  const isBusy = useCallback(key => busyKey === key, [busyKey]);

  return { run, isBusy, busyKey };
};
