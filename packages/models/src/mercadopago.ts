import { Customer, MercadoPagoConfig } from "mercadopago";
import type { CustomerResponse } from "mercadopago/dist/clients/customer/commonTypes";
import { err, fromPromise, ok } from "neverthrow";

import { env } from "@defierros/env";
import type { Types } from "@defierros/types";
import { filterMap } from "@defierros/utils";

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: env.ACCESS_TOKEN_MERCADOPAGO,
  options: { timeout: 5000 },
});

const mpCustomer = new Customer(mercadoPagoClient);

export async function postMercadoPagoCustomer({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName: string;
  lastName: string;
}): Types.ModelPromise<CustomerResponse> {
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

export async function getMercadoPagoCustomerById({
  mercadoPagoId,
}: {
  mercadoPagoId: string;
}): Types.ModelPromise<CustomerResponse> {
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

export async function getMercadoPagoCustomersByEmail({
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

export async function deleteMercadoPagoCustomer({
  mercadoPagoId,
}: {
  mercadoPagoId: string;
}): Types.ModelPromise<CustomerResponse> {
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

