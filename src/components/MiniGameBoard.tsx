import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { BlockData, GRID_SIZE } from "../game/unblockCubeLogic";
import { COLORS } from "../constants/colors";

interface MiniGameBoardProps {
  blocks: BlockData[];
  size: number;
}

export const MiniGameBoard: React.FC<MiniGameBoardProps> = memo(({
  blocks,
  size,
}) => {
  const cellSize = size / GRID_SIZE;
  const padding = size * 0.05;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {blocks.map((block) => {
        const isHorizontal = block.direction === "horizontal";
        const width = isHorizontal ? block.length * cellSize - 2 : cellSize - 2;
        const height = isHorizontal
          ? cellSize - 2
          : block.length * cellSize - 2;

        return (
          <View
            key={block.id}
            style={[
              styles.block,
              {
                width,
                height,
                left: block.col * cellSize + 1,
                top: block.row * cellSize + 1,
                backgroundColor: block.isRed
                  ? COLORS.game.red
                  : COLORS.game.coffee,
              },
            ]}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3E2618", // Deep wood color for background
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  block: {
    position: "absolute",
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
});
