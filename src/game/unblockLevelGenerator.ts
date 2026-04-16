import {
  BlockData,
  GRID_SIZE,
  getPossibleMoves,
  checkWin,
  serializeState,
} from './unblockCubeLogic';

export const TOTAL_UNBLOCK_LEVELS = 1000;

// ─── Seeded Deterministic RNG (Xorshift32) ────────────────────────────────────
class SeededRandom {
  private s: number;
  constructor(seed: number) {
    this.s = Math.max(1, ((seed ^ 0xdeadbeef) >>> 0) || 1);
  }
  next(): number {
    let s = this.s;
    s ^= (s << 13) >>> 0;
    s ^= (s >> 17) >>> 0;
    s ^= (s << 5) >>> 0;
    this.s = s >>> 0;
    return this.s / 4294967296;
  }
  int(lo: number, hi: number): number {
    if (lo >= hi) return lo;
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }
  bool(): boolean { return this.next() < 0.5; }
  pick<T>(a: T[]): T { return a[this.int(0, a.length - 1)]; }
}

// ─── Difficulty Config ────────────────────────────────────────────────────────
interface DifficultyConfig {
  minMoves: number;
  maxMoves: number;
  extraObstacles: number;
}
const getDifficulty = (level: number): DifficultyConfig => {
  if (level <= 50)  return { minMoves: 5,  maxMoves: 9,  extraObstacles: 3 };
  if (level <= 150) return { minMoves: 8,  maxMoves: 13, extraObstacles: 4 };
  if (level <= 300) return { minMoves: 11, maxMoves: 16, extraObstacles: 5 };
  if (level <= 500) return { minMoves: 14, maxMoves: 20, extraObstacles: 6 };
  if (level <= 750) return { minMoves: 17, maxMoves: 24, extraObstacles: 7 };
  return              { minMoves: 20, maxMoves: 30, extraObstacles: 8 };
};

// ─── Board Validation ─────────────────────────────────────────────────────────
const isValidBoard = (blocks: BlockData[]): boolean => {
  const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null)
  );
  for (const b of blocks) {
    for (let i = 0; i < b.length; i++) {
      const r = b.row + (b.direction === 'vertical'   ? i : 0);
      const c = b.col + (b.direction === 'horizontal' ? i : 0);
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
      if (grid[r][c] !== null) return false;
      grid[r][c] = b.id;
    }
  }
  return true;
};

// ─── BFS Solver (uses same logic as the game) ─────────────────────────────────
const BFS_LIMIT = 80000;
const solve = (blocks: BlockData[]): { minMoves: number } | null => {
  const visited = new Set<string>();
  const queue: { state: BlockData[]; depth: number }[] = [{ state: blocks, depth: 0 }];
  visited.add(serializeState(blocks));
  let head = 0;
  while (head < queue.length) {
    if (head > BFS_LIMIT) return null;
    const { state, depth } = queue[head++];
    if (checkWin(state)) return { minMoves: depth };
    for (const next of getPossibleMoves(state)) {
      const h = serializeState(next);
      if (!visited.has(h)) {
        visited.add(h);
        queue.push({ state: next, depth: depth + 1 });
      }
    }
  }
  return null;
};

// ─── Procedural Level Builder ─────────────────────────────────────────────────
/**
 * Tries to build one board for (levelNumber, attempt).
 * Every (levelNumber, attempt) pair uses a uniquely seeded RNG → unique layout.
 */
const tryBuild = (levelNumber: number, attempt: number): BlockData[] | null => {
  const rng = new SeededRandom(levelNumber * 999983 + attempt * 6291469 + 42);
  const { extraObstacles } = getDifficulty(levelNumber);

  // Track occupancy for fast overlap prevention
  const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null)
  );

  const canPlace = (b: BlockData): boolean => {
    for (let i = 0; i < b.length; i++) {
      const r = b.row + (b.direction === 'vertical'   ? i : 0);
      const c = b.col + (b.direction === 'horizontal' ? i : 0);
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
      if (grid[r][c] !== null) return false;
    }
    return true;
  };

  const place = (b: BlockData): void => {
    for (let i = 0; i < b.length; i++) {
      const r = b.row + (b.direction === 'vertical'   ? i : 0);
      const c = b.col + (b.direction === 'horizontal' ? i : 0);
      grid[r][c] = b.id;
    }
  };

  const blocks: BlockData[] = [];
  const add = (b: BlockData): boolean => {
    if (!canPlace(b)) return false;
    place(b);
    blocks.push(b);
    return true;
  };

  // ── Step 1: red_h (horizontal, exits right) ─────────────────────────────
  // Constrain col so there is at least 1 cell gap between red_h tail and col 5
  // i.e. redHCol + 2 <= 4  →  redHCol <= 3  (gap at col 4 or 5 for the exit blocker)
  const redHRow = rng.int(0, GRID_SIZE - 1);
  const redHCol = rng.int(0, GRID_SIZE - 3); // 0..3
  const redH: BlockData = { id: 'red_h', row: redHRow, col: redHCol, length: 2, direction: 'horizontal', isRed: true };
  if (!add(redH)) return null;

  // ── Step 2: exit blocker for red_h ──────────────────────────────────────
  // A vertical block in row redHRow, at some col > redHCol+1 (between red_h end and right wall)
  // The vertical block (length 2) must cover redHRow:
  //   row in [ max(0, redHRow-1), min(GRID_SIZE-2, redHRow) ]
  const ehColCandidates: number[] = [];
  for (let c = redHCol + 2; c <= GRID_SIZE - 1; c++) ehColCandidates.push(c);
  if (ehColCandidates.length === 0) return null;
  const ehCol = rng.pick(ehColCandidates);
  const ehRowMin = Math.max(0, redHRow - 1);
  const ehRowMax = Math.min(GRID_SIZE - 2, redHRow);
  const ehRow = rng.int(ehRowMin, ehRowMax);
  if (!add({ id: 'ebh', row: ehRow, col: ehCol, length: 2, direction: 'vertical' })) return null;

  // ── Step 3: red_v (vertical, exits bottom) ──────────────────────────────
  // Constrain row so there is at least 1 cell gap between red_v tail and row 5
  // i.e. redVRow + 2 <= 4  →  redVRow <= 3
  const redVCol = rng.int(0, GRID_SIZE - 1);
  let placed = false;
  for (let t = 0; t < 15 && !placed; t++) {
    const redVRow = rng.int(0, GRID_SIZE - 3); // 0..3
    const candidate: BlockData = { id: 'red_v', row: redVRow, col: redVCol, length: 2, direction: 'vertical', isRed: true };
    if (add(candidate)) placed = true;
  }
  if (!placed) return null;
  const redV = blocks.find(b => b.id === 'red_v')!;

  // ── Step 4: exit blocker for red_v ──────────────────────────────────────
  // A horizontal block (length 2) at some row > redVRow+1, covering redVCol
  //   col in [ max(0, redVCol-1), min(GRID_SIZE-2, redVCol) ]
  const evRowCandidates: number[] = [];
  for (let r = redV.row + 2; r <= GRID_SIZE - 1; r++) evRowCandidates.push(r);
  if (evRowCandidates.length === 0) return null;
  const evRow = rng.pick(evRowCandidates);
  const evColMin = Math.max(0, redVCol - 1);
  const evColMax = Math.min(GRID_SIZE - 2, redVCol);
  let evPlaced = false;
  // Try a few column positions for the horizontal blocker
  for (let t = 0; t < 5 && !evPlaced; t++) {
    const evCol = rng.int(evColMin, evColMax);
    if (add({ id: 'ebv', row: evRow, col: evCol, length: 2, direction: 'horizontal' })) evPlaced = true;
  }
  if (!evPlaced) return null;

  // ── Step 5: random extra obstacles ──────────────────────────────────────
  let added = 0;
  for (let t = 0; t < extraObstacles * 8 && added < extraObstacles; t++) {
    const dir: 'horizontal' | 'vertical' = rng.bool() ? 'horizontal' : 'vertical';
    const len = rng.int(2, 3);
    const maxR = dir === 'vertical'   ? GRID_SIZE - len : GRID_SIZE - 1;
    const maxC = dir === 'horizontal' ? GRID_SIZE - len : GRID_SIZE - 1;
    const r = rng.int(0, maxR);
    const c = rng.int(0, maxC);
    if (add({ id: `ob${added}`, row: r, col: c, length: len, direction: dir })) added++;
  }

  return blocks;
};

// ─── Fallback seed level (known-good) ────────────────────────────────────────
const FALLBACK_LEVEL: BlockData[] = [
  { id: 'red_h', row: 2, col: 0, length: 2, direction: 'horizontal', isRed: true },
  { id: 'red_v', row: 0, col: 4, length: 2, direction: 'vertical',   isRed: true },
  { id: 'ebh',   row: 1, col: 5, length: 3, direction: 'vertical' },
  { id: 'ebv',   row: 5, col: 3, length: 2, direction: 'horizontal' },
  { id: 'ob0',   row: 0, col: 0, length: 2, direction: 'horizontal' },
  { id: 'ob1',   row: 0, col: 2, length: 3, direction: 'vertical' },
  { id: 'ob2',   row: 3, col: 3, length: 2, direction: 'vertical' },
];

// ─── Main Export ──────────────────────────────────────────────────────────────
export const getUnblockLevel = (
  levelNumber: number
): { blocks: BlockData[]; levelNumber: number; minMoves: number } => {
  const { minMoves: minMov, maxMoves } = getDifficulty(levelNumber);

  for (let attempt = 0; attempt < 80; attempt++) {
    const blocks = tryBuild(levelNumber, attempt);
    if (!blocks) continue;
    if (!isValidBoard(blocks)) continue;

    const result = solve(blocks);
    if (!result) continue;
    if (result.minMoves < minMov || result.minMoves > maxMoves) continue;

    return { blocks, levelNumber, minMoves: result.minMoves };
  }

  // Fallback
  const fb = solve(FALLBACK_LEVEL);
  return {
    blocks: JSON.parse(JSON.stringify(FALLBACK_LEVEL)),
    levelNumber,
    minMoves: fb?.minMoves ?? 6,
  };
};