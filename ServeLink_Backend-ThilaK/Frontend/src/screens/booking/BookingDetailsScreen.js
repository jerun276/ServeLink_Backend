import { ScrollView, Text, View, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import Button from '../../components/common/Button';
import { useBookingContext } from '../../context/BookingContext';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';

const BookingDetailsScreen = ({ navigation, route }) => {
  const { bookingId } = route.params || {};
  const { getBookingById } = useBookingContext();
  const booking = getBookingById(bookingId);

  if (!booking) {
    return (
      <View style={[globalStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={globalStyles.title}>Booking Not Found</Text>
        <Button style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>Back to List</Button>
      </View>
    );
  }

  return (
    <View style={globalStyles.appBackground}>
      <View style={[globalStyles.screen, { paddingBottom: 0 }]}>
        <Animated.View entering={FadeInDown.duration(600)} style={globalStyles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={globalStyles.iconButton}>
            <Text style={{ fontSize: 20 }}>⬅️</Text>
          </Pressable>
          <Text style={[globalStyles.title, { fontSize: 22 }]}>Booking Details</Text>
          <Pressable
            style={globalStyles.iconButton}
            onPress={() =>
              navigation.navigate('BookingChatThread', {
                bookingId: booking._id,
                title: booking.providerName,
              })
            }
          >
            <Text style={{ fontSize: 20 }}>💬</Text>
          </Pressable>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={[globalStyles.card, { padding: 0, overflow: 'hidden' }]}>
          <View style={{ height: 180, backgroundColor: '#F0E6FF', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 60 }}>🗺️</Text>
            <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 10 }}>View on Live Map</Text>
          </View>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[globalStyles.title, { fontSize: 20 }]}>{booking.serviceTitle}</Text>
              <View style={{ backgroundColor: '#F4EBFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{booking.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[globalStyles.subTitle, { marginTop: 4 }]}>{booking.providerName}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={[globalStyles.card, { padding: 20 }]}>
          <Text style={[globalStyles.label, { marginBottom: 12 }]}>Service Details</Text>
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 18 }}>📅</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Date & Time</Text>
                <Text style={{ color: colors.subText }}>{new Date(booking.scheduledAt).toLocaleString()}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 18 }}>📍</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Address</Text>
                <Text style={{ color: colors.subText }}>{booking.address}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 18 }}>💵</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Amount</Text>
                <Text style={{ color: colors.subText }}>${booking.amount}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {booking.notes ? (
          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={[globalStyles.card, { padding: 20 }]}>
            <Text style={globalStyles.label}>Notes from Customer</Text>
            <Text style={{ color: colors.subText, marginTop: 8, lineHeight: 20 }}>{booking.notes}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInUp.delay(500).duration(600)}>
          <Button
            onPress={() =>
              navigation.navigate('BookingChatThread', {
                bookingId: booking._id,
                title: booking.providerName,
              })
            }
            style={{ marginTop: 12 }}
          >
            Chat with Provider
          </Button>
          <Button 
            variant="outline" 
            onPress={() => navigation.navigate('Home')}
            style={{ marginTop: 20 }}
          >
            Book Another Service
          </Button>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default BookingDetailsScreen;
