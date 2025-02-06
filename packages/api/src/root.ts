import { carsRouter } from "./router/cars";
import { postRouter } from "./router/post";
import { usersRouter } from "./router/users";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  cars: carsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
