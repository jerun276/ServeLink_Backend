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
