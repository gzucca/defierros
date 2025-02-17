import type { Result } from "neverthrow";
import { err, fromPromise, ok } from "neverthrow";

import { db, eq, schema } from "@defierros/db";
import type { Types } from "@defierros/types";

// const { sendWinnerEmail } = require("../../helpers");
// const {
//   notificationFactoryIn,
// } = require("../../helpers/notificationFactoryIn");
// const socket = require("../../socket");

// const { paymentCancel } = require("../../helpers/paymentCancel");

// export async function postBid({
//   userId,
//   carId,
//   amount,
//   paymentId,
// }: {
//   userId: string;
//   carId: string;
//   amount: number;
//   paymentId: string;
// }): Promise<Result<{ success: boolean }, Types.FailureType>> {
//   // const io = socket.getIO();

//   // const socketEmitBid = (
//   //   auction_dataValues,
//   //   bid_dataValues,
//   //   user_dataValues
//   // ) => {
//   //   io.emit("receive_bid", {
//   //     ...bid_dataValues,
//   //     Auction: auction_dataValues,
//   //     User: user_dataValues,
//   //   });
//   //   io.in(auction_dataValues.id).emit("receive_comment", {
//   //     ...bid_dataValues,
//   //     Auction: auction_dataValues,
//   //     User: user_dataValues,
//   //   });
//   // };

//   const auctionDBResult = await fromPromise(
//     db.query.Cars.findFirst({
//       where: eq(schema.Cars.id, carId),
//       with: {
//         bids: true,
//       },
//       orderBy: desc(schema.Bids.ammount),
//     }),
//     (e) => ({
//       code: "DatabaseError" as const,
//       message: `Failed to fetch auction: ${(e as Error).message}`,
//     }),
//   );

//   if (auctionDBResult.isErr()) {
//     return err(auctionDBResult.error);
//   }

//   const auctionDB = auctionDBResult.value;

//   if (!auctionDB) {
//     return err({
//       code: "InvalidArgsError" as const,
//       message: `Failed to fetch auction with id: ${carId}`,
//     });
//   }

//   const userDBResult = await fromPromise(
//     db.query.Users.findFirst({
//       where: eq(schema.Users.id, userId),
//     }),
//     (e) => ({
//       code: "DatabaseError" as const,
//       message: `Failed to fetch user: ${(e as Error).message}`,
//     }),
//   );

//   if (userDBResult.isErr()) {
//     return err(userDBResult.error);
//   }

//   const userDB = userDBResult.value;

//   if (!userDB) {
//     return err({
//       code: "InvalidArgsError" as const,
//       message: `Failed to fetch user with id: ${userId}`,
//     });
//   }

//   const lastBid = auctionDB.bids[0];
//   const diferenceInMilliseconds =
//     new Date(auctionDB.endTime).getTime() - new Date().getTime(); //diferencia en milisegundos entre el tiempo de finalizacion de la subasta y el tiempo actual.

//   if (diferenceInMilliseconds < 0) {
//     return err({
//       code: "InvalidArgsError" as const,
//       message: "This auction has finished",
//     });
//   } else if (diferenceInMilliseconds < 120000) {
//     const now = new Date();
//     const newEndTime = new Date(now.getTime() + 120000);

//     const updateResult = await fromPromise(
//       db
//         .update(schema.Cars)
//         .set({ endTime: newEndTime })
//         .where(eq(schema.Cars.id, auctionDB.id)),
//       (e) => ({
//         code: "DatabaseError" as const,
//         message: `Failed to update auction end time: ${(e as Error).message}`,
//       }),
//     );

//     if (updateResult.isErr()) {
//       return err(updateResult.error);
//     }
//   }

//   const lastBidAmount = lastBid?.ammount ?? 0;

//   if (!lastBid && lastBidAmount >= auctionDB.startingPrice) {
//     const createBidResult = await fromPromise(
//       db.insert(schema.Bids).values({
//         id: crypto.randomUUID(),
//         ammount: amount,
//         carId: auctionDB.id,
//         userId: userDB.id,
//         paymentId,
//         createdAt: new Date(),
//       }),
//       (e) => ({
//         code: "DatabaseError" as const,
//         message: `Failed to create bid: ${(e as Error).message}`,
//       }),
//     );

//     if (createBidResult.isErr()) {
//       return err(createBidResult.error);
//     }

//     return ok({ success: true });
//   }

//   if (lastBidAmount < 50000) {
//     if (amount >= lastBidAmount + 100) {
//       const createBidResult = await fromPromise(
//         db.insert(schema.Bids).values({
//           id: crypto.randomUUID(),
//           ammount: amount,
//           carId: auctionDB.id,
//           userId: userDB.id,
//           paymentId,
//           createdAt: new Date(),
//         }),
//         (e) => ({
//           code: "DatabaseError" as const,
//           message: `Failed to create bid: ${(e as Error).message}`,
//         }),
//       );

//       if (createBidResult.isErr()) {
//         return err(createBidResult.error);
//       }

//       return ok({ success: true });
//     } else {
//       return err({
//         code: "InvalidArgsError" as const,
//         message:
//           "The bid has to be more than 100 dollars higher than the last one",
//       });
//     }
//   }

//   if (amount >= lastBidAmount + 250) {
//     const createBidResult = await fromPromise(
//       db.insert(schema.Bids).values({
//         id: `bid_${crypto.randomUUID()}`,
//         ammount: amount,
//         carId: auctionDB.id,
//         userId: userDB.id,
//         paymentId,
//       }),
//       (e) => ({
//         code: "DatabaseError" as const,
//         message: `Failed to create bid: ${(e as Error).message}`,
//       }),
//     );

//     if (createBidResult.isErr()) {
//       return err(createBidResult.error);
//     }

//     return ok({ success: true });
//   } else {
//     return err({
//       code: "InvalidArgsError" as const,
//       message:
//         "The bid has to be more than 250 dollars higher than the last one",
//     });
//   }
// }

export async function postBid({
  userId,
  carId,
  amount,
  paymentId,
}: {
  userId: string;
  carId: string;
  amount: number;
  paymentId: string;
}): Promise<Result<{ success: boolean }, Types.FailureType>> {
  const auctionDBResult = await fromPromise(
    db.query.Cars.findFirst({
      where: eq(schema.Cars.id, carId),
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to fetch auction: ${(e as Error).message}`,
    }),
  );

  if (auctionDBResult.isErr()) {
    return err(auctionDBResult.error);
  }

  const auctionDB = auctionDBResult.value;

  if (!auctionDB) {
    return err({
      code: "InvalidArgsError" as const,
      message: `Failed to fetch auction with id: ${carId}`,
    });
  }

  const diferenceInMilliseconds =
    new Date(auctionDB.endTime).getTime() - new Date().getTime(); //diferencia en milisegundos entre el tiempo de finalizacion de la subasta y el tiempo actual.

  if (diferenceInMilliseconds < 0) {
    return err({
      code: "InvalidArgsError" as const,
      message: "This auction has finished",
    });
  } else if (diferenceInMilliseconds < 120000) {
    const now = new Date();
    const newEndTime = new Date(now.getTime() + 120000);

    const updateResult = await fromPromise(
      db
        .update(schema.Cars)
        .set({ endTime: newEndTime })
        .where(eq(schema.Cars.id, auctionDB.id)),
      (e) => ({
        code: "DatabaseError" as const,
        message: `Failed to update auction end time: ${(e as Error).message}`,
      }),
    );

    if (updateResult.isErr()) {
      return err(updateResult.error);
    }
  }

  const createBidResult = await fromPromise(
    db.insert(schema.Bids).values({
      id: `bid_${crypto.randomUUID()}`,
      amount: amount,
      carId: auctionDB.id,
      userId,
      paymentId,
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to create bid: ${(e as Error).message}`,
    }),
  );

  if (createBidResult.isErr()) {
    return err(createBidResult.error);
  }

  return ok({ success: true });
}

export async function getBid(bidId: string) {
  return await fromPromise(
    db.query.Bids.findFirst({
      where: eq(schema.Bids.id, bidId),
      with: {
        car: true,
        user: true,
      },
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to fetch bid: ${(e as Error).message}`,
    }),
  );
}
