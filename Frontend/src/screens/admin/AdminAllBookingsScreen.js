import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import { getAllBookingsRequest } from '../../services/adminService';

const AdminAllBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllBookingsRequest();
      setBookings(data);
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
        <Text style={[globalStyles.title, { fontSize: 20 }]}>All System Bookings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {loading && <Text style={{ color: colors.subText }}>Loading bookings...</Text>}
        {bookings.length === 0 && !loading && <Text style={{ color: colors.subText }}>No bookings found.</Text>}
        
        {bookings.map(item => (
          <View key={item._id} style={[globalStyles.card, { marginBottom: 12, padding: 15 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: colors.text }}>{item.serviceId?.title || 'Unknown Service'}</Text>
              <View style={[globalStyles.pill, { backgroundColor: '#F1F5F9' }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{item.status}</Text>
              </View>
            </View>
            <Text style={{ color: colors.subText, marginTop: 4 }}>Customer: {item.customerId?.name || 'N/A'}</Text>
            <Text style={{ color: colors.subText, marginTop: 2 }}>Provider: {item.providerId?.businessName || 'N/A'}</Text>
            <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 8 }}>
              Rs. {item.agreedPrice || 0}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default AdminAllBookingsScreen;
