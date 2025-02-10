import type { TRPCRouterRecord } from "@trpc/server";

import { ModelPromise } from ".";

export type TRPCRouterRecordNeverthrow<T extends TRPCRouterRecord> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? (...args: Parameters<T[K]>) => ModelPromise<ReturnType<T[K]>>
    : T[K] extends TRPCRouterRecord
    ? TRPCRouterRecordNeverthrow<T[K]>
    : T[K];
};
