import { Customer, MercadoPagoConfig, Payment } from "mercadopago";
import { err, fromPromise, ok } from "neverthrow";

import { env } from "@defierros/env";
import type { Types } from "@defierros/types";
import { filterMap } from "@defierros/utils";

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const mpCustomer = new Customer(mercadoPagoClient);
const mpPayment = new Payment(mercadoPagoClient);

export async function postCustomer({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName: string;
  lastName: string;
}): Types.ModelPromise<Types.CustomerResponse> {
  const newCustomerResponse = await fromPromise(
    mpCustomer.create({
      body: {
        email,
        first_name: firstName,
        last_name: lastName,
      },
    }),
    (e) => ({
      code: "MercadoPagoError" as const,
      message: `Failed to create mercado pago customer: ${(e as Error).message}`,
    }),
  );

  if (newCustomerResponse.isErr()) {
    return err(newCustomerResponse.error);
  }

  const newCustomer = newCustomerResponse.value;

  return ok(newCustomer);
}

export async function getCustomerById({
  mercadoPagoId,
}: {
  mercadoPagoId: string;
}): Types.ModelPromise<Types.CustomerResponse> {
  const customerResponse = await fromPromise(
    mpCustomer.get({
      customerId: mercadoPagoId,
    }),
    (e) => ({
      code: "MercadoPagoError" as const,
      message: `Failed to get mercado pago customer: ${(e as Error).message}`,
    }),
  );

  if (customerResponse.isErr()) {
    return err(customerResponse.error);
  }

  const customer = customerResponse.value;

  return ok(customer);
}

export async function getCustomersByEmail({
  email,
}: {
  email: string;
}): Types.ModelPromise<Types.CustomerResponseWithId[] | null> {
  const customerResponse = await fromPromise(
    mpCustomer.search({
      options: {
        email,
      },
    }),
    (e) => ({
      code: "MercadoPagoError" as const,
      message: `Failed to get mercado pago customer: ${(e as Error).message}`,
    }),
  );

  if (customerResponse.isErr()) {
    return err(customerResponse.error);
  }

  const customers = customerResponse.value.results;

  if (!customers || customers.length === 0) {
    return ok(null);
  }

  // Filter customers without Id or email
  const customersWithId: Types.CustomerResponseWithId[] = filterMap(
    customers,
    (customer) => {
      if (!customer.id || !customer.email) {
        return undefined;
      }

      // Ensure customer.id is treated as a string
      return customer as Types.CustomerResponseWithId;
    },
  );

  return ok(customersWithId);
}

export async function deleteCustomerById({
  mercadoPagoId,
}: {
  mercadoPagoId: string;
}): Types.ModelPromise<Types.CustomerResponse> {
  const customerResponse = await fromPromise(
    mpCustomer.remove({
      customerId: mercadoPagoId,
    }),
    (e) => ({
      code: "MercadoPagoError" as const,
      message: `Failed to delete mercado pago customer: ${(e as Error).message}`,
    }),
  );

  if (customerResponse.isErr()) {
    return err(customerResponse.error);
  }

  const customer = customerResponse.value;

  return ok(customer);
}

export async function getCustomerCardById({
  customerId,
  cardId,
}: {
  customerId: string;
  cardId: string;
}): Types.ModelPromise<Types.CustomerCardResponse> {
  const customerCardResponse = await fromPromise(
    mpCustomer.getCard({
      customerId: customerId,
      cardId: cardId,
    }),
    (e) => ({
      code: "MercadoPagoError" as const,
      message: `Failed to get mercado pago customer card: ${(e as Error).message}`,
    }),
  );

  if (customerCardResponse.isErr()) {
    return err(customerCardResponse.error);
  }

  const customerCard = customerCardResponse.value;

  return ok(customerCard);
}

export async function postCustomerCard({
  customerId,
  token,
  requestOptions,
}: {
  customerId: string;
  token: string;
  requestOptions?: Types.Options;
}): Types.ModelPromise<Types.CustomerCardResponse> {
  const customerCardResponse = await fromPromise(
    mpCustomer.createCard({
      customerId: customerId,
      body: { token },
      requestOptions,
    }),
    (e) => ({
      code: "MercadoPagoError" as const,
      message: `Failed to get mercado pago customer card: ${(e as Error).message}`,
    }),
  );

  if (customerCardResponse.isErr()) {
    return err(customerCardResponse.error);
  }

  const customerCard = customerCardResponse.value;

  return ok(customerCard);
}

export async function postPayment({
  body,
}: {
  body: Types.PaymentCreateRequest;
}): Types.ModelPromise<Types.PaymentResponse> {
  const paymentResponse = await fromPromise(
    mpPayment.create({ body }),
    (e) => ({
      code: "MercadoPagoError" as const,
      message: `Failed to create mercado pago payment: ${(e as Error).message}`,
    }),
  );

  if (paymentResponse.isErr()) {
    return err(paymentResponse.error);
  }

  return ok(paymentResponse.value);
}
