import { Pressable, Text, View, Image } from 'react-native';
import Animated, { FadeInUp, FadeOut, LinearTransition } from 'react-native-reanimated';
import Button from '../common/Button';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import { STATUS_LABELS } from '../../utils/constants';

const BookingCard = ({ booking, onOpen, onCancel, onReview }) => {
  const canCancel = booking.status === 'pending';
  const canReview = booking.status === 'completed' && !booking.isReviewed;

  // Generic image placeholder for now
  const image = 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&w=300&q=80';

  const statusColors = {
    pending: { bg: '#FFF9E6', text: '#FFD300' },
    completed: { bg: '#E6FFF2', text: '#07BD74' },
    cancelled: { bg: '#FFEBEB', text: '#F75555' },
    in_progress: { bg: '#E6F0FF', text: '#3385FF' },
  };

  const statusStyle = statusColors[booking.status] || { bg: '#F5F5F5', text: '#9E9E9E' };

  return (
    <Animated.View 
      entering={FadeInUp.duration(500)} 
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.springify().damping(20)}
    >
      <View style={globalStyles.card}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Image source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 20 }} />
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{booking.serviceTitle}</Text>
              <Text style={[globalStyles.subTitle, { marginTop: 2 }]}>{booking.providerName}</Text>
            </View>
            <View style={{ 
              alignSelf: 'flex-start',
              backgroundColor: statusStyle.bg, 
              paddingHorizontal: 10, 
              paddingVertical: 4, 
              borderRadius: 8 
            }}>
              <Text style={{ color: statusStyle.text, fontSize: 12, fontWeight: '700' }}>
                {STATUS_LABELS[booking.status] || booking.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: '#F5F5F5', marginVertical: 16 }} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button 
            onPress={() => onOpen(booking)} 
            variant="outline" 
            style={{ flex: 1, paddingVertical: 12 }}
            textStyle={{ fontSize: 14 }}
          >
            View Details
          </Button>
          {canCancel && (
            <Button 
              onPress={() => onCancel(booking)} 
              style={{ flex: 1, backgroundColor: '#FFEBEB', elevation: 0 }}
              textStyle={{ color: '#F75555', fontSize: 14 }}
            >
              Cancel Booking
            </Button>
          )}
          {canReview && (
            <Button 
              onPress={() => onReview(booking)} 
              style={{ flex: 1 }}
              textStyle={{ fontSize: 14 }}
            >
              Leave Review
            </Button>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default BookingCard;

