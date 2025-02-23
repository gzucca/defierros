import type { CarsSelectType, BidsSelectType } from "@defierros/db/types";

export type CarWithBids = CarsSelectType & {
  bids: BidsSelectType[];
};
