import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, LinearTransition } from 'react-native-reanimated';
import BookingCard from '../../components/booking/BookingCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useBookingContext } from '../../context/BookingContext';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import { BOOKING_TABS } from '../../utils/constants';

const BookingListScreen = ({ navigation }) => {
  const { loading, error, getBookingsByTab, cancelBooking, submitReview } = useBookingContext();
  const [tab, setTab] = useState('upcoming');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [pinModal, setPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const bookings = useMemo(() => {
    const list = getBookingsByTab(tab);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(b => 
      b.serviceTitle?.toLowerCase().includes(q) || 
      b.providerName?.toLowerCase().includes(q)
    );
  }, [getBookingsByTab, tab, searchQuery]);

  const confirmCancel = async () => {
    try {
      await cancelBooking(cancelTarget._id, pin);
      setPinModal(false);
      setPin('');
      setCancelTarget(null);
      setSuccessModal(true);
    } catch (e) {
      alert(e.message || 'Failed to cancel booking');
    }
  };

  const onSubmitReview = async () => {
    if (!reviewTarget) return;
    await submitReview({ bookingId: reviewTarget._id, rating: Number(rating), comment });
    setReviewTarget(null);
  };

  return (
    <View style={globalStyles.appBackground}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Animated.View entering={FadeInDown.duration(600)} style={globalStyles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 16 }}>📋</Text>
            </View>
            <Text style={globalStyles.title}>My Bookings</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={() => setShowSearch(!showSearch)} style={globalStyles.iconButton}>
              <Text style={{ fontSize: 20 }}>🔍</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Chats')} style={globalStyles.iconButton}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </Pressable>
          </View>
        </Animated.View>

        {showSearch && (
          <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={{ marginBottom: 15 }}>
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search bookings..."
              placeholderTextColor="#9E9E9E"
              style={[globalStyles.input, { elevation: 1, height: 50, borderRadius: 12 }]}
              value={searchQuery}
            />
          </Animated.View>
        )}

        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 20 }}>
          {BOOKING_TABS.map((item, index) => (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderBottomWidth: tab === item ? 3 : 0,
                borderBottomColor: colors.primary,
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                color: tab === item ? colors.primary : '#9E9E9E', 
                textTransform: 'capitalize', 
                fontWeight: '700',
                fontSize: 16
              }}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        {loading ? <Loader label="Refreshing bookings..." /> : null}
        
        {bookings.length === 0 ? (
          <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center', marginTop: 100 }}>
            <View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: '#F8F9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 80 }}>Empty</Text>
            </View>
            <Text style={[globalStyles.title, { fontSize: 22 }]}>No {tab} bookings</Text>
            <Text style={[globalStyles.subTitle, { textAlign: 'center', marginTop: 10 }]}>You don't have any {tab} bookings yet.</Text>
          </Animated.View>
        ) : (
          bookings.map((booking, index) => (
            <Animated.View 
              key={booking._id} 
              entering={FadeInUp.delay(index * 100).duration(500)}
              layout={LinearTransition.springify().damping(20)}
            >
              <BookingCard
                booking={booking}
                onCancel={setCancelTarget}
                onOpen={item => navigation.navigate('BookingDetails', { bookingId: item._id })}
                onReview={setReviewTarget}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Modals */}
      <Modal transparent visible={Boolean(cancelTarget) && !pinModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { padding: 30 }]}>
            <Text style={[globalStyles.title, { textAlign: 'center' }]}>Cancel Booking</Text>
            <Text style={[globalStyles.subTitle, { textAlign: 'center', marginTop: 12, marginBottom: 30 }]}>Are you sure you want to cancel this booking? This action cannot be undone.</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button onPress={() => setCancelTarget(null)} style={{ flex: 1, backgroundColor: '#F5F5F5', elevation: 0 }} textStyle={{ color: colors.text }}>No, Keep</Button>
              <Button onPress={() => setPinModal(true)} style={{ flex: 1 }}>Yes, Cancel</Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={pinModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { padding: 30 }]}>
            <Text style={[globalStyles.title, { textAlign: 'center' }]}>Enter Your PIN</Text>
            <Text style={[globalStyles.subTitle, { textAlign: 'center', marginTop: 12, marginBottom: 24 }]}>Enter your PIN to confirm cancellation.</Text>
            <TextInput
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={setPin}
              placeholder="••••"
              placeholderTextColor="#9E9E9E"
              style={[globalStyles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 10 }]}
              value={pin}
              secureTextEntry
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <Button onPress={() => setPinModal(false)} style={{ flex: 1, variant: 'outline' }} variant="outline">Back</Button>
              <Button onPress={confirmCancel} style={{ flex: 1 }}>Confirm</Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={successModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { padding: 30, alignItems: 'center' }]}>
             <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 40 }}>✅</Text>
            </View>
            <Text style={[globalStyles.title, { textAlign: 'center' }]}>Cancelled!</Text>
            <Text style={[globalStyles.subTitle, { textAlign: 'center', marginTop: 12, marginBottom: 30 }]}>Your booking has been cancelled successfully.</Text>
            <Button style={{ width: '100%' }} onPress={() => setSuccessModal(false)}>OK</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BookingListScreen;
