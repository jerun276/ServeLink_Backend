import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Input from '../../components/common/Input';
import useAuth from '../../hooks/useAuth';
import { getProviderBookingsRequest, updateBookingStatusRequest } from '../../services/bookingService';
import { getConversationsRequest } from '../../services/chatService';
import { getServiceReviewsRequest, getMyServicesRequest } from '../../services/serviceService';
import colors from '../../styles/colors';
import globalStyles from '../../styles/globalStyles';
import { getStoredObject, setStoredObject } from '../../utils/storage';

const ACTIVE_PROVIDER_STATUSES = ['pending', 'accepted', 'in_progress'];

const statusLabel = status => {
  if (status === 'in_progress') return 'In Progress';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = value => {
  if (!value) return 'No date';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const ProviderDashboardScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const [selectedDays, setSelectedDays] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const scheduleKey = useMemo(() => `provider_schedule_${user?.id || 'default'}`, [user?.id]);

  const initials = useMemo(() => {
    const fullName = user?.name || 'Provider';
    return fullName
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const pendingJobs = useMemo(
    () => bookings.filter(item => ACTIVE_PROVIDER_STATUSES.includes(item.status)),
    [bookings]
  );

  const ratingsSummary = useMemo(() => {
    const totalReviews = services.reduce((sum, item) => sum + Number(item.totalReviews || 0), 0);
    if (totalReviews === 0) {
      return { average: 0, totalReviews: 0 };
    }

    const weightedSum = services.reduce(
      (sum, item) => sum + Number(item.avgRating || 0) * Number(item.totalReviews || 0),
      0
    );
    return {
      average: weightedSum / totalReviews,
      totalReviews,
    };
  }, [services]);

  const loadDashboardData = async () => {
    setLoading(true);
    setLoadError('');

    try {
      const [providerBookings, providerConversations, myServices] = await Promise.all([
        getProviderBookingsRequest(),
        getConversationsRequest(),
        getMyServicesRequest(),
      ]);

      setBookings(providerBookings);
      setConversations(providerConversations);
      setServices(myServices);

      const reviewBuckets = await Promise.all(
        myServices.map(async service => {
          const rows = await getServiceReviewsRequest(service._id);
          return rows.map(review => ({
            ...review,
            serviceTitle: service.title,
          }));
        })
      );

      const allReviews = reviewBuckets
        .flat()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setReviews(allReviews);
    } catch (error) {
      setLoadError(error?.response?.data?.message || 'Could not load provider dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setLocation(user?.location || '');
    setBio(user?.bio || '');
    setSkillsText(Array.isArray(user?.skills) ? user.skills.join(', ') : '');
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const loadSchedule = async () => {
      const stored = await getStoredObject(scheduleKey);
      if (stored?.days && Array.isArray(stored.days)) {
        setSelectedDays(stored.days);
      }
    };

    loadSchedule();
  }, [scheduleKey]);

  const saveProfile = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setSaveError('Name is required.');
      setSaveMessage('');
      return;
    }

    if (!cleanPhone) {
      setSaveError('Phone number is required.');
      setSaveMessage('');
      return;
    }

    const skills = skillsText
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    setSavingProfile(true);
    setSaveError('');
    setSaveMessage('');

    try {
      await updateProfile({
        name: cleanName,
        phone: cleanPhone,
        location: location.trim(),
        bio: bio.trim(),
        skills,
      });
      setSaveMessage('Profile updated successfully.');
    } catch {
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const setNextBookingStatus = async (bookingId, status) => {
    try {
      await updateBookingStatusRequest(bookingId, { status });
      await loadDashboardData();
    } catch (error) {
      setLoadError(error?.response?.data?.message || 'Could not update booking status.');
    }
  };

  const toggleDay = async day => {
    const exists = selectedDays.includes(day);
    const next = exists
      ? selectedDays.filter(item => item !== day)
      : [...selectedDays, day].sort((a, b) => a - b);

    setSelectedDays(next);
    setSavingSchedule(true);
    await setStoredObject(scheduleKey, { days: next });
    setSavingSchedule(false);
  };

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.screen}>
          <Animated.View entering={FadeInDown.duration(600)} style={globalStyles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 19 }}>{initials}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{user?.name || 'Provider'}</Text>
                <Text style={{ color: colors.subText, fontWeight: '600' }}>{user?.email || ''}</Text>
              </View>
            </View>
            <Pressable onPress={logout} style={globalStyles.iconButton}>
              <Text style={{ fontSize: 20 }}>Exit</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(120).duration(500)} style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={globalStyles.label}>Provider Overview</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <View>
                <Text style={{ color: colors.subText, fontWeight: '600' }}>Pending Work</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{pendingJobs.length}</Text>
              </View>
              <View>
                <Text style={{ color: colors.subText, fontWeight: '600' }}>Customer Chats</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{conversations.length}</Text>
              </View>
              <View>
                <Text style={{ color: colors.subText, fontWeight: '600' }}>Avg Rating</Text>
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
                  {ratingsSummary.average.toFixed(1)}
                </Text>
                <Text style={{ color: colors.subText, fontSize: 12 }}>
                  {ratingsSummary.totalReviews} reviews
                </Text>
              </View>
            </View>
            {loading ? <Text style={{ marginTop: 8, color: colors.subText }}>Refreshing dashboard...</Text> : null}
            {loadError ? <Text style={{ marginTop: 8, color: '#D32F2F' }}>{loadError}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(180).duration(500)} style={[globalStyles.card, { borderRadius: 20 }]}>
            <View style={[globalStyles.headerRow, { marginBottom: 10 }]}>
              <Text style={[globalStyles.label, { marginBottom: 0 }]}>Pending Work</Text>
              <Pressable onPress={() => loadDashboardData()}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Refresh</Text>
              </Pressable>
            </View>

            {pendingJobs.length === 0 ? (
              <Text style={{ color: colors.subText }}>No pending or active jobs right now.</Text>
            ) : (
              pendingJobs.map(item => (
                <View
                  key={item._id}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E6ECF3',
                    borderRadius: 14,
                    padding: 12,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontWeight: '800', color: colors.text }}>{item.serviceTitle}</Text>
                  <Text style={{ color: colors.subText, marginTop: 2 }}>
                    Customer: {item.customerName} | {statusLabel(item.status)}
                  </Text>
                  <Text style={{ color: colors.subText, marginTop: 2 }}>Date: {formatDate(item.scheduledAt)}</Text>
                  {item.customerPhone ? (
                    <Text style={{ color: colors.subText, marginTop: 2 }}>Phone: {item.customerPhone}</Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    {item.status === 'pending' ? (
                      <Pressable
                        onPress={() => setNextBookingStatus(item._id, 'accepted')}
                        style={[globalStyles.pill, { backgroundColor: '#ECFDF5' }]}
                      >
                        <Text style={{ color: '#047857', fontWeight: '700' }}>Accept</Text>
                      </Pressable>
                    ) : null}
                    {item.status === 'accepted' ? (
                      <Pressable
                        onPress={() => setNextBookingStatus(item._id, 'in_progress')}
                        style={[globalStyles.pill, { backgroundColor: '#EFF6FF' }]}
                      >
                        <Text style={{ color: '#1D4ED8', fontWeight: '700' }}>Start Job</Text>
                      </Pressable>
                    ) : null}
                    {item.status === 'in_progress' ? (
                      <Pressable
                        onPress={() => setNextBookingStatus(item._id, 'completed')}
                        style={[globalStyles.pill, { backgroundColor: '#FEF3C7' }]}
                      >
                        <Text style={{ color: '#92400E', fontWeight: '700' }}>Mark Complete</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(230).duration(500)} style={[globalStyles.card, { borderRadius: 20 }]}>
            <View style={[globalStyles.headerRow, { marginBottom: 10 }]}>
              <Text style={[globalStyles.label, { marginBottom: 0 }]}>Customer Chats</Text>
              <Pressable onPress={() => navigation.navigate('Chats')}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Open Chats</Text>
              </Pressable>
            </View>

            {conversations.length === 0 ? (
              <Text style={{ color: colors.subText }}>No customer conversations yet.</Text>
            ) : (
              conversations.slice(0, 6).map(item => {
                const customerName =
                  item.customerId?.name || item.providerId?.userId?.name || 'Customer';
                return (
                  <Pressable
                    key={item._id}
                    onPress={() =>
                      navigation.navigate('Chats', {
                        screen: 'ChatThread',
                        params: { conversationId: item._id, title: customerName },
                      })
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: '#E6ECF3',
                      borderRadius: 14,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontWeight: '700', color: colors.text }}>{customerName}</Text>
                    <Text style={{ color: colors.subText, marginTop: 3 }}>
                      Booking status: {statusLabel(item.bookingId?.status || 'pending')}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(280).duration(500)} style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 10 }]}>Reviews and Ratings</Text>

            {services.map(service => (
              <View
                key={service._id}
                style={{
                  borderWidth: 1,
                  borderColor: '#E6ECF3',
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: '700', color: colors.text }}>{service.title}</Text>
                <Text style={{ color: colors.subText, marginTop: 3 }}>
                  Rating {Number(service.avgRating || 0).toFixed(1)} | {service.totalReviews || 0} reviews
                </Text>
              </View>
            ))}

            <Text style={[globalStyles.label, { marginTop: 8, marginBottom: 8 }]}>All Customer Reviews</Text>
            {reviews.length === 0 ? (
              <Text style={{ color: colors.subText }}>No reviews yet.</Text>
            ) : (
              reviews.map(review => (
                <View
                  key={review._id}
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 12,
                    padding: 10,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    {review.customerId?.name || 'Customer'} | Rating {Number(review.rating || 0).toFixed(1)}
                  </Text>
                  <Text style={{ color: colors.subText, marginTop: 2 }}>
                    Service: {review.serviceTitle || 'Service'}
                  </Text>
                  <Text style={{ color: colors.subText, marginTop: 2 }}>
                    {review.comment || 'No written comment'}
                  </Text>
                </View>
              ))
            )}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(340).duration(500)} style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 10 }]}>Profile Edit</Text>
            <Input label="Name" onChangeText={setName} placeholder="Enter your name" value={name} />
            <Input keyboardType="phone-pad" label="Phone" onChangeText={setPhone} placeholder="Enter phone number" value={phone} />
            <Input label="Location" onChangeText={setLocation} placeholder="Your district or city" value={location} />
            <Input label="Skills" onChangeText={setSkillsText} placeholder="Plumbing, Electrical" value={skillsText} />
            <Text style={globalStyles.label}>Bio</Text>
            <TextInput
              multiline
              numberOfLines={4}
              onChangeText={setBio}
              placeholder="Write your provider bio"
              placeholderTextColor="#9b92b3"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.text,
                fontSize: 15,
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: 14,
              }}
              value={bio}
            />
            {saveError ? <Text style={{ color: '#D32F2F', marginBottom: 8 }}>{saveError}</Text> : null}
            {saveMessage ? <Text style={{ color: '#047857', marginBottom: 8 }}>{saveMessage}</Text> : null}
            <Pressable onPress={saveProfile} style={[globalStyles.button, { paddingVertical: 12 }]}>
              <Text style={{ color: 'white', fontWeight: '700' }}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('ManageServices')}
              style={[globalStyles.outlineButton, { marginTop: 10, paddingVertical: 12 }]}
            >
              <Text style={globalStyles.outlineButtonText}>Manage Services</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={[globalStyles.card, { borderRadius: 20 }]}>
            <View style={[globalStyles.headerRow, { marginBottom: 12 }]}>
              <Text style={[globalStyles.label, { marginBottom: 0 }]}>Schedule Calendar</Text>
              <Text style={{ color: colors.subText, fontWeight: '600' }}>
                {savingSchedule ? 'Saving...' : `${selectedDays.length} days selected`}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text
                  key={`${day}-${index}`}
                  style={{ color: colors.subText, fontWeight: '700', width: 34, textAlign: 'center' }}
                >
                  {day}
                </Text>
              ))}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                const active = selectedDays.includes(day);
                return (
                  <Pressable
                    key={`schedule-day-${day}`}
                    onPress={() => toggleDay(day)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? colors.primary : '#F4F7FB',
                    }}
                  >
                    <Text style={{ color: active ? 'white' : colors.text, fontWeight: '700' }}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProviderDashboardScreen;
