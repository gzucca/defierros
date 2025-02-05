import { randomUUID } from "crypto";
import type { Result } from "neverthrow";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fromPromise } from "neverthrow";

import type { Types } from "@defierros/types";
import { db, eq, schema } from "@defierros/db";
import { env } from "@defierros/env";
import { Clerk, Users } from "@defierros/models";
import { sanitizeEmail } from "@defierros/utils";

export async function POST(req: Request) {
  const evt = await Clerk.verifyHook(headers, req, env.CLERK_WEBHOOK_SECRET);

  if (evt.isErr()) {
    return Response.json(
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
    const prevUser: Result<Types.UsersSelectType[], Types.FailureType> =
      await fromPromise(
        db
          .select()
          .from(schema.Users)
          .where(eq(schema.Users.clerkId, clerkUserId)),
        (err) => ({
          code: "NetworkError",
          message: `Error during user.created Clerk Webhook select operation. error: ${JSON.stringify(err)}`,
        }),
      );
    if (prevUser.isErr()) {
      console.log(prevUser.error);
      return Response.json(prevUser.error, { status: 500 });
    }

    if (prevUser.value[0]) {
      console.log(`User with clerkId ${clerkUserId} already exists`);
      return new Response("User already exists", { status: 200 });
    }

    const clerkName =
      whPayload.data.first_name?.concat(
        " " + (whPayload.data.last_name ?? ""),
      ) ?? null;

    const clerkUserName = whPayload.data.username ?? null;
    const clerkEmail = whPayload.data.email_addresses[0]?.email_address ?? null;

    if (!clerkEmail) {
      return Response.json(
        { code: "InvalidEmailError", message: "Email is required" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const prevUserEmail: Result<Types.UsersSelectType[], Types.FailureType> =
      await fromPromise(
        db
          .select()
          .from(schema.Users)
          .where(eq(schema.Users.email, clerkEmail)),
        (err) => ({
          code: "NetworkError",
          message: `Error during user.created Clerk Webhook select operation. error: ${JSON.stringify(err)}`,
        }),
      );
    if (prevUserEmail.isErr()) {
      console.log(prevUserEmail.error);
      return Response.json(prevUserEmail.error, { status: 500 });
    }

    // Update clerkId if email already exists
    if (prevUserEmail.value[0]) {
      console.log(`User with email ${clerkEmail} already exists`);
      const newUser = await fromPromise(
        db
          .update(schema.Users)
          .set({
            clerkId: clerkUserId,
          })
          .where(eq(schema.Users.email, clerkEmail)),
        (err) => ({
          code: "NetworkError",
          message: `Error during user.created Clerk Webhook update operation. error: ${JSON.stringify(err)}`,
        }),
      );
      if (newUser.isErr()) {
        console.log(newUser.error);
        return Response.json(newUser.error, { status: 500 });
      }
      return new Response("Updated user with email", { status: 200 });
    }

    const sanitizedEmail = sanitizeEmail(clerkEmail);

    const data = {
      id: `user_${randomUUID()}`,
      email: clerkEmail,
      name: clerkName ?? clerkUserName ?? sanitizedEmail,
      userName: clerkUserName ?? sanitizedEmail,
      profilePicture: whPayload.data.image_url,
      clerkId: clerkUserId,
      isActive: true,
      isAdmin: false,
    };

    console.log(`User data:`, data);

    if (!prevUser.value[0]) {
      // create user if not exists
      const newUser = await fromPromise(
        db.insert(schema.Users).values(data),
        (err) => ({
          code: "NetworkError",
          message: `Error during user.created Clerk Webhook insert operation. error: ${JSON.stringify(err)}`,
        }),
      );
      if (newUser.isErr()) {
        console.log(newUser.error);
        return Response.json(newUser.error, { status: 500 });
      }

      // fire posthog user created event for each user
      // PH.captureServerEvent(data.id, "user.created", {
      //   email: data.email,
      //   displayName: data.displayName,
      // });
    }

    return new Response("Webhook received", { status: 201 });
  }

  // session create
  if (eventType === "session.created") {
    const clerkUserId = whPayload.data.user_id;

    const clerkUserApi = await Clerk.clerkClient.users.getUser(clerkUserId);

    if (clerkUserApi.primaryEmailAddress != null) {
      try {
        const userDB = await db
          .select()
          .from(schema.Users)
          .where(
            eq(
              schema.Users.email,
              clerkUserApi.primaryEmailAddress.emailAddress,
            ),
          );

        const matchingUser = userDB[0];
        if (matchingUser == null) {
          throw new Error(`matchingUser == null`);
        }

        if (matchingUser.id === clerkUserId) {
          console.log(
            `Session created for user with email ${matchingUser.email} and clerk_id ${clerkUserId}`,
          );
          return new NextResponse(
            `Session created for user with email ${matchingUser.email} and clerk_id ${clerkUserId}`,
            {
              status: 200,
            },
          );
        }

        if (userDB.length && matchingUser.id !== clerkUserId) {
          await db
            .update(schema.Users)
            .set({
              id: clerkUserId,
            })
            .where(eq(schema.Users.id, matchingUser.id));

          console.log(
            `Updated user with email ${matchingUser.email} to replace old clerk_id ${matchingUser.id} with new clerk_id ${clerkUserId}`,
          );

          return new NextResponse(
            `Updated user with email ${matchingUser.email} to replace old clerk_id ${matchingUser.id} with new clerk_id ${clerkUserId}`,
            {
              status: 200,
            },
          );
        }
      } catch (err) {
        const message = (() => {
          if (err instanceof Error) {
            return err.message;
          } else {
            return `Unknown error in user.created Clerk Webhook. error: ${JSON.stringify(err)}`;
          }
        })();
        console.error("Clerk Webhook ERROR with user.created", err);

        return new NextResponse(message, {
          status: 500,
        });
      }
    }
  }

  // User deleted
  if (eventType === "user.deleted") {
    if (!whPayload.data.id) {
      return new Response("User ID is required", { status: 400 });
    }
    const deleteResult = await Users.deleteUser({
      userId: whPayload.data.id,
    });

    if (deleteResult.isErr()) {
      console.error(JSON.stringify(deleteResult.error));
      return new Response("DatabaseError", { status: 500 });
    }

    console.log("User deleted from DB.");
    return new Response("Webhook received", { status: 200 });
  }

  return Response.json(
    { code: "InvalidWebhookEvent", message: "Unknown webhook event" },
    { status: 404 },
  );
}
