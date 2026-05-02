import { AppDispatch, store } from './store';
import { setLastGeneratedLevel, setGenerating } from './gameSlice';
import { getUnblockLevel, TOTAL_UNBLOCK_LEVELS } from '../game/unblockLevelGenerator';
import Realm from 'realm';
import { saveLevelBatch, getAllLevels } from '../database/levelRepository';

const BATCH_SIZE = 50;

/**
 * Generates a batch of levels in the background and saves to Realm.
 */
export const startLevelGeneration = async (
  dispatch: AppDispatch,
  realm: Realm,
  lastGenerated: number,
  targetLimit: number = TOTAL_UNBLOCK_LEVELS
) => {
  if (lastGenerated >= targetLimit || !realm) return;

  dispatch(setGenerating(true));

  const generateBatch = async (start: number) => {
    const end = Math.min(start + BATCH_SIZE, targetLimit + 1);
    const batchData: any[] = [];

    for (let i = start; i < end; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));

      try {
        const levelData = getUnblockLevel(i);
        batchData.push(levelData);
      } catch (error) {
        console.error(`Error generating level ${i}:`, error);
      }
    }

    if (batchData.length > 0) {
      // Save to Realm
      saveLevelBatch(realm, batchData, 'Easy');
      
      // Update last generated level in Redux
      const maxLevel = Math.max(...batchData.map(l => l.levelNumber));
      dispatch(setLastGeneratedLevel(maxLevel));
    }

    const nextStart = end;
    if (nextStart <= targetLimit) {
      setTimeout(() => generateBatch(nextStart), 500);
    } else {
      dispatch(setGenerating(false));
    }
  };

  generateBatch(lastGenerated + 1);
};

/**
 * Imports levels from a JSON file and saves them to Realm.
 */
export const importLevelsFromJson = async (
  dispatch: AppDispatch,
  realm: Realm,
  levelsJson: any[]
) => {
  if (!realm || !levelsJson || !Array.isArray(levelsJson) || levelsJson.length === 0) return;

  console.log(`Starting unique level import...`);
  dispatch(setGenerating(true));

  try {
    const BATCH_SIZE = 20; 
    for (let i = 0; i < levelsJson.length; i += BATCH_SIZE) {
      const end = Math.min(i + BATCH_SIZE, levelsJson.length);
      const chunk = levelsJson.slice(i, end);

      realm.write(() => {
        for (const levelData of chunk) {
          // Make sure we have valid data
          if (!levelData || !levelData.levelNumber) continue;
          
          realm.create(
            "Level",
            {
              levelNumber: levelData.levelNumber,
              difficulty: 'Easy',
              minMoves: levelData.minMoves || 5,
              blocks: levelData.blocks || [],
            },
            Realm.UpdateMode.Modified
          );
        }
      });

      dispatch(setLastGeneratedLevel(end));
      
      // Short delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } catch (error) {
    console.error('Import failed at some point:', error);
  } finally {
    dispatch(setGenerating(false));
  }
};
