import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { ApiRequestError } from '../../src/services/api';
import { authService } from '../../src/services/auth';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { forgotPasswordSchema, type ForgotPasswordForm } from '../../src/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [form, setForm] = useState<ForgotPasswordForm>({ email: '' });
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function updateEmail(value: string) {
    setForm({ email: value });
    if (emailError) setEmailError('');
    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  }

  async function handleSubmit() {
    const result = forgotPasswordSchema.safeParse(form);
    if (!result.success) {
      setEmailError(result.error.issues[0]?.message ?? 'Invalid email');
      return;
    }

    setLoading(true);
    try {
      const message = await authService.forgotPassword(result.data.email);
      setSuccessMessage(message);
    } catch (err) {
      setServerError(
        err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back">
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a reset link.
          </Text>
        </View>

        {serverError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{serverError}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <Input
          label="Email"
          placeholder="you@example.com"
          value={form.email}
          onChangeText={updateEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <Button onPress={handleSubmit} loading={loading} style={styles.button}>
          Send reset link
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            accessibilityLabel="Go to login"
          >
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  back: { marginBottom: spacing.xl },
  backText: { ...typography.label, color: colors.primary },
  header: { marginBottom: spacing.xxl },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.bodyLarge, color: colors.textSecondary },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: { ...typography.body, color: colors.error },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successText: { ...typography.body, color: '#166534' },
  button: { marginBottom: spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { ...typography.body, color: colors.textSecondary },
  link: { ...typography.label, color: colors.primary },
});
