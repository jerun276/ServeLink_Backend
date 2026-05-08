import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import useAuth from '../../hooks/useAuth';
import { SERVICE_PROVIDERS } from '../../utils/constants';
import { formatLkr } from '../../utils/currency';
import { getConversationsRequest, openProviderConversationRequest } from '../../services/chatService';

const RATING_FILTERS = [0, 4, 4.5];

const ServiceDetailsScreen = ({ route, navigation }) => {
  const { service } = route.params || {};
  const { user } = useAuth();

  const [details, setDetails] = useState({});
  const [providerTypeFilter, setProviderTypeFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [selectedProviderId, setSelectedProviderId] = useState('');

  const allProviders = useMemo(() => {
    if (!service) return [];
    const rows = SERVICE_PROVIDERS[service.id] || [];

    if (rows.length > 0) return rows;

    return [
      {
        id: `usr-${service.id || 'fallback'}`,
        name: service.provider || 'Available Provider',
        photo: service.image,
        headline: 'Trusted verified provider',
        providerType: 'Individual',
        district: service.district || 'Sri Lanka',
        phone: '+94770000000',
        rating: 4.5,
        reviewCount: 30,
        completedJobs: 120,
        responseTime: '15 mins',
        price: service.price,
        services: service.options || ['General service'],
        workMention: 'Professional service with clear communication and clean work.',
        reviews: [{ by: 'Customer', text: 'Reliable and professional service.', rating: 4.5 }],
      },
    ];
  }, [service]);

  const providerTypeOptions = useMemo(() => {
    const types = Array.from(new Set(allProviders.map(item => item.providerType)));
    return ['All', ...types];
  }, [allProviders]);

  const filteredProviders = useMemo(() => {
    const list = allProviders
      .filter(provider => (providerTypeFilter === 'All' ? true : provider.providerType === providerTypeFilter))
      .filter(provider => provider.rating >= ratingFilter);

    const sorted = [...list];
    if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'price_low') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_high') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'jobs') sorted.sort((a, b) => b.completedJobs - a.completedJobs);
    return sorted;
  }, [allProviders, providerTypeFilter, ratingFilter, sortBy]);

  const selectedProvider = useMemo(
    () => filteredProviders.find(provider => provider.id === selectedProviderId) || filteredProviders[0],
    [filteredProviders, selectedProviderId],
  );

  useEffect(() => {
    if (!selectedProvider && filteredProviders.length > 0) {
      setSelectedProviderId(filteredProviders[0].id);
      return;
    }

    if (selectedProviderId && !filteredProviders.some(provider => provider.id === selectedProviderId)) {
      setSelectedProviderId(filteredProviders[0]?.id || '');
    }
  }, [filteredProviders, selectedProvider, selectedProviderId]);

  if (!service) {
    return (
      <View style={styles.fallbackContainer}>
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
    if (!selectedProvider) {
      Alert.alert('No provider selected', 'Please adjust filters or select a provider to continue.');
      return;
    }

    navigation.navigate('Checkout', {
      service,
      details,
      provider: selectedProvider,
    });
  };

  const onContactProvider = async (provider, mode) => {

    if (mode === 'sms') {
      try {
        const conversation = await openProviderConversationRequest(provider.id);
        
        if (conversation) {
          const displayName = provider.name || 'Provider';
          navigation.navigate('Chats', { 
            screen: 'ChatThread', 
            params: { conversationId: conversation._id, title: displayName } 
          });
        }
      } catch (err) {
        Alert.alert('Chat Error', err.response?.data?.message || 'Unable to start chat at this time.');
      }
      return;
    }

    const url = mode === 'call' ? `tel:${provider.phone}` : `sms:${provider.phone}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open contact app', 'Please try again on a device with phone/SMS support.');
    }
  };

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Image source={{ uri: service.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroCategory}>{service.category}</Text>
            <Text style={styles.heroTitle}>{service.title}</Text>
            <Text style={styles.heroPrice}>Starts from {formatLkr(service.price)} / day</Text>
          </View>
        </View>

        <View style={styles.contentWrap}>
          <Text style={styles.sectionTitle}>Provider filters</Text>

          <Text style={styles.filterLabel}>Provider type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {providerTypeOptions.map(type => (
              <FilterChip
                key={type}
                active={providerTypeFilter === type}
                label={type}
                onPress={() => setProviderTypeFilter(type)}
              />
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Minimum rating</Text>
          <View style={styles.rowWrap}>
            {RATING_FILTERS.map(value => (
              <FilterChip
                key={String(value)}
                active={ratingFilter === value}
                label={value === 0 ? 'Any' : `${value}+`}
                onPress={() => setRatingFilter(value)}
              />
            ))}
          </View>

          <Text style={styles.filterLabel}>Sort by</Text>
          <View style={styles.rowWrap}>
            <FilterChip active={sortBy === 'rating'} label="Top rated" onPress={() => setSortBy('rating')} />
            <FilterChip active={sortBy === 'jobs'} label="Most jobs" onPress={() => setSortBy('jobs')} />
            <FilterChip active={sortBy === 'price_low'} label="Price low" onPress={() => setSortBy('price_low')} />
            <FilterChip active={sortBy === 'price_high'} label="Price high" onPress={() => setSortBy('price_high')} />
          </View>

          <Text style={styles.sectionTitle}>Available providers</Text>
          {filteredProviders.map(provider => {
            const isSelected = selectedProvider?.id === provider.id;
            return (
              <Pressable
                key={provider.id}
                onPress={() => setSelectedProviderId(provider.id)}
                style={[styles.providerCard, isSelected && styles.providerCardSelected]}
              >
                <View style={styles.providerHeader}>
                  <Image source={{ uri: provider.photo || service.image }} style={styles.providerPhoto} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerHeadline}>{provider.headline || 'Experienced provider'}</Text>
                    <Text style={styles.providerMeta}>
                      {provider.providerType} | {provider.district}
                    </Text>
                  </View>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>{formatLkr(provider.price)} / day</Text>
                  </View>
                </View>

                <View style={styles.providerStatsRow}>
                  <Text style={styles.providerStatsText}>Rating {provider.rating} ({provider.reviewCount} reviews)</Text>
                  <Text style={styles.providerStatsText}>Jobs {provider.completedJobs}</Text>
                  <Text style={styles.providerStatsText}>Reply {provider.responseTime}</Text>
                </View>
                <Text style={styles.providerServices}>Services: {(provider.services || []).join(', ')}</Text>
                <Text style={styles.workMention}>Work: {provider.workMention || 'Quality service delivery.'}</Text>

                <View style={styles.contactRow}>
                  <Pressable
                    onPress={() => onContactProvider(provider, 'call')}
                    style={styles.contactButton}
                  >
                    <Text style={styles.contactButtonText}>Call</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onContactProvider(provider, 'sms')}
                    style={styles.contactButton}
                  >
                    <Text style={styles.contactButtonText}>Message</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setSelectedProviderId(provider.id);
                      onContinue();
                    }}
                    style={[styles.contactButton, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.contactButtonText}>Book Now</Text>
                  </Pressable>
                </View>

                <Text style={styles.reviewsTitle}>Recent reviews for this user</Text>
                {(provider.reviews || []).slice(0, 2).map((review, index) => (
                  <View key={`${provider.id}-review-${index}`} style={styles.reviewItem}>
                    <Text style={styles.reviewText}>
                      {review.by}: {review.text}
                    </Text>
                    <Text style={styles.reviewRating}>Rating {review.rating}</Text>
                  </View>
                ))}
              </Pressable>
            );
          })}

          {filteredProviders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No providers found</Text>
              <Text style={styles.emptyText}>Try different provider filters for this service.</Text>
            </View>
          ) : null}

          <Text style={[globalStyles.label, { marginTop: 16 }]}>Service options</Text>
          {service.options.map(option => (
            <View key={option} style={{ marginTop: 14 }}>
              <Text style={styles.optionTitle}>{option}</Text>
              <View style={styles.rowWrap}>
                {['Small', 'Medium', 'Large'].map(value => (
                  <Pressable
                    key={value}
                    onPress={() => handleOptionSelect(option, value)}
                    style={[
                      styles.optionChip,
                      details[option] === value ? styles.optionChipActive : null,
                    ]}
                  >
                    <Text style={details[option] === value ? styles.optionChipTextActive : styles.optionChipText}>
                      {value}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <View style={{ marginBottom: 30 }} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.bottomPrice}>{selectedProvider ? `${formatLkr(selectedProvider.price)} / day` : `${formatLkr(service.price)} / day`}</Text>
          <Text style={styles.bottomSubTitle}>{selectedProvider ? selectedProvider.name : 'Select provider'}</Text>
        </View>
        <Pressable onPress={onContinue} style={styles.bookNowButton}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
};

const FilterChip = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  fallbackButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 150,
  },
  heroCard: {
    margin: 16,
    borderRadius: 28,
    overflow: 'hidden',
    height: 260,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 30, 46, 0.45)',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFFFFFD9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#1A2A44',
    fontWeight: '700',
    fontSize: 12,
  },
  heroTextWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  heroCategory: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.95,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    marginTop: 4,
  },
  heroPrice: {
    color: '#E2F2FF',
    marginTop: 6,
    fontWeight: '700',
  },
  contentWrap: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 13,
    color: '#4F617A',
    fontWeight: '700',
    marginBottom: 8,
  },
  filterRow: {
    marginBottom: 10,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#EAF0F6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#0F766E',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#42526A',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DEE6EF',
    padding: 14,
    marginBottom: 12,
  },
  providerCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F5FCFA',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerPhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 10,
  },
  providerName: {
    color: '#13253F',
    fontSize: 17,
    fontWeight: '800',
  },
  providerHeadline: {
    color: '#2C4D70',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  providerMeta: {
    color: '#60728E',
    marginTop: 3,
    fontWeight: '600',
    fontSize: 12,
  },
  priceBadge: {
    backgroundColor: '#EEF4FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  priceBadgeText: {
    color: '#0A3D75',
    fontWeight: '700',
    fontSize: 12,
  },
  providerStatsRow: {
    marginBottom: 8,
  },
  providerStatsText: {
    color: '#526583',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 3,
  },
  providerServices: {
    color: '#314B6B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  workMention: {
    color: '#5A6F89',
    fontSize: 12,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  contactButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  contactDisabled: {
    opacity: 0.45,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  reviewsTitle: {
    color: '#152B4C',
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 12,
  },
  reviewItem: {
    backgroundColor: '#F6F9FD',
    borderRadius: 10,
    padding: 8,
    marginBottom: 6,
  },
  reviewText: {
    color: '#3A4F6F',
    fontSize: 12,
    marginBottom: 2,
  },
  reviewRating: {
    color: '#607089',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DEE6EF',
    marginBottom: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 4,
    color: colors.subText,
  },
  optionTitle: {
    color: '#23385A',
    fontWeight: '700',
    marginBottom: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8E2ED',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#E9F7F4',
  },
  optionChipText: {
    color: '#5E6F85',
    fontWeight: '600',
  },
  optionChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  helperText: {
    marginTop: 8,
    color: '#5C6E86',
    fontSize: 12,
    marginBottom: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 150,
    left: 14,
    right: 14,
    borderRadius: 20,
    backgroundColor: '#E7EFF8',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomPriceWrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  bottomPrice: {
    color: '#10213A',
    fontWeight: '800',
    fontSize: 14,
  },
  bottomSubTitle: {
    color: '#63738A',
    marginTop: 3,
    fontSize: 11,
  },
  bookNowButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

export default ServiceDetailsScreen;
