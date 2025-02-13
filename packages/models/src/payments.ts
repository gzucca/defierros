import { err } from "neverthrow";

import { db, schema } from "@defierros/db";

import { Cars, DollarValue, Users } from ".";

// Pago para reservar monto de Bid en subasta
export async function createBidPayment({
  userId,
  auctionId,
  deviceId,
  newOffer,
  token,
  issuer_id,
  payment_method_id,
  transaction_amount,
  installments,
  payer,
  ipAddress,
}: {
  userId: string;
  auctionId: string;
  deviceId: string;
  newOffer: string;
  token: string;
  issuer_id: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
  payer: {
    email: string;
    identification: string;
  };
  ipAddress: string;
}) {
  const userResponse = await Users.getById({ id: userId });

  if (userResponse.isErr()) {
    return err(userResponse.error);
  }

  const user = userResponse.value;

  const auctionResponse = await Cars.getById({ id: auctionId });

  if (auctionResponse.isErr()) {
    return err(auctionResponse.error);
  }

  const auction = auctionResponse.value;

  try {
    const dollarValueResult = await DollarValue.getDollarWebOrDB();

    if (dollarValueResult.isErr()) {
      return err(dollarValueResult.error);
    }

    const dollarValue = dollarValueResult.value;

    const paymentBid = await db.insert(schema.Payments).values({
      id: `payment_${crypto.randomUUID()}`,
      userId: user.id,
      dollarValueId: dollarValue.id,
      value: String(transaction_amount),
      paymentType: "auction-bid",
      carId: auction.id,
    });

    const newCardMP = await mpCustomer.createCard({
      customerId: user.mercadoPagoId,
      body: {
        token: token,
      },
    });

    const userDB = await User.findByPk(user.id);

    let inAuctionsArray = structuredClone(userDB.dataValues.inAuctions);

    if (
      !inAuctionsArray.find((inAuction) => inAuction.auctionId === auction.id)
    ) {
      inAuctionsArray.push({
        auctionId: auction.id,
        cardId: newCardMP.id,
        last_four_digits: newCardMP.last_four_digits,
        payment_method_id: newCardMP.payment_method.id,
      });
      await userDB.update({ inAuctions: inAuctionsArray });
    }

    const bodyMercadoPago = {
      additional_info: {
        ip_address: ipAddress,
        payer: {
          phone: {
            number: user.phoneNumber,
          },
          first_name: user.name,
        },
        items: [
          {
            id: paymentBid.dataValues.id,
            title: "Oferta",
            description: "Oferta para Subasta DeFierros",
            category_id: "other",
            quantity: 1,
            unit_price: transaction_amount,
          },
        ],
      },
      metadata: {
        id: paymentBid.dataValues.id,
        //* ADD PAYMENT TYPE FOR WEBHOOKMP ROUTE
        // 'paymentBid' | 'payment' | 'paymentSaleCredit'
        payment_type: "paymentBid",
      },
      token: token,
      three_d_secure_mode: "optional",
      issuer_id,
      payment_method_id,
      transaction_amount,
      notification_url: `${API_URL}/payment/webhookMP?source_news=webhooks`,
      external_reference: paymentBid.dataValues.id,
      installments,
      payer: {
        id: user.mercadoPagoId,
        email: payer.email,
        identification: payer.identification,
        first_name: user.name,
        phone: {
          number: user.phoneNumber,
        },
        entity_type: "individual",
        type: "customer",
      },
      description: `DEFIERROS_OFERTA_${paymentBid.dataValues.id}`,
      statement_descriptor: `DEFIERROS_OFERTA_${paymentBid.dataValues.id}`,
      capture: false,
    };

    console.log("este es bodyMercadoPago createBidPayment", bodyMercadoPago);

    const responseMP = await fetch("https://api.mercadopago.com/v1/payments", {
      body: JSON.stringify(bodyMercadoPago),
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN_MERCADOPAGO}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${newOffer + user.id}`,
        "X-meli-session-id": deviceId,
      },
      method: "POST",
    })
      .then(function (response) {
        return response.json();
      })
      .catch(function (error) {
        console.log(
          "Error trying to create MercadoPago payment with mpPayment:",
          error,
        );
        throw new Error(
          "Error trying to create MercadoPago payment with mpPayment:",
          error,
        );
      });

    console.log("response responseMP", await responseMP);

    if (responseMP.status === "authorized") {
      await paymentBid.update({
        mp_paymentId: responseMP.id,
        mp_status: responseMP.status,
        mp_status_detail: responseMP.status_detail,
        mp_date_created: responseMP.date_created,
        mp_payment_method: responseMP.payment_method,
      });
      const bid = await postBid({
        userId: user.id,
        auctionId: auction.id,
        ammount: newOffer,
      });
      await paymentBid.setBid(bid.dataValues.id);
      await paymentBid.setUser(user.id);
      await paymentBid.setAuction(auction.id);
    }
    return responseMP;
  } catch (error) {
    console.log("Error trying to create Bid payment:", error.message);
    console.error("Error trying to create Bid payment:", error.message);
  }
}
