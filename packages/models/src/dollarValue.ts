import { err, fromPromise, ok } from "neverthrow";
import puppeteer from "puppeteer";

import type { Types } from "@defierros/types";
import { db, desc, eq, schema } from "@defierros/db";

export async function getDollarWeb() {
  try {
    // Start a Puppeteer session with:
    // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
    // - no default viewport (`defaultViewport: null` - website page will in full width and height)
    const browser = await puppeteer.launch({
      headless: true,
      executablePath:
        process.env.NODE_ENV === "production"
          ? "/usr/bin/chromium-browser"
          : "",
    });

    // Open a new page
    const page = await browser.newPage();

    await page.setCacheEnabled(false);

    // On this new page:
    // - open the website
    // - wait until the dom content is loaded (HTML is ready)
    await page.goto(
      "https://dolarhoy.com/i/cotizaciones/dolar-bancos-y-casas-de-cambio",
      {
        waitUntil: "networkidle0",
      },
    );

    // - wait until the required selector is loaded
    await page.waitForSelector(
      "body > div.iframe-cotizaciones__container > div.container__data > div > p:nth-child(2)",
      { timeout: 60_000 },
    );

    let dollarValue = 0;

    // Get page data
    dollarValue = await page.evaluate(() => {
      try {
        // Fetch the element

        const valueTag = document.querySelector(
          "body > div.iframe-cotizaciones__container > div.container__data > div > p:nth-child(2)",
        );

        // Check if the element exists
        if (!valueTag) {
          console.log("Element not found");
          return 0;
        }

        // Get the displayed text and return it (`.innerText`)
        const value = Number(valueTag.textContent?.split("\n")[0]);
        // const value = String(valueTag.innerText.split("\n")[0]);

        return value;
      } catch (error) {
        console.error("Error extracting dollar value:", error);
        return 0; // Return undefined if there's an error
      }
    });

    // Close the browser
    await browser.close();

    return dollarValue;
  } catch (error) {
    console.log("Error with getDollar:", error);
    console.error("Error with getDollar:", error);
  }
}

export async function getDollarWebOrDB() {
  //TODO ADD NEVERTRHOW
  try {
    const dollarValue = await getDollarWeb();
    if (dollarValue && dollarValue !== 0) {
      await postDollarValue(dollarValue);
    }
  } catch (error) {
    console.log("Error with getDollar:", error);
    console.error("Error with getDollar:", error);
  }

  const dollarDBResult = await fromPromise(
    db.query.DollarValue.findFirst({
      orderBy: [desc(schema.DollarValue.createdAt)],
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to get dollar value from DB: ${(e as Error).message}`,
    }),
  );

  if (dollarDBResult.isErr()) {
    return err(dollarDBResult.error);
  }

  const dollarDB = dollarDBResult.value;

  if (!dollarDB) {
    return err({
      code: "NotFoundError" as const,
      message: "Dollar value not found",
    });
  }

  return ok(dollarDB);
}

export async function postDollarValue(dollarValue: number) {
  const postResult = await fromPromise(
    db.insert(schema.DollarValue).values({
      id: `dollarValue_${crypto.randomUUID()}`,
      value: String(dollarValue),
    }),
    (e) => ({
      code: "DatabaseError" as const,
      message: `Failed to post dollar value to DB: ${(e as Error).message}`,
    }),
  );

  if (postResult.isErr()) {
    return err(postResult.error);
  }

  return ok(postResult.value);
}
