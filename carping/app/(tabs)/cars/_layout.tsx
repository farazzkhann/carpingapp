import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/colors';

export default function CarsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Cars' }} />
      <Stack.Screen name="add" options={{ title: 'Add Car', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Car Details' }} />
    </Stack>
  );
}
