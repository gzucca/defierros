import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const Account = pgTable(
  "account",
  {
    userId: uuid()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar({ length: 255 }).notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    refresh_token: varchar({ length: 255 }),
    access_token: text(),
    expires_at: integer(),
    token_type: varchar({ length: 255 }),
    scope: varchar({ length: 255 }),
    id_token: text(),
    session_state: varchar({ length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdate(() => new Date()),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const User = pgTable("user", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 255 }),
  email: t.varchar({ length: 255 }).notNull(),
  emailVerified: t.timestamp({ mode: "date", withTimezone: true }),
  image: t.varchar({ length: 255 }),
}));

export const UserRelations = relations(User, ({ many }) => ({
  accounts: many(Account),
}));

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const Session = pgTable("session", (t) => ({
  sessionToken: t.varchar({ length: 255 }).notNull().primaryKey(),
  userId: t
    .uuid()
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
}));

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));

export const Cars = pgTable("Cars", (t) => ({
  // car_UUID
  id: t.varchar({ length: 64 }).notNull().primaryKey(),
  adminUploaderId: t.varchar({ length: 64 }),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdate(() => new Date()),
  postType: t
    .varchar({ length: 64 })
    .$type<"auction" | "sale">()
    .notNull()
    .default("auction"),
  ownerSelling: t.boolean().notNull().default(false),
  relationshipOwner: t.varchar({ length: 128 }),
  province: t.varchar({ length: 128 }).notNull(),
  city: t.varchar({ length: 128 }).notNull(),
  zipCode: t.varchar({ length: 32 }).notNull(),
  brand: t.varchar({ length: 128 }).notNull(),
  model: t.varchar({ length: 128 }).notNull(),
  year: t.integer().notNull(),
  minPrice: t.integer().default(0).notNull(),
  startingPrice: t.integer().default(100).notNull(),
  endTime: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
  kilometers: t.integer().default(0).notNull(),
  engine: t.varchar({ length: 128 }).notNull(),
  transmission: t.varchar({ length: 128 }).notNull(),
  driveTrain: t.varchar({ length: 128 }),
  bodyType: t.varchar({ length: 128 }).notNull(),
  color: t.varchar({ length: 128 }),
  highlights: t.text().notNull(),
  equipment: t.text(),
  modifications: t.text(),
  knownFlaws: t.text(),
  services: t.text(),
  addedItems: t.text(),
  domain: t.varchar({ length: 128 }),
  inspection: t.varchar({ length: 128 }),
  images: t
    .text("images")
    .array()
    .default(sql`'{}'::text[]`),
  transferCost: t.integer().default(0),
  views: t.integer().default(0),
  privacy: t
    .varchar({ length: 32 })
    .$type<"public" | "owner-only" | "admins-only">()
    .notNull()
    .default("admins-only"),
  sold: t.boolean().notNull().default(false),
  userId: t
    .varchar({ length: 64 })
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
}));

export const Bids = pgTable("Bids", (t) => ({
  // bid_UUID
  id: t.varchar({ length: 64 }).notNull().primaryKey(),
  amount: t.integer().notNull().default(0),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  paymentId: t.varchar({ length: 64 }).references(() => Payments.id),
  carId: t
    .varchar({ length: 64 })
    .notNull()
    .references(() => Cars.id, { onDelete: "cascade" }),
  userId: t
    .varchar({ length: 64 })
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
}));

export const CarsRelations = relations(Cars, ({ many }) => ({
  bids: many(Bids),
}));

export const BidsRelations = relations(Bids, ({ one }) => ({
  car: one(Cars, { fields: [Bids.carId], references: [Cars.id] }),
  payment: one(Payments, {
    fields: [Bids.paymentId],
    references: [Payments.id],
  }),
  user: one(Users, { fields: [Bids.userId], references: [Users.id] }),
}));

export const Users = pgTable("Users", (t) => ({
  // user_UUID
  id: t.varchar({ length: 64 }).notNull().primaryKey(),
  name: t.varchar({ length: 128 }),
  email: t.varchar({ length: 128 }).notNull().unique(),
  clerkId: t.varchar({ length: 128 }).notNull().unique(),
  sellerType: t
    .varchar({ length: 64 })
    .$type<"privateParty" | "dealership">()
    .notNull()
    .default("privateParty"),
  userName: t.varchar({ length: 128 }),
  profilePicture: t.varchar({ length: 256 }),
  phoneNumber: t.varchar({ length: 128 }),
  isActive: t.boolean().notNull().default(true),
  isAdmin: t.boolean().notNull().default(false),
  favorites: t.text("favorites").array().default([]),
  mercadoPagoId: t.varchar({ length: 128 }),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdate(() => new Date()),
}));

export const usersRelations = relations(Users, ({ many }) => ({
  cars: many(Cars),
  bids: many(Bids),
  comments: many(Comments),
  replies: many(Replies),
  payments: many(Payments),
}));

export const Comments = pgTable("Comments", (t) => ({
  // comment_UUID
  id: t.varchar({ length: 64 }).notNull().primaryKey(),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdate(() => new Date()),
  message: t.text().notNull(),
  carId: t
    .varchar({ length: 64 })
    .notNull()
    .references(() => Cars.id, { onDelete: "cascade" }),
  userId: t
    .varchar({ length: 64 })
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
}));

export const commentsRelations = relations(Comments, ({ one }) => ({
  car: one(Cars, { fields: [Comments.carId], references: [Cars.id] }),
}));

export const Replies = pgTable("Replies", (t) => ({
  // reply_UUID
  id: t.varchar({ length: 64 }).notNull().primaryKey(),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdate(() => new Date()),
  message: t.text().notNull(),
  commentId: t
    .varchar({ length: 64 })
    .notNull()
    .references(() => Comments.id, { onDelete: "cascade" }),
  userId: t
    .varchar({ length: 64 })
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
}));

export const repliesRelations = relations(Replies, ({ one }) => ({
  comment: one(Comments, {
    fields: [Replies.commentId],
    references: [Comments.id],
  }),
}));

export const DollarValue = pgTable("DollarValue", (t) => ({
  // dollarValue_UUID
  id: t.varchar({ length: 64 }).notNull().primaryKey(),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  value: t.numeric().default("0").notNull(),
}));

export const Payments = pgTable("Payments", (t) => ({
  // payment_UUID
  id: t.varchar({ length: 64 }).notNull().primaryKey(),
  createdAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdate(() => new Date()),
  value: t.numeric().default("0").notNull(),
  paymentType: t
    .varchar({ length: 64 })
    .$type<"auction-bid" | "sale" | "renew">()
    .notNull(),
  state: t.varchar({ length: 64 }).notNull().default("pending"),
  userId: t.varchar({ length: 64 }).notNull(),
  mpTransactionId: t.varchar({ length: 64 }),
  sellerId: t.varchar({ length: 64 }),
  carId: t
    .varchar({ length: 64 })
    .notNull()
    .references(() => Cars.id, { onDelete: "cascade" }),
  dollarValueId: t
    .varchar({ length: 64 })
    .notNull()
    .references(() => DollarValue.id, { onDelete: "cascade" }),
}));

export const paymentsRelations = relations(Payments, ({ one }) => ({
  dollarValue: one(DollarValue, {
    fields: [Payments.dollarValueId],
    references: [DollarValue.id],
  }),
  car: one(Cars, { fields: [Payments.carId], references: [Cars.id] }),
}));
