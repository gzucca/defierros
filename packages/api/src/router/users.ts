import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { Users } from "@defierros/models";

import { publicProcedure } from "../trpc";

export const usersRouter = {
  get: {
    all: publicProcedure.query(async () => {
      return await Users.getAll();
    }),

    byClerkId: publicProcedure
      .input(z.object({ clerkId: z.string() }))
      .query(async ({ input }) => {
        return await Users.getByClerkId({ clerkId: input.clerkId });
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
