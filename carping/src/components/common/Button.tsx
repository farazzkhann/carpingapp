import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        containerStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && pressedStyles[variant],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={loadingColors[variant]} size="small" />
      ) : (
        <Text style={[styles.text, textStyles[variant]]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  disabled: { opacity: 0.5 },
  text: { ...typography.button },
});

const containerStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: 'transparent', borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  danger: { backgroundColor: colors.error, borderColor: colors.error },
};

const textStyles: Record<Variant, { color: string }> = {
  primary: { color: '#FFFFFF' },
  secondary: { color: colors.primary },
  ghost: { color: colors.textSecondary },
  danger: { color: '#FFFFFF' },
};

const pressedStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primaryDark },
  secondary: { backgroundColor: colors.backgroundSecondary },
  ghost: { backgroundColor: colors.backgroundSecondary },
  danger: { backgroundColor: '#DC2626' },
};

const loadingColors: Record<Variant, string> = {
  primary: '#FFFFFF',
  secondary: colors.primary,
  ghost: colors.textSecondary,
  danger: '#FFFFFF',
};
