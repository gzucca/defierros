import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { Payments_postBidPayment } from "@defierros/models/payments";

import { publicProcedure } from "../trpc";

export const paymentsRouter = {
  post: {
    bidPayment: publicProcedure
      .input(
        z.object({
          userId: z.string(),
          auctionId: z.string(),
          token: z.string(),
          issuer_id: z.string(),
          payment_method_id: z.string(),
          transaction_amount: z.number(),
          installments: z.number(),
          payer: z.object({
            email: z.string(),
            identification: z.object({
              type: z.string(),
              number: z.string(),
            }),
          }),
          ipAddress: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const cars = await Payments_postBidPayment(input);

        if (cars.isErr()) {
          return { error: cars.error.message };
        }

        return { value: cars.value };
      }),
  },
} satisfies TRPCRouterRecord;
