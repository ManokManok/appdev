import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../screens/auth/AuthContext';
import AuthNavigation from './AuthNav';
import MainNavigation from './MainNav';
import UnauthorizedScreen from '../screens/UnauthorizedScreen';
import LoadingScreen from '../components/LoadingScreen';
import { ROUTES } from '../utils';

const Stack = createStackNavigator();

const AppNav = () => {
  const { isLoggedIn, isCustomer, isHydrating } = useAuth();

  if (isHydrating) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          isCustomer ? (
            <Stack.Screen name="Main" component={MainNavigation} />
          ) : (
            <Stack.Screen name={ROUTES.UNAUTHORIZED} component={UnauthorizedScreen} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigation} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNav;
