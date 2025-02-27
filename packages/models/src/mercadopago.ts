import { Customer, MercadoPagoConfig, Payment } from "mercadopago";
import { err, fromPromise, ok } from "neverthrow";

import type { Types } from "@defierros/types";
import { env } from "@defierros/env";
import { filterMap } from "@defierros/utils";

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const mpCustomer = new Customer(mercadoPagoClient);
const mpPayment = new Payment(mercadoPagoClient);

export async function MercadoPago_postCustomer({
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

export async function MercadoPago_getCustomerById({
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

export async function MercadoPago_getCustomersByEmail({
  email,
  liveMode,
}: {
  email: string;
  liveMode?: boolean;
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

  const unfilteredCustomers = customerResponse.value.results;

  if (!unfilteredCustomers) {
    return ok(null);
  }

  const customers = unfilteredCustomers.filter((customer) => {
    if (liveMode) {
      return customer.live_mode === liveMode;
    }

    return true;
  });

  if (customers.length === 0) {
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

export async function MercadoPago_deleteCustomerById({
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

export async function MercadoPago_getCustomerCardById({
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

export async function MercadoPago_postCustomerCard({
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

export async function MercadoPago_postPayment({
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

export async function MercadoPago_getPaymentById({
  paymentId,
}: {
  paymentId: string;
}): Types.ModelPromise<Types.PaymentResponse> {
  const paymentResponse = await fromPromise(
    mpPayment.get({ id: paymentId }),
    (e) => ({
      code: "MercadoPagoError" as const,
      message: `Failed to get mercado pago payment: ${(e as Error).message}`,
    }),
  );

  if (paymentResponse.isErr()) {
    return err(paymentResponse.error);
  }

  return ok(paymentResponse.value);
}

export async function MercadoPago_getOnlyOneCustomer({
  email,
  liveMode,
}: {
  email: string;
  liveMode?: boolean;
}): Types.ModelPromise<Types.CustomerResponseWithId | null> {
  const getCustomersResult = await MercadoPago_getCustomersByEmail({
    email,
    liveMode,
  });

  if (getCustomersResult.isErr()) {
    return err(getCustomersResult.error);
  }

  const customers = getCustomersResult.value;

  let lastUpdatedCustomer: Types.CustomerResponseWithId | null = null;

  if (customers) {
    const firstCustomer = customers[0];
    if (firstCustomer) {
      lastUpdatedCustomer = firstCustomer;
    }

    if (customers.length > 1) {
      const filteredCustomers = filterMap(customers, (customer) => {
        if (!customer.date_created) {
          return undefined;
        }

        return customer as Types.CustomerResponseWithId & {
          date_created: string;
        };
      });

      if (filteredCustomers.length === 0) {
        console.error("No valid customers found for sorting");
        return ok(null);
      }

      const lastCustomer = filteredCustomers.sort((a, b) => {
        return (
          new Date(b.date_last_updated ?? b.date_created).getTime() -
          new Date(a.date_last_updated ?? a.date_created).getTime()
        );
      })[0];

      if (!lastCustomer) {
        return ok(null);
      }

      const oldCustomers = customers.filter(
        (customer) => customer.id !== lastCustomer.id,
      );

      for (const customer of oldCustomers) {
        const deleteCustomerResult = await MercadoPago_deleteCustomerById({
          mercadoPagoId: customer.id,
        });

        if (deleteCustomerResult.isErr()) {
          console.error(deleteCustomerResult.error);
        }

        console.log(`Deleted customer ${customer.id}`);
      }

      lastUpdatedCustomer = lastCustomer;
    }
  }

  const customer = lastUpdatedCustomer;

  return ok(customer);
}

export async function MercadoPago_getOrCreateCustomer({
  email,
  firstName,
  lastName,
  liveMode,
}: {
  email: string;
  firstName: string;
  lastName: string;
  liveMode?: boolean;
}): Types.ModelPromise<Types.CustomerResponse> {
  const getCustomerResult = await MercadoPago_getOnlyOneCustomer({
    email,
    liveMode,
  });

  if (getCustomerResult.isErr()) {
    return err(getCustomerResult.error);
  }

  const getCustomer = getCustomerResult.value;

  if (!getCustomer) {
    const newCustomerResult = await MercadoPago_postCustomer({
      email,
      firstName,
      lastName,
    });

    if (newCustomerResult.isErr()) {
      return err(newCustomerResult.error);
    }

    const newCustomer = newCustomerResult.value;

    return ok(newCustomer);
  }

  return ok(getCustomer);
}
