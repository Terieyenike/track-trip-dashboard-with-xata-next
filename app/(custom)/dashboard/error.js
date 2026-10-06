"use client";
import Link from "next/link";
export default function ErrorPage({ reset }) {
  return (
    <section className="empty panel" role="alert">
      <h1>Let’s get your journey back on track.</h1>
      <p>
        This page couldn’t load. Your saved browser data has not been cleared.
      </p>
      <div className="form-actions">
        <Link className="button secondary" href="/dashboard">
          Back to trips
        </Link>
        <button className="button" onClick={reset}>
          Try again
        </button>
      </div>
    </section>
  );
}
