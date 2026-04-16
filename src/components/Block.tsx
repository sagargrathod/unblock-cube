import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { BlockData, GRID_SIZE } from '../game/unblockCubeLogic';
import { COLORS } from '../constants/colors';

interface BlockProps {
  block: BlockData & { bounds: { min: number; max: number } };
  cellSize: number;
  onMove: (id: string, newPos: { row: number; col: number }) => boolean;
}

export const Block: React.FC<BlockProps> = ({ block, cellSize, onMove }) => {
  const isHorizontal = block.direction === 'horizontal';
  
  const translateX = useSharedValue(block.col * cellSize);
  const translateY = useSharedValue(block.row * cellSize);
  const context = useSharedValue({ x: 0, y: 0 });

  // Update positions when block data changes (e.g. from props)
  React.useEffect(() => {
    translateX.value = withSpring(block.col * cellSize, { damping: 15 });
    translateY.value = withSpring(block.row * cellSize, { damping: 15 });
  }, [block.col, block.row, cellSize]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((event) => {
      if (isHorizontal) {
        const nextX = context.value.x + event.translationX;
        const minX = block.bounds.min * cellSize;
        const maxX = block.bounds.max * cellSize;
        translateX.value = Math.max(minX, Math.min(maxX, nextX));
      } else {
        const nextY = context.value.y + event.translationY;
        const minY = block.bounds.min * cellSize;
        const maxY = block.bounds.max * cellSize;
        translateY.value = Math.max(minY, Math.min(maxY, nextY));
      }
    })
    .onEnd(() => {
      // Snapping logic
      const targetCol = isHorizontal ? Math.round(translateX.value / cellSize) : block.col;
      const targetRow = isHorizontal ? block.row : Math.round(translateY.value / cellSize);
      
      // Try to commit move
      runOnJS(onMove)(block.id, { row: targetRow, col: targetCol });
      
      // Reset values if the move wasn't committed (useEffect will override if it was)
      translateX.value = withSpring(targetCol * cellSize);
      translateY.value = withSpring(targetRow * cellSize);
    });

  const animatedStyle = useAnimatedStyle(() => {
    let opacity = 1;
    if (block.isRed) {
      if (isHorizontal) {
        opacity = interpolate(
          translateX.value,
          [(GRID_SIZE - block.length) * cellSize, (GRID_SIZE - 0.5) * cellSize],
          [1, 0],
          Extrapolation.CLAMP
        );
      } else {
        opacity = interpolate(
          translateY.value,
          [(GRID_SIZE - block.length) * cellSize, (GRID_SIZE - 0.5) * cellSize],
          [1, 0],
          Extrapolation.CLAMP
        );
      }
    }

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity,
    };
  });

  const width = isHorizontal ? block.length * cellSize - 4 : cellSize - 4;
  const height = isHorizontal ? cellSize - 4 : block.length * cellSize - 4;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.block,
          {
            width,
            height,
            backgroundColor: block.isRed ? COLORS.game.red : COLORS.game.coffee,
            margin: 2,
          },
          animatedStyle,
        ]}
      >
          {block.isRed && (
            <Text style={styles.arrow}>
              {isHorizontal ? '→' : '↓'}
            </Text>
          )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  arrow: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  }
});
