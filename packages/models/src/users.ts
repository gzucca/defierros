import { err, fromPromise, ok } from "neverthrow";

import type { Types } from "@defierros/types";
import { db, eq, schema } from "@defierros/db";

export async function Users_getAll(): Types.ModelPromise<
  Types.UsersSelectType[]
> {
  const usersResult = await fromPromise(db.query.Users.findMany(), (e) => ({
    code: "DatabaseError" as const,
    message: `Failed to get all users: ${(e as Error).message}`,
  }));

  if (usersResult.isErr()) return err(usersResult.error);

  return ok(usersResult.value);
}

export async function Users_getByClerkId({
  clerkId,
}: {
  clerkId: string;
}): Types.ModelPromise<Types.UsersSelectType | null> {
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
  if (!userResult.value) {
    return ok(null);
  }

  return ok(userResult.value);
}

export async function Users_getById({
  id,
}: {
  id: string;
}): Types.ModelPromise<Types.UsersSelectType | null> {
  const userResult = await fromPromise(
    db.query.Users.findFirst({
      where: eq(schema.Users.id, id),
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to get user by id ${id}: ${(e as Error).message}`,
    }),
  );

  if (userResult.isErr()) return err(userResult.error);
  if (!userResult.value) {
    return ok(null);
  }

  return ok(userResult.value);
}

export async function Users_getByEmail({
  email,
}: {
  email: string;
}): Types.ModelPromise<Types.UsersSelectType | null> {
  const userResult = await fromPromise(
    db.query.Users.findFirst({
      where: eq(schema.Users.email, email),
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to get user by email ${email}: ${(e as Error).message}`,
    }),
  );

  if (userResult.isErr()) return err(userResult.error);
  if (!userResult.value) {
    return ok(null);
  }

  return ok(userResult.value);
}

export async function Users_deleteUser({
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

export async function Users_post(
  args: {
    id: string;
    clerkId: string;
    email: string;
  } & Partial<Types.UsersInsertType>,
): Types.ModelPromise<{ success: boolean }> {
  const userResult = await fromPromise(
    db.insert(schema.Users).values(args),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to insert user: ${(e as Error).message}`,
    }),
  );

  if (userResult.isErr()) return err(userResult.error);

  return ok({ success: true });
}

export async function Users_putBy({
  email,
  id,
  clerkId,
  mercadoPagoId,
  newData,
}: {
  email?: string;
  id?: string;
  clerkId?: string;
  mercadoPagoId?: string;
  newData: Partial<Types.UsersSelectType>;
}): Types.ModelPromise<{ success: boolean }> {
  if (id) {
    const userResult = await fromPromise(
      db.update(schema.Users).set(newData).where(eq(schema.Users.id, id)),
      (e) => ({
        code: "DatabaseError" as const,
        message: `Failed to update user by id ${id}: ${(e as Error).message}`,
      }),
    );

    if (userResult.isErr()) return err(userResult.error);

    return ok({ success: true });
  }

  if (email) {
    const userResult = await fromPromise(
      db.update(schema.Users).set(newData).where(eq(schema.Users.email, email)),
      (e) => ({
        code: "DatabaseError" as const,
        message: `Failed to update user by email ${email}: ${(e as Error).message}`,
      }),
    );

    if (userResult.isErr()) return err(userResult.error);

    return ok({ success: true });
  }

  if (clerkId) {
    const userResult = await fromPromise(
      db
        .update(schema.Users)
        .set(newData)
        .where(eq(schema.Users.clerkId, clerkId)),
      (e) => ({
        code: "DatabaseError" as const,
        message: `Failed to update user by clerkId ${clerkId}: ${(e as Error).message}`,
      }),
    );

    if (userResult.isErr()) return err(userResult.error);

    return ok({ success: true });
  }

  if (mercadoPagoId) {
    const userResult = await fromPromise(
      db
        .update(schema.Users)
        .set(newData)
        .where(eq(schema.Users.mercadoPagoId, mercadoPagoId)),
      (e) => ({
        code: "DatabaseError" as const,
        message: `Failed to update user by mercadoPagoId ${mercadoPagoId}: ${(e as Error).message}`,
      }),
    );

    if (userResult.isErr()) return err(userResult.error);

    return ok({ success: true });
  }

  return err({
    code: "InvalidArgsError" as const,
    message: "No id, email, clerkId, or mercadoPagoId provided",
  });
}
