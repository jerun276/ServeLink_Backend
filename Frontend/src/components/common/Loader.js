import { ActivityIndicator, Text, View } from 'react-native';

const Loader = ({ label = 'Loading...' }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <ActivityIndicator color="#7B2CFF" size="small" />
      <Text style={{ color: '#7A7390' }}>{label}</Text>
    </View>
  );
};

export default Loader;
