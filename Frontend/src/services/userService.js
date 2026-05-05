import api from './api';

export const getMyProfileRequest = async () => {
  const { data } = await api.get('/users/me');
  return data.user;
};

export const updateMyProfileRequest = async payload => {
  const { data } = await api.patch('/users/me', payload);
  return data.user;
};
