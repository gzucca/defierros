import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@defierros/db";

import { publicProcedure } from "../trpc";

export const usersRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(schema.Users);
    // return ctx.db.query.Post.findMany({
    //   orderBy: desc(Post.id),
    //   limit: 10,
    // });
  }),

  byId: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.db
        .select()
        .from(schema.Users)
        .where(eq(schema.Users.clerkId, input.clerkId))
        .limit(1);

      if (users.length === 0) {
        throw new Error("User not found");
      }

      return users[0];
      // return ctx.db.query.Post.findFirst({
      //   where: eq(Post.id, input.id),
      // });
    }),

  // create: protectedProcedure
  //   .input(schema.CreatePostSchema)
  //   .mutation(({ ctx, input }) => {
  //     return ctx.db.insert(schema.Post).values(input);
  //   }),

  // delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
  //   return ctx.db.delete(schema.Post).where(eq(schema.Post.id, input));
  // }),
} satisfies TRPCRouterRecord;
