import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import useAuth from '../../hooks/useAuth';
import { getAdminDashboardRequest } from '../../services/adminService';

const StatCard = ({ label, value, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        opacity: pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }]
      }
    ]}
  >
    <Text style={{ color: colors.subText, fontWeight: '600', fontSize: 12 }}>{label}</Text>
    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 24, marginTop: 4 }}>{value}</Text>
    {onPress && <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700', marginTop: 4 }}>View Details ›</Text>}
  </Pressable>
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
              <StatCard label="Users" value={stats?.users?.total || 0} onPress={() => navigation.navigate('AdminAllUsers')} />
              <StatCard label="Customers" value={stats?.users?.customers || 0} onPress={() => navigation.navigate('AdminAllUsers')} />
              <StatCard label="Provider Users" value={stats?.users?.providerUsers || 0} onPress={() => navigation.navigate('AdminAllUsers')} />
              <StatCard label="Admins" value={stats?.users?.admins || 0} onPress={() => navigation.navigate('AdminAllUsers')} />
              <StatCard label="Provider Profiles" value={stats?.providers?.profilesTotal || 0} />
              <StatCard label="Pending Providers" value={stats?.providers?.pending || 0} onPress={() => navigation.navigate('AdminPendingProviders')} />
              <StatCard label="Total Bookings" value={stats?.bookings?.total || 0} onPress={() => navigation.navigate('AdminAllBookings')} />
              <StatCard label="Completion Rate" value={`${stats?.bookings?.completionRate || 0}%`} />
            </View>
          </View>
          
          <View style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 15 }]}>Account Settings</Text>
            
            <Pressable 
              onPress={() => navigation.navigate('AdminAddAdmin')}
              style={styles.settingItem}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#F0FDF4' }]}>
                <Text style={{ fontSize: 18 }}>➕</Text>
              </View>
              <Text style={styles.settingText}>Add New Admin</Text>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>

            <View style={styles.settingDivider} />

            <Pressable 
              onPress={logout}
              style={styles.settingItem}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#FFEBEB' }]}>
                <Text style={{ fontSize: 18 }}>🚪</Text>
              </View>
              <Text style={[styles.settingText, { color: '#F75555' }]}>Logout from Admin</Text>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0E6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  settingArrow: {
    fontSize: 22,
    color: '#CBD5E1',
    fontWeight: '400',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  }
};

export default AdminDashboardScreen;
