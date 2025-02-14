import { randomUUID } from "crypto";
import type { Result } from "neverthrow";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fromPromise } from "neverthrow";

import type { Types } from "@defierros/types";
import { db, eq, schema } from "@defierros/db";
import { env } from "@defierros/env";
import { Clerk, Users } from "@defierros/models";
import { sanitizeEmail } from "@defierros/utils";

export async function POST(req: Request) {
  const body = await req.json();
  const paymentId = body.id;
  const paymentStatus = body.status;
  const paymentStatusDetail = body.status_detail;
  const paymentDate = body.date_approved;


  // const responseMP = await fetch("https://api.mercadopago.com/v1/payments", {
  //   body: JSON.stringify(bodyMercadoPago),
  //   headers: {
  //     Authorization: `Bearer ${ACCESS_TOKEN_MERCADOPAGO}`,
  //     "Content-Type": "application/json",
  //     "X-Idempotency-Key": `${newOffer + user.id}`,
  //     "X-meli-session-id": deviceId,
  //   },
  //   method: "POST",
  // })
  //   .then(function (response) {
  //     return response.json();
  //   })
  //   .catch(function (error) {
  //     console.log(
  //       "Error trying to create MercadoPago payment with mpPayment:",
  //       error,
  //     );
  //     throw new Error(
  //       "Error trying to create MercadoPago payment with mpPayment:",
  //       error,
  //     );
  //   });

  // console.log("response responseMP", await responseMP);

  // if (responseMP.status === "authorized") {
  //   await paymentBid.update({
  //     mp_paymentId: responseMP.id,
  //     mp_status: responseMP.status,
  //     mp_status_detail: responseMP.status_detail,
  //     mp_date_created: responseMP.date_created,
  //     mp_payment_method: responseMP.payment_method,
  //   });
  //   const bid = await postBid({
  //     userId: user.id,
  //     auctionId: auction.id,
  //     ammount: newOffer,
  //   });
  //   await paymentBid.setBid(bid.dataValues.id);
  //   await paymentBid.setUser(user.id);
  //   await paymentBid.setAuction(auction.id);
  // }
  // return responseMP;
}