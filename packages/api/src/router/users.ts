import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { Users_getAll, Users_getByClerkId } from "@defierros/models/users";

import { publicProcedure } from "../trpc";

export const usersRouter = {
  get: {
    all: publicProcedure.query(async () => {
      const users = await Users_getAll();

      if (users.isErr()) {
        return { error: users.error.message };
      }

      return { value: users.value };
    }),

    byClerkId: publicProcedure
      .input(z.object({ clerkId: z.string() }))
      .query(async ({ input }) => {
        const user = await Users_getByClerkId({ clerkId: input.clerkId });

        if (user.isErr()) {
          return { error: user.error.message };
        }

        return { value: user.value };
      }),

  },

  // create: protectedProcedure
  //   .input(schema.CreatePostSchema)
  //   .mutation(({ ctx, input }) => {
  //     return ctx.db.insert(schema.Post).values(input);
  //   }),

  // delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
  //   return ctx.db.delete(schema.Post).where(eq(schema.Post.id, input));
  // }),
} satisfies TRPCRouterRecord;
