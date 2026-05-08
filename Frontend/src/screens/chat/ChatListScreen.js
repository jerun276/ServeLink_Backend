import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { getConversationsRequest } from '../../services/chatService';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';

const ChatListScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const rows = await getConversationsRequest();
      setConversations(rows);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text style={[globalStyles.title, { marginBottom: 10 }]}>Chats</Text>
        <Text style={[globalStyles.subTitle, { marginBottom: 18 }]}>Connect with your providers and customers.</Text>

        {loading ? <Text style={{ color: colors.subText }}>Loading conversations...</Text> : null}

        {conversations.map(item => {
          const displayName =
            item.customerId?.name || item.providerId?.userId?.name || 'Conversation';
          return (
            <Pressable
              key={item._id}
              onPress={() => navigation.navigate('ChatThread', { conversationId: item._id, title: displayName })}
              style={[globalStyles.card, { marginBottom: 10, borderRadius: 20 }]}
            >
              <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>{displayName}</Text>
              <Text style={{ color: colors.subText, marginTop: 4 }}>
                Booking status: {item.bookingId?.status || 'unknown'}
              </Text>
            </Pressable>
          );
        })}

        {!loading && conversations.length === 0 ? (
          <View style={[globalStyles.card, { borderRadius: 20 }]}>
            <Text style={{ fontWeight: '700', color: colors.text }}>No chats yet</Text>
            <Text style={{ color: colors.subText, marginTop: 4 }}>Select a provider from a service to start a conversation.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default ChatListScreen;
