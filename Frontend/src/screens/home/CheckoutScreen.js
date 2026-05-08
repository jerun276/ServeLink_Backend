import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Button from '../../components/common/Button';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import { formatLkr } from '../../utils/currency';

const PaymentOption = ({ title, icon, selected, onSelect }) => (
  <Pressable
    onPress={onSelect}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: selected ? colors.primary : '#F0F0F0',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 16 }}>
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>{icon}</Text>
      </View>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>{title}</Text>
    </View>
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {selected ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} /> : null}
    </View>
  </Pressable>
);

const CheckoutScreen = ({ route, navigation }) => {
  const { service, details, provider } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState('paypal');

  if (!service) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Invalid checkout session</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  const payableAmount = provider?.price || service.price;

  const onConfirm = () => {
    navigation.navigate('Pin', { service, details, provider, paymentMethod });
  };

  return (
    <View style={[globalStyles.appBackground, { backgroundColor: '#F8F9FE' }]}>
      <Animated.View entering={FadeInDown.duration(600)} style={[globalStyles.headerRow, { paddingHorizontal: 20, paddingTop: 50 }]}>
        <Pressable onPress={() => navigation.goBack()} style={globalStyles.iconButton}>
          <Text style={{ fontSize: 20 }}>{'<'}</Text>
        </Pressable>
        <Text style={[globalStyles.title, { fontSize: 22 }]}>Payment Methods</Text>
        <View style={{ width: 48 }} />
      </Animated.View>

      <ScrollView style={{ padding: 20 }}>
        <Animated.Text entering={FadeIn.delay(200).duration(500)} style={[globalStyles.subTitle, { marginBottom: 20 }]}>
          Select the payment method you want to use.
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <PaymentOption title="PayPal" icon="PP" selected={paymentMethod === 'paypal'} onSelect={() => setPaymentMethod('paypal')} />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <PaymentOption title="Google Pay" icon="G" selected={paymentMethod === 'google'} onSelect={() => setPaymentMethod('google')} />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <PaymentOption title="Apple Pay" icon="AP" selected={paymentMethod === 'apple'} onSelect={() => setPaymentMethod('apple')} />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(600).duration(500)}>
          <PaymentOption title="Card ending 4679" icon="Card" selected={paymentMethod === 'card'} onSelect={() => setPaymentMethod('card')} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={[globalStyles.card, { marginTop: 20, backgroundColor: '#F0E6FF', borderColor: '#E0D0FF' }]}>
          {provider ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: colors.subText }}>Provider</Text>
              <Text style={{ fontWeight: '700', maxWidth: '60%', textAlign: 'right' }}>{provider.name}</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: colors.subText }}>Price</Text>
            <Text style={{ fontWeight: '700' }}>{formatLkr(payableAmount)} / day</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.subText }}>Promo</Text>
            <Text style={{ fontWeight: '700', color: colors.danger }}>-LKR 0</Text>
          </View>
          <View style={{ height: 1, backgroundColor: '#D0C0FF', marginVertical: 15 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700', fontSize: 18 }}>Total</Text>
            <Text style={{ fontWeight: '800', fontSize: 18, color: colors.primary }}>{formatLkr(payableAmount)} / day</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(800).duration(600)} style={{ padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#F0F0F0', marginBottom: 150 }}>
        <Button onPress={onConfirm}>Confirm Payment</Button>
      </Animated.View>
    </View>
  );
};

export default CheckoutScreen;
