import { AppDispatch } from './store';
import { addLevelBatch, setGenerating } from './gameSlice';
import { getUnblockLevel, TOTAL_UNBLOCK_LEVELS } from '../game/unblockLevelGenerator';

const BATCH_SIZE = 50;

/**
 * Generates a batch of levels in the background.
 * Yields the thread between levels to keep the UI responsive.
 */
export const startLevelGeneration = async (
  dispatch: AppDispatch,
  lastGenerated: number,
  targetLimit: number = TOTAL_UNBLOCK_LEVELS
) => {
  if (lastGenerated >= targetLimit) return;

  dispatch(setGenerating(true));

  const generateBatch = async (start: number) => {
    const end = Math.min(start + BATCH_SIZE, targetLimit + 1);
    console.log(`[LevelService] Starting batch generation: ${start} - ${end - 1}`);
    const batchData = [];

    for (let i = start; i < end; i++) {
        // Yield thread to keep UI responsive. Yielding on EVERY iteration
        // ensures the main JS thread has time to process user inputs Like 'Play' button
        // and navigation animations without freezing.
        await new Promise(resolve => setTimeout(resolve, 20));
        
        try {
            const levelData = getUnblockLevel(i);
            batchData.push(levelData);
        } catch (error) {
            console.error(`Error generating level ${i}:`, error);
        }
    }

    if (batchData.length > 0) {
      dispatch(addLevelBatch(batchData));
      console.log(`[LevelService] Successfully added batch of ${batchData.length} levels.`);
    }

    const nextStart = end;
    if (nextStart <= targetLimit) {
      console.log(`[LevelService] Scheduling next batch starting from ${nextStart}`);
      // Small delay between batches to ensure persistence has time to catch up if needed
      setTimeout(() => generateBatch(nextStart), 500);
    } else {
      console.log(`[LevelService] All ${targetLimit} levels generated successfully.`);
      dispatch(setGenerating(false));
    }
  };

  generateBatch(lastGenerated + 1);
};
