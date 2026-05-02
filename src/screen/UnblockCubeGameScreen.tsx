import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GameBoard } from "../components/GameBoard";
import {
  canMoveTo,
  checkWin,
  getBounds,
  BlockData,
  solveLevel,
  GRID_SIZE,
} from "../game/unblockCubeLogic";
import {
  getUnblockLevel,
  TOTAL_UNBLOCK_LEVELS,
} from "../game/unblockLevelGenerator";
import { COLORS } from "../constants/colors";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  setCurrentLevel,
  incrementMoves,
  resetMoves,
  updateBestMoves,
  unlockLevel,
} from "../redux/gameSlice";
import { useRealm } from "../database/realmContext";
import { getLevelByNumber } from "../database/levelRepository";

const levelsData = require("../assets/levels.json");

export default function UnblockCubeGameScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const realm = useRealm();
  const level = useAppSelector((state) => state.game.currentLevel);
  const moves = useAppSelector((state) => state.game.totalMoves);

  const movesRef = React.useRef(moves);
  React.useEffect(() => {
    movesRef.current = moves;
  }, [moves]);

  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const blocksRef = React.useRef<BlockData[]>([]);
  const [minMoves, setMinMoves] = useState(0);

  const [isSolving, setIsSolving] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const loadLevel = useCallback(
    (levelNum: number) => {
      if (levelNum < 1 || levelNum > TOTAL_UNBLOCK_LEVELS) return;

      // Try to get level from Realm, fallback to JSON
      let levelData: any = getLevelByNumber(realm, levelNum);
      if (!levelData) {
        levelData = levelsData.find((l: any) => l.levelNumber === levelNum);
      }
      // Final fallback to generator (should not be reached if JSON is complete)
      if (!levelData) {
        levelData = getUnblockLevel(levelNum);
      }

      // Convert Realm blocks (List) to plain array if needed
      const blocksArray = Array.isArray(levelData.blocks)
        ? levelData.blocks
        : Array.from(levelData.blocks);

      const finalBlocks = blocksArray as BlockData[];
      setBlocks(finalBlocks);
      blocksRef.current = finalBlocks;
      setMinMoves(levelData.minMoves);
      dispatch(setCurrentLevel(levelNum));
      dispatch(resetMoves());
    },
    [dispatch, realm],
  );

  useEffect(() => {
    // Load initial level if blocks not set
    if (blocks.length === 0) {
      loadLevel(level);
    }
  }, [loadLevel, level, blocks.length]);

  const blocksWithBounds = useMemo(() => {
    return blocks.map((block) => ({
      ...block,
      bounds: getBounds(block, blocks),
    }));
  }, [blocks]);

  const handleMove = useCallback(
    (id: string, newPos: { row: number; col: number }) => {
      const currentBlocks = blocksRef.current;
      const blockIndex = currentBlocks.findIndex((b) => b.id === id);
      if (blockIndex === -1) return false;

      const block = currentBlocks[blockIndex];
      // No change in position
      if (block.row === newPos.row && block.col === newPos.col) return false;

      // Get bounds for the LATEST state to ensure path is clear
      const bounds = getBounds(block, currentBlocks);

      // Validate new position against actual bounds (this handles collisions and path)
      const validatedPos = { ...newPos };
      if (block.direction === "horizontal") {
        validatedPos.col = Math.max(bounds.min, Math.min(bounds.max, newPos.col));
      } else {
        validatedPos.row = Math.max(bounds.min, Math.min(bounds.max, newPos.row));
      }

      // Check if it's a red block trying to exit
      if (block.isRed) {
        const threshold = GRID_SIZE - block.length;
        if (block.direction === "horizontal" && validatedPos.col >= threshold) {
          // Only allow exit if the bounds say it's possible (path is clear to GRID_SIZE)
          if (bounds.max === GRID_SIZE) {
            validatedPos.col = GRID_SIZE;
          } else {
            // Otherwise, stay at the furthest possible valid position
            validatedPos.col = bounds.max;
          }
        } else if (block.direction === "vertical" && validatedPos.row >= threshold) {
          if (bounds.max === GRID_SIZE) {
            validatedPos.row = GRID_SIZE;
          } else {
            validatedPos.row = bounds.max;
          }
        }
      }

      // If the move didn't actually change the state (e.g. invalid move that snapped back)
      if (block.row === validatedPos.row && block.col === validatedPos.col) {
        return false;
      }

      const newBlocks = [...currentBlocks];
      newBlocks[blockIndex] = { ...block, ...validatedPos };

      // Update Ref immediately to prevent race conditions on next move
      blocksRef.current = newBlocks;
      // Update local state for rendering
      setBlocks(newBlocks);

      // Handle side effects
      const finalMovesCount = movesRef.current + 1;
      dispatch(incrementMoves());

      if (checkWin(newBlocks)) {
        // Record progress
        dispatch(updateBestMoves({ level, moves: finalMovesCount }));
        dispatch(unlockLevel(level + 1));

        // Show completion alert
        setTimeout(() => {
          Alert.alert(
            "LEVEL COMPLETE",
            `Congratulations! You solved level ${level} in ${finalMovesCount} moves.`,
            [
              { text: "Next Level", onPress: () => loadLevel(level + 1) },
              { text: "Menu", onPress: () => navigation.goBack() },
            ],
            { cancelable: false },
          );
        }, 800);
      }
      return true;
    },
    [dispatch, level, loadLevel, navigation],
  );

  const handleHint = () => {
    if (isSolving) return;

    setIsSolving(true);
    setTimeout(() => {
      const solution = solveLevel(blocks);
      setIsSolving(false);

      if (solution && solution.length > 0) {
        const nextMove = solution[0];
        handleMove(nextMove.blockId, { row: nextMove.row, col: nextMove.col });
      } else {
        Alert.alert("No Hint", "Could not find a solution from this state.");
      }
    }, 100);
  };

  const resetGame = () => {
    loadLevel(level);
  };

  const handleSearch = () => {
    const num = parseInt(searchText.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= TOTAL_UNBLOCK_LEVELS) {
      loadLevel(num);
      setShowSearch(false);
      setSearchText("");
    } else {
      Alert.alert(
        "Invalid Level",
        `Please enter a level between 1 and ${TOTAL_UNBLOCK_LEVELS}.`,
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Unblock Cube</Text>
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navButton, level === 1 && styles.disabledNav]}
              onPress={() => loadLevel(level - 1)}
              disabled={level === 1}
            >
              <Text style={styles.navButtonText}>←</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.levelBadge}
              onPress={() => setShowSearch((s) => !s)}
            >
              <Text style={styles.levelText}>Level {level} 🔍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                level === TOTAL_UNBLOCK_LEVELS && styles.disabledNav,
              ]}
              onPress={() => loadLevel(level + 1)}
              disabled={level === TOTAL_UNBLOCK_LEVELS}
            >
              <Text style={styles.navButtonText}>→</Text>
            </TouchableOpacity>
          </View>

          {showSearch && (
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                keyboardType="number-pad"
                placeholder={`1 – ${TOTAL_UNBLOCK_LEVELS}`}
                placeholderTextColor="#666"
                onSubmitEditing={handleSearch}
                returnKeyType="go"
                autoFocus
              />
              <TouchableOpacity
                style={styles.searchGoBtn}
                onPress={handleSearch}
              >
                <Text style={styles.searchGoBtnText}>Go</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View>
          <Text style={styles.moves}>Moves: {moves}</Text>
          {minMoves > 0 && (
            <Text style={styles.parText}>Par: {minMoves} moves</Text>
          )}
        </View>
      </View>

      <View style={styles.gameContainer}>
        {blocks.length > 0 && (
          <GameBoard blocks={blocksWithBounds} onMove={handleMove} />
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.footerButtonText}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, isSolving && styles.disabledButton]}
          onPress={handleHint}
          disabled={isSolving}
        >
          <Text style={styles.footerButtonText}>
            {isSolving ? "..." : "Hint"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={resetGame}>
          <Text style={styles.footerButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.theme.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.theme.text,
  },
  moves: {
    color: COLORS.theme.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  levelIndicator: {
    fontSize: 14,
    color: COLORS.game.orange,
    fontWeight: "600",
  },
  parText: {
    color: COLORS.game.orange,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "right",
  },
  headerTitleContainer: {
    flex: 0.7,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  navButton: {
    backgroundColor: COLORS.theme.surface,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.theme.surface,
  },
  disabledNav: {
    opacity: 0.3,
  },
  navButtonText: {
    color: COLORS.theme.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  levelBadge: {
    backgroundColor: COLORS.game.orange + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.game.orange + "40",
  },
  levelText: {
    color: COLORS.game.orange,
    fontWeight: "bold",
    fontSize: 15,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: COLORS.theme.surface,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.game.orange + "60",
  },
  searchInput: {
    flex: 1,
    color: COLORS.theme.text,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  searchGoBtn: {
    backgroundColor: COLORS.game.orange,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },
  searchGoBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  gameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.theme.surface,
  },
  footerButton: {
    backgroundColor: COLORS.theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  footerButtonText: {
    color: COLORS.theme.text,
    fontWeight: "600",
  },
});
