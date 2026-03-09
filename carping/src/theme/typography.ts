import type { TextStyle } from 'react-native';

export const typography = {
  h1: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 40 },
  h2: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 32 },
  h3: { fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28 },
  bodyLarge: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 },
  button: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 24 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;
