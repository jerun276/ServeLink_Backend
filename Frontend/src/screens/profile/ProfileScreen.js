import { ScrollView, Text, View, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import useAuth from '../../hooks/useAuth';
import { CHAT_THREADS } from '../../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const initials = useMemo(() => {
    const name = user?.name || 'User';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const saveQuickBio = async () => {
    setSaving(true);
    try {
      await updateProfile({ bio: draft });
      setDraft('');
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
            <Text style={{ color: colors.subText, marginBottom: 4 }}>Role: {user?.role || 'customer'}</Text>
            <Text style={{ color: colors.subText, marginBottom: 4 }}>Location: {user?.location || 'Not added yet'}</Text>
            <Text style={{ color: colors.subText, marginBottom: 4 }}>Skills: {(user?.skills || []).join(', ') || 'Not added yet'}</Text>
            <Text style={{ color: colors.subText }}>Bio: {user?.bio || 'No bio added yet.'}</Text>
            <Text style={{ color: colors.subText, marginTop: 8 }}>Draft bio: {draft || '(empty)'}</Text>
            <Pressable
              onPress={saveQuickBio}
              style={[globalStyles.button, { marginTop: 12, paddingVertical: 12 }]}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>
                {saving ? 'Saving...' : 'Save Draft Bio'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDraft('Professional and friendly service provider.')}
              style={[globalStyles.pill, { marginTop: 8, alignSelf: 'flex-start' }]}
            >
              <Text style={globalStyles.pillText}>Use Suggested Bio</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(600)} style={[globalStyles.card, { padding: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <Text key={d} style={{ color: colors.subText, fontWeight: '600', width: 30, textAlign: 'center' }}>{d}</Text>
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
