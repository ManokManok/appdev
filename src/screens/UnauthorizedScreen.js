import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import Card from '../components/ui/Card';
import { useAuth } from './auth/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils';

const UnauthorizedScreen = () => {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Access restricted</Text>
        <Text style={styles.subtitle}>
          This mobile app is for customer accounts only. Staff and admin users should use the web dashboard.
        </Text>
        <CustomButton label="Log out" variant="secondary" onPress={logout} containerStyle={styles.button} />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.backgroundWarm,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    width: '100%',
  },
});

export default UnauthorizedScreen;
