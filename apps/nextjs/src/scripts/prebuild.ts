import { env } from "@defierros/env";

async function execute() {
  for (const key in env) {
    if ((env as any)[key] == null) {
      throw new Error(`env.${key} is null`);
    }
    console.log("env" + key + " is set");
  }

  console.log("build env: ", JSON.stringify(env));
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Prebuild Script Finished 🚀");
}

// Self-invoking async function
(async () => {
  await execute();
})().catch((err) => {
  console.error(err);
  throw err;
});
