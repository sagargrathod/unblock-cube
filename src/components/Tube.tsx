import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { Tube as TubeType, MAX_CAPACITY } from '../game/gameLogic';
import { COLORS } from '../constants/colors';

const LiquidLayer: React.FC<{
  color: string;
  height: number;
  bottom: number;
  isBottom: boolean;
  isPouring: boolean;
  isEntering?: boolean;
}> = ({ color, height, bottom, isBottom, isPouring, isEntering }) => {
  const heightVal = useSharedValue(isEntering ? 0 : height);
  const opacityVal = useSharedValue(isEntering ? 0 : 1);

  useEffect(() => {
    if (isPouring) {
      heightVal.value = withTiming(0, { duration: 400, easing: Easing.bezier(0.4, 0, 0.2, 1) });
      opacityVal.value = withTiming(0, { duration: 400 });
    } else if (isEntering) {
      // Delay entrance to match tube travel + tilt (approx 1000ms)
      heightVal.value = withDelay(1000, withTiming(height, { duration: 500 }));
      opacityVal.value = withDelay(1000, withTiming(1, { duration: 500 }));
    } else {
      heightVal.value = withTiming(height, { duration: 300 });
      opacityVal.value = withTiming(1, { duration: 300 });
    }
  }, [height, isPouring, isEntering]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightVal.value,
    opacity: opacityVal.value,
    backgroundColor: COLORS.game[color as keyof typeof COLORS.game] || color,
    bottom: bottom,
    borderBottomLeftRadius: isBottom ? 26 : 0,
    borderBottomRightRadius: isBottom ? 26 : 0,
  }));

  return <Animated.View style={[styles.liquidLayer, animatedStyle]} />;
};

const LiquidStream: React.FC<{
  color: string;
  isPouring: boolean;
  isReceiving: boolean;
  tubeHeight: number;
  currentLiquidHeight: number;
}> = ({ color, isPouring, isReceiving, tubeHeight, currentLiquidHeight }) => {
  const heightVal = useSharedValue(0);

  useEffect(() => {
    if (isPouring || isReceiving) {
      const targetHeight = isPouring ? tubeHeight : tubeHeight - currentLiquidHeight;
      // Delay to match tilt (approx 800ms for receiving, 600ms for pouring)
      const delay = isReceiving ? 900 : 700;
      heightVal.value = withDelay(delay, withTiming(targetHeight, { duration: 400 }));
    } else {
      heightVal.value = withTiming(0, { duration: 200 });
    }
  }, [isPouring, isReceiving, tubeHeight, currentLiquidHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightVal.value,
    backgroundColor: COLORS.game[color as keyof typeof COLORS.game] || color,
    top: 0,
  }));

  return <Animated.View style={[styles.stream, animatedStyle]} />;
};

interface TubeProps {
  tube: TubeType;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  isPouring?: boolean;
  isReceiving?: boolean;
  pouringColor?: string;
  pouringDirection?: 'left' | 'right' | null;
  destinationPosition?: { x: number, y: number } | null;
  onLayout?: (index: number, layout: { x: number, y: number }) => void;
}

export const Tube: React.FC<TubeProps> = ({
  tube,
  index,
  isSelected,
  onClick,
  isPouring,
  isReceiving,
  pouringColor,
  pouringDirection,
  destinationPosition,
  onLayout,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(isSelected ? 1.05 : 1, { duration: 200 });
  }, [isSelected]);

  useEffect(() => {
    if (isPouring && destinationPosition) {
      const dx = destinationPosition.x;
      const dy = destinationPosition.y - 120; // Move above the dest tube

      // Sequence: Lift -> Move -> Tilt
      translateY.value = withTiming(-60, { duration: 300 });
      translateX.value = withDelay(300, withTiming(dx, { duration: 500, easing: Easing.bezier(0.4, 0, 0.2, 1) }));
      translateY.value = withDelay(300, withTiming(dy, { duration: 500 }));
      rotateZ.value = withDelay(800, withTiming(pouringDirection === 'left' ? -45 : 45, { duration: 400 }));

      // Sequence: Untilt -> Return -> Drop
      rotateZ.value = withDelay(1600, withTiming(0, { duration: 300 }));
      translateX.value = withDelay(1900, withTiming(0, { duration: 500 }));
      translateY.value = withDelay(1900, withTiming(0, { duration: 500 }));
    } else if (!isPouring) {
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      rotateZ.value = withTiming(0);
    }
  }, [isPouring, destinationPosition, pouringDirection]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
    zIndex: isPouring ? 100 : 1,
    borderColor: isSelected ? COLORS.theme.accent : COLORS.theme.border,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, y } = event.nativeEvent.layout;
    onLayout?.(index, { x, y });
  };

  const tubeHeight = 160;
  const tubeWidth = 60;
  const liquidLayerHeight = tubeHeight / MAX_CAPACITY;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <TouchableOpacity onPress={onClick} activeOpacity={0.8}>
        <Animated.View style={[styles.tube, animatedStyle, { width: tubeWidth, height: tubeHeight }]}>
          <View style={styles.liquidContainer}>
            {(isPouring || isReceiving) && pouringColor && (
              <LiquidStream
                color={pouringColor}
                isPouring={!!isPouring}
                isReceiving={!!isReceiving}
                tubeHeight={tubeHeight}
                currentLiquidHeight={tube.length * liquidLayerHeight}
              />
            )}
            {tube.map((color, colorIndex) => (
              <LiquidLayer
                key={`${index}-${colorIndex}-${color}`}
                color={color}
                height={liquidLayerHeight}
                bottom={colorIndex * liquidLayerHeight}
                isBottom={colorIndex === 0}
                isPouring={!!isPouring && colorIndex === tube.length - 1}
              />
            ))}
            {isReceiving && pouringColor && (
              <LiquidLayer
                key="receiving-layer"
                color={pouringColor}
                height={liquidLayerHeight}
                bottom={tube.length * liquidLayerHeight}
                isBottom={tube.length === 0}
                isPouring={false}
                isEntering={true}
              />
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.tubeNumber}>#{index + 1}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 10,
  },
  tube: {
    borderRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 4,
    backgroundColor: COLORS.theme.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  liquidContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  tubeNumber: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.theme.muted,
    fontWeight: '500',
  },
  liquidLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  stream: {
    position: 'absolute',
    width: 6,
    alignSelf: 'center',
    zIndex: 10,
    opacity: 0.7,
  },
});
