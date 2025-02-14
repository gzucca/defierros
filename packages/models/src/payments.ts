import { err, ok } from "neverthrow";

import type { Types } from "@defierros/types";
import { db, schema } from "@defierros/db";
import { env } from "@defierros/env";

import { Cars, DollarValue, MercadoPago, Users } from ".";

// Pago para reservar monto de Bid en subasta
export async function postBidPayment({
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
  const userResponse = await Users.getById({ id: userId });

  if (userResponse.isErr()) {
    return err(userResponse.error);
  }

  const user = userResponse.value;

  if (user.mercadoPagoId === null) {
    return err(new Error("User has no Mercado Pago ID"));
  }

  const auctionResponse = await Cars.getById({ id: auctionId });

  if (auctionResponse.isErr()) {
    return err(auctionResponse.error);
  }

  const auction = auctionResponse.value;

  const dollarValueResult = await DollarValue.getDollarWebOrDB();

  if (dollarValueResult.isErr()) {
    return err(dollarValueResult.error);
  }

  const dollarValue = dollarValueResult.value;

  const paymentBidId = `payment_${crypto.randomUUID()}`;

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

  await db.insert(schema.Payments).values({
    id: `payment_${crypto.randomUUID()}`,
    userId: user.id,
    dollarValueId: dollarValue.id,
    value: String(transaction_amount),
    paymentType: "auction-bid",
    carId: auction.id,
  });

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
  };

  console.log("este es bodyMercadoPago createBidPayment", bodyMercadoPago);

  const paymentResponse = await MercadoPago.postPayment({
    body: bodyMercadoPago,
  });

  if (paymentResponse.isErr()) {
    return err(paymentResponse.error);
  }

  const payment = paymentResponse.value;

  return ok(payment);
}
