import { requestJson } from './client';

export const registerFcmToken = (token, fcmToken) =>
  requestJson('/devices/fcm-token', { token: fcmToken }, 'POST', token);

export const getRealtimeToken = authToken => requestJson('/realtime/token', null, 'GET', authToken);
