import { carsRouter } from "./router/cars";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  cars: carsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
