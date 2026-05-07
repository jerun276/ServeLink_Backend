import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import globalStyles from '../../styles/globalStyles';

const Input = ({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default' }) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  useEffect(() => {
    setIsSecure(secureTextEntry);
  }, [secureTextEntry]);

  return (
    <View style={{ marginBottom: 10 }}>
      {label ? <Text style={globalStyles.label}>{label}</Text> : null}
      <View style={{ position: 'relative' }}>
        <TextInput
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9b92b3"
          secureTextEntry={isSecure}
          style={[globalStyles.input, secureTextEntry ? { paddingRight: 78 } : null]}
          value={value}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsSecure(prev => !prev)}
            style={{ position: 'absolute', right: 14, top: 12, paddingHorizontal: 8, paddingVertical: 6 }}
          >
            <Text style={{ color: '#486284', fontWeight: '700', fontSize: 12 }}>
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default Input;
