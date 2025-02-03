import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@defierros/db";
import { schema } from "@defierros/db";

import { protectedProcedure, publicProcedure } from "../trpc";

export const carsRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(schema.Cars);
    // return ctx.db.query.Post.findMany({
    //   orderBy: desc(Post.id),
    //   limit: 10,
    // });
  }),

  // byId: publicProcedure
  //   .input(z.object({ id: z.string() }))
  //   .query(({ ctx, input }) => {
  //     return ctx.db.select().from(schema.Post).where(eq(schema.Post.id, input.id));

  //     // return ctx.db.query.Post.findFirst({
  //     //   where: eq(Post.id, input.id),
  //     // });
  //   }),

  // create: protectedProcedure
  //   .input(schema.CreatePostSchema)
  //   .mutation(({ ctx, input }) => {
  //     return ctx.db.insert(schema.Post).values(input);
  //   }),

  // delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
  //   return ctx.db.delete(schema.Post).where(eq(schema.Post.id, input));
  // }),
} satisfies TRPCRouterRecord;
