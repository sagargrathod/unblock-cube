import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  currentLevel: number;
  totalMoves: number;
  unlockedLevels: number;
  bestMoves: Record<string, number>; // levelNumber: moves
  lastGeneratedLevel: number;
  isGenerating: boolean;
}

const initialState: GameState = {
  currentLevel: 1,
  totalMoves: 0,
  unlockedLevels: 1,
  bestMoves: {},
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
      if (moves <= 0) return; // Ignore invalid move counts
      
      const levelKey = level.toString();
      const currentBest = state.bestMoves[levelKey];
      if (!currentBest || moves < currentBest) {
        state.bestMoves[levelKey] = moves;
      }
    },
    setLastGeneratedLevel: (state, action: PayloadAction<number>) => {
      if (action.payload > state.lastGeneratedLevel) {
        state.lastGeneratedLevel = action.payload;
      }
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
  setLastGeneratedLevel,
  setGenerating,
} = gameSlice.actions;

export default gameSlice.reducer;
