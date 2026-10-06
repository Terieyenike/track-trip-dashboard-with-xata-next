"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand, Icon } from "@/components/TravelUI";
import { useState } from "react";
import { useTravel, TravelProvider } from "@/components/TravelProvider";

export function Workspace({ children, user }) {
  return (
    <TravelProvider user={user} key={user.id}>
      <WorkspaceShell>{children}</WorkspaceShell>
    </TravelProvider>
  );
}
function WorkspaceShell({ children }) {
  const path = usePathname();
  const { user, busy, localPreview, importPreview, error } = useTravel();
  const [signingOut, setSigningOut] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [importing, setImporting] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [hideImport, setHideImport] = useState(false);
  async function signOut() {
    if (signingOut || busy) return;
    setSigningOut(true);
    setAccountError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign-out" }),
      });
      if (!response.ok) throw new Error("Unable to sign out. Please retry.");
      window.location.replace("/sign-in");
    } catch (failure) {
      setAccountError(failure.message);
      setSigningOut(false);
    }
  }
  async function importLocal() {
    if (importing) return;
    setImporting(true);
    const saved = await importPreview();
    setImporting(false);
    if (saved) setConfirmImport(false);
  }
  const initial = user.email?.[0]?.toUpperCase() || "T";
  return (
    <div className="workspace">
      <a href="#content" className="skip">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Workspace">
          {user.isAdmin && <Link className="nav-link" href="/admin/reports"><Icon name="notes" />Review inbox</Link>}
          <Link className={path.includes("/stories/create") ? "nav-link active" : "nav-link"} href="/dashboard/stories/create"><Icon name="plus" />Create a story</Link>
          <Link className="nav-link" href="/saved-stories"><Icon name="notes" />Saved stories</Link>
          <Link className="nav-link" href="/explore"><Icon name="globe" />Travel stories</Link>
          <Link
            className={
              path === "/dashboard" || path.includes("/trip/")
                ? "nav-link active"
                : "nav-link"
            }
            href="/dashboard"
          >
            <Icon name="trips" />
            My trips
          </Link>
          <Link
            className={path.includes("/note") ? "nav-link active" : "nav-link"}
            href="/dashboard/note"
          >
            <Icon name="notes" />
            Travel journal
          </Link>
          <Link className="nav-link" href="/dashboard/trip/create">
            <Icon name="plus" />
            Plan a new trip
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="little-promo">
            <Icon name="globe" size={28} />
            <h3>The world is waiting.</h3>
            <p>Make a little room for your next adventure.</p>
            <Link href="/dashboard/trip/create">
              Let’s plan it <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="profile">
            <span className="avatar">{initial}</span>
            <div>
              <strong className="account-email">{user.email}</strong>
              <small>Private account</small>
            </div>
            <span className="online" />
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <span>
            Workspace <span className="slash">/</span>{" "}
            {path.includes("/stories/create") ? "Create a story" : path.includes("/note") ? "Travel journal" : "My trips"}
          </span>
          <div className="topbar-right">
            <span className="preview-pill">● Private workspace</span>
            <button
              className="text-link sign-out"
              onClick={signOut}
              disabled={signingOut || busy}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
            <span className="avatar small">{initial}</span>
          </div>
        </header>
        <main id="content" className="content">
          {accountError && (
            <p className="form-error" role="alert">
              {accountError}
            </p>
          )}
          {localPreview && !hideImport && (
            <aside className="local-import panel">
              <div className="import-notice-heading"><strong>Older trips saved on this device</strong><button className="text-link" onClick={()=>setHideImport(true)} aria-label="Dismiss import notice">Dismiss</button></div>
              <p>
                {localPreview.trips} trips and{" "}
                {localPreview.notes} memories. Import a copy into {user.email}.
                Some may be samples. Originals stay on this
                device.
              </p>
              {confirmImport ? (
                <>
                  <p>
                    Only import records that belong to you. They will be copied
                    to this account’s cloud workspace.
                  </p>
                  {error && (
                    <p role="alert" className="form-error">
                      {error}
                    </p>
                  )}
                  <div className="form-actions">
                    <button
                      className="button"
                      disabled={busy || importing}
                      onClick={importLocal}
                    >
                      {importing ? "Importing…" : "Import into my account"}
                    </button>
                    <button
                      className="button secondary"
                      disabled={importing}
                      onClick={() => setConfirmImport(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <button
                  className="text-link"
                  disabled={busy || importing}
                  onClick={() => setConfirmImport(true)}
                >
                  Review import →
                </button>
              )}
            </aside>
          )}
          <fieldset
            className="workspace-fields"
            disabled={busy || importing || signingOut}
          >
            {children}
          </fieldset>
          {busy && (
            <p className="save-status" role="status">
              Saving to your account…
            </p>
          )}
        </main>
        <footer className="workspace-footer">
          Made for the journey, and everything along the way.
          <span>Track Trips © 2026</span>
        </footer>
      </div>
    </div>
  );
}
