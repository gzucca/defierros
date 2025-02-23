import { carsRouter } from "./router/cars";
import { paymentsRouter } from "./router/payments";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";
import type { Types } from "@defierros/types";

export const appRouter = createTRPCRouter({
  cars: carsRouter,
  users: usersRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
