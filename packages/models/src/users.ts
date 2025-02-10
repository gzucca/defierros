import { err, fromPromise, ok } from "neverthrow";

import type { Types } from "@defierros/types";
import { db, eq, schema } from "@defierros/db";


export async function getAll() : Types.ModelPromise<Types.UsersSelectType[]> {
  const usersResult = await fromPromise(db.query.Users.findMany(), (e) => ({
    code: "DatabaseError" as const,
    message: `Failed to get all users: ${(e as Error).message}`,
  }));

  if (usersResult.isErr()) return err(usersResult.error);

  return ok(usersResult.value);
}

export async function getByClerkId({ clerkId }: { clerkId: string }) : Types.ModelPromise<Types.UsersSelectType> {
  const userResult = await fromPromise(
    db.query.Users.findFirst({
      where: eq(schema.Users.clerkId, clerkId),
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to get user by clerkId ${clerkId}: ${(e as Error).message}`,
    }),
  );

  if (userResult.isErr()) return err(userResult.error);
  if (!userResult.value) return err({
    code: "NotFoundError" as const,
    message: `User with clerkId ${clerkId} not found`,
  });

  return ok(userResult.value);
}

export async function deleteUser({
  userId,
  tx,
}: {
  userId: string;
  tx?: typeof db;
}): Types.ModelPromise<true> {
  const runWithTx = async (
    transaction: typeof db,
  ): Types.ModelPromise<true> => {
    // // Delete user's organization lookups
    // const deleteUserOrgsResult = await fromPromise(
    // 	transaction
    // 		.delete(schema.LookupUsersOrganizations)
    // 		.where(eq(schema.LookupUsersOrganizations.userId, userId)),
    // 	(e) => ({
    // 		code: 'DatabaseError' as const,
    // 		message: `Failed to delete user organization lookups: ${(e as Error).message}`,
    // 	}),
    // )
    // if (deleteUserOrgsResult.isErr()) return err(deleteUserOrgsResult.error)

    // Delete user's starred prompts
    // const deleteStarredPromptsResult = await fromPromise(
    // 	transaction
    // 		.delete(schema.LookupUsersStarredPrompts)
    // 		.where(eq(schema.LookupUsersStarredPrompts.userId, userId)),
    // 	(e) => ({
    // 		code: 'DatabaseError' as const,
    // 		message: `Failed to delete user starred prompts: ${(e as Error).message}`,
    // 	}),
    // )
    // if (deleteStarredPromptsResult.isErr()) return err(deleteStarredPromptsResult.error)

    // // Delete user's starred contracts
    // const deleteStarredContractsResult = await fromPromise(
    // 	transaction
    // 		.delete(schema.LookupUsersStarredContracts)
    // 		.where(eq(schema.LookupUsersStarredContracts.userId, userId)),
    // 	(e) => ({
    // 		code: 'DatabaseError' as const,
    // 		message: `Failed to delete user starred contracts: ${(e as Error).message}`,
    // 	}),
    // )
    // if (deleteStarredContractsResult.isErr()) return err(deleteStarredContractsResult.error)

    // Finally delete the user
    const deleteUserResult = await fromPromise(
      transaction.delete(schema.Users).where(eq(schema.Users.id, userId)),
      (e) => ({
        code: "DatabaseError" as const,
        message: `Failed to delete user: ${(e as Error).message}`,
      }),
    );
    if (deleteUserResult.isErr()) return err(deleteUserResult.error);

    return ok(true as const);
  };

  // If no transaction is provided, create one
  if (!tx) {
    return await db.transaction(async (transaction) => {
      return await runWithTx(transaction as unknown as typeof db);
    });
  }

  // If transaction is provided, use it
  return await runWithTx(tx);
}
