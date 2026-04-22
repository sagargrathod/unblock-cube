import { combineReducers } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';

const appReducer = combineReducers({
    game: gameReducer,
});

export default appReducer;