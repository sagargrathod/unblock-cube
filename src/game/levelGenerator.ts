import {
  BlockData,
  solveLevel,
  GRID_SIZE,
  Direction,
} from './unblockCubeLogic';

export interface LevelData {
  levelNumber: number;
  blocks: BlockData[];
  moves: number;
}

const DIFFICULTY_TIERS = [
  { start: 1, end: 250, minMoves: 5, label: 'Easy' },
  { start: 251, end: 500, minMoves: 10, label: 'Medium' },
  { start: 501, end: 750, minMoves: 15, label: 'Hard' },
  { start: 751, end: 1000, minMoves: 20, label: 'Expert' },
];

const hasOverlap = (block: BlockData, others: BlockData[]): boolean => {
  const getCells = (b: BlockData) => {
    const cells = [];
    for (let i = 0; i < b.length; i++) {
      cells.push(b.direction === 'horizontal' 
        ? `${b.row}-${b.col + i}` 
        : `${b.row + i}-${b.col}`);
    }
    return cells;
  };

  const currentCells = getCells(block);
  for (const other of others) {
    const otherCells = getCells(other);
    if (currentCells.some(c => otherCells.includes(c))) return true;
  }
  return false;
};

const generateCandidate = (minMoves: number): BlockData[] | null => {
  const blocks: BlockData[] = [];
  
  // 1. Place Horizontal Red Block
  const redH: BlockData = {
    id: 'red_h',
    isRed: true,
    direction: 'horizontal',
    length: 2,
    row: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1, // Avoid top/bottom for red H
    col: Math.floor(Math.random() * 2), // Start at col 0 or 1
  };
  blocks.push(redH);

  // 2. Place Vertical Red Block
  const redV: BlockData = {
    id: 'red_v',
    isRed: true,
    direction: 'vertical',
    length: 2,
    row: Math.floor(Math.random() * 2), // Start at row 0 or 1
    col: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1, // Avoid sides for red V
  };

  if (hasOverlap(redV, blocks)) return null;
  blocks.push(redV);

  // 3. Add Blockers
  const numBlockers = 8 + Math.floor(Math.random() * 6); // 8 to 14 blockers
  let attempts = 0;

  while (blocks.length < numBlockers && attempts < 200) {
    attempts++;
    const dir: Direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    const length = Math.random() > 0.8 ? 3 : 2;
    
    const candidate: BlockData = {
      id: `b${blocks.length}`,
      direction: dir,
      length: length,
      row: Math.floor(Math.random() * (GRID_SIZE - (dir === 'vertical' ? length - 1 : 0))),
      col: Math.floor(Math.random() * (GRID_SIZE - (dir === 'horizontal' ? length - 1 : 0))),
    };

    if (candidate.row + (dir === 'vertical' ? length : 0) > GRID_SIZE) continue;
    if (candidate.col + (dir === 'horizontal' ? length : 0) > GRID_SIZE) continue;

    if (!hasOverlap(candidate, blocks)) {
      blocks.push(candidate);
    }
  }

  // Ensure variety
  const hasH = blocks.filter(b => !b.isRed && b.direction === 'horizontal').length > 0;
  const hasV = blocks.filter(b => !b.isRed && b.direction === 'vertical').length > 0;
  if (!hasH || !hasV) return null;

  return blocks;
};

export const generateAllLevels = (): LevelData[] => {
  const levels: LevelData[] = [];
  console.log('Starting level generation...');

  for (const tier of DIFFICULTY_TIERS) {
    for (let i = tier.start; i <= tier.end; i++) {
      let found = false;
      let attempts = 0;
      
      while (!found && attempts < 1000) {
        attempts++;
        const candidate = generateCandidate(tier.minMoves);
        if (!candidate) continue;

        const solution = solveLevel(candidate, 80000); // Higher limit for 2-red levels
        if (solution && solution.length >= tier.minMoves) {
          levels.push({
            levelNumber: i,
            blocks: candidate,
            moves: solution.length,
          });
          found = true;
          if (i % 50 === 0 || i === tier.start) {
            console.log(`Generated Level ${i} (${tier.label}) with ${solution.length} moves.`);
          }
        }
      }
      
      if (!found) {
        levels.push({
          levelNumber: i,
          blocks: [
            { id: 'red_h', isRed: true, row: 2, col: 0, length: 2, direction: 'horizontal' },
            { id: 'red_v', isRed: true, row: 0, col: 4, length: 2, direction: 'vertical' },
            { id: 'v1', row: 0, col: 2, length: 3, direction: 'vertical' },
            { id: 'h1', row: 4, col: 0, length: 3, direction: 'horizontal' },
          ],
          moves: 5
        });
      }
    }
  }

  return levels;
};
