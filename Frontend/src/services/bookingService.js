import api from './api';

const normalizeBooking = booking => ({
  _id: booking._id,
  serviceTitle: booking.serviceId?.title || booking.serviceTitle || 'Service',
  providerName: booking.providerId?.businessName || booking.providerName || 'Provider',
  status: booking.status,
  scheduledAt: booking.scheduledAt,
  address: booking.address,
  amount: booking.agreedPrice ?? booking.amount ?? 0,
  notes: booking.notes || '',
  isReviewed: Boolean(booking.isReviewed),
});

const normalizeProviderBooking = booking => ({
  _id: booking._id,
  serviceTitle: booking.serviceId?.title || 'Service',
  customerName: booking.customerId?.name || 'Customer',
  customerEmail: booking.customerId?.email || '',
  customerPhone: booking.customerId?.phone || '',
  status: booking.status,
  scheduledAt: booking.scheduledAt,
  address: booking.address,
  amount: booking.agreedPrice ?? 0,
  notes: booking.notes || '',
});

export const getMyBookingsRequest = async () => {
  const { data } = await api.get('/bookings/mine');
  return (data.bookings || []).map(normalizeBooking);
};

export const getProviderBookingsRequest = async () => {
  const { data } = await api.get('/bookings/provider');
  return (data.bookings || []).map(normalizeProviderBooking);
};

export const cancelBookingRequest = async id => {
  const { data } = await api.delete(`/bookings/${id}`);
  return normalizeBooking(data.booking || { _id: id, status: 'cancelled' });
};

export const submitReviewRequest = async payload => {
  const { data } = await api.post('/reviews', payload);
  return data;
};

export const updateBookingStatusRequest = async (id, payload) => {
  const { data } = await api.patch(`/bookings/${id}/status`, payload);
  return normalizeBooking(data.booking);
};
