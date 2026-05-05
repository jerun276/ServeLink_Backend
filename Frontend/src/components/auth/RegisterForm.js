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
  const [role, setRole] = useState('customer');
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
  }, []);

  const submit = async () => {
    const values = { name, email, phone, password, role };
    const validation = validateRegister(values);
    if (validation) {
      setError(validation);
      return;
    }

    setError('');
    try {
      await onSubmit(values);
    } catch (err) {
      // Error handled by parent via serverError prop
    }
  };

  return (
    <Animated.View style={[globalStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Input label="Full Name" onChangeText={setName} placeholder="Enter your full name" value={name} />
      <Input keyboardType="email-address" label="Email Address" onChangeText={setEmail} placeholder="you@example.com" value={email} />
      <Input keyboardType="phone-pad" label="Phone Number" onChangeText={setPhone} placeholder="e.g. 0771234567" value={phone} />
      <Input label="Password" onChangeText={setPassword} placeholder="Min 8 characters, 1 uppercase, 1 number" secureTextEntry value={password} />

      <Text style={[globalStyles.label, { marginTop: 10 }]}>Register as:</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Button onPress={() => setRole('customer')} style={{ flex: 1 }} variant={role === 'customer' ? 'primary' : 'outline'}>
          Customer
        </Button>
        <Button onPress={() => setRole('provider')} style={{ flex: 1 }} variant={role === 'provider' ? 'primary' : 'outline'}>
          Provider
        </Button>
      </View>

      {(error || serverError) ? (
        <View style={{ backgroundColor: '#FFF0F0', padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#FFE0E0' }}>
          <Text style={{ color: '#D32F2F', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
            ⚠️ {error || serverError}
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
