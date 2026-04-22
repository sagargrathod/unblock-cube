import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  currentLevel: number;
  totalMoves: number;
  unlockedLevels: number;
  bestMoves: Record<number, number>; // levelNumber: moves
  levels: Record<number, any>; // levelNumber: levelData
  lastGeneratedLevel: number;
  isGenerating: boolean;
}

const initialState: GameState = {
  currentLevel: 1,
  totalMoves: 0,
  unlockedLevels: 1,
  bestMoves: {},
  levels: {},
  lastGeneratedLevel: 0,
  isGenerating: false,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentLevel: (state, action: PayloadAction<number>) => {
      state.currentLevel = action.payload;
      state.totalMoves = 0; // Reset moves when changing level
    },
    incrementMoves: (state) => {
      state.totalMoves += 1;
    },
    resetMoves: (state) => {
      state.totalMoves = 0;
    },
    unlockLevel: (state, action: PayloadAction<number>) => {
      if (action.payload > state.unlockedLevels) {
        state.unlockedLevels = action.payload;
      }
    },
    updateBestMoves: (state, action: PayloadAction<{ level: number; moves: number }>) => {
      const { level, moves } = action.payload;
      if (!state.bestMoves[level] || moves < state.bestMoves[level]) {
        state.bestMoves[level] = moves;
      }
    },
    addLevelBatch: (state, action: PayloadAction<any[]>) => {
      action.payload.forEach(level => {
        state.levels[level.levelNumber] = level;
        if (level.levelNumber > state.lastGeneratedLevel) {
          state.lastGeneratedLevel = level.levelNumber;
        }
      });
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
  },
});

export const {
  setCurrentLevel,
  incrementMoves,
  resetMoves,
  unlockLevel,
  updateBestMoves,
  addLevelBatch,
  setGenerating,
} = gameSlice.actions;

export default gameSlice.reducer;
