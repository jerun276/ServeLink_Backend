import { ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import useAuth from '../../hooks/useAuth';
import { CHAT_THREADS } from '../../utils/constants';
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
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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
                <Text style={[globalStyles.title, { fontSize: 22 }]}>{user?.name || 'Andrew Ainsley'}</Text>
                <Text style={globalStyles.subTitle}>{user?.email || 'andrew_ainsley@yourdomain.com'}</Text>
              </View>
            </View>
            <Pressable onPress={logout} style={globalStyles.iconButton}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[globalStyles.headerRow, { marginTop: 24, marginBottom: 12 }]}>
            <Text style={[globalStyles.title, { fontSize: 20 }]}>My Calendar</Text>
            <Pressable>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>December 2026 ▾</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(250).duration(600)} style={[globalStyles.card, { marginBottom: 20 }]}>
            <Text style={[globalStyles.label, { marginBottom: 8 }]}>Profile Details</Text>
            <Text style={{ color: colors.subText, marginBottom: 10 }}>Role: {user?.role || 'customer'}</Text>
            <Input label="Name" onChangeText={setName} placeholder="Enter your name" value={name} />
            <Input keyboardType="phone-pad" label="Phone" onChangeText={setPhone} placeholder="Enter your phone number" value={phone} />
            <Input label="Location" onChangeText={setLocation} placeholder="Enter your location" value={location} />
            <Input label="Skills" onChangeText={setSkillsText} placeholder="e.g. Plumbing, Electrical" value={skillsText} />
            <Text style={globalStyles.label}>Bio</Text>
            <TextInput
              multiline
              numberOfLines={4}
              onChangeText={setBio}
              placeholder="Write a short bio"
              placeholderTextColor="#9b92b3"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: colors.text,
                fontSize: 15,
                minHeight: 100,
                textAlignVertical: 'top',
                marginBottom: 14,
              }}
              value={bio}
            />

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
              style={[globalStyles.button, { marginTop: 12, paddingVertical: 12 }]}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(600)} style={[globalStyles.card, { padding: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
                <Text key={`${d}-${index}`} style={{ color: colors.subText, fontWeight: '600', width: 30, textAlign: 'center' }}>{d}</Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day, index) => (
                <Animated.View 
                  key={day} 
                  entering={FadeInDown.delay(400 + index * 20).duration(300)}
                >
                  <Pressable 
                    style={{ 
                      width: 35, 
                      height: 35, 
                      borderRadius: 10, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: day === 21 ? colors.primary : 'transparent'
                    }}
                  >
                    <Text style={{ 
                      color: day === 21 ? 'white' : colors.text,
                      fontWeight: day === 21 ? '700' : '500'
                    }}>{day}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={[globalStyles.headerRow, { marginTop: 24, marginBottom: 12 }]}>
            <Text style={[globalStyles.title, { fontSize: 20 }]}>Inbox</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Chats</Text>
              <Text style={{ color: colors.subText, fontWeight: '700' }}>Calls</Text>
            </View>
          </Animated.View>

          {CHAT_THREADS.map((thread, index) => (
            <Animated.View 
              key={thread.id} 
              entering={FadeInUp.delay(600 + index * 100).duration(500)}
            >
              <Pressable style={[globalStyles.card, { padding: 16, marginBottom: 12 }]}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{thread.name}</Text>
                      <Text style={{ fontSize: 12, color: colors.subText }}>{thread.time}</Text>
                    </View>
                    <Text numberOfLines={1} style={{ color: colors.subText, fontSize: 14 }}>{thread.lastMessage}</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}

          {user?.role === 'provider' ? (
            <Pressable
              onPress={() => navigation.navigate('ManageServices')}
              style={[globalStyles.button, { marginTop: 10 }]}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Manage My Services</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
