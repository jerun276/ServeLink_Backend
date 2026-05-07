import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';
import BookingListScreen from '../screens/booking/BookingListScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatThreadScreen from '../screens/chat/ChatThreadScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProviderDashboardScreen from '../screens/profile/ProviderDashboardScreen';
import ManageServicesScreen from '../screens/profile/ManageServicesScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ProviderReviewScreen from '../screens/admin/ProviderReviewScreen';
import ServiceDetailsScreen from '../screens/home/ServiceDetailsScreen';
import CheckoutScreen from '../screens/home/CheckoutScreen';
import PinScreen from '../screens/home/PinScreen';
import colors from '../styles/colors';
import useAuth from '../hooks/useAuth';

const Tab = createBottomTabNavigator();
const BookingStackNav = createNativeStackNavigator();
const HomeStackNav = createNativeStackNavigator();
const ChatStackNav = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

const HomeStack = () => (
  <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
    <HomeStackNav.Screen component={HomeScreen} name="HomeMain" />
    <HomeStackNav.Screen component={ServiceDetailsScreen} name="ServiceDetails" />
    <HomeStackNav.Screen component={CheckoutScreen} name="Checkout" />
    <HomeStackNav.Screen component={PinScreen} name="Pin" />
  </HomeStackNav.Navigator>
);

const BookingStack = () => (
  <BookingStackNav.Navigator screenOptions={{ headerShown: false }}>
    <BookingStackNav.Screen component={BookingListScreen} name="BookingList" />
    <BookingStackNav.Screen component={BookingDetailsScreen} name="BookingDetails" />
    <BookingStackNav.Screen component={ChatThreadScreen} name="BookingChatThread" />
  </BookingStackNav.Navigator>
);

const ChatStack = () => (
  <ChatStackNav.Navigator screenOptions={{ headerShown: false }}>
    <ChatStackNav.Screen component={ChatListScreen} name="ChatList" />
    <ChatStackNav.Screen component={ChatThreadScreen} name="ChatThread" />
  </ChatStackNav.Navigator>
);

const ProfileStack = ({ profileRootComponent, role }) => (
  <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStackNav.Screen component={profileRootComponent} name="ProfileMain" />
    {role === 'provider' ? (
      <ProfileStackNav.Screen component={ManageServicesScreen} name="ManageServices" />
    ) : null}
    {role === 'admin' ? (
      <ProfileStackNav.Screen component={ProviderReviewScreen} name="ProviderReview" />
    ) : null}
  </ProfileStackNav.Navigator>
);

const TabNavigator = () => {
  const { user } = useAuth();
  let ProfileRootScreen = ProfileScreen;
  if (user?.role === 'provider') ProfileRootScreen = ProviderDashboardScreen;
  if (user?.role === 'admin') ProfileRootScreen = AdminDashboardScreen;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: '#9E9E9E',
        }}
      >
        <Tab.Screen
          component={HomeStack}
          name="Home"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Text style={{ color: focused ? 'white' : '#9E9E9E', fontSize: 22 }}>🏠</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          component={BookingStack}
          name="Bookings"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Text style={{ color: focused ? 'white' : '#9E9E9E', fontSize: 22 }}>📅</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          component={ChatStack}
          name="Chats"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Text style={{ color: focused ? 'white' : '#9E9E9E', fontSize: 22 }}>👥</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          children={() => <ProfileStack profileRootComponent={ProfileRootScreen} role={user?.role} />}
          name="Profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Text style={{ color: focused ? 'white' : '#9E9E9E', fontSize: 22 }}>👤</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: {
    backgroundColor: colors.primary,
  }
});

export default TabNavigator;
