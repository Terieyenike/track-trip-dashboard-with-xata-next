import { createSupabase, configured } from "@/lib/supabase/server";
import { privateHeaders, appOrigin } from "@/lib/security.mjs";
import { NextResponse } from "next/server";
export async function GET(request) {
  const url = new URL(request.url);
  const origin = appOrigin(request);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (
    configured() &&
    token_hash &&
    ["signup", "recovery", "email"].includes(type)
  ) {
    const { error } = await (
      await createSupabase()
    ).auth.verifyOtp({ token_hash, type });
    if (!error)
      return NextResponse.redirect(
        new URL(
          type === "recovery" ? "/reset-password" : "/dashboard",
          origin,
        ),
        { headers: privateHeaders },
      );
  }
  return NextResponse.redirect(
    new URL("/sign-in?error=confirmation", origin),
    { headers: privateHeaders },
  );
}
