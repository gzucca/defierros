"use server";

// import { Cars_getAll } from "@defierros/models/cars";

// import { withServerActionTracking } from "~/middleware/serverActionMiddleware";

// /**
//  * Server action to fetch cars
//  * @returns Promise with cars data or error
//  */
// export const getAll = withServerActionTracking(
//   "cars.getAll",

//   async () => {
//     try {
//       // Get contracts using combined search strategy
//       // This handles both query-based and filter-based searches
//       const carsResult = await Cars_getAll();

//       if (carsResult.isErr()) {
//         throw new Error(
//           `Failed to get cars: ${JSON.stringify(carsResult.error)}`,
//         );
//       }

//       return {
//         value: carsResult.value,
//       };
//     } catch (error) {
//       console.error("Cars search failed:", error);
//       return {
//         error: {
//           code: "CallFailedError",
//           message: `Failed to get cars`,
//         },
//       };
//     }
//   },
// );
