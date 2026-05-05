import { Text, TextInput, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';

const Input = ({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default' }) => {
  return (
    <View>
      {label ? <Text style={globalStyles.label}>{label}</Text> : null}
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9b92b3"
        secureTextEntry={secureTextEntry}
        style={globalStyles.input}
        value={value}
      />
    </View>
  );
};

export default Input;
