import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@defierros/db";
import { CreatePostSchema, Post } from "@defierros/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(Post).orderBy(desc(Post.id));
    // return ctx.db.query.Post.findMany({
    //   orderBy: desc(Post.id),
    //   limit: 10,
    // });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.select().from(Post).where(eq(Post.id, input.id));

      // return ctx.db.query.Post.findFirst({
      //   where: eq(Post.id, input.id),
      // });
    }),

  create: protectedProcedure
    .input(CreatePostSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Post).values(input);
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Post).where(eq(Post.id, input));
  }),
} satisfies TRPCRouterRecord;
