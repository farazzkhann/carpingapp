import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Carping',
  slug: 'carping',
  scheme: 'carping',
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    'expo-sharing',
    'expo-media-library',
  ],
  experiments: {
    typedRoutes: true,
  },
});
