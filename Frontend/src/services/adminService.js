import api from './api';

export const getAdminDashboardRequest = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};

export const getPendingProvidersRequest = async () => {
  const { data } = await api.get('/admin/providers/pending');
  return data.providers || [];
};

export const getProviderReviewDetailRequest = async providerId => {
  const { data } = await api.get(`/admin/providers/${providerId}`);
  return data;
};

export const verifyProviderRequest = async (providerId, payload) => {
  const { data } = await api.patch(`/providers/${providerId}/verify`, payload);
  return data;
};

export const deleteReviewAsAdminRequest = async reviewId => {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
};

export const getAllBookingsRequest = async () => {
  const { data } = await api.get('/admin/bookings');
  return data.bookings || [];
};

export const getAllUsersRequest = async () => {
  const { data } = await api.get('/admin/users');
  return data.users || [];
};

export const blockUserRequest = async userId => {
  const { data } = await api.post(`/admin/users/${userId}/block`);
  return data;
};

export const unblockUserRequest = async userId => {
  const { data } = await api.post(`/admin/users/${userId}/unblock`);
  return data;
};

export const addAdminRequest = async payload => {
  const { data } = await api.post('/admin/add-admin', payload);
  return data;
};
