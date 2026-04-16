export const GRID_SIZE = 6;

export type Direction = 'horizontal' | 'vertical';

export interface BlockData {
  id: string;
  row: number;
  col: number;
  length: number;
  direction: Direction;
  isRed?: boolean;
}

export interface Move {
  blockId: string;
  row: number;
  col: number;
}

/**
 * Checks if a block can move to a specific position without overlaps and staying in bounds.
 */
export const canMoveTo = (
  block: BlockData,
  newPos: { row: number; col: number },
  allBlocks: BlockData[]
): boolean => {
  const { row: newRow, col: newCol } = newPos;

  // Stay inside grid (0–5), or reach exit (6) if red
  if (newRow < 0 || newCol < 0) return false;
  
  if (block.direction === 'horizontal') {
    const maxCol = block.isRed ? GRID_SIZE : GRID_SIZE - block.length;
    if (newCol > maxCol || newRow !== block.row) return false;
  } else {
    const maxRow = block.isRed ? GRID_SIZE : GRID_SIZE - block.length;
    if (newRow > maxRow || newCol !== block.col) return false;
  }

  // Check overlaps (only for positions in the grid 0-5)
  // If a red block is at index GRID_SIZE (6), it's "off board" and doesn't collide
  if (newRow === GRID_SIZE || newCol === GRID_SIZE) return true;

  for (const other of allBlocks) {
    if (other.id === block.id) continue;
    // Skip collision for blocks already exited
    if (other.col === GRID_SIZE || other.row === GRID_SIZE) continue;

    if (block.direction === 'horizontal') {
      if (other.direction === 'horizontal') {
        if (other.row === newRow) {
          if (newCol < other.col + other.length && newCol + block.length > other.col) return false;
        }
      } else {
        if (newRow >= other.row && newRow < other.row + other.length) {
          if (other.col >= newCol && other.col < newCol + block.length) return false;
        }
      }
    } else {
      if (other.direction === 'vertical') {
        if (other.col === newCol) {
          if (newRow < other.row + other.length && newRow + block.length > other.row) return false;
        }
      } else {
        if (newCol >= other.col && newCol < other.col + other.length) {
          if (other.row >= newRow && other.row < newRow + block.length) return false;
        }
      }
    }
  }

  return true;
};

/**
 * Returns the min and max positions a block can move to in its current direction.
 */
export const getBounds = (
  block: BlockData,
  allBlocks: BlockData[]
): { min: number; max: number } => {
  let min = 0;
  // Red blocks can move to GRID_SIZE to exit
  let max = block.isRed ? GRID_SIZE : GRID_SIZE - block.length;

  for (const other of allBlocks) {
    if (other.id === block.id) continue;
    if (other.col === GRID_SIZE || other.row === GRID_SIZE) continue;

    if (block.direction === 'horizontal') {
      if (other.direction === 'horizontal') {
        if (other.row === block.row) {
          if (other.col < block.col) min = Math.max(min, other.col + other.length);
          else if (other.col > block.col) max = Math.min(max, other.col - block.length);
        }
      } else {
        if (block.row >= other.row && block.row < other.row + other.length) {
          if (other.col < block.col) min = Math.max(min, other.col + 1);
          else if (other.col > block.col) max = Math.min(max, other.col - block.length);
        }
      }
    } else {
      if (other.direction === 'vertical') {
        if (other.col === block.col) {
          if (other.row < block.row) min = Math.max(min, other.row + other.length);
          else if (other.row > block.row) max = Math.min(max, other.row - block.length);
        }
      } else {
        if (block.col >= other.col && block.col < other.col + other.length) {
          if (other.row < block.row) min = Math.max(min, other.row + 1);
          else if (other.row > block.row) max = Math.min(max, other.row - block.length);
        }
      }
    }
  }

  return { min, max };
};

/**
 * Win condition: ALL red blocks must reach the exit (pos 6).
 */
export const checkWin = (blocks: BlockData[]): boolean => {
  const redBlocks = blocks.filter(b => b.isRed);
  if (redBlocks.length === 0) return false;
  
  return redBlocks.every(redBlock => {
    if (redBlock.direction === 'horizontal') {
      return redBlock.col === GRID_SIZE;
    } else {
      return redBlock.row === GRID_SIZE;
    }
  });
};

/**
 * Generates all possible next states from the current configuration.
 */
export const getPossibleMoves = (blocks: BlockData[]): BlockData[][] => {
  const nextStates: BlockData[][] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.col === GRID_SIZE || block.row === GRID_SIZE) continue; // Exited blocks don't move

    const { min, max } = getBounds(block, blocks);
    const current = block.direction === 'horizontal' ? block.col : block.row;

    for (let pos = min; pos <= max; pos++) {
      if (pos === current) continue;

      const newState = [...blocks];
      newState[i] = {
        ...block,
        row: block.direction === 'vertical' ? pos : block.row,
        col: block.direction === 'horizontal' ? pos : block.col,
      };
      nextStates.push(newState);
    }
  }

  return nextStates;
};

/**
 * State serialization for BFS efficiency.
 */
export const serializeState = (blocks: BlockData[]): string => {
  let res = '';
  for (let i = 0; i < blocks.length; i++) {
    res += `${blocks[i].row}${blocks[i].col}`;
  }
  return res;
};

/**
 * BFS algorithm to find the shortest path.
 */
export const solveLevel = (initialBlocks: BlockData[], limit: number = 50000): Move[] | null => {
  const visited = new Set<string>();
  const queue: { state: BlockData[]; path: Move[] }[] = [
    { state: initialBlocks, path: [] }
  ];

  visited.add(serializeState(initialBlocks));

  let head = 0;
  while (head < queue.length) {
    const { state, path } = queue[head++];

    if (checkWin(state)) return path;
    if (queue.length > limit) break;

    const nextStates = getPossibleMoves(state);
    for (const nextState of nextStates) {
      const hash = serializeState(nextState);
      if (!visited.has(hash)) {
        visited.add(hash);

        let movedBlockIdx = -1;
        for (let i = 0; i < state.length; i++) {
          if (state[i].row !== nextState[i].row || state[i].col !== nextState[i].col) {
            movedBlockIdx = i;
            break;
          }
        }

        const movedBlock = nextState[movedBlockIdx];
        const move: Move = {
          blockId: movedBlock.id,
          row: movedBlock.row,
          col: movedBlock.col,
        };

        queue.push({ state: nextState, path: [...path, move] });
      }
    }
  }

  return null;
};
