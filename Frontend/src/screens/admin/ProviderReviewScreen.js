import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import {
  deleteReviewAsAdminRequest,
  getProviderReviewDetailRequest,
  verifyProviderRequest,
} from '../../services/adminService';

const ProviderReviewScreen = ({ route, navigation }) => {
  const providerId = route?.params?.providerId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);

  const loadDetail = async () => {
    if (!providerId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getProviderReviewDetailRequest(providerId);
      setProvider(data.provider || null);
      setServices(data.services || []);
      setReviews(data.reviews || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not load provider review details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [providerId]);

  const verify = async action => {
    if (!provider) return;
    if (action === 'reject' && !rejectionReason.trim()) {
      setError('Rejection reason is required before rejecting.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await verifyProviderRequest(provider._id, {
        action,
        reason: action === 'reject' ? rejectionReason.trim() : '',
      });
      setSuccessMessage(`Provider ${action}d successfully.`);
      await loadDetail();
      navigation.setParams({ refreshDashboard: Date.now() });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to submit verification decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async reviewId => {
    try {
      await deleteReviewAsAdminRequest(reviewId);
      setReviews(prev => prev.filter(item => item._id !== reviewId));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not delete review.');
    }
  };

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.screen}>
          <View style={[globalStyles.headerRow, { marginBottom: 10 }]}>
            <View>
              <Text style={{ color: colors.subText, fontWeight: '700' }}>Provider Review</Text>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 22 }}>
                {provider?.businessName || 'Loading...'}
              </Text>
            </View>
            <Pressable onPress={loadDetail}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{loading ? 'Loading...' : 'Refresh'}</Text>
            </Pressable>
          </View>

          {error ? <Text style={{ color: colors.danger, marginBottom: 10 }}>{error}</Text> : null}
          {successMessage ? <Text style={{ color: colors.success, marginBottom: 10 }}>{successMessage}</Text> : null}

          <View style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 6 }]}>Identity & Business</Text>
            <Text style={{ color: colors.subText }}>
              User: {provider?.userId?.name || 'N/A'} ({provider?.userId?.email || 'N/A'})
            </Text>
            <Text style={{ color: colors.subText, marginTop: 4 }}>NIC: {provider?.nicNumber || 'N/A'}</Text>
            <Text style={{ color: colors.subText, marginTop: 4 }}>
              Status: {provider?.verificationStatus || 'pending'}
            </Text>
            <Text style={{ color: colors.subText, marginTop: 8 }}>NIC Image URL:</Text>
            <Text selectable style={{ color: colors.text, fontSize: 12 }}>{provider?.nicImageUrl || 'Not available'}</Text>
            <Text style={{ color: colors.subText, marginTop: 8 }}>Business Registration URL:</Text>
            <Text selectable style={{ color: colors.text, fontSize: 12 }}>
              {provider?.businessRegUrl || 'Not provided'}
            </Text>
          </View>

          <View style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 8 }]}>Verification Decision</Text>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={setRejectionReason}
              placeholder="Rejection reason (required for reject)"
              placeholderTextColor="#8A97AB"
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#DDE5EF',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: 84,
                textAlignVertical: 'top',
                marginBottom: 10,
              }}
              value={rejectionReason}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => verify('approve')}
                style={[globalStyles.button, { flex: 1, paddingVertical: 12, backgroundColor: colors.success }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  {submitting ? 'Submitting...' : 'Approve'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => verify('reject')}
                style={[globalStyles.button, { flex: 1, paddingVertical: 12, backgroundColor: colors.danger }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  {submitting ? 'Submitting...' : 'Reject'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 8 }]}>Services ({services.length})</Text>
            {services.length === 0 ? (
              <Text style={{ color: colors.subText }}>No services yet.</Text>
            ) : (
              services.map(item => (
                <View
                  key={item._id}
                  style={{ borderWidth: 1, borderColor: '#E6ECF3', borderRadius: 12, padding: 10, marginBottom: 8 }}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{item.title}</Text>
                  <Text style={{ color: colors.subText, marginTop: 2 }}>
                    {item.category} | {item.pricingType} | {item.district}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 8 }]}>Recent Reviews ({reviews.length})</Text>
            {reviews.length === 0 ? (
              <Text style={{ color: colors.subText }}>No reviews available.</Text>
            ) : (
              reviews.map(item => (
                <View
                  key={item._id}
                  style={{ borderWidth: 1, borderColor: '#E6ECF3', borderRadius: 12, padding: 10, marginBottom: 8 }}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {item.customerId?.name || 'Customer'} | Rating {item.rating}
                  </Text>
                  <Text style={{ color: colors.subText, marginTop: 4 }}>{item.comment || 'No comment'}</Text>
                  <Pressable onPress={() => deleteReview(item._id)} style={{ marginTop: 8 }}>
                    <Text style={{ color: colors.danger, fontWeight: '700' }}>Delete Review</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProviderReviewScreen;
