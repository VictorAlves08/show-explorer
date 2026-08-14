import type {
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from 'react-native';

export function composePressedStyle(
  style: PressableProps['style'],
  state: PressableStateCallbackType,
  pressedStyle: ViewStyle,
): StyleProp<ViewStyle> {
  const resolvedStyle = typeof style === 'function' ? style(state) : style;

  return [state.pressed ? pressedStyle : null, resolvedStyle];
}
