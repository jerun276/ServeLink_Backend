import api, { setAuthToken } from './api';

export const loginRequest = async payload => {
  const { data } = await api.post('/auth/login', payload);
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const registerRequest = async payload => {
  const { data } = await api.post('/auth/register', payload);
  if (data?.token) setAuthToken(data.token);
  return data;
};

export const getMeRequest = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};
