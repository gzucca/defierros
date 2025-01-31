import { chunk } from "lodash";
import { Result } from "neverthrow";

import type { Types } from "@defierros/types";

export const name = "utils";

export function getDaysDifference(date1: Date, date2: Date): number {
  // Get the time in milliseconds for each date
  const time1 = date1.getTime();
  const time2 = date2.getTime();

  // Calculate the difference in milliseconds
  const diffInMs = time1 - time2;

  // Convert milliseconds to days
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return Math.ceil(diffInDays);
}

export function getErrorMessage(e: unknown) {
  if (e instanceof Error) {
    return e.message;
  }
  return "Unknown Error";
}
/**
 *
 * finds and transforms an item in an array using the provided callback.
 * the callback is run on every element on the array until it produces a non-undefined value,
 * if the non-undefined value is produced it returns immediately, otherwise it keeps going.
 * if there are no non-undefined values returned by the callback as its run on the entire array,
 * the function itself returns undefined
 *
 * works with async if you await it
 *
 * @param array array of items
 * @param callback callback run against every item in the array (until non-undefined output is produced)
 * @returns the transformed value that the callback produces, or undefined
 */
export function findMap<T, U>(
  array: T[],
  callback: (item: T) => U | undefined,
): U | undefined {
  for (const item of array) {
    const result = callback(item);
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
}

/**
 * The filterMap function takes an array and a callback function as parameters.
 * It uses reduce to accumulate the results into a new array.
 * The callback is applied to each element of the array. If the callback returns a value other than undefined, that value is pushed into the result array.
 * If the callback returns undefined, that element is effectively filtered out by not being added to the result array.
 * The function returns the new array containing only the transformed values, with all undefined values filtered out.
 *
 * I don't think this works with async callback -> Erik
 *
 * @param array array of items
 * @param callback callback run against every item in the array
 * @returns array containing the filtered, transformed items
 */
export function filterMap<T, U>(
  array: T[],
  callback: (item: T) => U | undefined,
): U[] {
  return array.reduce<U[]>((result, item) => {
    const mappedValue = callback(item);
    return mappedValue !== undefined ? [...result, mappedValue] : result;
  }, []);
}

export function nameToSlug({ name }: { name: string }) {
  return name
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9-]+/g, "") // Remove all non-alphanumeric characters except hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from the start and end
}

/**
 * Converts an L2 squared distance to a normalized score between 0 and 100.
 * Used for semantic search results where typical L2 distances range from 0 to 4.
 * A distance of 0 means perfect similarity (score 100), while a distance of 4 or greater means no similarity (score 0).
 *
 * @param distance - The L2 squared distance from the semantic search
 * @returns A normalized score between 0 and 100
 */
export function semanticDistanceToScore(distance: number): number {
  // Convert L2 squared distance to a 0-100 score
  // Typical L2 distances in our embeddings range from 0 to 4
  const normalizedScore = Math.max(0, Math.min(100, (1 - distance / 4) * 100));
  return Math.round(normalizedScore);
}

// export function browserLog(message?: unknown, ...optionalParams: unknown[]) {
//   if (typeof window !== "undefined") {
//     console.log(message, ...optionalParams);
//   }
// }

// browserLog.error = function (message?: unknown, ...optionalParams: unknown[]) {
//   if (typeof window !== "undefined") {
//     console.error(message, ...optionalParams);
//   }
// };

/** delay thread by <param> ms */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * await Promise.all(arr.map(callback))
 *
 * is the same Type-wise as:
 *
 * await runSequentiallyOverArray(arr, callback)
 *
 * the difference, is runSequentiallyOverArray runs the
 * callback over the array one index at a time
 */
export async function runSequentiallyOverArray<T, R>(
  values: T[],
  asyncCallback: (value: T) => Promise<R>,
  /**
   * timeout to wait after batch is run
   */
  timeoutMs = 0, // Optional third parameter for timeout
  batchSize = 1,
): Promise<R[]> {
  const results: R[] = [];
  const batches = chunk(values, batchSize);
  for (const batch of batches) {
    const batchResult = await Promise.all(batch.map(asyncCallback));
    results.push(...batchResult);
    await delay(timeoutMs);
  }

  return results;
}

/**
 * stringifyDisplayRecord is intended for openai calls where we want to present objects to the assistant.
 *
 * feel free to use as a template to create a custom function if you have custom prompt passing needs!
 * (openai is creativity land... so fun working on ai)
 * - Erik
 */

export function stringifyDisplayRecord({
  displayRecord,
}: {
  displayRecord: Record<string, string>;
}) {
  return Object.entries(displayRecord)
    .map(([key, val]) => {
      return `- ${key}: ${val}`;
    })
    .join(`\n`);
}

/**
 * returns the day daysAgo days ago
 */
export function getDaysAgoDate({ daysAgo }: { daysAgo: number }) {
  const todayDate = new Date(); // {object Date}

  const daysAgoMilliseconds = 1000 * 60 * 60 * 24 * daysAgo; // 1000 milliseconds/sec, 60 secs/min, 60 mins/hour, 24 hours/day, daysAgo days
  const daysAgoDate = new Date(todayDate.getTime() - daysAgoMilliseconds); // {object Date}
  return daysAgoDate;
}

/**
 * Combines an array of values into a formatted string using the specified delimiter,
 * based on their presence, following these rules:
 *
 * - If all values are present, returns them joined by the delimiter (e.g., "a -> b -> c").
 * - If some values are missing (empty or undefined), only includes the defined values.
 * - If no values are present, returns "N/A".
 *
 * This function is useful when you have multiple values and need to create a formatted string
 * representation based on which values are available, with a customizable separator.
 *
 * @param {Array<string | undefined>} values - An array of string values to format.
 * @param {string} delimiter - The delimiter to use for concatenation (e.g., " -> ").
 * @returns {string} - A formatted string based on the presence of values in the array.
 */
export function conditionalConcat(
  values: (string | null | undefined)[],
  delimiter = " -> ",
): string {
  // Filter out empty, null, or undefined values
  const filteredValues = values.filter((value) => !!value);

  // If no valid values are left, return 'N/A'
  if (filteredValues.length === 0) {
    return "N/A";
  }

  // Join the remaining values using the specified delimiter
  return filteredValues.join(delimiter);
}
/**
 * Checks if the provided value is a valid date.
 *
 * This function attempts to parse the input value as a Date object.
 * It then checks if the parsed value is a valid Date instance and
 * that it does not result in an invalid date (NaN).
 *
 * @param {any} date - The value to be checked for validity as a date.
 * @returns {boolean} - Returns true if the value is a valid date, otherwise false.
 */
export function isValidDate(date: unknown): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime()); // Check if the Date object is valid
  }
  if (typeof date === "string" || typeof date === "number") {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }
  return false; // Return false for invalid types
}

/**
 * Converts an object to a JSON string with its keys sorted in alphabetical order.
 *
 * This function ensures that the resulting JSON string is stable, meaning that
 * the order of keys in the stringified output will always be the same for the
 * same input object. This can be useful for consistent hashing, comparison, or
 * storage purposes.
 *
 * @param {Record<string, unknown>} obj - The object to be stringified.
 * @returns {string} - The JSON string representation of the object with sorted keys.
 */
export function stableStringify(obj: Record<string, unknown>): string {
  const sortedObj = Object.keys(obj)
    .sort() // Sort the keys
    .reduce(
      (acc, key) => {
        acc[key] = obj[key];
        return acc;
      },
      {} as Record<string, unknown>,
    );

  return JSON.stringify(sortedObj);
}

export function compressFilterState(
  filterState: object,
): Result<string, Types.FailureType> {
  const stringifyJson = Result.fromThrowable(JSON.stringify, (e) => {
    const error: Types.FailureType = {
      code: "ParsingError",
      message: `Failed to stringify JSON: ${(e as Error).message}`,
    };
    return error;
  });

  const encodeBase64 = Result.fromThrowable(btoa, (e) => {
    const error: Types.FailureType = {
      code: "CallFailedError",
      message: `Failed to encode base64: ${(e as Error).message}`,
    };
    return error;
  });

  return stringifyJson(filterState).andThen(encodeBase64);
}

export function sortKeysAlphabetically<T extends Record<string, unknown>>(
  obj: T,
): T {
  const sortedEntries = Object.entries(obj).sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB),
  );
  return Object.fromEntries(sortedEntries) as T;
}

export function decompressFilterState(
  compressedString: string,
): Result<object, Types.FailureType> {
  const decodeBase64 = Result.fromThrowable(atob, (error) => {
    const error2: Types.FailureType = {
      code: "CallFailedError",
      message: `Failed to decode base64: ${(error as Error).message}`,
    };
    return error2;
  });

  const parseJson = Result.fromThrowable(JSON.parse, (error) => {
    const error3: Types.FailureType = {
      code: "ParsingError",
      message: `Failed to parse JSON: ${(error as Error).message}`,
    };
    return error3;
  });

  return decodeBase64(compressedString).andThen(parseJson);
}

/**
 * Type predicate function to narrow type from T | null to T
 * @param value - The value to check for null
 * @returns True if the value is non-null, false otherwise
 */
export function isNonNullGuard<T>(value: T | null | undefined): value is T {
  return Boolean(value);
}

export const getExtNameFromContentType = (contentType: string) => {
  const contentTypeMappings: Record<string, string> = {
    // Text and Code Files
    "text/html": ".html",
    "text/css": ".css",
    "application/javascript": ".js",
    "application/typescript": ".ts",
    "application/json": ".json",
    "application/xml": ".xml",
    "text/xml": ".xml",
    "text/markdown": ".md",
    "text/plain": ".txt",
    "text/csv": ".csv",
    "text/x-c": ".c",
    "text/x-c++src": ".cpp",
    "text/x-java-source": ".java",
    "text/x-python": ".py",
    "application/x-httpd-php": ".php",
    "application/x-ruby": ".rb",
    "application/x-tex": ".tex",
    "application/x-sh": ".sh",
    "application/x-python-code": ".py",
    "application/x-perl": ".pl",
    "text/x-shellscript": ".sh",

    // Document Files
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      ".pptx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "application/rtf": ".rtf",

    // Font Files
    "font/ttf": ".ttf",
    "font/otf": ".otf",
    "font/woff": ".woff",
    "font/woff2": ".woff2",

    // Image Files
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/bmp": ".bmp",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
    "image/tiff": ".tiff",
    "image/x-icon": ".ico",
    "image/vnd.microsoft.icon": ".ico",

    // Audio Files
    "audio/mpeg": ".mp3",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/webm": ".webm",
    "audio/aac": ".aac",

    // Video Files
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/ogg": ".ogv",
    "video/mpeg": ".mpeg",
    "video/x-msvideo": ".avi",

    // Compressed and Archive Files
    "application/zip": ".zip",
    "application/gzip": ".gz",
    "application/x-7z-compressed": ".7z",
    "application/vnd.rar": ".rar",
    "application/x-tar": ".tar",
    "application/x-rar-compressed": ".rar",

    // Application and Executable Files
    "application/octet-stream": "", // Used for binary/executable files with unknown type
    "application/x-java-archive": ".jar",
    "application/x-msdownload": ".exe",
    "application/vnd.apple.installer+xml": ".mpkg",
    "application/x-dosexec": ".exe",

    // Miscellaneous Document Files
    "application/vnd.oasis.opendocument.text": ".odt",
    "application/vnd.oasis.opendocument.spreadsheet": ".ods",
    "application/vnd.oasis.opendocument.presentation": ".odp",
    "application/vnd.oasis.opendocument.graphics": ".odg",
  };

  return contentTypeMappings[contentType] ?? "";
};

export function formatSolicitationNumber(solicitationNumber: string): string {
  return (
    solicitationNumber
      .trim()
      .toLocaleLowerCase("en-US")
      .replaceAll("&", "and")
      .replaceAll(/[\s_/()|]/g, "-") // Replace spaces, underscores, slashes, parentheses, and pipes with dashes
      .replaceAll(/["™]/g, "") // Remove quotation marks and trademark symbols
      .replaceAll(/[^a-z0-9-]/g, "") // Remove all non-URL-safe characters
      .replaceAll(/-+/g, "-") // Collapse multiple dashes
      .replace(/^-|-$/g, "") || "emptySolNum"
  ); // Trim leading/trailing dashes; ensure non-empty result
}

/**
 * Checks if a given pathname matches any of the beta routes based on their segments and type
 * @param pathname - The current pathname to check
 * @param betaRoutes - Array of beta routes to check against
 * @returns boolean indicating if the pathname matches any beta route
 */
export function isBetaRoute(
  pathname: string | null,
  betaRoutes: { segments: string[]; type: "exact" | "inclusive" }[],
): boolean {
  if (!pathname) return false;

  return betaRoutes.some((route) =>
    route.type === "exact"
      ? route.segments.every((segment) => pathname.split("/").includes(segment))
      : route.segments.every((segment) => pathname.includes(segment)),
  );
}

/**
 * Finds the first beta route that matches the given pathname
 * @param pathname - The current pathname to check
 * @param betaRoutes - Array of beta routes to check against
 * @returns The matching beta route or null if no match is found
 */
export function findMatchingBetaRoute<
  T extends { segments: string[]; type: "exact" | "inclusive" },
>(pathname: string | null, betaRoutes: T[]): T | null {
  if (!pathname) return null;

  return (
    betaRoutes.find((route) =>
      route.type === "exact"
        ? route.segments.every((segment) =>
            pathname.split("/").includes(segment),
          )
        : route.segments.every((segment) => pathname.includes(segment)),
    ) ?? null
  );
}

// export function cleanHtml(input: string): string {
//   // Remove HTML tags
//   const withoutTags = input.replace(/<\/?[^>]+(>|$)/g, "");

//   // Decode HTML entities
//   const parser = new DOMParser();
//   const decoded = parser.parseFromString(withoutTags, "text/html")
//     .documentElement.textContent;

//   return decoded || "";
// }

// Compares to Notices, returning the keys that are different.
export function camelCaseToSentenceCase(camelCaseString: string): string {
  return camelCaseString
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
}

export function sanitizeEmail(email: string): string {
  return nameToSlug({
    name: email.split("@")[0]?.replace(/\s+/g, "") ?? "",
  });
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const lowercaseFirstLetter = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

export function featuresArrayToText(array: string[]) {
  const newArray = [];
  for (let i = 0; i < array.length; i++) {
    if (i === 0) {
      const feature = array[i];
      const featureCapitalized = feature
        ? capitalizeFirstLetter(feature)
        : null;
      if (featureCapitalized) {
        newArray.push(featureCapitalized);
      }
    }

    if (i > 0) {
      const feature = array[i];
      const featureLowercase = feature ? lowercaseFirstLetter(feature) : null;
      if (featureLowercase) {
        newArray.push(featureLowercase);
      }
    }

    if (i + 1 < array.length) {
      newArray.push(", ");
    }
  }
  newArray.push(".");

  const arrayToText = newArray.join("");

  return arrayToText;
}
