import Realm from "realm";
import { Level } from "./schema";

export const saveLevelBatch = (realm: Realm, levels: any[], difficulty: string) => {
  realm.write(() => {
    levels.forEach((levelData) => {
      realm.create(
        "Level",
        {
          levelNumber: levelData.levelNumber,
          difficulty: difficulty,
          minMoves: levelData.minMoves,
          blocks: levelData.blocks,
        },
        Realm.UpdateMode.Modified
      );
    });
  });
};

export const getLevelByNumber = (realm: Realm, levelNumber: number): Level | null => {
  return realm.objectForPrimaryKey<Level>("Level", levelNumber);
};

export const getAllLevels = (realm: Realm) => {
  return realm.objects<Level>("Level").sorted("levelNumber");
};

export const clearAllLevels = (realm: Realm) => {
  realm.write(() => {
    realm.delete(realm.objects("Level"));
  });
};
