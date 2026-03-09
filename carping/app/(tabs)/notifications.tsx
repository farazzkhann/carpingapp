import { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { notificationsService } from '../../src/services/notifications';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';
import type { Notification, NotificationType } from '../../src/types';

const TYPE_CONFIG: Record<NotificationType, { label: string; color: string }> = {
  PARKING_ISSUE: { label: 'Parking Issue', color: '#F59E0B' },
  BLOCKING:      { label: 'Blocking',       color: '#EF4444' },
  ACCIDENT:      { label: 'Accident',        color: '#DC2626' },
  EMERGENCY:     { label: 'Emergency',       color: '#7C3AED' },
  GENERAL:       { label: 'General',         color: '#6B7280' },
};

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const renderItem = useCallback(({ item }: { item: Notification }) => {
    const config = TYPE_CONFIG[item.type];
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

    return (
      <Pressable
        style={[styles.card, item.isRead && styles.cardRead]}
        onPress={() => { if (!item.isRead) markReadMutation.mutate(item.id); }}
        accessibilityLabel={`Notification: ${item.message}`}
        accessibilityRole="button"
      >
        {!item.isRead && <View style={styles.unreadDot} />}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
              <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
            </View>
            <Text style={styles.time}>{timeAgo}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
          <View style={styles.cardFooter}>
            {item.car && (
              <Text style={styles.plate}>{item.car.licensePlate} · {item.car.make} {item.car.model}</Text>
            )}
            {item.senderName && (
              <Text style={styles.sender}>from {item.senderName}</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  }, [markReadMutation]);

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
        <Text style={styles.errorText}>Failed to load notifications</Text>
        <Button onPress={() => refetch()} variant="secondary" style={styles.retryButton}>
          Try again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.unreadLabel}>{unreadCount} unread</Text>
          <Pressable
            onPress={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            accessibilityLabel="Mark all as read"
          >
            <Text style={styles.markAllText}>
              {markAllMutation.isPending ? 'Marking...' : 'Mark all read'}
            </Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          notifications?.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              When someone scans your QR sticker, their message will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadLabel: { ...typography.label, color: colors.textSecondary },
  markAllText: { ...typography.label, color: colors.primary },
  list: { padding: spacing.base, gap: spacing.sm },
  emptyContainer: { flexGrow: 1 },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
  },
  cardRead: { opacity: 0.65 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
    marginRight: spacing.sm,
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.caption, fontFamily: 'Inter_600SemiBold' },
  time: { ...typography.caption, color: colors.textLight },
  message: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  plate: { ...typography.caption, color: colors.textSecondary },
  sender: { ...typography.caption, color: colors.textLight },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  errorText: { ...typography.body, color: colors.error, marginBottom: spacing.base },
  retryButton: { width: 140 },
});
