import type { Metadata, Viewport } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@defierros/ui";
import { ThemeProvider, ThemeToggle } from "@defierros/ui/theme";
import { Toaster } from "@defierros/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { initMercadoPago } from "@mercadopago/sdk-react";

import { env } from "@defierros/env";


// if (typeof window !== "undefined") {
//   // checks that we are client-side
//   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
//     capture_pageview: false,
//     api_host:
//       process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
//     person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
//     loaded: (posthog) => {
//       if (env.ENV === "development") posthog.debug(); // debug mode in development
//     },
//   });
// }

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? env.NEXT_PUBLIC_CLIENT_URL
      : "http://localhost:3000",
  ),
  title: "Defierros",
  description: "Simple monorepo with shared backend for web & mobile apps",
  openGraph: {
    title: "Defierros",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: env.NEXT_PUBLIC_CLIENT_URL,
    siteName: "Defierros",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jullerino",
    creator: "@jullerino",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "bg-background text-foreground min-h-screen font-sans antialiased",
            GeistSans.variable,
            GeistMono.variable,
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <TRPCReactProvider>{props.children}</TRPCReactProvider>
            <div className="fixed right-4 bottom-4">
              <ThemeToggle />
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
