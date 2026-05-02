import { createRealmContext } from "@realm/react";
import { Level, Block } from "./schema";

const config = {
  schema: [Level, Block],
  schemaVersion: 1,
};

export const { RealmProvider, useRealm, useQuery, useObject } = createRealmContext(config);
