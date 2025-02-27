import { randomUUID } from "crypto";
import type { Result } from "neverthrow";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fromPromise } from "neverthrow";

import type { Types } from "@defierros/types";
import { db, eq, schema } from "@defierros/db";
import { env } from "@defierros/env";
import { Clerk_clerkClient, Clerk_verifyHook } from "@defierros/models/clerk";
import {
  MercadoPago_getOnlyOneCustomer,
  MercadoPago_getOrCreateCustomer,
} from "@defierros/models/mercadopago";
import {
  Users_deleteUser,
  Users_getByClerkId,
  Users_getByEmail,
  Users_post,
  Users_putBy,
} from "@defierros/models/users";
import { sanitizeEmail } from "@defierros/utils";

export async function POST(req: Request) {
  const evt = await Clerk_verifyHook(headers, req, env.CLERK_WEBHOOK_SECRET);

  if (evt.isErr()) {
    return NextResponse.json(
      { code: evt.error.code, message: evt.error.message },
      { status: 401 },
    );
  }

  const whPayload = evt.value;
  const eventType = whPayload.type;
  console.log(
    `Webhook with and ID of ${whPayload.data.id} and type of ${eventType}`,
  );

  // User created
  if (eventType === "user.created") {
    const clerkUserId = whPayload.data.id;

    // Check if user already exists
    const prevUserByClerkIdResult = await Users_getByClerkId({
      clerkId: clerkUserId,
    });
    if (prevUserByClerkIdResult.isErr()) {
      console.log(prevUserByClerkIdResult.error);
      return NextResponse.json(prevUserByClerkIdResult.error, { status: 500 });
    }

    const prevUserByClerkId = prevUserByClerkIdResult.value;

    if (prevUserByClerkId) {
      console.log(`User with clerkId ${clerkUserId} already exists`);
      return NextResponse.json("User already exists", { status: 200 });
    }

    const clerkFirstName = whPayload.data.first_name ?? null;
    const clerkLastName = whPayload.data.last_name ?? null;
    const clerkFullName = clerkFirstName?.concat(" " + clerkLastName) ?? null;
    const clerkUserName = whPayload.data.username ?? null;
    const clerkEmail = whPayload.data.email_addresses[0]?.email_address ?? null;

    if (!clerkEmail) {
      return NextResponse.json(
        { code: "InvalidEmailError", message: "Email is required" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const prevUserByEmailResult = await Users_getByEmail({
      email: clerkEmail,
    });
    if (prevUserByEmailResult.isErr()) {
      console.log(prevUserByEmailResult.error);
      return NextResponse.json(prevUserByEmailResult.error, { status: 500 });
    }

    const prevUserByEmail = prevUserByEmailResult.value;

    // Update clerkId if email already exists
    if (prevUserByEmail && prevUserByEmail.clerkId !== clerkUserId) {
      console.log(
        `User with email ${clerkEmail} already but different clerkId exists. Updating clerkId to ${clerkUserId}`,
      );
      const updateUserResult = await Users_putBy({
        email: clerkEmail,
        newData: { clerkId: clerkUserId },
      });
      if (updateUserResult.isErr()) {
        console.log(updateUserResult.error);
        return NextResponse.json(updateUserResult.error, { status: 500 });
      }
      return NextResponse.json("Updated user with email", { status: 200 });
    }

    const sanitizedEmail = sanitizeEmail(clerkEmail);

    const mpCustomerResult = await MercadoPago_getOrCreateCustomer({
      firstName: clerkFirstName ?? clerkUserName ?? sanitizedEmail,
      lastName: clerkLastName ?? clerkUserName ?? sanitizedEmail,
      email: clerkEmail,
      liveMode: env.NODE_ENV === "production" ? true : false,
    });

    if (mpCustomerResult.isErr()) {
      console.log(mpCustomerResult.error);
      return NextResponse.json(mpCustomerResult.error, { status: 500 });
    }

    const mpCustomer = mpCustomerResult.value;

    if (prevUserByEmail && prevUserByEmail.mercadoPagoId !== mpCustomer.id) {
      console.log(
        `User with email ${clerkEmail} already but different mercadoPagoId exists. Updating mercadoPagoId to ${mpCustomer.id}`,
      );
      const updateUserResult = await Users_putBy({
        email: clerkEmail,
        newData: { mercadoPagoId: mpCustomer.id },
      });
      if (updateUserResult.isErr()) {
        console.log(updateUserResult.error);
        return NextResponse.json(updateUserResult.error, { status: 500 });
      }
      return NextResponse.json("Updated user with email", { status: 200 });
    }

    const data = {
      id: `user_${randomUUID()}`,
      email: clerkEmail,
      name: clerkFullName ?? clerkUserName ?? sanitizedEmail,
      userName: clerkUserName ?? sanitizedEmail,
      profilePicture: whPayload.data.image_url,
      clerkId: clerkUserId,
      mercadoPagoId: mpCustomer.id,
      isActive: true,
      isAdmin: false,
    };

    console.log(`User data:`, data);

    // create user if not exists
    const newUserResult = await Users_post(data);
    if (newUserResult.isErr()) {
      console.log(newUserResult.error);
      return NextResponse.json(newUserResult.error, { status: 500 });
    }

    // fire posthog user created event for each user
    // PH.captureServerEvent(data.id, "user.created", {
    //   email: data.email,
    //   displayName: data.displayName,
    // });

    return NextResponse.json("Webhook received", { status: 201 });
  }

  // session create
  if (eventType === "session.created") {
    const clerkUserId = whPayload.data.user_id;

    const clerkUserApi = await Clerk_clerkClient.users.getUser(clerkUserId);
    const clerkEmail = clerkUserApi.primaryEmailAddress?.emailAddress ?? null;
    if (!clerkEmail) {
      return NextResponse.json(
        { code: "InvalidEmailError", message: "Email is required" },
        { status: 400 },
      );
    }

    const userDBResult = await Users_getByEmail({
      email: clerkEmail,
    });
    if (userDBResult.isErr()) {
      console.log(userDBResult.error);
      return NextResponse.json(userDBResult.error, { status: 500 });
    }

    const userDB = userDBResult.value;

    if (userDB == null) {
      throw new Error(`matchingUser == null`);
    }

    if (userDB.id === clerkUserId) {
      console.log(
        `Session created for user with email ${userDB.email} and clerk_id ${clerkUserId}`,
      );
      return NextResponse.json(
        `Session created for user with email ${userDB.email} and clerk_id ${clerkUserId}`,
        {
          status: 200,
        },
      );
    }

    if (userDB.id !== clerkUserId) {
      await Users_putBy({
        email: clerkEmail,
        newData: { clerkId: clerkUserId },
      });

      console.log(
        `Updated user with email ${userDB.email} to replace old clerk_id ${userDB.id} with new clerk_id ${clerkUserId}`,
      );

      return NextResponse.json(
        `Updated user with email ${userDB.email} to replace old clerk_id ${userDB.id} with new clerk_id ${clerkUserId}`,
        {
          status: 200,
        },
      );
    }
  }

  // User deleted
  if (eventType === "user.deleted") {
    if (!whPayload.data.id) {
      return NextResponse.json("User ID is required", { status: 400 });
    }
    const deleteResult = await Users_deleteUser({
      userId: whPayload.data.id,
    });

    if (deleteResult.isErr()) {
      console.error(JSON.stringify(deleteResult.error));
      return NextResponse.json("DatabaseError", { status: 500 });
    }

    console.log("User deleted from DB.");
    return NextResponse.json("Webhook received", { status: 200 });
  }

  return NextResponse.json(
    { code: "InvalidWebhookEvent", message: "Unknown webhook event" },
    { status: 404 },
  );
}
