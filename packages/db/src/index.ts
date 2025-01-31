import * as resources from "./schema";
import { db } from "./client";

export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/pg-core";
export const schema = { ...resources };
export { db };
