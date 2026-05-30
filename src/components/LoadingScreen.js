import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../utils';

const LoadingScreen = () => (
  <View style={styles.container}>
    <View style={[styles.card, SHADOWS.md]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.label}>Loading your account</Text>
      <Text style={styles.hint}>Please wait a moment…</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundWarm,
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  hint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
});

export default LoadingScreen;
