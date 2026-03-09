import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { authService } from '../../src/services/auth';
import { useAuthStore } from '../../src/store/auth-store';
import { notificationsService } from '../../src/services/notifications';
import { carsService } from '../../src/services/cars';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { radius } from '../../src/theme/radius';
import { typography } from '../../src/theme/typography';
import type { NotificationType } from '../../src/types';

const TYPE_COLORS: Record<NotificationType, string> = {
  PARKING_ISSUE: '#F59E0B',
  BLOCKING:      '#EF4444',
  ACCIDENT:      '#DC2626',
  EMERGENCY:     '#7C3AED',
  GENERAL:       '#6B7280',
};

const TYPE_LABELS: Record<NotificationType, string> = {
  PARKING_ISSUE: 'Parking Issue',
  BLOCKING:      'Blocking',
  ACCIDENT:      'Accident',
  EMERGENCY:     'Emergency',
  GENERAL:       'General',
};

export default function HomeScreen() {
  const { user, clearUser } = useAuthStore();
  const router = useRouter();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getNotifications,
  });

  const { data: cars } = useQuery({
    queryKey: ['cars'],
    queryFn: carsService.getCars,
  });

  async function handleLogout() {
    await authService.logout();
    clearUser();
    router.replace('/(auth)/login');
  }

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;
  const recentNotifications = notifications?.slice(0, 5) ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{user?.fullName ?? 'User'}</Text>
        </View>
        <Pressable onPress={handleLogout} accessibilityLabel="Log out">
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{cars?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Cars</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, unreadCount > 0 && styles.statUnread]}>
            {unreadCount}
          </Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{notifications?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Total alerts</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/cars')}
            accessibilityLabel="Go to My Cars"
          >
            <Text style={styles.actionIcon}>🚗</Text>
            <Text style={styles.actionLabel}>My Cars</Text>
          </Pressable>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/notifications')}
            accessibilityLabel="Go to Notifications"
          >
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionLabel}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          {(notifications?.length ?? 0) > 5 && (
            <Pressable
              onPress={() => router.push('/(tabs)/notifications')}
              accessibilityLabel="See all notifications"
            >
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          )}
        </View>
        {recentNotifications.length === 0 ? (
          <View style={styles.emptyAlerts}>
            <Text style={styles.emptyText}>No alerts yet. Share your QR code to get started.</Text>
          </View>
        ) : (
          recentNotifications.map(n => (
            <Pressable
              key={n.id}
              style={[styles.notifRow, n.isRead && styles.notifRowRead]}
              onPress={() => router.push('/(tabs)/notifications')}
              accessibilityLabel={'Alert: ' + n.message}
            >
              <View style={[styles.notifDot, { backgroundColor: TYPE_COLORS[n.type] }]} />
              <View style={styles.notifBody}>
                <Text style={styles.notifType}>{TYPE_LABELS[n.type]}</Text>
                <Text style={styles.notifMessage} numberOfLines={1}>{n.message}</Text>
                {n.car && <Text style={styles.notifPlate}>{n.car.licensePlate}</Text>}
              </View>
              <Text style={styles.notifTime}>
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: spacing.base, paddingBottom: spacing.huge },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingTop: spacing.base,
  },
  greeting: { ...typography.body, color: colors.textSecondary },
  name: { ...typography.h2, color: colors.textPrimary },
  logoutText: { ...typography.label, color: colors.textLight, marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: { ...typography.h1, color: colors.textPrimary },
  statUnread: { color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  section: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.base },
  seeAll: { ...typography.label, color: colors.primary },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'center',
    position: 'relative',
  },
  actionIcon: { fontSize: 28, marginBottom: spacing.xs },
  actionLabel: { ...typography.label, color: colors.textPrimary },
  actionBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' },
  emptyAlerts: { padding: spacing.base, alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  notifRowRead: { opacity: 0.6 },
  notifDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  notifBody: { flex: 1 },
  notifType: { ...typography.label, color: colors.textSecondary },
  notifMessage: { ...typography.body, color: colors.textPrimary },
  notifPlate: { ...typography.caption, color: colors.textLight },
  notifTime: { ...typography.caption, color: colors.textLight, flexShrink: 0 },
});
