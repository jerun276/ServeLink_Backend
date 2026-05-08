import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import { SERVICES_CATALOG, SERVICE_PROVIDERS } from '../../utils/constants';
import { formatLkr } from '../../utils/currency';

const SORT_OPTIONS = [
  { key: 'popular', label: 'Popular' },
  { key: 'rating', label: 'Top rated' },
  { key: 'price_low', label: 'Price low' },
  { key: 'price_high', label: 'Price high' },
];

const PRICE_OPTIONS = [
  { key: 'all', label: 'Any price' },
  { key: 'budget', label: 'LKR 3,000 / day' },
  { key: 'standard', label: 'LKR 4,000 / day' },
  { key: 'premium', label: 'LKR 5,000+ / day' },
];

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [minRating, setMinRating] = useState(0);

  const categories = useMemo(
    () => ['All', 'Painting', 'Laundry', 'Appliance', 'Plumbing', 'Shifting'],
    [],
  );

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const getTopProviderRating = serviceItem => {
      const providers = SERVICE_PROVIDERS[serviceItem.id] || [];
      if (!providers.length) return Number(serviceItem.rating || 0);
      return Math.max(...providers.map(provider => provider.rating || 0));
    };

    const priceBounds = {
      all: { min: 0, max: Number.MAX_SAFE_INTEGER },
      budget: { min: 0, max: 3 },
      standard: { min: 4, max: 4 },
      premium: { min: 5, max: Number.MAX_SAFE_INTEGER },
    };
    const selectedPrice = priceBounds[priceFilter] || priceBounds.all;

    const list = SERVICES_CATALOG.filter(item => {
      const topProviderRating = getTopProviderRating(item);
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.provider.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery);
      const matchesCategory = activeTab === 'All' || item.category === activeTab;
      const matchesPrice = item.price >= selectedPrice.min && item.price <= selectedPrice.max;
      const matchesRating = topProviderRating >= minRating;
      return matchesQuery && matchesCategory && matchesPrice && matchesRating;
    });

    const sorted = [...list];
    if (sortBy === 'price_low') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_high') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') sorted.sort((a, b) => getTopProviderRating(b) - getTopProviderRating(a));
    if (sortBy === 'popular') sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return sorted;
  }, [activeTab, minRating, priceFilter, query, sortBy]);

  const featuredService = filteredServices[0] || SERVICES_CATALOG[0];
  const featuredTopRating = useMemo(() => {
    const providers = SERVICE_PROVIDERS[featuredService.id] || [];
    if (!providers.length) return Number(featuredService.rating || 0);
    return Math.max(...providers.map(provider => provider.rating || 0));
  }, [featuredService]);

  const openService = service => {
    navigation.navigate('ServiceDetails', { service });
  };

  const resetFilters = () => {
    setSortBy('popular');
    setPriceFilter('all');
    setMinRating(0);
  };

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[globalStyles.screen, { paddingTop: 40 }]}>
          <Text style={styles.pageTitle}>Find trusted services you can book today</Text>

          <View style={styles.searchBox}>
            <TextInput
              onChangeText={setQuery}
              placeholder="Search by service, provider or category"
              placeholderTextColor="#7B8596"
              style={styles.searchInput}
              value={query}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
            {categories.map(tab => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.categoryChip, activeTab === tab && styles.activeCategoryChip]}
              >
                <Text style={[styles.categoryChipText, activeTab === tab && styles.activeCategoryChipText]}>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={{ marginBottom: 20 }} />

          <Pressable onPress={() => openService(featuredService)} style={styles.featuredCard}>
            <ImageBackground
              imageStyle={styles.featuredImage}
              source={{ uri: featuredService.image }}
              style={styles.featuredCardContent}
            >
              <View style={styles.featuredOverlay} />
              <View style={styles.featuredTextLayer}>
                <Text style={styles.featuredBadge}>Fast booking</Text>
                <Text style={styles.featuredTitle}>{featuredService.title}</Text>
                <Text style={styles.featuredMeta}>
                  {featuredService.provider} | {featuredService.district} | top user rating {featuredTopRating.toFixed(1)}
                </Text>
                <View style={styles.featuredPriceRow}>
                  <Text style={styles.featuredPrice}>{formatLkr(featuredService.price)} / day</Text>
                  <Text style={styles.featuredPriceLabel}>starting price</Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>

          <View style={styles.servicesList}>
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                onPress={() => openService(service)}
                service={service}
                providerCount={(SERVICE_PROVIDERS[service.id] || []).length}
                topProviderRating={(SERVICE_PROVIDERS[service.id] || []).length ? Math.max(...SERVICE_PROVIDERS[service.id].map(provider => provider.rating || 0)) : Number(service.rating || 0)}
              />
            ))}
            {filteredServices.length === 0 ? (
              <View style={[globalStyles.card, styles.emptyState]}>
                <Text style={styles.emptyStateTitle}>No services found</Text>
                <Text style={styles.emptyStateText}>Try a different search, rating, or price filter.</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const FilterGroup = ({ label, options, activeValue, onChange }) => (
  <View style={styles.filterGroup}>
    <Text style={styles.filterLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {options.map(option => (
        <FilterChip
          key={option.key}
          active={activeValue === option.key}
          label={option.label}
          onPress={() => onChange(option.key)}
        />
      ))}
    </ScrollView>
  </View>
);

const ServiceCard = ({ service, onPress, providerCount, topProviderRating }) => (
  <Pressable onPress={onPress} style={styles.serviceCard}>
    <Image source={{ uri: service.image }} style={styles.serviceImage} />
    <View style={styles.serviceInfo}>
      <Text style={styles.serviceTitle}>{service.title}</Text>
      <Text style={styles.serviceMeta}>
        {service.provider} | {service.district}
      </Text>
      <View style={styles.serviceStatsRow}>
        <Text style={styles.statText}>Users {providerCount || 1}</Text>
        <Text style={styles.statText}>Top rating {Number(topProviderRating || 0).toFixed(1)}</Text>
      </View>
      <Text style={styles.optionText}>
        Options: {service.options.slice(0, 2).join(', ')}
      </Text>
      <View style={styles.purchaseRow}>
        <Text style={styles.priceText}>{formatLkr(service.price)} / day</Text>
        <View style={styles.purchaseButton}>
          <Text style={styles.purchaseButtonText}>Book Now</Text>
        </View>
      </View>
    </View>
  </Pressable>
);

const FilterChip = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.filterChip, active && styles.activeFilterChip]}
  >
    <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 160,
  },
  welcomeText: {
    color: '#5A6578',
    fontSize: 13,
    fontWeight: '600',
  },
  customerName: {
    color: '#182438',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  locationText: {
    color: '#6D7787',
    fontSize: 12,
    marginTop: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  pageTitle: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    color: '#10213A',
    marginBottom: 20,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBE1EA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 18,
  },
  searchInput: {
    color: '#162339',
    fontSize: 15,
    paddingVertical: 9,
  },
  horizontalList: {
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#EEF2F7',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#0F766E',
  },
  categoryChipText: {
    color: '#415067',
    fontSize: 13,
    fontWeight: '700',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
  },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E7EE',
    padding: 14,
    marginBottom: 18,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    color: '#15253F',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#F4F7FA',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#102A43',
  },
  filterChipText: {
    color: '#42516A',
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  ratingRow: {
    marginTop: 2,
  },
  ratingChipsWrap: {
    flexDirection: 'row',
  },
  featuredCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  featuredCardContent: {
    height: 230,
    justifyContent: 'flex-end',
  },
  featuredImage: {
    borderRadius: 24,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 24, 44, 0.45)',
  },
  featuredTextLayer: {
    padding: 18,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    color: '#0B2D4D',
    fontWeight: '700',
    fontSize: 11,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 29,
  },
  featuredMeta: {
    color: '#DEECFF',
    fontSize: 13,
    marginTop: 7,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
  },
  featuredPrice: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  featuredPriceLabel: {
    color: '#DAE7FA',
    fontSize: 12,
    marginLeft: 8,
  },
  servicesList: {
    rowGap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E7EE',
    overflow: 'hidden',
  },
  serviceImage: {
    width: 124,
    height: 170,
  },
  serviceInfo: {
    flex: 1,
    padding: 12,
  },
  serviceTitle: {
    fontSize: 16,
    color: '#12223C',
    fontWeight: '800',
    lineHeight: 21,
  },
  serviceMeta: {
    marginTop: 5,
    color: '#607089',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  statText: {
    color: '#3D4D66',
    fontSize: 12,
    fontWeight: '700',
  },
  optionText: {
    color: '#64758D',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 17,
  },
  purchaseRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '800',
    flexShrink: 1,
    marginRight: 8,
  },
  purchaseButton: {
    backgroundColor: '#0F766E',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyState: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E7EE',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyStateText: {
    color: colors.subText,
    marginTop: 4,
  },
});

export default HomeScreen;
