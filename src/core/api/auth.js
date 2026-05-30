import { requestJson } from './client';

export const userLogin = ({ email, username = email, password }) =>
  requestJson('/login', { email, username, password }, 'POST');

export const userRegister = ({ name, email, password }) =>
  requestJson('/register', { name, email, username: email, password }, 'POST');

export const userGoogleAuth = idToken =>
  requestJson('/auth/google', { idToken }, 'POST');

export const getProfile = token => requestJson('/profile', null, 'GET', token);
