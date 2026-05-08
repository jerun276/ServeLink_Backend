import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import { getPendingProvidersRequest } from '../../services/adminService';

const AdminPendingProvidersScreen = ({ navigation }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPendingProvidersRequest();
      setProviders(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={globalStyles.appBackground}>
      <View style={[globalStyles.headerRow, { paddingHorizontal: 20, paddingTop: 16 }]}>
        <Pressable onPress={() => navigation.goBack()} style={globalStyles.iconButton}>
          <Text>‹</Text>
        </Pressable>
        <Text style={[globalStyles.title, { fontSize: 20 }]}>Pending Verifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {loading && <Text style={{ color: colors.subText }}>Loading pending providers...</Text>}
        {providers.length === 0 && !loading && (
          <Text style={{ color: colors.subText, textAlign: 'center', marginTop: 40 }}>All providers are verified!</Text>
        )}
        
        {providers.map(provider => (
          <Pressable
            key={provider._id}
            onPress={() => navigation.navigate('ProviderReview', { providerId: provider._id })}
            style={[globalStyles.card, { marginBottom: 12, padding: 15 }]}
          >
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>
              {provider.businessName || provider.userId?.name || 'Provider'}
            </Text>
            <Text style={{ color: colors.subText, marginTop: 2 }}>
              {provider.userId?.email || 'No email'} | {provider.district || 'No district'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <View style={[globalStyles.pill, { backgroundColor: '#FEF3C7' }]}>
                <Text style={{ color: '#92400E', fontSize: 10, fontWeight: '700' }}>PENDING REVIEW</Text>
              </View>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Open review ›</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default AdminPendingProvidersScreen;
