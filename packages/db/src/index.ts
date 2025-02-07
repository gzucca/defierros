import { db } from "./client";
import type { DB } from "./client";
import * as resources from "./schema";

export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/pg-core";
export const schema = { ...resources };
export { db };
export type { DB };