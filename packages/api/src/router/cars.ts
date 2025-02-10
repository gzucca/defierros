import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { Cars } from "@defierros/models";

import { publicProcedure } from "../trpc";

export const carsRouter = {
  get: {
    all: publicProcedure.query(async () => {
      const cars = await Cars.getAll();

      if (cars.isErr()) {
        return { error: cars.error.message };
      }

      return { value: cars.value };
    }),

    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const cars = await Cars.getById({ id: input.id });

        if (cars.isErr()) {
          return { error: cars.error.message };
        }

        return { value: cars.value };
      }),

    byPostType: publicProcedure
      .input(z.object({ postType: z.enum(["auction", "sale"]) }))
      .query(async ({ input }) => {
        const cars = await Cars.getByPostType({ postType: input.postType });

        if (cars.isErr()) {
          return { error: cars.error.message };
        }

        return { value: cars.value };
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
