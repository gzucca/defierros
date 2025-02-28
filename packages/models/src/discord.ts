import { err, ok } from "neverthrow";

import type { Types } from "@defierros/types";
import { env } from "@defierros/env";

const channelId = "1345027822028066866"; // Replace with your Discord channel ID
const botToken = env.DISCORD_BOT_TOKEN; // Replace with your bot token

function isDiscordMessage(value: unknown): value is Types.DiscordMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "content" in value &&
    "id" in value &&
    "channel_id" in value &&
    "author" in value
  );
}

export async function Discord_sendMessage(
  message: string,
): Types.ModelPromise<Types.DiscordResponse> {
  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${botToken}`,
      },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      throw new Error(`Error sending message: ${response.statusText}`);
    }

    const data = (await response.json()) as unknown;
    if (!isDiscordMessage(data)) {
      throw new Error("Invalid response format from Discord API");
    }
    console.log("Message sent:", data);
    return ok({ success: true, message: JSON.stringify(data) });
  } catch (error) {
    console.error("Failed to send Discord message:", error);
    return err({
      code: "DiscordError",
      message: "Failed to send Discord message",
    });
  }
}
