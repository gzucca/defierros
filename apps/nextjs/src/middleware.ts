// export { auth as middleware } from "@defierros/auth";

// // Or like this if you need to do something here.
// // export default auth((req) => {
// //   console.log(req.auth) //  { session: { user: { ... } } }
// // })

// // Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/setup-account(.*)",
]);

export default clerkMiddleware(async (auth, req, _res) => {
  const authObject = await auth();
  const userId = authObject.userId;

  if (!userId && isProtectedRoute(req)) {
    return authObject.redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
