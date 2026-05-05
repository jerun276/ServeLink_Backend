import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRef } from 'react';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import LoginForm from '../../components/auth/LoginForm';
import useAuth from '../../hooks/useAuth';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';

const LoginScreen = ({ navigation }) => {
  const { login, error, loading } = useAuth();

  const handleLogin = async values => {
    await login(values);
  };

  return (
    <View style={globalStyles.appBackground}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
        >
          <View style={[globalStyles.screen, { justifyContent: 'center', paddingVertical: 60 }]}>
            <Animated.View entering={FadeInDown.delay(100).duration(600)} exiting={FadeOutUp.duration(300)}>
              <View style={{ alignItems: 'center', marginBottom: 50 }}>
                <View style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: 40, 
                  backgroundColor: colors.primary, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 10
                }}>
                  <Text style={{ fontSize: 60 }}>🔐</Text>
                </View>
                <Animated.Text 
                  entering={FadeInDown.delay(300).duration(600)}
                  style={[globalStyles.title, { marginTop: 30, textAlign: 'center' }]}
                >
                  Welcome Back
                </Animated.Text>
                <Animated.Text 
                  entering={FadeInDown.delay(400).duration(600)}
                  style={[globalStyles.subTitle, { textAlign: 'center', marginTop: 10 }]}
                >
                  Sign in to access your services
                </Animated.Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500).duration(600)} exiting={FadeOutDown.duration(300)}>
              <LoginForm loading={loading} onSubmit={handleLogin} serverError={error} />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(700).duration(600)} style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              <Text style={{ color: colors.subText, fontWeight: '600' }}>New here?</Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={{ color: colors.primary, fontWeight: '800' }}>Create Account</Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
