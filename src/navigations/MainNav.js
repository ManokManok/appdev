import { createStackNavigator } from '@react-navigation/stack';
import { COLORS, ROUTES } from '../utils';

// screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: COLORS.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: COLORS.white,
  headerTitleStyle: {
    fontWeight: '700',
    fontSize: 20,
  },
  headerTitleAlign: 'left',
};

const MainNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.HOME} screenOptions={screenOptions}>
      <Stack.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigation;
