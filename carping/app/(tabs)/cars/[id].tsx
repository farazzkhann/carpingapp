import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { carsService } from '../../../src/services/cars';
import { ApiRequestError } from '../../../src/services/api';
import { Button } from '../../../src/components/common/Button';
import { LoadingScreen } from '../../../src/components/common/LoadingScreen';
import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';
import { radius } from '../../../src/theme/radius';
import { typography } from '../../../src/theme/typography';

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  const { data: car, isLoading, isError } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsService.getCarById(id),
    enabled: !!id,
  });

  async function performDelete() {
    setDeleting(true);
    try {
      await carsService.deleteCar(id);
      queryClient.removeQueries({ queryKey: ['car', id] });
      await queryClient.invalidateQueries({ queryKey: ['cars'] });
      router.back();
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : 'Failed to delete car.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setDeleting(false);
    }
  }

  function handleDelete() {
    const message = `Remove ${car?.make} ${car?.model} from your account? This cannot be undone.`;
    if (Platform.OS === 'web') {
      if (window.confirm(message)) performDelete();
    } else {
      Alert.alert('Delete Car', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]);
    }
  }

  if (isLoading) return <LoadingScreen />;

  if (isError || !car) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Car not found</Text>
        <Button onPress={() => router.back()} variant="secondary" style={styles.backButton}>
          Go back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.plate}>{car.licensePlate}</Text>
        {car.nickname ? <Text style={styles.nickname}>{car.nickname}</Text> : null}
      </View>

      <View style={styles.section}>
        <DetailRow label="Make" value={car.make} />
        <DetailRow label="Model" value={car.model} />
        <DetailRow label="Color" value={car.color} />
        {car.year ? <DetailRow label="Year" value={String(car.year)} /> : null}
        <DetailRow label="QR Code ID" value={car.qrCodeId} mono />
      </View>

      <View style={styles.actions}>
        <Button
          onPress={() => router.push({ pathname: '/car/[id]/qrcode', params: { id: car.id } })}
          accessibilityLabel="Show QR code"
        >
          Show QR Code
        </Button>
        <Button
          onPress={handleDelete}
          variant="danger"
          loading={deleting}
          accessibilityLabel="Delete this car"
        >
          Delete Car
        </Button>
      </View>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.rowValueMono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: spacing.base },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  header: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plate: { ...typography.h1, color: colors.textPrimary },
  nickname: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  section: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.label, color: colors.textSecondary },
  rowValue: { ...typography.body, color: colors.textPrimary, flex: 1, textAlign: 'right' },
  rowValueMono: { fontSize: 11, color: colors.textLight },
  actions: { gap: spacing.sm },
  errorText: { ...typography.body, color: colors.error, marginBottom: spacing.base },
  backButton: { width: 140 },
});
