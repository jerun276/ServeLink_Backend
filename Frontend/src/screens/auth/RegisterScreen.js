import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import RegisterForm from '../../components/auth/RegisterForm';
import useAuth from '../../hooks/useAuth';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';

const RegisterScreen = ({ navigation }) => {
  const { register, error, loading } = useAuth();

  const handleRegister = async values => {
    await register(values);
  };

  return (
    <View style={globalStyles.appBackground}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[globalStyles.screen, { flexGrow: 1 }]} 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
            <Animated.View entering={FadeInDown.delay(100).duration(600)} exiting={FadeOutUp.duration(300)}>
              <View style={{ alignItems: 'center', marginBottom: 30 }}>
                <View style={{ width: 80, height: 80, borderRadius: 25, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 40 }}>📝</Text>
                </View>
                <Text style={[globalStyles.title, { fontSize: 32, textAlign: 'center' }]}>Create Account</Text>
                <Text style={[globalStyles.subTitle, { textAlign: 'center', marginTop: 8 }]}>Fill in the details to get started.</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).duration(600)} exiting={FadeOutDown.duration(300)}>
              <RegisterForm loading={loading} onSubmit={handleRegister} serverError={error} />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(700).duration(600)} style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              <Text style={{ color: colors.subText }}>Already have an account?</Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
