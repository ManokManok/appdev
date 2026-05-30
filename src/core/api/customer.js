import { requestJson } from './client';

export const getProducts = token => requestJson('/products', null, 'GET', token);
export const getProfile = token => requestJson('/profile', null, 'GET', token);
export const updateProfile = (token, body) => requestJson('/profile', body, 'PUT', token);
export const getBookings = token => requestJson('/bookings', null, 'GET', token);
export const createBooking = (token, body) => requestJson('/bookings', body, 'POST', token);
export const getOrders = token => requestJson('/orders', null, 'GET', token);
export const createOrder = (token, body) => requestJson('/orders', body, 'POST', token);
export const getPayments = token => requestJson('/payments', null, 'GET', token);
export const createPayment = (token, body) => requestJson('/payments', body, 'POST', token);
