import { err, fromPromise, ok } from "neverthrow";

import type { Types } from "@defierros/types";
import { db, desc, schema } from "@defierros/db";

export async function getDollarWeb() {
  const response = await fetch("https://dolarapi.com/v1/dolares/oficial");
  const data = (await response.json()) as { compra: number };
  return data.compra;
}

// Returns the dollar value from the web or the DB
export async function getDollarWebOrDB(): Types.ModelPromise<Types.DollarValueSelectType> {
  const dollarDBResult = await fromPromise(
    db.query.DollarValue.findFirst({
      orderBy: [desc(schema.DollarValue.createdAt)],
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to get dollar value from DB: ${(e as Error).message}`,
    }),
  );

  if (dollarDBResult.isErr()) {
    return err(dollarDBResult.error);
  }

  const dollarDB = dollarDBResult.value;

  if (!dollarDB) {
    return err({
      code: "NotFoundError" as const,
      message: "Dollar value not found",
    });
  }

  const today = new Date();
  const lastUpdate = new Date(dollarDB.createdAt);
  const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newDollarValue: Types.DollarValueSelectType | null = null;
  if (diffDays > 1) {
    try {
      const newDollarValueResult = await getDollarWeb();
      if (newDollarValueResult) {
        const postResult = await postDollarValue(newDollarValueResult);

        if (postResult.isErr()) {
          return err(postResult.error);
        }

        newDollarValue = postResult.value;
      }
    } catch (error) {
      console.log("Error with getDollar:", error);
      console.error("Error with getDollar:", error);
    }
  }

  return ok(newDollarValue ?? dollarDB);
}

export async function postDollarValue(
  dollarValue: number,
): Types.ModelPromise<Types.DollarValueSelectType> {
  const id = `dollarValue_${crypto.randomUUID()}`;
  const postResult = await fromPromise(
    db.insert(schema.DollarValue).values({
      id,
      value: String(dollarValue),
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to post dollar value to DB: ${(e as Error).message}`,
    }),
  );

  if (postResult.isErr()) {
    return err(postResult.error);
  }

  return ok({ id, createdAt: new Date(), value: String(dollarValue) });
}
