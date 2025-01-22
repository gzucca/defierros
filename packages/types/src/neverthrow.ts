import type { Result } from "neverthrow";

export type FailureCode =
  | "Aborted"
  | "InvalidBodyError"
  /** if the args passed to a function are invalid */
  | "InvalidArgsError"
  | "InvalidExtensionError"
  | "InvalidTokenError"
  | "FileSizeTooLargeError"
  | "NotFoundError"
  | "CallFailedError"
  | "SamGovError"
  | "HighergovError"
  | "OpenAIError"
  | "StripeError"
  /**
   * if the user already had a trial and cancelled
   */
  | "StripePreviousTrialError"
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
