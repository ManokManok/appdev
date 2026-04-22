import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';

import { AuthProvider } from './src/screens/auth/AuthContext';
import AppNav from './src/navigations';
const App = () => (
  <GestureHandlerRootView style={styles.root}>
    <AuthProvider>
      <View style={styles.appContainer}>
        <AppNav />
      </View>
    </AuthProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
  },
});

export default App;
