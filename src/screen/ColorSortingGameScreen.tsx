import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Tube } from '../components/Tube';
import {
  GameState,
  canPour,
  isGameWon,
  isTubeComplete,
  getTopColor,
} from '../game/gameLogic';
import { getLevel } from '../game/levelGenerator';
import { COLORS } from '../constants/colors';

export default function ColorSortingGameScreen({ navigation }: any) {
  const [gameState, setGameState] = useState<GameState>({
    tubes: [],
    moves: 0,
    level: 1,
    selectedTubeIndex: null,
    history: [],
  });
  const [pouringAnimation, setPouringAnimation] = useState<{
    sourceIndex: number;
    destIndex: number;
    color: string;
    direction: 'left' | 'right';
  } | null>(null);

  const [tubeLayouts, setTubeLayouts] = useState<Record<number, { x: number; y: number }>>({});

  // Initialize game
  const initializeGame = (levelNumber: number) => {
    const level = getLevel(levelNumber);
    setGameState({
      tubes: level.tubes,
      moves: 0,
      level: levelNumber,
      selectedTubeIndex: null,
      history: [],
    });
  };

  useEffect(() => {
    initializeGame(gameState.level);
  }, []);

  const handleTubeLayout = (index: number, layout: { x: number; y: number }) => {
    setTubeLayouts(prev => ({ ...prev, [index]: layout }));
  };

  // Handle tube click
  const handleTubeClick = (index: number) => {
    if (pouringAnimation) return;

    if (gameState.selectedTubeIndex === null) {
      if (gameState.tubes[index].length > 0 && !isTubeComplete(gameState.tubes[index])) {
        setGameState(prev => ({ ...prev, selectedTubeIndex: index }));
      }
    } else if (gameState.selectedTubeIndex === index) {
      setGameState(prev => ({ ...prev, selectedTubeIndex: null }));
    } else {
      const selectedTubeIndex = gameState.selectedTubeIndex;
      const sourceTube = gameState.tubes[selectedTubeIndex];
      const destTube = gameState.tubes[index];

      if (canPour(sourceTube, destTube)) {
        // Execute move and start animation
        const pourColor = getTopColor(sourceTube)!;

        setPouringAnimation({
          sourceIndex: selectedTubeIndex,
          destIndex: index,
          color: pourColor,
          direction: index < selectedTubeIndex ? 'left' : 'right',
        });

        const newTubes = [...gameState.tubes];
        const newSourceTube = [...sourceTube];
        const newDestTube = [...destTube];
        const color = newSourceTube.pop()!;
        newDestTube.push(color);
        newTubes[selectedTubeIndex] = newSourceTube;
        newTubes[index] = newDestTube;

        // Finish animation and update state after the full sequence (approx 2.4s)
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            tubes: newTubes,
            selectedTubeIndex: null,
            moves: prev.moves + 1,
          }));
          setPouringAnimation(null);

          if (isGameWon(newTubes)) {
            Alert.alert("Level Complete!", `You won in ${gameState.moves + 1} moves!`, [
              { text: "Next Level", onPress: () => initializeGame(gameState.level + 1) }
            ]);
          }
        }, 2500);
      } else {
        setGameState(prev => ({ ...prev, selectedTubeIndex: null })); // Deselect if pour is invalid
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Color Sorting</Text>
        <Text style={styles.moves}>Moves: {gameState.moves}</Text>
      </View>

      <View style={styles.gameBoard}>
        <View style={styles.tubesContainer}>
          {gameState.tubes.map((tube, index) => {
            const isSource = pouringAnimation?.sourceIndex === index;
            const isDest = pouringAnimation?.destIndex === index;

            // Calculate destination position relative to the source tube
            let destinationPosition = null;
            if (isSource && pouringAnimation && tubeLayouts[index] && tubeLayouts[pouringAnimation.destIndex]) {
              const sourceLayout = tubeLayouts[index];
              const destLayout = tubeLayouts[pouringAnimation.destIndex];
              destinationPosition = {
                x: destLayout.x - sourceLayout.x,
                y: destLayout.y - sourceLayout.y,
              };
            }

            return (
              <Tube
                key={index}
                tube={tube}
                index={index}
                isSelected={gameState.selectedTubeIndex === index}
                onClick={() => handleTubeClick(index)}
                isPouring={isSource}
                isReceiving={isDest}
                pouringColor={pouringAnimation?.color}
                pouringDirection={pouringAnimation?.sourceIndex === index ? pouringAnimation.direction : null}
                destinationPosition={destinationPosition}
                onLayout={handleTubeLayout}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.footerButtonText}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => initializeGame(gameState.level)}>
          <Text style={styles.footerButtonText}>Restart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.theme.text,
  },
  moves: {
    color: COLORS.theme.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameBoard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  tubesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 400,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.theme.surface,
  },
  footerButton: {
    backgroundColor: COLORS.theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  footerButtonText: {
    color: COLORS.theme.text,
    fontWeight: '600',
  },
});
