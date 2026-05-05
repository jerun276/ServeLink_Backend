import { ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import { SERVICES_CATALOG } from '../../utils/constants';

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
    const colorPool = ['#F8C6EB', '#D6F1C9', '#F8E7B6', '#CDEAFF', '#EBD8FF'];
    const normalizedQuery = query.trim().toLowerCase();

    const priceBounds = {
      all: { min: 0, max: Number.MAX_SAFE_INTEGER },
      budget: { min: 0, max: 24 },
      standard: { min: 25, max: 29 },
      premium: { min: 30, max: Number.MAX_SAFE_INTEGER },
    };
    const selectedPrice = priceBounds[priceFilter] || priceBounds.all;

    const list = SERVICES_CATALOG
      .filter(item => {
        const matchesQuery =
          !normalizedQuery ||
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.provider.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery);
        const matchesCategory = activeTab === 'All' || item.category === activeTab;
        const matchesPrice = item.price >= selectedPrice.min && item.price <= selectedPrice.max;
        const matchesRating = Number(item.rating || 0) >= minRating;
        return matchesQuery && matchesCategory && matchesPrice && matchesRating;
      })
      .map((service, index) => ({
        id: service.id,
        title: service.title,
        category: service.category,
        offer: `${service.provider} • ${service.district || 'Sri Lanka'} • ⭐ ${service.rating || 4.5}`,
        badge: '✨',
        color: colorPool[index % colorPool.length],
        emoji: ['🧹', '🛠️', '🧺', '🎨', '🚚'][index % 5],
        service,
      }));

    const sorted = [...list];
    if (sortBy === 'price_low') sorted.sort((a, b) => a.service.price - b.service.price);
    if (sortBy === 'price_high') sorted.sort((a, b) => b.service.price - a.service.price);
    if (sortBy === 'rating') sorted.sort((a, b) => (b.service.rating || 0) - (a.service.rating || 0));
    if (sortBy === 'popular') sorted.sort((a, b) => (b.service.popularity || 0) - (a.service.popularity || 0));
    return sorted;
  }, [activeTab, minRating, priceFilter, query, sortBy]);

  const openService = service => {
    navigation.navigate('ServiceDetails', { service });
  };

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.screen}>
          <View style={globalStyles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#E0E0E0', overflow: 'hidden' }}>
                <Text style={{ fontSize: 30, textAlign: 'center' }}>👩</Text>
              </View>
              <View>
                <Text style={globalStyles.subTitle}>Welcome</Text>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Anna Grace</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable style={globalStyles.iconButton}>
                <Text style={{ fontSize: 18 }}>📍</Text>
              </Pressable>
              <Pressable style={globalStyles.iconButton}>
                <Text style={{ fontSize: 18 }}>🛒</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={globalStyles.title}>Smart Home,</Text>
            <Text style={[globalStyles.title, { fontStyle: 'italic', fontWeight: '400' }]}>Smooth Services</Text>
          </View>

          <View style={{ marginBottom: 20 }}>
            <View style={[globalStyles.input, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
              <Text style={{ fontSize: 18 }}>🔍</Text>
              <TextInput
                onChangeText={setQuery}
                placeholder="Search"
                placeholderTextColor="#9E9E9E"
                style={{ flex: 1, color: colors.text, fontSize: 16 }}
                value={query}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {categories.map(tab => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  globalStyles.pill,
                  activeTab === tab && globalStyles.activePill,
                  { marginRight: 8, paddingHorizontal: 18 },
                ]}
              >
                <Text style={[globalStyles.pillText, activeTab === tab && globalStyles.activePillText]}>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <FilterChip label="Popular" active={sortBy === 'popular'} onPress={() => setSortBy('popular')} />
            <FilterChip label="Top Rated" active={sortBy === 'rating'} onPress={() => setSortBy('rating')} />
            <FilterChip label="Price ↑" active={sortBy === 'price_low'} onPress={() => setSortBy('price_low')} />
            <FilterChip label="Price ↓" active={sortBy === 'price_high'} onPress={() => setSortBy('price_high')} />
            <FilterChip label="Budget" active={priceFilter === 'budget'} onPress={() => setPriceFilter('budget')} />
            <FilterChip label="Standard" active={priceFilter === 'standard'} onPress={() => setPriceFilter('standard')} />
            <FilterChip label="Premium" active={priceFilter === 'premium'} onPress={() => setPriceFilter('premium')} />
            <FilterChip label="⭐ 4.5+" active={minRating === 4.5} onPress={() => setMinRating(minRating === 4.5 ? 0 : 4.5)} />
            <FilterChip label="Reset" active={false} onPress={() => {
              setSortBy('popular');
              setPriceFilter('all');
              setMinRating(0);
            }} />
          </ScrollView>

          <View style={[globalStyles.card, { backgroundColor: '#E6F5E7', padding: 0, overflow: 'hidden', height: 220, flexDirection: 'row' }]}>
            <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
              <View
                style={{
                  backgroundColor: '#E3EFE2',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 100,
                  alignSelf: 'flex-start',
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700' }}>24/7 Support</Text>
              </View>
              <View style={{ position: 'absolute', top: 18, right: 18, backgroundColor: '#EEFFFD', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ fontSize: 22, fontWeight: '800' }}>40% off</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#5E6A61', marginBottom: 8, fontWeight: '600' }}>Fresh, Fast Cleaning</Text>
              <Text style={{ fontSize: 34, fontWeight: '800', lineHeight: 38 }}>Quick Home{'\n'}Cleaning Service</Text>
              <Pressable
                onPress={() => openService(filteredServices[0]?.service || SERVICES_CATALOG[0])}
                style={{
                  backgroundColor: colors.secondary,
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  borderRadius: 100,
                  alignSelf: 'flex-start',
                  marginTop: 15,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Book Now</Text>
              </Pressable>
            </View>
            <View style={{ width: '34%', height: '100%', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 8 }}>
              <Text style={{ fontSize: 96 }}>🧹</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'column', gap: 14 }}>
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                title={service.title}
                offer={service.description}
                color={service.color}
                onPress={() => openService(service.service)}
                emoji={service.emoji}
                badge={service.badge}
              />
            ))}
            {filteredServices.length === 0 ? (
              <View style={[globalStyles.card, { backgroundColor: '#FFFFFF', padding: 22 }]}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>No services found</Text>
                <Text style={{ color: colors.subText, marginTop: 4 }}>Try another filter or search text.</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const ServiceCard = ({ title, offer, color, onPress, emoji, badge }) => (
  <Pressable onPress={onPress} style={[globalStyles.card, { backgroundColor: color, flexDirection: 'row', height: 155, padding: 0, overflow: 'hidden', marginBottom: 0 }]}>
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16 }}>{badge}</Text>
        </View>
        <Text style={{ fontWeight: '800', fontSize: 24 }}>{title}</Text>
      </View>
      <Text style={{ fontSize: 15, color: 'rgba(0,0,0,0.58)', fontWeight: '600', marginBottom: 12 }}>{offer}</Text>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.62)', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 100, alignSelf: 'flex-start' }}>
        <Text style={{ fontWeight: '700', fontSize: 12 }}>Book Now</Text>
      </View>
    </View>
    <View style={{ width: '35%', height: '100%', alignItems: 'center', justifyContent: 'center', paddingRight: 4 }}>
      <Text style={{ fontSize: 74 }}>{emoji}</Text>
    </View>
  </Pressable>
);

const FilterChip = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={{
      backgroundColor: active ? colors.primary : '#FFFFFF',
      borderRadius: 99,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginRight: 8,
      borderWidth: 1,
      borderColor: active ? colors.primary : '#EAEAEA',
    }}
  >
    <Text style={{ color: active ? '#FFFFFF' : '#5E5E5E', fontWeight: '700', fontSize: 12 }}>{label}</Text>
  </Pressable>
);

export default HomeScreen;
