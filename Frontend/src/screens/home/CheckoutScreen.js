import React, { useState } from 'react';
import { ScrollView, Text, View, Pressable, Image } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import Button from '../../components/common/Button';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';

const PaymentOption = ({ title, icon, selected, onSelect }) => (
  <Pressable 
    onPress={onSelect}
    style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 24,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: selected ? colors.primary : '#F0F0F0',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text>
    </View>
    <View style={{ 
      width: 24, 
      height: 24, 
      borderRadius: 12, 
      borderWidth: 2, 
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />}
    </View>
  </Pressable>
);

const CheckoutScreen = ({ route, navigation }) => {
  const { service, details } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState('paypal');

  if (!service) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Invalid Checkout Session</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  const onConfirm = () => {
    navigation.navigate('Pin', { service, details, paymentMethod });
  };

  return (
    <View style={[globalStyles.appBackground, { backgroundColor: '#F8F9FE' }]}>
      <Animated.View entering={FadeInDown.duration(600)} style={[globalStyles.headerRow, { paddingHorizontal: 20, paddingTop: 50 }]}>
        <Pressable onPress={() => navigation.goBack()} style={globalStyles.iconButton}>
          <Text style={{ fontSize: 20 }}>⬅️</Text>
        </Pressable>
        <Text style={[globalStyles.title, { fontSize: 22 }]}>Payment Methods</Text>
        <View style={{ width: 48 }} />
      </Animated.View>

      <ScrollView style={{ padding: 20 }}>
        <Animated.Text 
          entering={FadeIn.delay(200).duration(500)}
          style={[globalStyles.subTitle, { marginBottom: 20 }]}
        >
          Select the payment method you want to use.
        </Animated.Text>
        
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <PaymentOption 
            title="PayPal" 
            icon="🅿️" 
            selected={paymentMethod === 'paypal'} 
            onSelect={() => setPaymentMethod('paypal')} 
          />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <PaymentOption 
            title="Google Pay" 
            icon="𝑮" 
            selected={paymentMethod === 'google'} 
            onSelect={() => setPaymentMethod('google')} 
          />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <PaymentOption 
            title="Apple Pay" 
            icon="🍎" 
            selected={paymentMethod === 'apple'} 
            onSelect={() => setPaymentMethod('apple')} 
          />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(600).duration(500)}>
          <PaymentOption 
            title="•••• •••• •••• 4679" 
            icon="💳" 
            selected={paymentMethod === 'card'} 
            onSelect={() => setPaymentMethod('card')} 
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(700).duration(600)}
          style={[globalStyles.card, { marginTop: 20, backgroundColor: '#F0E6FF', borderColor: '#E0D0FF' }]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: colors.subText }}>Price</Text>
            <Text style={{ fontWeight: '700' }}>${service.price}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.subText }}>Promo</Text>
            <Text style={{ fontWeight: '700', color: colors.danger }}>-$0.00</Text>
          </View>
          <View style={{ height: 1, backgroundColor: '#D0C0FF', marginVertical: 15 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700', fontSize: 18 }}>Total</Text>
            <Text style={{ fontWeight: '800', fontSize: 18, color: colors.primary }}>${service.price}</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(800).duration(600)} style={{ padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#F0F0F0' }}>
        <Button onPress={onConfirm}>Confirm Payment</Button>
      </Animated.View>
    </View>
  );
};

export default CheckoutScreen;
