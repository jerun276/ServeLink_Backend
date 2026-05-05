import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  cancelBookingRequest,
  getMyBookingsRequest,
  submitReviewRequest,
  updateBookingStatusRequest,
} from '../services/bookingService';
import { BOOKING_TABS, DEFAULT_BOOKINGS, SERVICES_CATALOG, STATUS_BY_TAB } from '../utils/constants';

const BookingContext = createContext(null);

const sortByDateDesc = list => [...list].sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyBookingsRequest();
      setBookings(sortByDateDesc(data));
    } catch {
      setBookings(sortByDateDesc(DEFAULT_BOOKINGS));
      setError('Using demo booking data. Connect backend for live bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const bookServiceFromCatalog = (serviceId, details = {}) => {
    const service = SERVICES_CATALOG.find(item => item.id === serviceId);
    if (!service) return;

    const booking = {
      _id: `bk-${Date.now()}`,
      serviceTitle: service.title,
      providerName: service.provider,
      status: 'pending',
      scheduledAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
      address: 'Address will be confirmed in details',
      amount: service.price,
      notes:
        Object.keys(details).length > 0
          ? Object.entries(details)
              .map(([key, value]) => `${key}: ${value}`)
              .join(' | ')
          : 'Created from service catalog',
      isReviewed: false,
    };

    setBookings(prev => sortByDateDesc([booking, ...prev]));
  };

  const cancelBooking = async (id, pin) => {
    if (pin !== '1234') {
      throw new Error('Invalid PIN. Use demo PIN: 1234');
    }

    try {
      await cancelBookingRequest(id);
    } catch {
      // local fallback
    }

    setBookings(prev =>
      prev.map(booking => (booking._id === id ? { ...booking, status: 'cancelled' } : booking))
    );
  };

  const submitReview = async ({ bookingId, rating, comment }) => {
    try {
      await submitReviewRequest({ bookingId, rating, comment });
    } catch {
      // local fallback
    }

    setBookings(prev => prev.map(item => (item._id === bookingId ? { ...item, isReviewed: true } : item)));
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await updateBookingStatusRequest(id, { status });
    } catch {
      // local fallback
    }

    setBookings(prev => prev.map(item => (item._id === id ? { ...item, status } : item)));
  };

  const getBookingsByTab = tab => {
    if (!BOOKING_TABS.includes(tab)) return bookings;
    const statusList = STATUS_BY_TAB[tab];
    return bookings.filter(booking => statusList.includes(booking.status));
  };

  const getBookingById = id => bookings.find(item => item._id === id);

  const value = useMemo(
    () => ({
      bookings,
      loading,
      error,
      loadBookings,
      bookServiceFromCatalog,
      cancelBooking,
      submitReview,
      updateBookingStatus,
      getBookingsByTab,
      getBookingById,
    }),
    [bookings, loading, error]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBookingContext must be used inside BookingProvider');
  return context;
};
