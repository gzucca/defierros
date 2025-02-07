// import { sql } from "@vercel/postgres";
// import { drizzle } from "drizzle-orm/vercel-postgres";

// import * as schema from "./schema";

// export const db = drizzle({
//   client: sql,
//   schema,
//   casing: "snake_case",
// });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

const connectionString = process.env.DATABASE_URL;

const sql = neon(connectionString);

export const db = drizzle({ client: sql, schema });
export type DB = typeof db;
// export { db };
