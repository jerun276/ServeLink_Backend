import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import Input from '../../components/common/Input';
import { addAdminRequest } from '../../services/adminService';

const AdminAddAdminScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdd = async () => {
    if (!name || !email || !password || !phone) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await addAdminRequest({ name, email, password, phone });
      setSuccess('Admin account created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setTimeout(() => navigation.goBack(), 2000);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.appBackground}>
      <View style={[globalStyles.headerRow, { paddingHorizontal: 20, paddingTop: 16 }]}>
        <Pressable onPress={() => navigation.goBack()} style={globalStyles.iconButton}>
          <Text>‹</Text>
        </Pressable>
        <Text style={[globalStyles.title, { fontSize: 20 }]}>Add New Admin</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={[globalStyles.card, { borderRadius: 20 }]}>
          <Text style={[globalStyles.label, { marginBottom: 15 }]}>Create Administrative Account</Text>
          
          <Input label="Full Name" onChangeText={setName} placeholder="Admin Name" value={name} />
          <Input label="Email Address" onChangeText={setEmail} placeholder="admin@servelink.lk" value={email} keyboardType="email-address" />
          <Input label="Password" onChangeText={setPassword} placeholder="••••••••" value={password} secureTextEntry />
          <Input label="Phone Number" onChangeText={setPhone} placeholder="+94 7X XXX XXXX" value={phone} keyboardType="phone-pad" />

          {error ? <Text style={{ color: colors.danger, marginBottom: 12, fontWeight: '600' }}>{error}</Text> : null}
          {success ? <Text style={{ color: colors.success, marginBottom: 12, fontWeight: '600' }}>{success}</Text> : null}

          <Pressable 
            onPress={handleAdd} 
            disabled={loading}
            style={[globalStyles.button, { marginTop: 10, opacity: loading ? 0.7 : 1 }]}
          >
            <Text style={{ color: 'white', fontWeight: '800' }}>
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminAddAdminScreen;
