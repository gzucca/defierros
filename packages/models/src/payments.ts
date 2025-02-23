import { err, fromPromise, ok } from "neverthrow";

import type { Types } from "@defierros/types";
import { db, schema } from "@defierros/db";
import { env } from "@defierros/env";

import * as Cars from "./cars";
import * as MercadoPago from "./mercadopago";
import * as Users from "./users";

// Pago para reservar monto de Bid en subasta
export async function Payments_postBidPayment({
  userId,
  auctionId,
  token,
  issuer_id,
  payment_method_id,
  transaction_amount,
  installments,
  payer,
  ipAddress,
}: Types.MPFormData) {
  const userResponse = await Users.Users_getById({ id: userId });

  if (userResponse.isErr()) {
    return err(userResponse.error);
  }

  const user = userResponse.value;

  if (user.mercadoPagoId === null) {
    return err({
      code: "DatabaseError" as const,
      message: `Failed to post payment: User has no Mercado Pago ID`,
    });
  }

  const auctionResponse = await Cars.Cars_getById({ id: auctionId });

  if (auctionResponse.isErr()) {
    return err(auctionResponse.error);
  }

  const auction = auctionResponse.value;

  // const newCardMPResult = await MercadoPago.postCustomerCard({
  //   customerId: user.mercadoPagoId,
  //   token,
  // });

  // if (newCardMPResult.isErr()) {
  //   return err(newCardMPResult.error);
  // }

  // const newCardMP = newCardMPResult.value;

  // let inAuctionsArray = structuredClone(userDB.dataValues.inAuctions);

  // if (
  //   !inAuctionsArray.find((inAuction) => inAuction.auctionId === auction.id)
  // ) {
  //   inAuctionsArray.push({
  //     auctionId: auction.id,
  //     cardId: newCardMP.id,
  //     last_four_digits: newCardMP.last_four_digits,
  //     payment_method_id: newCardMP.payment_method.id,
  //   });
  //   await userDB.update({ inAuctions: inAuctionsArray });
  // }

  const paymentBidId = `payment_${crypto.randomUUID()}`;

  const bodyMercadoPago = {
    additional_info: {
      ip_address: ipAddress,
      payer: {
        phone: {
          number: user.phoneNumber ?? undefined,
        },
        first_name: user.name ?? undefined,
      },
      items: [
        {
          id: paymentBidId,
          title: "Oferta",
          description: "Oferta para Subasta DeFierros",
          category_id: "other",
          quantity: 1,
          unit_price: transaction_amount,
        },
      ],
    },
    metadata: {
      id: paymentBidId,
      //* ADD PAYMENT TYPE FOR WEBHOOKMP ROUTE
      // 'paymentBid' | 'payment' | 'paymentSaleCredit'
      payment_type: "paymentBid",
      auctionId: auction.id,
      userId: user.id,
    },
    token: token,
    three_d_secure_mode: "optional",
    issuer_id: Number(issuer_id),
    payment_method_id,
    transaction_amount,
    notification_url: `${env.WEBHOOKS_URL}/mercadopago?source_news=webhooks`,
    external_reference: paymentBidId,
    installments,
    payer: {
      id: user.mercadoPagoId,
      email: payer.email,
      identification: payer.identification,
      first_name: user.name ?? undefined,
      phone: {
        number: user.phoneNumber ?? undefined,
      },
      entity_type: "individual",
      type: "customer",
    },
    description: `DEFIERROS_OFERTA_${paymentBidId}`,
    statement_descriptor: `DEFIERROS_OFERTA_${paymentBidId}`,
    capture: false,
  } as Types.PaymentCreateRequest;

  const paymentResponse = await MercadoPago.MercadoPago_postPayment({
    body: bodyMercadoPago,
  });

  if (paymentResponse.isErr()) {
    return err(paymentResponse.error);
  }

  const payment = paymentResponse.value;

  return ok(payment);
}

export async function Payments_postPayment({
  id,
  userId,
  dollarValueId,
  value,
  paymentType,
  carId,
}: Types.PaymentsInsertType): Types.ModelPromise<{ success: boolean }> {
  const paymentResponse = await fromPromise(
    db.insert(schema.Payments).values({
      id,
      userId,
      dollarValueId,
      value,
      paymentType,
      carId,
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to post payment: ${(e as Error).message}`,
    }),
  );

  if (paymentResponse.isErr()) {
    return err(paymentResponse.error);
  }

  return ok({ success: true });
}
