import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import useAuth from '../../hooks/useAuth';
import { getAdminDashboardRequest } from '../../services/adminService';

const StatCard = ({ label, value }) => (
  <View
    style={{
      width: '48%',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 14,
      padding: 12,
      marginBottom: 10,
    }}
  >
    <Text style={{ color: colors.subText, fontWeight: '600', fontSize: 12 }}>{label}</Text>
    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 24, marginTop: 4 }}>{value}</Text>
  </View>
);

const AdminDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);

  const pendingProviders = useMemo(() => dashboard?.pendingProviders || [], [dashboard]);
  const stats = dashboard?.stats;

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminDashboardRequest();
      setDashboard(data);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.screen}>
          <View style={[globalStyles.headerRow, { marginBottom: 10 }]}>
            <View>
              <Text style={{ color: colors.subText, fontWeight: '700' }}>Admin Panel</Text>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 24 }}>{user?.name || 'Admin'}</Text>
            </View>
            <Pressable onPress={logout} style={globalStyles.iconButton}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Exit</Text>
            </Pressable>
          </View>

          <View style={[globalStyles.card, { borderRadius: 20 }]}>
            <View style={[globalStyles.headerRow, { marginBottom: 8 }]}>
              <Text style={[globalStyles.label, { marginBottom: 0 }]}>System Metrics</Text>
              <Pressable onPress={loadDashboard}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>{loading ? 'Refreshing...' : 'Refresh'}</Text>
              </Pressable>
            </View>

            {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <StatCard label="Users" value={stats?.users?.total || 0} />
              <StatCard label="Customers" value={stats?.users?.customers || 0} />
              <StatCard label="Provider Users" value={stats?.users?.providerUsers || 0} />
              <StatCard label="Admins" value={stats?.users?.admins || 0} />
              <StatCard label="Provider Profiles" value={stats?.providers?.profilesTotal || 0} />
              <StatCard label="Pending Providers" value={stats?.providers?.pending || 0} />
              <StatCard label="Total Bookings" value={stats?.bookings?.total || 0} />
              <StatCard label="Completion Rate" value={`${stats?.bookings?.completionRate || 0}%`} />
            </View>
          </View>

          <View style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 8 }]}>Pending Provider Reviews</Text>
            {pendingProviders.length === 0 ? (
              <Text style={{ color: colors.subText }}>No pending providers right now.</Text>
            ) : (
              pendingProviders.map(provider => (
                <Pressable
                  key={provider._id}
                  onPress={() => navigation.navigate('ProviderReview', { providerId: provider._id })}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E6ECF3',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '800' }}>
                    {provider.businessName || provider.userId?.name || 'Provider'}
                  </Text>
                  <Text style={{ color: colors.subText, marginTop: 2 }}>
                    {provider.userId?.email || 'No email'} | {provider.district || 'No district'}
                  </Text>
                  <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 6 }}>Open review</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboardScreen;
