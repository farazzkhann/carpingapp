import { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { carsService } from '../../../src/services/cars';
import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';
import { radius } from '../../../src/theme/radius';
import { typography } from '../../../src/theme/typography';
import { Button } from '../../../src/components/common/Button';
import type { Car } from '../../../src/types';

export default function CarsScreen() {
  const router = useRouter();

  const { data: cars, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['cars'],
    queryFn: carsService.getCars,
  });

  const renderCar = useCallback(({ item }: { item: Car }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(tabs)/cars/${item.id}`)}
      accessibilityLabel={`View ${item.make} ${item.model}`}
      accessibilityRole="button"
    >
      <View style={styles.cardHeader}>
        <Text style={styles.plate}>{item.licensePlate}</Text>
        {item.nickname ? <Text style={styles.nickname}>{item.nickname}</Text> : null}
      </View>
      <Text style={styles.carName}>
        {item.year ? `${item.year} ` : ''}{item.make} {item.model}
      </Text>
      <Text style={styles.color}>{item.color}</Text>
      <Text style={styles.qrHint}>Tap to view QR code →</Text>
    </Pressable>
  ), [router]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load cars</Text>
        <Button onPress={() => refetch()} variant="secondary" style={styles.retryButton}>
          Try again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cars}
        keyExtractor={item => item.id}
        renderItem={renderCar}
        contentContainerStyle={cars?.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No cars yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first car to get a QR code sticker
            </Text>
          </View>
        }
      />
      <View style={styles.fab}>
        <Button
          onPress={() => router.push('/(tabs)/cars/add')}
          accessibilityLabel="Add a new car"
        >
          + Add Car
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  list: { padding: spacing.base, paddingBottom: 100 },
  emptyContainer: { flexGrow: 1 },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  plate: { ...typography.h3, color: colors.textPrimary },
  nickname: { ...typography.caption, color: colors.textSecondary },
  carName: { ...typography.bodyLarge, color: colors.textPrimary, marginBottom: spacing.xs },
  color: { ...typography.body, color: colors.textSecondary },
  qrHint: { ...typography.caption, color: colors.primary, marginTop: spacing.sm },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  errorText: { ...typography.body, color: colors.error, marginBottom: spacing.base },
  retryButton: { width: 140 },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.base,
    right: spacing.base,
  },
});
