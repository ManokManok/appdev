import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, ROUTES, SHADOWS } from '../utils';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import BookingsScreen from '../screens/BookingsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  [ROUTES.HOME]: ['home', 'home-outline'],
  [ROUTES.ORDERS]: ['receipt', 'receipt-outline'],
  [ROUTES.BOOKINGS]: ['calendar', 'calendar-outline'],
  [ROUTES.PAYMENTS]: ['card', 'card-outline'],
  [ROUTES.PROFILE]: ['person-circle', 'person-circle-outline'],
};

const makeTabIcon = routeName => {
  const TabIcon = ({ focused, color, size }) => {
    const icons = TAB_ICONS[routeName] || ['ellipse', 'ellipse-outline'];
    const name = focused ? icons[0] : icons[1];
    return <Ionicons name={name} size={size} color={color} />;
  };
  TabIcon.displayName = `TabIcon(${routeName})`;
  return TabIcon;
};

const HomeTabIcon = makeTabIcon(ROUTES.HOME);
const OrdersTabIcon = makeTabIcon(ROUTES.ORDERS);
const BookingsTabIcon = makeTabIcon(ROUTES.BOOKINGS);
const PaymentsTabIcon = makeTabIcon(ROUTES.PAYMENTS);
const ProfileTabIcon = makeTabIcon(ROUTES.PROFILE);

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: COLORS.textOnPrimary,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          SHADOWS.lg,
          { height: tabBarHeight, paddingBottom: Math.max(insets.bottom, 8) },
        ],
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{ title: 'Home', headerShown: false, tabBarIcon: HomeTabIcon }}
      />
      <Tab.Screen
        name={ROUTES.ORDERS}
        component={OrdersScreen}
        options={{ title: 'Orders', tabBarIcon: OrdersTabIcon }}
      />
      <Tab.Screen
        name={ROUTES.BOOKINGS}
        component={BookingsScreen}
        options={{ title: 'Bookings', tabBarIcon: BookingsTabIcon }}
      />
      <Tab.Screen
        name={ROUTES.PAYMENTS}
        component={PaymentsScreen}
        options={{ title: 'Payments', tabBarIcon: PaymentsTabIcon }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: false, tabBarIcon: ProfileTabIcon }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -2,
  },
});

export default MainTabs;
