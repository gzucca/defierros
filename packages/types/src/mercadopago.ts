import type { CustomerResponse } from "mercadopago/dist/clients/customer/commonTypes";
import type { CustomerCardResponse } from "mercadopago/dist/clients/customerCard/commonTypes";
import type { Options } from "mercadopago/dist/types";
import {
  ICardPaymentBrickPayer,
  ICardPaymentFormData,
} from "@mercadopago/sdk-react/esm/bricks/cardPayment/type";
import { Identification, Phone } from "mercadopago/dist/clients/commonTypes";
import { CustomerDefaultAddress } from "mercadopago/dist/clients/customer/commonTypes";
import {
  CustomerCardCreateClient,
  CustomerCardCreateData,
} from "mercadopago/dist/clients/customerCard/create/types";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";
import { ApiResponse } from "mercadopago/dist/types";

export type {
  CustomerResponse,
  CustomerCardResponse,
  CustomerCardCreateData,
  Options,
  PaymentCreateRequest,
  PaymentResponse,
};

export declare interface CustomerResponseWithId extends ApiResponse {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: Phone;
  identification?: Identification;
  default_address?: string;
  address?: CustomerDefaultAddress;
  date_registered?: string;
  description?: string;
  date_created?: string;
  date_last_updated?: string;
  metadata?: any;
  default_card?: string;
  cards?: CustomerCardCreateClient[];
  addresses?: CustomerDefaultAddress[];
  live_mode?: boolean;
}

export declare interface MPFormData
  extends ICardPaymentFormData<ICardPaymentBrickPayer> {
  userId: string;
  auctionId: string;
  ipAddress: string;
}
