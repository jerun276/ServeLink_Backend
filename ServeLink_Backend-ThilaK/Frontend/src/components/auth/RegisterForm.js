import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import Button from '../common/Button';
import Input from '../common/Input';
import globalStyles from '../../styles/globalStyles';
import { validateRegister } from '../../utils/validators';

const RegisterForm = ({ onSubmit, loading = false, serverError = '' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    const values = { name, email, phone, password, role: 'customer' };
    const validation = validateRegister(values);
    if (validation) {
      setError(validation);
      return;
    }

    setError('');
    try {
      await onSubmit(values);
    } catch (err) {
      // Parent handles server errors through serverError prop.
    }
  };

  return (
    <Animated.View style={[globalStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Input label="Full Name" onChangeText={setName} placeholder="Enter your full name" value={name} />
      <Input keyboardType="email-address" label="Email Address" onChangeText={setEmail} placeholder="you@example.com" value={email} />
      <Input keyboardType="phone-pad" label="Phone Number" onChangeText={setPhone} placeholder="e.g. 0771234567" value={phone} />
      <Input label="Password" onChangeText={setPassword} placeholder="Min 8 characters, 1 uppercase, 1 number" secureTextEntry value={password} />

      {(error || serverError) ? (
        <View style={{ backgroundColor: '#FFF0F0', padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#FFE0E0' }}>
          <Text style={{ color: '#D32F2F', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
            Warning: {error || serverError}
          </Text>
        </View>
      ) : null}

      <Button disabled={loading} onPress={submit}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </Animated.View>
  );
};

export default RegisterForm;
