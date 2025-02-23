/**
 * in packages/scripts, run:
 * pnpm with-env tsx src/dollarValue/get-dollar-value.ts
 */

import { DollarValue_getDollarWeb } from "@defierros/models/dollarValue";

(async () => {
  const dollarValue = await DollarValue_getDollarWeb();
  console.log(dollarValue);
})();
