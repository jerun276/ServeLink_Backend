import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View, Pressable, StyleSheet, TextInput } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import useAuth from '../../hooks/useAuth';
import { getServiceReviewsRequest, submitServiceReviewRequest } from '../../services/serviceService';

const ServiceDetailsScreen = ({ route, navigation }) => {
  const { service } = route.params || {};
  const { user } = useAuth();
  const [details, setDetails] = useState({});
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  if (!service) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Service not found</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.fallbackButton}>
          <Text style={styles.fallbackButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleOptionSelect = (option, value) => {
    setDetails(prev => ({ ...prev, [option]: value }));
  };

  const onContinue = () => {
    navigation.navigate('Checkout', { service, details });
  };

  const loadReviews = async () => {
    try {
      const rows = await getServiceReviewsRequest(service.id || service._id);
      setReviews(rows);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [service?.id, service?._id]);

  const onSubmitReview = async () => {
    setReviewError('');
    try {
      await submitServiceReviewRequest({
        serviceId: service.id || service._id,
        rating: myRating,
        comment: myComment,
      });
      setMyComment('');
      loadReviews();
    } catch (e) {
      setReviewError(e?.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={{ position: 'relative', margin: 16, borderRadius: 34, overflow: 'hidden', backgroundColor: '#F8C8EE' }}>
          <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: service.image }} style={{ width: '100%', height: '100%', opacity: 0.32 }} />
          </View>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              backgroundColor: '#FFFFFFA8',
              borderRadius: 50,
              padding: 8,
            }}
          >
            <Text style={{ fontSize: 19 }}>‹</Text>
          </Pressable>
          <Pressable style={{ position: 'absolute', top: 14, right: 14, backgroundColor: '#FFFFFFA8', borderRadius: 50, padding: 8 }}>
            <Text style={{ fontSize: 17 }}>🛒</Text>
          </Pressable>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
            <Text style={{ fontSize: 34 }}>🧹</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 18 }}>
          <View>
            <Text style={{ fontSize: 34, fontWeight: '800', color: colors.text }}>{service.title}</Text>
            <Text style={{ color: colors.subText, marginTop: 2 }}>
              horough care, spotless home.
            </Text>
          </View>

          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 34, fontWeight: '900', color: colors.text }}>${service.price}99</Text>
              <Text style={{ textDecorationLine: 'line-through', color: '#8D8D8D', fontWeight: '700' }}>${service.price + 5}99</Text>
            </View>
            <View style={{ backgroundColor: '#D7F4B5', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontWeight: '700', color: '#4D7A2C' }}>Up to 30% Off</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
            <PriceChip label="Classic" price={`${service.price}99`} active />
            <PriceChip label="Premium" price={`${service.price + 4}99`} />
            <PriceChip label="Platinum" price={`${service.price + 6}99`} />
          </View>

          <View style={styles.providerCard}>
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 21 }}>👨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>Marcus Mane</Text>
              <Text style={{ color: '#848484', fontWeight: '600' }}>Service Man</Text>
            </View>
            <Pressable style={styles.smallIcon}>
              <Text>📞</Text>
            </Pressable>
            <Pressable style={styles.smallIcon}>
              <Text>💬</Text>
            </Pressable>
          </View>

          <Text style={[globalStyles.label, { marginTop: 6 }]}>Home Description</Text>
          <Text style={{ color: colors.subText, lineHeight: 20 }}>
            Our Home Deep Cleaning service delivers a thorough, spotless clean for every corner of your house.
            Enjoy a fresh, hygienic, and comfortable living space with professional care.
          </Text>

          {service.options.map(option => (
            <View key={option} style={{ marginTop: 24 }}>
              <Text style={globalStyles.label}>{option}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {['Small', 'Medium', 'Large'].map(val => (
                  <Pressable
                    key={val}
                    onPress={() => handleOptionSelect(option, val)}
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 100,
                      borderWidth: 2,
                      borderColor: details[option] === val ? colors.primary : '#F0F0F0',
                      backgroundColor: details[option] === val ? '#F4EBFF' : 'transparent',
                    }}
                  >
                    <Text style={{ 
                      color: details[option] === val ? colors.primary : colors.subText,
                      fontWeight: '600'
                    }}>
                      {val}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <Text style={[globalStyles.label, { marginTop: 24 }]}>Customer Reviews</Text>
          {reviews.map(item => (
            <View key={item._id} style={[styles.reviewCard, { marginBottom: 8 }]}>
              <Text style={{ fontWeight: '700', color: colors.text }}>{item.customerId?.name || 'Customer'}</Text>
              <Text style={{ color: colors.subText, marginTop: 2 }}>Rating: {item.rating}/5</Text>
              <Text style={{ color: colors.subText, marginTop: 4 }}>{item.comment || 'No comment'}</Text>
            </View>
          ))}
          {reviews.length === 0 ? <Text style={{ color: colors.subText }}>No reviews yet.</Text> : null}

          {user?.role === 'customer' ? (
            <View style={[styles.reviewCard, { marginTop: 12 }]}>
              <Text style={[globalStyles.label, { marginBottom: 8 }]}>Add Your Review</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Pressable key={star} onPress={() => setMyRating(star)} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 18 }}>{star <= myRating ? '⭐' : '☆'}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={myComment}
                onChangeText={setMyComment}
                placeholder="Write your review comment"
                placeholderTextColor="#999"
                style={{ backgroundColor: '#F5F5F5', borderRadius: 12, padding: 10, color: colors.text }}
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {['Great work', 'On time', 'Very professional'].map(text => (
                  <Pressable key={text} onPress={() => setMyComment(text)} style={styles.quickComment}>
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>{text}</Text>
                  </Pressable>
                ))}
              </View>
              {reviewError ? <Text style={{ color: '#D63A65', marginTop: 8 }}>{reviewError}</Text> : null}
              <Pressable onPress={onSubmitReview} style={[styles.bookNowButton, { marginTop: 10 }]}>
                <Text style={{ color: 'white', fontWeight: '700' }}>Submit Review</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, paddingHorizontal: 20, paddingVertical: 14 }}>
          <Text style={{ fontSize: 34, fontWeight: '900', color: colors.text }}>${service.price}99</Text>
        </View>
        <Pressable onPress={onContinue} style={styles.bookNowButton}>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
};

const PriceChip = ({ label, price, active = false }) => (
  <Pressable
    style={{
      backgroundColor: active ? '#1E1E1E' : '#F2F2F6',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minWidth: 92,
    }}
  >
    <Text style={{ color: active ? '#FFFFFF' : '#9A9A9A', fontWeight: '600', fontSize: 12 }}>{label}</Text>
    <Text style={{ color: active ? '#FFFFFF' : '#323232', fontWeight: '800', marginTop: 2 }}>${price}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  fallbackButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  fallbackButtonText: { color: 'white', fontWeight: '700' },
  providerCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 30,
    backgroundColor: '#EEEAFD',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookNowButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
  },
  quickComment: {
    backgroundColor: '#F4EBFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});

export default ServiceDetailsScreen;
