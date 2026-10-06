import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    if (request.nextUrl.pathname.startsWith("/dashboard"))
      return NextResponse.redirect(new URL("/sign-in", request.url));
    return response;
  }
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values) => {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          response.headers.set("Cache-Control", "private, no-store");
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  let user = null;
  try {
    const { data } = await client.auth.getUser();
    user = data.user;
  } catch {
    /* Fail closed if auth cannot be verified. */
  }
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const signIn = new URL("/sign-in", request.url);
    if (request.nextUrl.pathname === "/dashboard/stories/create") signIn.searchParams.set("next", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(signIn);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }
  return response;
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/auth/:path*",
    "/reset-password",
  ],
};
