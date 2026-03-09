import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '../../src/services/notifications';
import { colors } from '../../src/theme/colors';

function UnreadBadge() {
  const { data: count } = useQuery({
    queryKey: ['unread-count'],
    queryFn: notificationsService.getUnreadCount,
    refetchInterval: 30000, // poll every 30s
  });

  if (!count || count === 0) return null;

  return (
    <View style={badge.dot}>
      <Text style={badge.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 9999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  text: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="cars" options={{ title: 'My Cars' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => (
            <View>
              <Text style={{ fontSize: 20, color }}>🔔</Text>
              <UnreadBadge />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
