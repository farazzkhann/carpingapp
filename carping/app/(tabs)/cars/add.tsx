import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { carsService } from '../../../src/services/cars';
import { ApiRequestError } from '../../../src/services/api';
import { Button } from '../../../src/components/common/Button';
import { Input } from '../../../src/components/common/Input';
import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';
import { typography } from '../../../src/theme/typography';

const addCarSchema = z.object({
  licensePlate: z.string().min(1, 'License plate is required').max(20),
  make: z.string().min(1, 'Make is required').max(50),
  model: z.string().min(1, 'Model is required').max(50),
  color: z.string().min(1, 'Color is required').max(30),
  year: z
    .string()
    .optional()
    .refine(v => !v || (!isNaN(Number(v)) && Number(v) >= 1900 && Number(v) <= new Date().getFullYear() + 1), {
      message: 'Enter a valid year',
    }),
  nickname: z.string().max(50).optional(),
});

type FormFields = {
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  year: string;
  nickname: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

export default function AddCarScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormFields>({
    licensePlate: '',
    make: '',
    model: '',
    color: '',
    year: '',
    nickname: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(key: keyof FormFields, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
    if (serverError) setServerError('');
  }

  async function handleSubmit() {
    const result = addCarSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormFields;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await carsService.createCar({
        licensePlate: result.data.licensePlate,
        make: result.data.make,
        model: result.data.model,
        color: result.data.color,
        year: result.data.year ? Number(result.data.year) : undefined,
        nickname: result.data.nickname || undefined,
      });

      // Invalidate the cars list so it refetches with the new car
      await queryClient.invalidateQueries({ queryKey: ['cars'] });
      router.back();
    } catch (err) {
      setServerError(
        err instanceof ApiRequestError ? err.message : 'Failed to add car. Try again.',
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
        {serverError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{serverError}</Text>
          </View>
        ) : null}

        <Input
          label="License Plate *"
          placeholder="ABC 123"
          value={form.licensePlate}
          onChangeText={v => updateField('licensePlate', v)}
          error={errors.licensePlate}
          autoCapitalize="characters"
        />
        <Input
          label="Make *"
          placeholder="Toyota"
          value={form.make}
          onChangeText={v => updateField('make', v)}
          error={errors.make}
          autoCapitalize="words"
        />
        <Input
          label="Model *"
          placeholder="Camry"
          value={form.model}
          onChangeText={v => updateField('model', v)}
          error={errors.model}
          autoCapitalize="words"
        />
        <Input
          label="Color *"
          placeholder="White"
          value={form.color}
          onChangeText={v => updateField('color', v)}
          error={errors.color}
          autoCapitalize="words"
        />
        <Input
          label="Year"
          placeholder="2022"
          value={form.year}
          onChangeText={v => updateField('year', v)}
          error={errors.year}
          keyboardType="numeric"
          maxLength={4}
        />
        <Input
          label="Nickname"
          placeholder="My daily driver"
          value={form.nickname}
          onChangeText={v => updateField('nickname', v)}
          error={errors.nickname}
        />

        <Button onPress={handleSubmit} loading={loading} style={styles.button}>
          Add Car
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.base },
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
