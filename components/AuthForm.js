"use client";
import { useState } from "react";
import Link from "next/link";
import { Brand, Icon } from "@/components/TravelUI";
const titles = {
  "sign-in": "Welcome back.",
  "sign-up": "Your next chapter starts here.",
  "forgot-password": "Find your way back.",
  "reset-password": "A fresh start.",
};
export default function AuthForm({ mode, enabled, confirmationError = false, destination = "/dashboard" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    confirmationError
      ? "This confirmation link is invalid or expired. Request a fresh link or try signing in."
      : "",
  );
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (fields.confirm !== undefined && fields.password !== fields.confirm) {
      setError("The passwords do not match.");
      setBusy(false);
      return;
    }
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          email: fields.email,
          password: fields.password,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to continue.");
      if (mode === "sign-in" || mode === "reset-password" || body.signedIn)
        window.location.assign(
          new URL(mode === "sign-in" ? destination : "/dashboard", window.location.origin).href,
        );
      else setMessage(body.message);
    } catch (failure) {
      setError(failure.message || "Unable to connect. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <Brand />
      <section className="panel auth-panel">
        <div className="eyebrow">MADE FOR YOUR JOURNEY</div>
        <h1>{titles[mode]}</h1>
        <p>
          {mode === "sign-up"
            ? "Plan your trips and keep your memories in your own private workspace."
            : mode === "forgot-password"
              ? "We’ll email you a link to reset your password."
              : mode === "reset-password"
                ? "Choose a new password for your account."
                : "Sign in to your trips, plans, and travel journal."}
        </p>
        {!enabled && (
          <p className="form-error" role="status">
            Accounts are being set up. Sign-in will be available once the
            workspace is connected.
          </p>
        )}
        <form onSubmit={submit}>
          <fieldset disabled={busy || !enabled} className="form-fields">
            {mode !== "reset-password" && (
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
            )}
            {mode !== "forgot-password" && (
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete={
                    mode === "sign-in" ? "current-password" : "new-password"
                  }
                  required
                  minLength={mode === "sign-in" ? 1 : 12}
                  maxLength={128}
                />
                {mode !== "sign-in" && (
                  <small>
                    At least 12 characters. A unique passphrase works well.
                  </small>
                )}
              </label>
            )}
            {mode === "reset-password" && (
              <label>
                Confirm password
                <input
                  type="password"
                  name="confirm"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                />
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="auth-message" role="status">
                {message}
              </p>
            )}
            <button className="button" type="submit">
              {busy
                ? "Please wait…"
                : mode === "sign-up"
                  ? "Create account"
                  : mode === "forgot-password"
                    ? "Send reset link"
                    : mode === "reset-password"
                      ? "Update password"
                      : "Sign in"}
              <Icon name="arrow" size={17} />
            </button>
          </fieldset>
        </form>
        <div className="auth-links">
          {mode === "sign-in" ? (
            <>
              <Link href="/forgot-password">Forgot password?</Link>
              <span>
                New here? <Link href="/sign-up">Create an account</Link>
              </span>
            </>
          ) : (
            <Link href="/sign-in">Back to sign in</Link>
          )}
        </div>
        <p className="auth-footnote">
          Your account has its own trips and journal. Existing browser-local
          previews stay on this device.
        </p>
      </section>
      <Link className="text-link" href="/">
        ← Back to Track Trips
      </Link>
    </main>
  );
}
