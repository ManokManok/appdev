
import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  ios: 'http://localhost:8000/api',
  default: 'http://localhost:8000/api',
});

const requestJson = async (path, body) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.status));
  }

  return data;
};

const readJson = async response => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getErrorMessage = (data, status) => {
  if (typeof data?.message === 'string') {
    return data.message;
  }

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (data?.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors).flat().find(Boolean);
    if (firstError) {
      return String(firstError);
    }
  }

  return status === 401
    ? 'Invalid email or password.'
    : 'Something went wrong. Please try again.';
};

export const userLogin = ({ email, username = email, password }) =>
  requestJson('/login', { email, username, password });

export const userRegister = ({ name, email, password }) =>
  requestJson('/register', { name, email, username: email, password });
