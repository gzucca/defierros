import crypto from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { err } from "neverthrow";

import { env } from "@defierros/env";
import { Bids_postBid } from "@defierros/models/bids";
import { DollarValue_getDollarWebOrDB } from "@defierros/models/dollarValue";
import { MercadoPago_getPaymentById } from "@defierros/models/mercadopago";
import { Payments_postPayment } from "@defierros/models/payments";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("body", body);

  const xSignature = headers().get("x-signature"); // Assuming headers is an object containing request headers
  const xRequestId = headers().get("x-request-id"); // Assuming headers is an object containing request headers

  if (!xSignature || !xRequestId) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const url = new URL(req.url);

  // Obtain Query params related to the request URL
  const dataID = url.searchParams.get("data.id");
  const type = url.searchParams.get("type");

  console.log("dataID", dataID);
  console.log("type", type);
  console.log("body.action", body.action);

  // Separating the x-signature into parts
  const parts = xSignature.split(",");

  // Initializing variables to store ts and hash
  let ts: string | undefined;
  let hash: string | undefined;

  // Iterate over the values to obtain ts and v1
  parts.forEach((part) => {
    // Split each part into key and value
    const [key, value] = part.split("=");
    if (key && value) {
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      if (trimmedKey === "ts") {
        ts = trimmedValue;
      } else if (trimmedKey === "v1") {
        hash = trimmedValue;
      }
    }
  });

  if (!ts || !hash) {
    return NextResponse.json({ error: "Missing ts or hash" }, { status: 400 });
  }

  // Obtain the secret key for the user/application from Mercadopago developers site
  const secret = env.MERCADOPAGO_WEBHOOK_SECRET;

  // Generate the manifest string
  const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

  const hmac = crypto.createHmac("sha256", secret).update(manifest);

  const sha = hmac.digest("hex");

  if (sha === hash) {
    // HMAC verification passed
    console.log("HMAC verification passed");
  } else {
    // HMAC verification failed
    console.log("HMAC verification failed");
    return NextResponse.json(
      { error: "HMAC verification failed" },
      { status: 400 },
    );
  }

  if (body.action === "payment.created") {
    const paymentId = dataID;

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const paymentResponse = await MercadoPago_getPaymentById({ paymentId });

    if (paymentResponse.isErr()) {
      console.log(
        "Error trying to get MercadoPago payment:",
        paymentResponse.error,
      );
      return NextResponse.json(
        { error: "Error trying to get MercadoPago payment" },
        { status: 500 },
      );
    }

    const payment = paymentResponse.value;

    console.log("payment:");
    console.dir(payment, { depth: null });

    const dollarValueResult = await DollarValue_getDollarWebOrDB();

    if (dollarValueResult.isErr()) {
      return err(dollarValueResult.error);
    }

    const dollarValue = dollarValueResult.value;

    const paymentIdInsert = payment.metadata.id;

    const paymentType = payment.metadata.payment_type;

    const userId = payment.metadata.user_id;

    const carId = payment.metadata.auction_id;

    if (!paymentIdInsert || !paymentType || !userId || !carId) {
      return NextResponse.json(
        { error: "Missing paymentId, paymentType, userId, or carId" },
        { status: 400 },
      );
    }

    const postPaymentResponse = await Payments_postPayment({
      id: paymentIdInsert,
      userId,
      dollarValueId: dollarValue.id,
      value: String(payment.transaction_amount),
      paymentType,
      carId,
    });

    if (postPaymentResponse.isErr()) {
      return NextResponse.json(
        { error: "Error trying to post payment" },
        { status: 500 },
      );
    }

    const postPayment = postPaymentResponse.value;

    console.log("postPayment:", postPayment);

    const postBidResponse = await Bids_postBid({
      userId,
      carId,
      amount: Number(payment.transaction_amount),
      paymentId: paymentIdInsert,
    });

    if (postBidResponse.isErr()) {
      return NextResponse.json(
        { error: "Error trying to post bid" },
        { status: 500 },
      );
    }

    const postBid = postBidResponse.value;

    console.log("postBid:", postBid);
  }

  return NextResponse.json(
    { message: "Successfully processed webhook" },
    { status: 200 },
  );
}
