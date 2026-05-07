import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;
