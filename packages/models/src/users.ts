import { err, fromPromise, ok } from "neverthrow";

import type { Types } from "@defierros/types";
import { db, eq, schema } from "@defierros/db";

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
