import { createStackNavigator } from '@react-navigation/stack';
import { COLORS, ROUTES } from '../utils';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import ErrorScreen from '../screens/auth/ErrorScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary, elevation: 0, shadowOpacity: 0 },
  headerTintColor: COLORS.textOnPrimary,
  headerTitleStyle: { fontWeight: '700', fontSize: 17, letterSpacing: -0.2 },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: COLORS.backgroundWarm },
};

const AuthNavigation = () => (
  <Stack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={screenOptions}>
    <Stack.Screen name={ROUTES.LOGIN} component={Login} options={{ headerShown: false }} />
    <Stack.Screen
      name={ROUTES.REGISTER}
      component={Register}
      options={{ title: 'Create Account', headerShown: false }}
    />
    <Stack.Screen name={ROUTES.ERRORSCREEN} component={ErrorScreen} options={{ title: 'Error' }} />
  </Stack.Navigator>
);

export default AuthNavigation;
