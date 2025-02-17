/**
 * in packages/scripts, run:
 * pnpm with-env tsx src/dollarValue/get-dollar-value.ts
 */

import { DollarValue } from "@defierros/models";

(async () => {
  const dollarValue = await DollarValue.getDollarWeb();
  console.log(dollarValue);
})();
