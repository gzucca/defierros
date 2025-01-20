CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "Bids" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"ammount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"paymentId" varchar(64),
	"carId" varchar(64) NOT NULL,
	"userId" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Cars" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"adminUploaderId" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"postType" varchar(64) DEFAULT 'auction' NOT NULL,
	"ownerSelling" boolean DEFAULT false NOT NULL,
	"relationshipOwner" varchar(128),
	"province" varchar(128) NOT NULL,
	"city" varchar(128) NOT NULL,
	"zipCode" varchar(32) NOT NULL,
	"brand" varchar(128) NOT NULL,
	"model" varchar(128) NOT NULL,
	"year" integer NOT NULL,
	"minPrice" integer DEFAULT 0,
	"startingPrice" integer DEFAULT 100,
	"endTime" timestamp with time zone,
	"kilometers" integer DEFAULT 0,
	"engine" varchar(128) NOT NULL,
	"transmission" varchar(128) NOT NULL,
	"driveTrain" varchar(128),
	"bodyType" varchar(128) NOT NULL,
	"color" varchar(128),
	"highlights" text NOT NULL,
	"equipment" text,
	"modifications" text,
	"knownFlaws" text,
	"services" text,
	"addedItems" text,
	"domain" varchar(128),
	"inspection" varchar(128),
	"images" text[] DEFAULT '{}'::text[],
	"transferCost" integer DEFAULT 0,
	"views" integer DEFAULT 0,
	"privacy" varchar(32) DEFAULT 'admins-only' NOT NULL,
	"sold" boolean DEFAULT false NOT NULL,
	"userId" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Comments" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"message" text NOT NULL,
	"carId" varchar(64) NOT NULL,
	"userId" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DollarValue" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"value" numeric DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payments" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone,
	"value" numeric DEFAULT '0' NOT NULL,
	"paymentType" varchar(64) NOT NULL,
	"state" varchar(64) DEFAULT 'pending' NOT NULL,
	"userId" varchar(64) NOT NULL,
	"mpTransactionId" varchar(64),
	"sellerId" varchar(64),
	"carId" varchar(64) NOT NULL,
	"dollarValueId" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "Replies" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"message" text NOT NULL,
	"commentId" varchar(64) NOT NULL,
	"userId" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(128),
	"email" varchar(128),
	"auth0Id" varchar(128),
	"sellerType" varchar(64) DEFAULT 'privateParty' NOT NULL,
	"userName" varchar(128),
	"profilePicture" varchar(128),
	"phoneNumber" varchar(128),
	"isActive" boolean DEFAULT true NOT NULL,
	"isAdmin" boolean DEFAULT false NOT NULL,
	"favorites" text[] DEFAULT '{}',
	"mercadoPagoId" varchar(128),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Bids" ADD CONSTRAINT "Bids_paymentId_Payments_id_fk" FOREIGN KEY ("paymentId") REFERENCES "public"."Payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Bids" ADD CONSTRAINT "Bids_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "public"."Cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Bids" ADD CONSTRAINT "Bids_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cars" ADD CONSTRAINT "Cars_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "public"."Cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "public"."Cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_dollarValueId_DollarValue_id_fk" FOREIGN KEY ("dollarValueId") REFERENCES "public"."DollarValue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_commentId_Comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."Comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;