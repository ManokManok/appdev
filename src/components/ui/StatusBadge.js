import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RADIUS, TYPOGRAPHY, getStatusColors } from '../../utils';

const StatusBadge = memo(({ status, style }) => {
  const colors = getStatusColors(status);
  const label = String(status || 'Unknown').replace(/_/g, ' ');

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
});

StatusBadge.displayName = 'StatusBadge';

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    ...TYPOGRAPHY.caption,
    textTransform: 'capitalize',
  },
});

export default StatusBadge;
