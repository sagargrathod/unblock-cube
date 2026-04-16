import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Block } from './Block';
import { BlockData, GRID_SIZE } from '../game/unblockCubeLogic';
import { COLORS } from '../constants/colors';

interface GameBoardProps {
  blocks: (BlockData & { bounds: { min: number; max: number } })[];
  onMove: (id: string, newPos: { row: number; col: number }) => boolean;
}

const PADDING = 2;
const { width } = Dimensions.get('window');
const BOARD_SIZE = width * 0.9;
const INNER_BOARD_SIZE = BOARD_SIZE - (PADDING * 2);
const CELL_SIZE = INNER_BOARD_SIZE / GRID_SIZE;

export const GameBoard: React.FC<GameBoardProps> = ({ blocks, onMove }) => {
  const gridCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      cells.push(i);
    }
    return cells;
  }, []);

  return (
    <View style={[styles.container, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
      {/* Grid Background */}
      <View style={styles.grid}>
        {gridCells.map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.cell, 
              { width: CELL_SIZE, height: CELL_SIZE }
            ]} 
          />
        ))}
      </View>

      {/* Exits */}
      {blocks.filter(b => b.isRed).map((redBlock) => {
        if (redBlock.direction === 'horizontal') {
          return (
            <View 
              key={`exit-${redBlock.id}`}
              style={[
                styles.exit, 
                styles.exitHorizontal, 
                { top: redBlock.row * CELL_SIZE + PADDING, left: BOARD_SIZE - PADDING - 4 }
              ]} 
            />
          );
        } else {
          return (
            <View 
              key={`exit-${redBlock.id}`}
              style={[
                styles.exit, 
                styles.exitVertical, 
                { left: redBlock.col * CELL_SIZE + PADDING, top: BOARD_SIZE - PADDING - 4 }
              ]} 
            />
          );
        }
      })}

      {/* Blocks */}
      <View style={styles.blocksContainer}>
        {blocks.map((block) => (
          <Block 
            key={block.id} 
            block={block} 
            cellSize={CELL_SIZE} 
            onMove={onMove} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8B4513', // Wooden board color
    padding: 2,
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    overflow: 'visible',
  },
  grid: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.3,
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#000',
  },
  blocksContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
  },
  exit: {
    position: 'absolute',
    backgroundColor: COLORS.game.red,
  },
  exitHorizontal: {
    width: 10,
    height: CELL_SIZE,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  exitVertical: {
    height: 10,
    width: CELL_SIZE,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
});
