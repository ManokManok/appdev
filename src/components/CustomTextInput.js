import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, SPACING } from '../utils';

const CustomTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  textStyle,
  containerStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={COLORS.textMuted}
        style={[styles.input, textStyle]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: 16,
    color: COLORS.text,
  },
});

export default CustomTextInput;
