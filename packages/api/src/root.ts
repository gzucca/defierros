import type { Types } from "@defierros/types";

import { carsRouter } from "./router/cars";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  cars: carsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type AppRouterNeverthrow = Types.TRPCRouterRecordNeverthrow<
  AppRouter["_def"]["procedures"]
>;
