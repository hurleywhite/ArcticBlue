/*
  Middleware placeholder.

  Once Clerk is provisioned, replace this with:

    import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
    const isProtected = createRouteMatcher([
      "/dashboard(.*)",
      "/canvas(.*)",
      "/learning(.*)",
      "/use-cases(.*)",
      "/tools(.*)",
      "/admin(.*)",
    ]);
    export default clerkMiddleware((auth, req) => {
      if (isProtected(req)) auth().protect();
    });
    export const config = {
      matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js|json|jpg|jpeg|png|gif|svg|ico|webp|map)).*)", "/(api|trpc)(.*)"],
    };

  Until then, all routes are publicly viewable so the scaffold renders
  without requiring Clerk keys.
*/

import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
