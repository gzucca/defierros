export interface DiscordAuthor {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  public_flags: number;
  flags: number;
  bot: boolean;
  banner: string | null;
  accent_color: number | null;
  global_name: string | null;
  avatar_decoration_data: string | null;
  banner_color: string | null;
  clan: string | null;
  primary_guild: string | null;
}

export interface DiscordMessage {
  type: number;
  content: string;
  mentions: string[];
  mention_roles: string[];
  attachments: string[];
  embeds: unknown[];
  timestamp: string;
  edited_timestamp: string | null;
  flags: number;
  components: unknown[];
  id: string;
  channel_id: string;
  author: DiscordAuthor;
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
}

export interface DiscordResponse {
  success: boolean;
  message: string;
}

