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
import { useAuthStore } from '../../src/store/auth-store';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { loginSchema, type LoginForm } from '../../src/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField<K extends keyof LoginForm>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
    if (serverError) setServerError('');
  }

  async function handleLogin() {
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<LoginForm> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginForm;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message as never;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(result.data);
      setUser(user);
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
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your Carping account</Text>
        </View>

        {serverError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{serverError}</Text>
          </View>
        ) : null}

        <Input
          label="Email"
          placeholder="you@example.com"
          value={form.email}
          onChangeText={v => updateField('email', v)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <Input
          label="Password"
          placeholder="Your password"
          value={form.password}
          onChangeText={v => updateField('password', v)}
          error={errors.password}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          textContentType="password"
          rightIcon={
            <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
          }
          onRightIconPress={() => setShowPassword(s => !s)}
        />

        <Pressable
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotLink}
          accessibilityLabel="Forgot password"
        >
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>

        <Button onPress={handleLogin} loading={loading} style={styles.button}>
          Sign in
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable
            onPress={() => router.push('/(auth)/register')}
            accessibilityLabel="Go to register"
          >
            <Text style={styles.link}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
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
  forgotLink: { alignSelf: 'flex-end', marginBottom: spacing.xl, marginTop: -spacing.sm },
  link: { ...typography.label, color: colors.primary },
  button: { marginBottom: spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { ...typography.body, color: colors.textSecondary },
  toggleText: { ...typography.caption, color: colors.primary },
});
