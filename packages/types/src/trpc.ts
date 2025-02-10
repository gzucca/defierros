import type { TRPCRouterRecord, AnyRouter } from "@trpc/server";
import { ModelPromise } from ".";

export type TRPCRouterRecordNeverthrow<T extends TRPCRouterRecord | AnyRouter> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? (...args: Parameters<T[K]>) => ModelPromise<ReturnType<T[K]>>
    : T[K] extends TRPCRouterRecord | AnyRouter
    ? TRPCRouterRecordNeverthrow<T[K]>
    : T[K];
};
