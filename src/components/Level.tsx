import React, { useState, memo } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { MiniGameBoard } from "./MiniGameBoard";

interface LevelProps {
  levelNumber: number;
  isLocked: boolean;
  isCleared: boolean;
  levelData?: any;
  bestMoves?: number;
  onPress: (levelNumber: number) => void;
}

export const Level = memo(({
    levelNumber,
    isLocked,
    isCleared,
    levelData,
    bestMoves,
    onPress,
  }: LevelProps) => {
    const [previewSize, setPreviewSize] = useState(0);

    const onLayout = (event: any) => {
      const { width } = event.nativeEvent.layout;
      if (width > 0 && width !== previewSize) {
        setPreviewSize(width);
      }
    };

    // Separate styles for different states
    const showLockedStyle = isLocked;
    const showClearedStyle = !isLocked && isCleared;

    return (
      <TouchableOpacity
        style={[
          styles.container,
          showLockedStyle && styles.lockedContainer,
          showClearedStyle && styles.clearedContainer,
        ]}
        onPress={() => !isLocked && onPress(levelNumber)}
        activeOpacity={0.7}
        disabled={isLocked}
      >
        <Text style={styles.levelText}>{levelNumber}</Text>

        <View style={styles.previewContainer} onLayout={onLayout}>
          {previewSize > 0 && (
            <>
              {levelData && levelData.blocks ? (
                <MiniGameBoard
                  blocks={Array.from(levelData.blocks)}
                  size={previewSize}
                />
              ) : (
                <View
                  style={[
                    styles.placeholder,
                    { width: previewSize, height: previewSize },
                  ]}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color={colors.dark.ClassicBrown}
                  />
                </View>
              )}
            </>
          )}

          {isLocked && (
            <View style={styles.lockOverlay}>
              <Ionicons
                name="lock-closed"
                size={24}
                color={colors.light.LightPine}
              />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          {levelData?.minMoves && (
            <View style={styles.movesRow}>
              <Text style={styles.movesLabel}>Best Moves: </Text>
              <Text style={styles.movesValue}>{levelData.minMoves}</Text>
            </View>
          )}
          {!isLocked && (
            <View style={styles.movesRow}>
              <Text style={styles.movesLabel}>You Achieved: </Text>
              <Text
                style={[styles.movesValue, isCleared && styles.clearedValue]}
              >
                {bestMoves ?? "-"}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.Walnut, // Base color for unlocked but not cleared
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.dark.DarkOak,
    marginBottom: 16,
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  lockedContainer: {
    backgroundColor: colors.dark.EspressoWood,
    borderColor: colors.dark.BurntWood,
    opacity: 0.8,
  },
  clearedContainer: {
    backgroundColor: colors.dark.GoldenBrown, // Brighter color for cleared levels
    borderColor: colors.dark.DarkGoldenBrown,
    elevation: 6,
  },
  levelText: {
    color: colors.light.LightPine,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  previewContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    backgroundColor: colors.dark.BurntWood,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    marginTop: 8,
    width: "100%",
    gap: 2,
  },
  movesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  movesLabel: {
    color: colors.light.LightPine,
    fontSize: 9,
    fontWeight: "400",
  },
  movesValue: {
    color: colors.light.LightPine,
    fontSize: 10,
    fontWeight: "bold",
  },
  clearedValue: {
    color: colors.light.LightPine,
  },
});
