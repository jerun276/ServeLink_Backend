import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import RegisterForm from '../../components/auth/RegisterForm';
import useAuth from '../../hooks/useAuth';
import globalStyles from '../../styles/globalStyles';

const RegisterScreen = ({ navigation }) => {
  const { register, error, loading } = useAuth();

  const handleRegister = async values => {
    await register(values);
  };

  return (
    <View style={globalStyles.appBackground}>
      <View style={styles.bgShapeTop} />
      <View style={styles.bgShapeBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[globalStyles.screen, styles.screenContent]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <Text style={styles.brandName}>Create profile</Text>
            <Text style={styles.title}>Start using ServeLink</Text>
            <Text style={styles.subtitle}>Set up your account to compare price, rating, and service options.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(350).duration(650)} style={styles.formCard}>
            <RegisterForm loading={loading} onSubmit={handleRegister} serverError={error} />
          </Animated.View>

          <Animated.View entering={FadeIn.delay(550).duration(650)} style={styles.switchRow}>
            <Text style={styles.switchHint}>Already registered?</Text>
            <Pressable onPress={() => navigation.navigate('Login')} style={styles.switchButton}>
              <Text style={styles.switchButtonText}>Sign in</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  bgShapeTop: {
    position: 'absolute',
    top: -100,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#D7E9FF',
  },
  bgShapeBottom: {
    position: 'absolute',
    bottom: -120,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#D9F5EE',
  },
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 46,
  },
  brandName: {
    color: '#0F766E',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#13243D',
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '800',
  },
  subtitle: {
    color: '#607089',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  formCard: {
    marginTop: 24,
  },
  switchRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    marginBottom: 6,
  },
  switchHint: {
    color: '#5F6D84',
    fontWeight: '600',
  },
  switchButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCD6E3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  switchButtonText: {
    color: '#0F766E',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default RegisterScreen;
