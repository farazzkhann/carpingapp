import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { z } from 'zod';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { ApiRequestError } from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

const schema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    const result = schema.safeParse({ newPassword });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid password');
      return;
    }

    if (!token) {
      setServerError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: result.data.newPassword }),
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok) {
        throw new ApiRequestError(data.error ?? 'Failed to reset password', res.status);
      }
      setDone(true);
    } catch (err) {
      setServerError(
        err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Invalid Link</Text>
        <Text style={styles.subtitle}>This reset link is missing a token. Please request a new one.</Text>
        <Button onPress={() => router.replace('/(auth)/forgot-password')} style={styles.button}>
          Request new link
        </Button>
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.centered}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.title}>Password Reset</Text>
        <Text style={styles.subtitle}>Your password has been updated. You can now log in.</Text>
        <Button onPress={() => router.replace('/(auth)/login')} style={styles.button}>
          Go to Login
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>Enter your new password below.</Text>
        </View>

        {serverError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{serverError}</Text>
          </View>
        ) : null}

        <Input
          label="New Password"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={newPassword}
          onChangeText={v => { setNewPassword(v); setError(''); }}
          error={error}
          secureTextEntry
        />

        <Button onPress={handleSubmit} loading={loading} style={styles.button}>
          Reset Password
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  header: { marginBottom: spacing.xxl },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.bodyLarge, color: colors.textSecondary },
  successIcon: { fontSize: 56, color: colors.success, marginBottom: spacing.base },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: { ...typography.body, color: colors.error },
  button: { marginTop: spacing.sm },
});
