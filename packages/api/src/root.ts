import { carsRouter } from "./router/cars";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  cars: carsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
