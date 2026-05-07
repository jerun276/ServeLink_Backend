import api from './api';

export const openBookingConversationRequest = async bookingId => {
  const { data } = await api.post('/chats/conversations', { bookingId });
  return data.conversation;
};

export const getConversationsRequest = async () => {
  const { data } = await api.get('/chats/conversations');
  return data.conversations || [];
};

export const getConversationMessagesRequest = async conversationId => {
  const { data } = await api.get(`/chats/conversations/${conversationId}/messages`);
  return data.messages || [];
};

export const sendConversationMessageRequest = async (conversationId, text) => {
  const { data } = await api.post(`/chats/conversations/${conversationId}/messages`, { text });
  return data.message;
};
