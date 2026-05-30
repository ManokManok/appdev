import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils';

const CustomButton = memo(({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'md',
  containerStyle,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.button,
          size === 'sm' && styles.buttonSm,
          isPrimary && styles.primary,
          variant === 'secondary' && styles.secondary,
          isGhost && styles.ghost,
          disabled && styles.disabled,
          isPrimary && !disabled && SHADOWS.sm,
        ]}
        activeOpacity={disabled ? 1 : 0.82}
      >
        <Text
          style={[
            styles.text,
            size === 'sm' && styles.textSm,
            isPrimary && styles.primaryText,
            variant === 'secondary' && styles.secondaryText,
            isGhost && styles.ghostText,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

CustomButton.displayName = 'CustomButton';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.9,
  },
  primaryText: {
    color: COLORS.textOnPrimary,
  },
  secondaryText: {
    color: COLORS.text,
  },
  ghostText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default CustomButton;
