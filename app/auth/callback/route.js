import { createSupabase, configured } from "@/lib/supabase/server";
import { safeNext, privateHeaders, appOrigin } from "@/lib/security.mjs";
import { NextResponse } from "next/server";
export async function GET(request) {
  const url = new URL(request.url);
  const origin = appOrigin(request);
  const code = url.searchParams.get("code");
  if (configured() && code) {
    const client = await createSupabase();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeNext(url.searchParams.get("next")), origin),
        { headers: privateHeaders },
      );
  }
  return NextResponse.redirect(
    new URL("/sign-in?error=confirmation", origin),
    { headers: privateHeaders },
  );
}
