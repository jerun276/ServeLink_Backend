import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import Button from '../common/Button';
import Input from '../common/Input';
import globalStyles from '../../styles/globalStyles';
import { validateLogin } from '../../utils/validators';

const LoginForm = ({ onSubmit, loading = false, serverError = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const submit = async () => {
    const validation = validateLogin({ email, password });
    if (validation) {
      setError(validation);
      return;
    }

    setError('');
    try {
      await onSubmit({ email, password });
    } catch (err) {
      // Parent handles server errors through serverError prop.
    }
  };

  return (
    <Animated.View style={[globalStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Input keyboardType="email-address" label="Email Address" onChangeText={setEmail} placeholder="you@example.com" value={email} />
      <Input label="Password" onChangeText={setPassword} placeholder="Enter your password" secureTextEntry value={password} />

      {(error || serverError) ? (
        <View style={{ backgroundColor: '#FFF0F0', padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#FFE0E0' }}>
          <Text style={{ color: '#D32F2F', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
            Warning: {error || serverError}
          </Text>
        </View>
      ) : null}

      <Button disabled={loading} onPress={submit}>
        {loading ? 'Authenticating...' : 'Sign In'}
      </Button>
    </Animated.View>
  );
};

export default LoginForm;
