import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import { getAllUsersRequest, blockUserRequest, unblockUserRequest } from '../../services/adminService';

const AdminAllUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllUsersRequest();
      setUsers(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBlockToggle = async (userId, isBlocked) => {
    setActionLoading(userId);
    try {
      if (isBlocked) {
        await unblockUserRequest(userId);
      } else {
        await blockUserRequest(userId);
      }
      await loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <View style={globalStyles.appBackground}>
      <View style={[globalStyles.headerRow, { paddingHorizontal: 20, paddingTop: 16 }]}>
        <Pressable onPress={() => navigation.goBack()} style={globalStyles.iconButton}>
          <Text>‹</Text>
        </Pressable>
        <Text style={[globalStyles.title, { fontSize: 20 }]}>System Users</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {loading && <Text style={{ color: colors.subText }}>Loading users...</Text>}
        
        {users.map(item => (
          <View key={item._id} style={[globalStyles.card, { marginBottom: 12, padding: 15 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: item.isBlocked ? '#94A3B8' : colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '800' }}>{item.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontWeight: '800', color: colors.text }}>{item.name}</Text>
                  {item.isBlocked && (
                    <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '800' }}>BLOCKED</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: colors.subText, fontSize: 13 }}>{item.email}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={[globalStyles.pill, { backgroundColor: item.role === 'provider' ? '#E0F2FE' : '#F1F5F9' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: item.role === 'provider' ? colors.primary : colors.text }}>{item.role}</Text>
                </View>
              </View>

              {item.role !== 'admin' && (
                <Pressable 
                  onPress={() => handleBlockToggle(item._id, item.isBlocked)}
                  style={{ opacity: actionLoading === item._id ? 0.5 : 1 }}
                >
                  <Text style={{ color: item.isBlocked ? colors.primary : '#EF4444', fontWeight: '700', fontSize: 13 }}>
                    {actionLoading === item._id ? 'Updating...' : (item.isBlocked ? 'Unblock User' : 'Block User')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default AdminAllUsersScreen;
