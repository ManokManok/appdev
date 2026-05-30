import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

import { initUsbMetroBridge } from './src/dev/usbMetroBridge';
import { AuthProvider } from './src/screens/auth/AuthContext';
import { RealtimeProvider } from './src/core/realtime/RealtimeContext';
import { usePushNotifications } from './src/core/notifications/usePushNotifications';
import AppNav from './src/navigations';

const AppShell = () => {
  usePushNotifications();

  return (
    <View style={styles.appContainer}>
      <AppNav />
    </View>
  );
};

const App = () => {
  useEffect(() => initUsbMetroBridge(), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <RealtimeProvider>
            <AppShell />
          </RealtimeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
  },
});

export default App;
