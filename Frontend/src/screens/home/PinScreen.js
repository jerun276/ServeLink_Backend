import React, { useState } from 'react';
import { Text, View, Pressable, TextInput, Modal } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import Button from '../../components/common/Button';
import globalStyles from '../../styles/globalStyles';
import colors from '../../styles/colors';
import { useBookingContext } from '../../context/BookingContext';

const PinScreen = ({ route, navigation }) => {
  const { service, details } = route.params || {};
  const { bookServiceFromCatalog } = useBookingContext();
  const [pin, setPin] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!service) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Session Expired</Text>
        <Button onPress={() => navigation.navigate('HomeMain')}>Back to Home</Button>
      </View>
    );
  }

  const onContinue = () => {
    if (pin.length === 4) {
      bookServiceFromCatalog(service.id, details);
      setShowSuccess(true);
    }
  };

  const handleComplete = () => {
    setShowSuccess(false);
    navigation.navigate('Bookings', { screen: 'BookingList' });
  };

  return (
    <View style={[globalStyles.appBackground, { backgroundColor: '#F8F9FE' }]}>
      <Animated.View entering={FadeInDown.duration(600)} style={[globalStyles.headerRow, { paddingHorizontal: 20, paddingTop: 50 }]}>
        <Pressable onPress={() => navigation.goBack()} style={globalStyles.iconButton}>
          <Text style={{ fontSize: 20 }}>⬅️</Text>
        </Pressable>
        <Text style={[globalStyles.title, { fontSize: 22 }]}>Enter Your PIN</Text>
        <View style={{ width: 48 }} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.Text 
          entering={FadeIn.delay(300).duration(500)}
          style={[globalStyles.subTitle, { textAlign: 'center', marginBottom: 40 }]}
        >
          Enter your PIN to confirm the booking payment.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={{ flexDirection: 'row', gap: 15, marginBottom: 40 }}>
          {[0, 1, 2, 3].map(i => (
            <Animated.View 
              key={i} 
              entering={ZoomIn.delay(500 + i * 100).duration(400)}
              style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 16, 
                backgroundColor: 'white', 
                borderWidth: 2, 
                borderColor: pin.length > i ? colors.primary : '#F0F0F0',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {pin.length > i && <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.text }} />}
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(600).duration(600)}
          style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '⌫'].map((num, index) => (
            <Pressable
              key={num}
              onPress={() => {
                if (num === '⌫') setPin(pin.slice(0, -1));
                else if (pin.length < 4 && typeof num === 'number') setPin(pin + num);
              }}
              style={{ width: '25%', height: 70, alignItems: 'center', justifyContent: 'center' }}
            >
              <Animated.Text 
                entering={FadeIn.delay(700 + index * 50).duration(300)}
                style={{ fontSize: 28, fontWeight: '700', color: colors.text }}
              >
                {num}
              </Animated.Text>
            </Pressable>
          ))}
        </Animated.View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(900).duration(600)} style={{ padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#F0F0F0', marginBottom: 150 }}>
        <Button onPress={onContinue} disabled={pin.length < 4}>Continue</Button>
      </Animated.View>

      <Modal visible={showSuccess} transparent animationType="fade">
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(200)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <Animated.View 
            entering={ZoomIn.springify().damping(15)} 
            exiting={ZoomOut.duration(200)}
            style={{ backgroundColor: 'white', borderRadius: 40, padding: 30, width: '100%', alignItems: 'center' }}
          >
            <View style={{ 
              width: 100, 
              height: 100, 
              borderRadius: 50, 
              backgroundColor: colors.primary, 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: 24
            }}>
              <Text style={{ fontSize: 50 }}>✅</Text>
            </View>
            <Text style={[globalStyles.title, { textAlign: 'center' }]}>Booking Successful!</Text>
            <Text style={[globalStyles.subTitle, { textAlign: 'center', marginTop: 12, marginBottom: 30 }]}>
              Your booking has been successfully confirmed. You can check the details in your booking list.
            </Text>
            <Button style={{ width: '100%' }} onPress={handleComplete}>View Booking</Button>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
};

export default PinScreen;
