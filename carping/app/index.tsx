import { View } from 'react-native';
import { colors } from '../src/theme/colors';

// Intentionally blank — root _layout.tsx handles auth redirect.
export default function Index() {
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
