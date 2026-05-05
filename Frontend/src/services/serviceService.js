import api from './api';

export const listServicesRequest = async params => {
  const { data } = await api.get('/services', { params });
  return data;
};

export const createServiceRequest = async payload => {
  const { data } = await api.post('/services', payload);
  return data;
};

export const updateServiceRequest = async (id, payload) => {
  const { data } = await api.put(`/services/${id}`, payload);
  return data;
};

export const getMyServicesRequest = async () => {
  const { data } = await api.get('/services/my');
  return data.services || [];
};

export const submitServiceReviewRequest = async payload => {
  const { data } = await api.post('/reviews', payload);
  return data;
};

export const getServiceReviewsRequest = async serviceId => {
  const { data } = await api.get(`/reviews/service/${serviceId}`);
  return data.reviews || [];
};
