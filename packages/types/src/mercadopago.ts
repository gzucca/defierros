import { Identification, Phone } from "mercadopago/dist/clients/commonTypes";
import { CustomerDefaultAddress } from "mercadopago/dist/clients/customer/commonTypes";
import { CustomerCardCreateClient } from "mercadopago/dist/clients/customerCard/create/types";
import { ApiResponse } from "mercadopago/dist/types";

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
