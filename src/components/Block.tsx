import React from "react";
import { StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { BlockData, GRID_SIZE } from "../game/unblockCubeLogic";
import { COLORS } from "../constants/colors";

interface BlockProps {
  block: BlockData & { bounds: { min: number; max: number } };
  cellSize: number;
  onMove: (id: string, newPos: { row: number; col: number }) => boolean;
}

const SPRING_CONFIG = {
  damping: 25,
  stiffness: 200,
  mass: 0.5,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

export const Block: React.FC<BlockProps> = ({ block, cellSize, onMove }) => {
  const isHorizontal = block.direction === "horizontal";

  const translateX = useSharedValue(block.col * cellSize);
  const translateY = useSharedValue(block.row * cellSize);
  const isDragging = useSharedValue(false);
  const context = useSharedValue({ x: 0, y: 0 });

  // Update positions when block data changes (e.g. from props)
  React.useEffect(() => {
    if (!isDragging.value) {
      const targetX = block.col * cellSize;
      const targetY = block.row * cellSize;

      if (Math.abs(translateX.value - targetX) > 0.1) {
        translateX.value = withSpring(targetX, SPRING_CONFIG);
      }
      if (Math.abs(translateY.value - targetY) > 0.1) {
        translateY.value = withSpring(targetY, SPRING_CONFIG);
      }
    }
  }, [block.col, block.row, cellSize, isDragging]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-2, 2])
    .activeOffsetY([-2, 2])
    .onStart(() => {
      isDragging.value = true;
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
    .onEnd((event) => {
      isDragging.value = false;

      let targetCol = block.col;
      let targetRow = block.row;

      // Use velocity to determine intended target (flick support)
      const velocityThreshold = 500;

      if (isHorizontal) {
        const velocityAdjustment =
          Math.abs(event.velocityX) > velocityThreshold
            ? Math.sign(event.velocityX)
            : 0;
        targetCol = Math.round(
          translateX.value / cellSize + velocityAdjustment * 0.2,
        );

        // Red block exit snap logic
        if (block.isRed && targetCol >= GRID_SIZE - block.length) {
          targetCol = GRID_SIZE;
        }
      } else {
        const velocityAdjustment =
          Math.abs(event.velocityY) > velocityThreshold
            ? Math.sign(event.velocityY)
            : 0;
        targetRow = Math.round(
          translateY.value / cellSize + velocityAdjustment * 0.2,
        );

        // Red block exit snap logic
        if (block.isRed && targetRow >= GRID_SIZE - block.length) {
          targetRow = GRID_SIZE;
        }
      }

      // Tell JS thread to update state
      runOnJS(onMove)(block.id, { row: targetRow, col: targetCol });

      // Immediate UI thread snap
      // The actual target might be limited by bounds in handleMove, but we snap optimistically
      translateX.value = withSpring(targetCol * cellSize, SPRING_CONFIG);
      translateY.value = withSpring(targetRow * cellSize, SPRING_CONFIG);
    });

  const animatedStyle = useAnimatedStyle(() => {
    let opacity = 1;
    if (block.isRed) {
      const exitThreshold = (GRID_SIZE - block.length) * cellSize;
      if (isHorizontal) {
        opacity = interpolate(
          translateX.value,
          [exitThreshold, exitThreshold + cellSize * 0.8],
          [1, 0],
          Extrapolation.CLAMP,
        );
      } else {
        opacity = interpolate(
          translateY.value,
          [exitThreshold, exitThreshold + cellSize * 0.8],
          [1, 0],
          Extrapolation.CLAMP,
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
          <Text style={styles.arrow}>{isHorizontal ? "→" : "↓"}</Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  block: {
    position: "absolute",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  arrow: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
