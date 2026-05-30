import { API_BASE_URL } from '../../utils/apiConfig';

let onUnauthorized = null;

export const setUnauthorizedHandler = handler => {
  onUnauthorized = handler;
};

const readJson = async response => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const getErrorMessage = (data, status) => {
  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error;
  }

  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }

  if (data?.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors).flat().find(Boolean);
    if (firstError) {
      return String(firstError);
    }
  }

  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  return 'Something went wrong. Please try again.';
};

export const requestJson = async (path, body = null, method = 'GET', token = null) => {
  const headers = { Accept: 'application/json' };

  if (body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : undefined,
    });

    const data = await readJson(response);

    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    if (!response.ok) {
      throw new Error(getErrorMessage(data, response.status));
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reach the server.';
    throw new Error(message.includes('Network request failed')
      ? 'Unable to reach the backend. Please check your network connection.'
      : message);
  }
};
