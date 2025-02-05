import type { WebhookEvent } from "@clerk/nextjs/server";
import type { Result } from "neverthrow";
import { createClerkClient } from "@clerk/backend";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { err, fromPromise, ok } from "neverthrow";
import { Webhook } from "svix";

import type { Types } from "@defierros/types";
import { env } from "@defierros/env";

export const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SignCallback) {
  const client = jwksClient({
    jwksUri: `${env.CLERK_FRONTEND_API_URL}/.well-known/jwks.json`,
  });

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err, undefined);
    }

    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}
function verifyJWT(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}

export async function checkAuth(
  req: Request,
): Promise<Result<Types.ClerkAuthSuccessType, Types.FailureType>> {
  const sessionToken = req.headers.get("Authorization") ?? "";
  if (!sessionToken)
    return err({
      code: "InvalidTokenError",
      message: `invalid session token: ${sessionToken}`,
    });
  const token = sessionToken.split("Bearer ")[1];
  if (!token)
    return err({
      code: "InvalidTokenError",
      message: `invalid bearer token: ${token}`,
    });

  const verified = fromPromise<Types.ClerkAuthSuccessType, Types.FailureType>(
    verifyJWT(token) as Promise<Types.ClerkAuthSuccessType>,
    (err) => ({
      code: "InvalidTokenError",
      message: `failed to verify JWT. error: ${JSON.stringify(err)}`,
    }),
  );

  return verified;
}

export async function verifyHook(
  headers: () => Headers,
  req: Request,
  WEBHOOK_SECRET: string,
): Promise<Result<WebhookEvent, Types.FailureType>> {
  const payload = (await req.json()) as unknown;
  const body = JSON.stringify(payload);

  if (!WEBHOOK_SECRET) {
    // Required
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    // Svix tokens
    return err({
      code: "InvalidWebhookError",
      message: "Invalid webhooks tokens.",
    });
  }

  // Create a new svix instance
  const wh = new Webhook(WEBHOOK_SECRET);

  // Verify the payload with the headers
  const verify = (): WebhookEvent => {
    return wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  };

  let evt;

  try {
    evt = verify();
  } catch (e) {
    return err({
      code: "InvalidWebhookError",
      message: `Invalid tokens. ${JSON.stringify(e)}`,
    });
  }

  return ok(evt);
}
