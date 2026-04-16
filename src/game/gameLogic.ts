// Game Logic for Color Sorting Puzzle

import { COLORS } from '../constants/colors';

export type Color = string;
export type Tube = Color[];
export const MAX_CAPACITY = 4;

export interface GameState {
  tubes: Tube[];
  moves: number;
  level: number;
  selectedTubeIndex: number | null;
  history: Tube[][];
}

// Get top color of a tube
export function getTopColor(tube: Tube): Color | null {
  return tube.length > 0 ? tube[tube.length - 1] : null;
}

// Count consecutive colors from the top
export function countTopColors(tube: Tube): number {
  if (tube.length === 0) return 0;
  const topColor = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] === topColor) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// Check if a pour is valid
export function canPour(sourceTube: Tube, destinationTube: Tube): boolean {
  // Can't pour from empty tube
  if (sourceTube.length === 0) return false;
  
  // Can't pour to full tube
  if (destinationTube.length >= MAX_CAPACITY) return false;
  
  // Can pour to empty tube
  if (destinationTube.length === 0) return true;
  
  // Can pour if top colors match
  const sourceColor = getTopColor(sourceTube);
  const destColor = getTopColor(destinationTube);
  
  return sourceColor === destColor;
}

// Perform the pour operation
export function pour(sourceTube: Tube, destinationTube: Tube): { source: Tube; destination: Tube; colorsPoured: number } {
  const newSource = [...sourceTube];
  const newDestination = [...destinationTube];
  
  const pourColor = getTopColor(newSource);
  if (!pourColor) return { source: newSource, destination: newDestination, colorsPoured: 0 };
  
  let colorsPoured = 0;
  const maxCanPour = Math.min(
    countTopColors(newSource),
    MAX_CAPACITY - newDestination.length
  );
  
  for (let i = 0; i < maxCanPour; i++) {
    if (newSource.length > 0) {
      const color = newSource.pop()!;
      newDestination.push(color);
      colorsPoured++;
    }
  }
  
  return { source: newSource, destination: newDestination, colorsPoured };
}

// Check if tube is complete (all same color or empty)
export function isTubeComplete(tube: Tube): boolean {
  if (tube.length === 0) return true;
  if (tube.length !== MAX_CAPACITY) return false;
  
  const firstColor = tube[0];
  return tube.every(color => color === firstColor);
}

// Check if game is won
export function isGameWon(tubes: Tube[]): boolean {
  return tubes.every(tube => isTubeComplete(tube));
}

// Check if tube is empty
export function isTubeEmpty(tube: Tube): boolean {
  return tube.length === 0;
}

// Check if tube contains only one color
export function isTubeSingleColor(tube: Tube): boolean {
  if (tube.length === 0) return true;
  const firstColor = tube[0];
  return tube.every(color => color === firstColor);
}
