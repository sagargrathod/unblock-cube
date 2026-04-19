import { ColorValue, StyleProp, ViewStyle } from 'react-native';
import React, { ReactNode } from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

interface AppGradientProps {
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const DEFAULT_WOOD_GRADIENT: readonly [ColorValue, ColorValue, ...ColorValue[]] = [
  colors.dark.Walnut,
  colors.dark.ClassicBrown,
  colors.dark.GoldenBrown,
];

export const AppGradient = ({
  colors = DEFAULT_WOOD_GRADIENT,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  style,
  children,
}: AppGradientProps) => {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};
