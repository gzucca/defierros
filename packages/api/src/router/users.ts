import { z } from "zod";

import type { Types } from "@defierros/types";
import { Users } from "@defierros/models";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const usersRouter = createTRPCRouter({
  get: createTRPCRouter({
    all: publicProcedure.query(async () => {
      return await Users.getAll();
    }),

    byClerkId: publicProcedure
      .input(z.object({ clerkId: z.string() }))
      .query(async ({ input }) => {
        return await Users.getByClerkId({ clerkId: input.clerkId });
      }),
  }),

  // create: protectedProcedure
  //   .input(schema.CreatePostSchema)
  //   .mutation(({ ctx, input }) => {
  //     return ctx.db.insert(schema.Post).values(input);
  //   }),

  // delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
  //   return ctx.db.delete(schema.Post).where(eq(schema.Post.id, input));
  // }),
});

// Export the router type for consumers
export type UsersRouter = typeof usersRouter._def.procedures;
export type UsersRouterNeverthrow =
  Types.TRPCRouterRecordNeverthrow<UsersRouter>;
