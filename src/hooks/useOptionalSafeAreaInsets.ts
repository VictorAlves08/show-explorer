import { useContext } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

const ZERO_INSETS = {
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
};

export function useOptionalSafeAreaInsets() {
  return useContext(SafeAreaInsetsContext) ?? ZERO_INSETS;
}
