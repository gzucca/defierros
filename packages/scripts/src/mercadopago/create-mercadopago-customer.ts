/**
 * in packages/scripts, run:
 * pnpm with-env tsx src/mercadopago/create-mercadopago-customer.ts
 */

import type { Types } from "@defierros/types";
import { MercadoPago } from "@defierros/models";
import { filterMap } from "@defierros/utils";

(async () => {
  try {
    const email = "malegnij@gmail.com";
    const getCustomersResult = await MercadoPago.getCustomersByEmail({
      email,
    });

    if (getCustomersResult.isErr()) {
      console.error(getCustomersResult.error);
      return;
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
          return;
        }

        lastUpdatedCustomer = filteredCustomers.sort((a, b) => {
          return (
            new Date(b.date_last_updated ?? b.date_created).getTime() -
            new Date(a.date_last_updated ?? a.date_created).getTime()
          );
        })[0] as Types.CustomerResponseWithId;

        const oldCustomers = customers.filter(
          (customer) => customer.id !== lastUpdatedCustomer!.id,
        );

        for (const customer of oldCustomers) {
          const deleteCustomerResult = await MercadoPago.deleteCustomerById({
            mercadoPagoId: customer.id,
          });

          if (deleteCustomerResult.isErr()) {
            console.error(deleteCustomerResult.error);
          }

          console.log(`Deleted customer ${customer.id}`);
        }
      }
    }

    const customer = lastUpdatedCustomer;

    if (customer?.live_mode === false) {
      await MercadoPago.deleteCustomerById({
        mercadoPagoId: customer.id,
      });

      console.log("email", email);

      const newCustomerResult = await MercadoPago.postCustomer({
        email,
        firstName: "Juan Bautista",
        lastName: "Malegnij",
      });

      if (newCustomerResult.isErr()) {
        console.error(newCustomerResult.error);
        return;
      }

      const newCustomer = newCustomerResult.value;

      console.log("Check live mode");

      console.dir(newCustomer, { depth: null });
    }

    console.dir(customer, { depth: null });

    if (!customer) {
      const newCustomerResult = await MercadoPago.postCustomer({
        email,
        firstName: "Juan Bautista",
        lastName: "Malegnij",
      });

      if (newCustomerResult.isErr()) {
        console.error(newCustomerResult.error);
        return;
      }

      const newCustomer = newCustomerResult.value;

      console.dir(newCustomer, { depth: null });
    }
  } catch (error) {
    console.error(error);
  }
})();
