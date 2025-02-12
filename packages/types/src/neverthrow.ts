import type { Result } from "neverthrow";

export type FailureCode =
  | "Aborted"
  | "InvalidBodyError"
  | "InvalidArgsError"
  | "InvalidExtensionError"
  | "InvalidTokenError"
  | "FileSizeTooLargeError"
  | "NotFoundError"
  | "CallFailedError"
  | "MercadoPagoError"
  | "ResendError"
  | "ClerkError"
  | "ClerkFormIdentifierExistsError"
  | "DatabaseError"
  | "InvalidWebhookError"
  | "NetworkError"
  | "NeverthrowHydrationError"
  | "ParsingError"
  | "UnknownError"
  | "Unauthenticated"
  | "Unauthorized"
  | "LangchainError"
  | "UpstashError"
  | "ServerActionError"
  | "LavinMQError";

export interface FailureType {
  code: FailureCode;
  message: string;
}

export type ResultType<T, E> =
  | {
      error: E;
      value?: never;
    }
  | {
      value: T;
      error?: never;
    };

export type ServerActionPromise<T, E = FailureType> = Promise<ResultType<T, E>>;

export type ModelPromise<T, E extends FailureType = FailureType> = Promise<
  Result<T, E>
>;

export type ModelResult<T, E extends FailureType = FailureType> = Result<T, E>;
