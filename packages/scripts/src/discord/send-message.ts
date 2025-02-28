/**
 * in packages/scripts, run:
 * pnpm with-env tsx src/discord/send-message.ts
 */

import { Discord_sendMessage } from "@defierros/models/discord";

(async () => {
  const message = await Discord_sendMessage("Sí, funciona");
  if (message.isErr()) {
    console.error(message.error);
  } else {
    console.log(message.value);
  }
})();
