import { err, fromPromise, ok } from "neverthrow";

import type { Types } from "@defierros/types";
import { asc, db, eq, schema } from "@defierros/db";

export async function Cars_getAll(): Types.ModelPromise<Types.CarWithBids[]> {
  const carsResult = await fromPromise(
    db.query.Cars.findMany({
      with: {
        bids: {
          orderBy: (bids, { desc }) => [desc(bids.createdAt)],
        },
      },
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to get all cars: ${(e as Error).message}`,
    }),
  );

  if (carsResult.isErr()) return err(carsResult.error);

  return ok(carsResult.value);
}

export async function Cars_getById({
  id,
}: {
  id: string;
}): Types.ModelPromise<Types.CarWithBids> {
  const carResult = await fromPromise(
    db.query.Cars.findFirst({
      where: eq(schema.Cars.id, id),
      with: {
        bids: {
          orderBy: (bids, { desc }) => [desc(bids.createdAt)],
        },
      },
      orderBy: asc(schema.Bids.createdAt),
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to get car by id ${id}: ${(e as Error).message}`,
    }),
  );

  if (carResult.isErr()) return err(carResult.error);

  if (!carResult.value) {
    return err({
      code: "NotFoundError" as const,
      message: `Car with id ${id} not found`,
    });
  }

  return ok(carResult.value);
}

export async function Cars_getByPostType({
  postType,
}: {
  postType: "auction" | "sale";
}): Types.ModelPromise<Types.CarWithBids[]> {
  const carResult = await fromPromise(
    db.query.Cars.findMany({
      where: eq(schema.Cars.postType, postType),
      with: {
        bids: {
          orderBy: (bids, { desc }) => [desc(bids.createdAt)],
        },
      },
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to get car by post type ${postType}: ${(e as Error).message}`,
    }),
  );

  if (carResult.isErr()) return err(carResult.error);

  if (carResult.value.length === 0) {
    return err({
      code: "NotFoundError" as const,
      message: `Car with post type ${postType} not found`,
    });
  }

  return ok(carResult.value);
}
