import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { qrService, type NotificationType } from '../../src/services/qr';
import { ApiRequestError } from '../../src/services/api';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';

const NOTIFICATION_TYPES: { label: string; value: NotificationType }[] = [
  { label: 'Parking Issue', value: 'PARKING_ISSUE' },
  { label: 'Blocking Access', value: 'BLOCKING' },
  { label: 'Accident', value: 'ACCIDENT' },
  { label: 'Emergency', value: 'EMERGENCY' },
  { label: 'General', value: 'GENERAL' },
];

const notifyFormSchema = z.object({
  message: z.string().min(1, 'Please enter a message').max(500, 'Message too long'),
  senderName: z.string().max(100).optional(),
});

type FormErrors = { message?: string; senderName?: string };

export default function PublicQrScanScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();

  const [selectedType, setSelectedType] = useState<NotificationType>('GENERAL');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  const { data: car, isLoading, isError } = useQuery({
    queryKey: ['qr', code],
    queryFn: () => qrService.getCarByQrCode(code),
    enabled: !!code,
    retry: 1,
  });

  async function handleSend() {
    const result = notifyFormSchema.safeParse({ message, senderName: senderName || undefined });
    if (!result.success) {
      const errs: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormErrors;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFormErrors(errs);
      return;
    }

    setSending(true);
    setSendError('');
    try {
      await qrService.sendNotification(code, {
        type: selectedType,
        message: result.data.message,
        senderName: result.data.senderName,
      });
      setSent(true);
    } catch (err) {
      setSendError(
        err instanceof ApiRequestError ? err.message : 'Failed to send notification. Try again.',
      );
    } finally {
      setSending(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Looking up vehicle...</Text>
      </View>
    );
  }

  if (isError || !car) {
    return (
      <>
        <Stack.Screen options={{ title: 'Carping' }} />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>QR Code Not Found</Text>
          <Text style={styles.errorSubtitle}>This QR code is no longer valid.</Text>
        </View>
      </>
    );
  }

  if (sent) {
    return (
      <>
        <Stack.Screen options={{ title: 'Message Sent' }} />
        <View style={styles.centered}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Message Sent</Text>
          <Text style={styles.successSubtitle}>
            The owner of {car.make} {car.model} ({car.licensePlate}) has been notified.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Contact Car Owner' }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Car Info */}
          <View style={styles.carCard}>
            <Text style={styles.plate}>{car.licensePlate}</Text>
            <Text style={styles.carName}>
              {car.year ? `${car.year} ` : ''}{car.make} {car.model}
            </Text>
            {car.nickname ? <Text style={styles.nickname}>{car.nickname}</Text> : null}
          </View>

          <Text style={styles.sectionLabel}>What's the issue?</Text>

          {/* Type Selector */}
          <View style={styles.typeRow}>
            {NOTIFICATION_TYPES.map(t => (
              <Button
                key={t.value}
                onPress={() => setSelectedType(t.value)}
                variant={selectedType === t.value ? 'primary' : 'secondary'}
                style={styles.typeButton}
              >
                {t.label}
              </Button>
            ))}
          </View>

          <Input
            label="Message *"
            placeholder="Describe the issue..."
            value={message}
            onChangeText={v => {
              setMessage(v);
              if (formErrors.message) setFormErrors(e => ({ ...e, message: undefined }));
            }}
            error={formErrors.message}
            multiline
          />

          <Input
            label="Your name (optional)"
            placeholder="Anonymous"
            value={senderName}
            onChangeText={v => {
              setSenderName(v);
              if (formErrors.senderName) setFormErrors(e => ({ ...e, senderName: undefined }));
            }}
            error={formErrors.senderName}
          />

          {sendError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{sendError}</Text>
            </View>
          ) : null}

          <Button
            onPress={handleSend}
            loading={sending}
            style={styles.sendButton}
            accessibilityLabel="Send notification to car owner"
          >
            Send Notification
          </Button>

          <Text style={styles.privacyNote}>
            The car owner will not see your contact details.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.base, paddingBottom: spacing.xxxl },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.base },
  carCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plate: { ...typography.h2, color: colors.textPrimary },
  carName: { ...typography.bodyLarge, color: colors.textSecondary, marginTop: spacing.xs },
  nickname: { ...typography.caption, color: colors.textLight, marginTop: spacing.xs },
  sectionLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.base },
  typeButton: { flex: 1, minWidth: 120 },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: { ...typography.body, color: colors.error },
  sendButton: { marginTop: spacing.sm },
  privacyNote: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.base,
  },
  errorTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  errorSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  successIcon: { fontSize: 64, color: colors.success, marginBottom: spacing.base },
  successTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  successSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
