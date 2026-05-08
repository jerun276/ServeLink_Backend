import { ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const initials = useMemo(() => {
    const name = user?.name || 'User';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setLocation(user?.location || '');
    setBio(user?.bio || '');
    setSkillsText(Array.isArray(user?.skills) ? user.skills.join(', ') : '');
  }, [user]);

  const saveProfile = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setSaveError('Name is required.');
      setMessage('');
      return;
    }

    if (!cleanPhone) {
      setSaveError('Phone number is required.');
      setMessage('');
      return;
    }

    const skills = skillsText
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    setSaving(true);
    setSaveError('');
    setMessage('');

    try {
      await updateProfile({
        name: cleanName,
        phone: cleanPhone,
        location: location.trim(),
        bio: bio.trim(),
        skills,
      });
      setMessage('Profile updated successfully.');
    } catch {
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.screen}>
          <Animated.View entering={FadeInDown.duration(600)} style={globalStyles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 30, 
                backgroundColor: colors.primary, 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 20 }}>{initials}</Text>
              </View>
              <View>
                <Text style={[globalStyles.title, { fontSize: 22 }]}>{user?.name || 'User'}</Text>
                <Text style={globalStyles.subTitle}>{user?.email || 'user@example.com'}</Text>
              </View>
            </View>
            <Pressable onPress={logout} style={globalStyles.iconButton}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(250).duration(600)} style={[globalStyles.card, { marginTop: 24, marginBottom: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 8 }]}>Update Profile</Text>
            <Text style={{ color: colors.subText, marginBottom: 15 }}>Manage your personal information below.</Text>
            
            <Input label="Name" onChangeText={setName} placeholder="Enter your name" value={name} />
            <Input keyboardType="phone-pad" label="Phone" onChangeText={setPhone} placeholder="Enter your phone number" value={phone} />
            <Input label="Location" onChangeText={setLocation} placeholder="Enter your location" value={location} />
            
            {saveError ? (
              <View style={{ backgroundColor: '#FFF0F0', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FFE0E0' }}>
                <Text style={{ color: '#D32F2F', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{saveError}</Text>
              </View>
            ) : null}

            {message ? (
              <View style={{ backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#A7F3D0' }}>
                <Text style={{ color: '#047857', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{message}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={saveProfile}
              style={[globalStyles.button, { marginTop: 12, paddingVertical: 14 }]}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                {saving ? 'Saving...' : 'Update Account'}
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={[globalStyles.card, { marginTop: 0 }]}>
            <Text style={[globalStyles.label, { marginBottom: 15 }]}>Account Settings</Text>
            
            <Pressable 
              onPress={() => navigation.navigate('Bookings')}
              style={styles.settingItem}
            >
              <View style={styles.settingIconWrap}>
                <Text style={{ fontSize: 18 }}>📅</Text>
              </View>
              <Text style={styles.settingText}>My Bookings</Text>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>

            <View style={styles.settingDivider} />

            <Pressable 
              onPress={() => navigation.navigate('Chats')}
              style={styles.settingItem}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Text style={{ fontSize: 18 }}>💬</Text>
              </View>
              <Text style={styles.settingText}>My Chats</Text>
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
              <Text style={[styles.settingText, { color: '#F75555' }]}>Logout</Text>
              <Text style={styles.settingArrow}>›</Text>
            </Pressable>
          </Animated.View>
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

export default ProfileScreen;
