import { configured, createSupabase } from "@/lib/supabase/server";
import { sameOrigin, privateHeaders, limitedBody, appOrigin } from "@/lib/security.mjs";
export const dynamic = "force-dynamic";
const json = (body, status = 200) =>
  Response.json(body, { status, headers: privateHeaders });
export async function POST(request) {
  if (!sameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }
  if (!configured())
    return json(
      {
        error:
          "Account setup is pending. Connect the Supabase project to enable sign-in.",
      },
      503,
    );
  if (Number(request.headers.get("content-length") || 0) > 10000)
    return json({ error: "Request too large." }, 413);
  let input;
  try {
    const bytes = await limitedBody(request, 10000);
    input = JSON.parse(new TextDecoder().decode(bytes));
  } catch (failure) {
    return json(
      {
        error:
          failure.status === 413 ? "Request too large." : "Invalid request.",
      },
      failure.status || 400,
    );
  }
  const { action, email, password } = input;
  const client = await createSupabase();
  try {
    if (action === "sign-out") {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error)
        return json({ error: "Unable to sign out. Please retry." }, 503);
      return json({ ok: true });
    }
    if (
      !["sign-in", "sign-up", "forgot-password", "reset-password"].includes(
        action,
      )
    )
      return json({ error: "Invalid action." }, 400);
    if (
      action !== "reset-password" &&
      (typeof email !== "string" ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    )
      return json({ error: "Enter a valid email address." }, 400);
    if (
      action !== "forgot-password" &&
      (typeof password !== "string" ||
        password.length > 128 ||
        (action !== "sign-in" && password.length < 12))
    )
      return json(
        { error: "Use a password between 12 and 128 characters." },
        400,
      );
    const origin = appOrigin(request);
    if (action === "sign-in") {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error)
        return json(
          {
            error:
              "Unable to sign in. Check your details and email confirmation, then retry.",
          },
          400,
        );
      return json({ ok: true });
    }
    if (action === "sign-up") {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: origin + "/auth/callback" },
      });
      if (error)
        return json(
          { error: error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit" ? "Too many attempts. Please wait a few minutes before trying again." : "Unable to create the account. Please try again later." },
          400,
        );
      return json({
        ok: true,
        signedIn: Boolean(data.session),
        message:
          "Check your email to confirm your account. If this address already has an account, sign in or reset your password.",
      });
    }
    if (action === "forgot-password") {
      await client.auth.resetPasswordForEmail(email, {
        redirectTo: origin + "/auth/callback?next=/reset-password",
      });
      return json({
        ok: true,
        message:
          "If the address has an account, you will receive a password reset link.",
      });
    }
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();
    if (authError || !user)
      return json({ error: "Open a valid password reset link first." }, 401);
    const { error } = await client.auth.updateUser({ password });
    if (error)
      return json(
        {
          error:
            "Unable to update your password. Request a fresh reset link and retry.",
        },
        400,
      );
    await client.auth.signOut({ scope: "others" });
    return json({ ok: true });
  } catch {
    return json(
      { error: "The account service is unavailable. Please retry." },
      503,
    );
  }
}
