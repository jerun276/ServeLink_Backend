import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  getConversationMessagesRequest,
  openBookingConversationRequest,
  openProviderConversationRequest,
  sendConversationMessageRequest,
} from '../../services/chatService';
import useAuth from '../../hooks/useAuth';
import colors from '../../styles/colors';
import globalStyles from '../../styles/globalStyles';

const ChatThreadScreen = ({ route, navigation }) => {
  const { conversationId: initialConversationId, bookingId, providerId, title } = route.params || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [conversationId, setConversationId] = useState(initialConversationId || '');

  useEffect(() => {
    const ensureConversation = async () => {
      if (conversationId) return;
      
      try {
        if (bookingId && bookingId.length > 5) {
          const conversation = await openBookingConversationRequest(bookingId);
          if (conversation?._id) setConversationId(conversation._id);
        } else if (providerId && providerId.length > 5) {
          const conversation = await openProviderConversationRequest(providerId);
          if (conversation?._id) setConversationId(conversation._id);
        }
      } catch (err) {
        console.log('Chat initialization error:', err.response?.data || err.message);
      }
    };
    ensureConversation();
  }, [bookingId, providerId, conversationId]);

  const loadMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const rows = await getConversationMessagesRequest(conversationId);
      setMessages(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const timer = setInterval(loadMessages, 4000);
    return () => clearInterval(timer);
  }, [conversationId]);

  const onSend = async () => {
    if (!draft.trim() || !conversationId) return;
    await sendConversationMessageRequest(conversationId, draft);
    setDraft('');
    loadMessages();
  };

  const normalizedTitle = useMemo(() => title || 'Chat', [title]);

  return (
    <View style={globalStyles.appBackground}>
      <View style={[globalStyles.headerRow, { paddingHorizontal: 20, paddingTop: 16, marginBottom: 10 }]}>
        <Pressable onPress={() => navigation.goBack()} style={globalStyles.iconButton}>
          <Text>‹</Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{normalizedTitle}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        {loading ? <Text style={{ color: colors.subText }}>Loading messages...</Text> : null}
        {messages.map(item => {
          const mine = item.senderId?._id === user?.id;
          return (
            <View
              key={item._id}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                backgroundColor: mine ? colors.primary : '#ECECEC',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 8,
                maxWidth: '80%',
              }}
            >
              <Text style={{ color: mine ? '#fff' : '#222' }}>{item.text}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 120, left: 16, right: 16, flexDirection: 'row', gap: 10 }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message"
          placeholderTextColor="#999"
          style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
        />
        <Pressable onPress={onSend} style={[globalStyles.button, { paddingHorizontal: 20 }]}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ChatThreadScreen;
