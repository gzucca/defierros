ALTER TABLE "Users" RENAME COLUMN "auth0Id" TO "clerkId";--> statement-breakpoint
ALTER TABLE "Bids" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Cars" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Cars" ALTER COLUMN "minPrice" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Cars" ALTER COLUMN "startingPrice" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Cars" ALTER COLUMN "endTime" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Cars" ALTER COLUMN "kilometers" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Comments" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "DollarValue" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Payments" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Replies" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "profilePicture" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Comments" ADD COLUMN "updatedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Replies" ADD COLUMN "updatedAt" timestamp with time zone;