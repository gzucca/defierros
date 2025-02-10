import { z } from "zod";

import type { Types } from "@defierros/types";
import { Cars } from "@defierros/models";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const carsRouter = createTRPCRouter({
  get: createTRPCRouter({
    all: publicProcedure.query(async () => {
      return await Cars.getAll();
    }),

    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await Cars.getById({ id: input.id });
      }),

    byPostType: publicProcedure
      .input(z.object({ postType: z.enum(["auction", "sale"]) }))
      .query(async ({ input }) => {
        return await Cars.getByPostType({ postType: input.postType });
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
export type CarsRouter = typeof carsRouter;
export type CarsRouterNeverthrow = Types.TRPCRouterRecordNeverthrow<CarsRouter>;
