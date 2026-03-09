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
import { registerSchema, type RegisterForm } from '../../src/utils/validation';

type FormErrors = Partial<Record<keyof RegisterForm, string>>;

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors(e => ({ ...e, [key]: undefined }));
    }
    if (serverError) setServerError('');
  }

  async function handleRegister() {
    const payload = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      phone: form.phone.trim() || undefined,
    };

    const result = registerSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RegisterForm;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await authService.register(result.data);
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join Carping to protect your car</Text>
        </View>

        {serverError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{serverError}</Text>
          </View>
        ) : null}

        <Input
          label="Full name"
          placeholder="John Smith"
          value={form.fullName}
          onChangeText={v => updateField('fullName', v)}
          error={errors.fullName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />

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
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={form.password}
          onChangeText={v => updateField('password', v)}
          error={errors.password}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          textContentType="newPassword"
          rightIcon={
            <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
          }
          onRightIconPress={() => setShowPassword(s => !s)}
        />

        <Input
          label="Phone (optional)"
          placeholder="+61 400 000 000"
          value={form.phone}
          onChangeText={v => updateField('phone', v)}
          error={errors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />

        <Button onPress={handleRegister} loading={loading} style={styles.button}>
          Create account
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
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
  button: { marginBottom: spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { ...typography.body, color: colors.textSecondary },
  link: { ...typography.label, color: colors.primary },
  toggleText: { ...typography.caption, color: colors.primary },
});
