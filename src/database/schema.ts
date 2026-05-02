import Realm, { ObjectSchema } from "realm";

export class Block extends Realm.Object<Block> {
  id!: string;
  row!: number;
  col!: number;
  length!: number;
  direction!: string;
  isRed?: boolean;

  static schema: ObjectSchema = {
    name: "Block",
    embedded: true,
    properties: {
      id: "string",
      row: "int",
      col: "int",
      length: "int",
      direction: "string",
      isRed: { type: "bool", default: false },
    },
  };
}

export class Level extends Realm.Object<Level> {
  levelNumber!: number;
  difficulty!: string;
  minMoves!: number;
  blocks!: Realm.List<Block>;

  static schema: ObjectSchema = {
    name: "Level",
    primaryKey: "levelNumber",
    properties: {
      levelNumber: "int",
      difficulty: "string",
      minMoves: "int",
      blocks: "Block[]",
    },
  };
}
