import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import LoginForm from '../../components/auth/LoginForm';
import useAuth from '../../hooks/useAuth';
import globalStyles from '../../styles/globalStyles';

const LoginScreen = ({ navigation }) => {
  const { login, error, loading } = useAuth();

  const handleLogin = async values => {
    await login(values);
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
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[globalStyles.screen, styles.screenContent]}>
            <Animated.View entering={FadeInDown.delay(100).duration(600)}>
              <Text style={styles.brandName}>ServeLink</Text>
              <Text style={styles.title}>Customer Login</Text>
              <Text style={styles.subtitle}>Sign in to your customer account and continue booking trusted local services.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(350).duration(650)} style={styles.formCard}>
              <LoginForm loading={loading} onSubmit={handleLogin} serverError={error} />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(550).duration(650)} style={styles.switchRow}>
              <Text style={styles.switchHint}>New to ServeLink?</Text>
              <Pressable onPress={() => navigation.navigate('Register')} style={styles.switchButton}>
                <Text style={styles.switchButtonText}>Create account</Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  bgShapeTop: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#D4F0EC',
  },
  bgShapeBottom: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#E9EFFA',
  },
  screenContent: {
    justifyContent: 'center',
    paddingVertical: 56,
  },
  brandName: {
    color: '#0F766E',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#13243D',
    fontSize: 34,
    lineHeight: 40,
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
    marginTop: 30,
  },
  switchRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
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

export default LoginScreen;
