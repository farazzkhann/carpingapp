import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function QrLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        headerShadowVisible: false,
      }}
    />
  );
}
