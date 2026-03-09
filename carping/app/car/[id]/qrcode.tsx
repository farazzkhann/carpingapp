import { useRef } from 'react';
import { Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import { carsService } from '../../../src/services/cars';
import { Button } from '../../../src/components/common/Button';
import { LoadingScreen } from '../../../src/components/common/LoadingScreen';
import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';
import { radius } from '../../../src/theme/radius';
import { typography } from '../../../src/theme/typography';

// APP_URL points to the frontend — this is what the QR code encodes so scanners land on the scan page
const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? 'http://localhost:8081';

export default function QrCodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const svgRef = useRef<{ toDataURL: (cb: (data: string) => void) => void } | null>(null);

  const { data: car, isLoading, isError } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsService.getCarById(id),
    enabled: !!id,
  });

  async function handleShare() {
    const scanUrl = `${APP_URL}/qr/${car?.qrCodeId}`;
    const description = `Scan to contact the owner of ${car?.make} ${car?.model} (${car?.licensePlate})`;
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message: description, url: scanUrl } // iOS shows url separately — don't put it in message or it duplicates
          : { message: `${description}: ${scanUrl}` }, // Android ignores url field — must include in message
      );
    } catch {
      // user dismissed
    }
  }

  if (isLoading) return <LoadingScreen />;

  if (isError || !car) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Car not found</Text>
      </View>
    );
  }

  const scanUrl = `${APP_URL}/qr/${car.qrCodeId}`;

  return (
    <>
      <Stack.Screen options={{ title: `${car.make} ${car.model} QR` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.plate}>{car.licensePlate}</Text>
          {car.nickname ? <Text style={styles.nickname}>{car.nickname}</Text> : null}

          <View style={styles.qrWrapper}>
            <QRCode
              value={scanUrl}
              size={220}
              color={colors.textPrimary}
              backgroundColor={colors.background}
              getRef={ref => { svgRef.current = ref as typeof svgRef.current; }}
            />
          </View>

          <Text style={styles.hint}>Anyone who scans this code can send you a notification</Text>
          <Text style={styles.url} numberOfLines={1}>{scanUrl}</Text>
        </View>

        <View style={styles.actions}>
          <Button onPress={handleShare} accessibilityLabel="Share QR code">
            Share QR Code
          </Button>
        </View>

        {Platform.OS !== 'web' && (
          <Text style={styles.saveHint}>
            Take a screenshot to save your QR code and print it as a windshield sticker.
          </Text>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: spacing.base, alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    marginBottom: spacing.base,
  },
  plate: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  nickname: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.base },
  qrWrapper: {
    padding: spacing.base,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    marginVertical: spacing.xl,
  },
  hint: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  url: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
  actions: { width: '100%', gap: spacing.sm },
  errorText: { ...typography.body, color: colors.error },
  saveHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
  },
});
