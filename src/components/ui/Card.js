import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../utils';

const Card = memo(({ children, style, elevated = true, padding = 'lg' }) => (
  <View
    style={[
      styles.card,
      elevated && SHADOWS.md,
      padding === 'lg' && styles.padLg,
      padding === 'md' && styles.padMd,
      padding === 'none' && styles.padNone,
      style,
    ]}
  >
    {children}
  </View>
));

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  padLg: { padding: SPACING.lg },
  padMd: { padding: SPACING.md },
  padNone: { padding: 0 },
});

export default Card;
