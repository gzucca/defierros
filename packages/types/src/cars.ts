import type { Types } from "@defierros/types";

export type CarWithBids = Types.CarsSelectType & {
  bids: Types.BidsSelectType[];
};
