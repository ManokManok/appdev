/**
 * Mercure SSE over XMLHttpRequest — works on React Native (fetch-event-source does not).
 */

function parseEventBlock(block) {
  const lines = block.split('\n');
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^\s/, ''));
    }
  }

  if (!dataLines.length) {
    return null;
  }

  return dataLines.join('\n');
}

/**
 * @returns {() => void} disconnect
 */
export function connectMercureStream(url, token, { onMessage, onError, signal } = {}) {
  const xhr = new XMLHttpRequest();
  let offset = 0;
  let pending = '';
  let disconnected = false;

  const disconnect = () => {
    if (disconnected) {
      return;
    }
    disconnected = true;
    xhr.abort();
  };

  const flushChunk = chunk => {
    pending += chunk;
    const parts = pending.split('\n\n');
    pending = parts.pop() ?? '';

    for (const part of parts) {
      const data = parseEventBlock(part);
      if (!data) {
        continue;
      }
      try {
        onMessage?.(JSON.parse(data));
      } catch {
        // ignore malformed payloads
      }
    }
  };

  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'text/event-stream');
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  xhr.setRequestHeader('Cache-Control', 'no-cache');

  xhr.onreadystatechange = () => {
    if (disconnected) {
      return;
    }

    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status !== 200 && xhr.status !== 0) {
        onError?.(new Error(`Mercure HTTP ${xhr.status}`));
      } else if (!disconnected) {
        onError?.(new Error('Mercure stream closed'));
      }
      return;
    }

    if (xhr.readyState >= XMLHttpRequest.LOADING && xhr.status === 200) {
      const chunk = xhr.responseText.substring(offset);
      offset = xhr.responseText.length;
      if (chunk) {
        flushChunk(chunk);
      }
    } else if (xhr.readyState >= XMLHttpRequest.HEADERS_RECEIVED && xhr.status >= 400) {
      onError?.(new Error(`Mercure HTTP ${xhr.status}`));
      disconnect();
    }
  };

  xhr.onerror = () => {
    if (!disconnected) {
      onError?.(new Error('Mercure network error'));
    }
  };

  signal?.addEventListener('abort', disconnect);
  xhr.send();

  return disconnect;
}
