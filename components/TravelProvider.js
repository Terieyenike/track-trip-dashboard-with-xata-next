"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { parseTravelData, storageKey } from "@/utils/travel-data.mjs";
const TravelContext = createContext(null);
export function TravelProvider({ children, user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);
  const state = useRef({ data: null, revision: 0 });
  const queue = useRef(Promise.resolve());
  const request = useCallback(
    async (options) => {
      const response = await fetch("/api/workspace", {
        cache: "no-store",
        ...options,
      });
      const body = await response.json();
      if (response.status === 401) {
        state.current = { data: null, revision: 0 };
        setData(null);
        window.location.replace("/sign-in");
        throw new Error("Your session ended. Please sign in again.");
      }
      if (!response.ok) {
        const failure = new Error(
          body.error || "Unable to reach your workspace.",
        );
        failure.status = response.status;
        throw failure;
      }
      if (body.userId !== user.id) {
        state.current = { data: null, revision: 0 };
        setData(null);
        window.location.replace("/dashboard");
        throw new Error(
          "Your signed-in account changed. Reloading your workspace.",
        );
      }
      const checked = parseTravelData(JSON.stringify(body.data));
      state.current = { data: checked, revision: body.revision };
      setData(checked);
      return checked;
    },
    [user.id],
  );
  const reload = useCallback(async () => {
    try {
      await request();
      setError("");
    } catch (failure) {
      setError(failure.message);
    }
  }, [request]);
  useEffect(() => {
    let active = true;
    const initialize = async () => {
      await reload();
      if (!active) return;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw !== null) {
          const saved = parseTravelData(raw);
          setLocalPreview({
            trips: saved.trips.length,
            notes: saved.notes.length,
          });
        }
      } catch {
        /* Keep unreadable legacy data untouched. */
      }
    };
    queue.current = queue.current.then(initialize, initialize);
    return () => {
      active = false;
    };
  }, [reload, user.id]);
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) queue.current = queue.current.then(reload, reload);
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, [reload]);
  const save = useCallback(
    (update) => {
      const operation = async () => {
        setBusy(true);
        try {
          if (!state.current.data)
            throw new Error("Reload your workspace before saving.");
          const next = parseTravelData(
            JSON.stringify(update(state.current.data)),
          );
          await request({
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: next,
              revision: state.current.revision,
              userId: user.id,
            }),
          });
          setError("");
          return true;
        } catch (failure) {
          if (failure.status === 409) {
            try {
              await request();
            } catch {
              /* Keep the visible save failure. */
            }
          }
          setError(failure.message);
          return false;
        } finally {
          setBusy(false);
        }
      };
      const task = queue.current.then(operation, operation);
      queue.current = task.then(
        () => {},
        () => {},
      );
      return task;
    },
    [request, user.id],
  );
  const uploadPhoto = useCallback(
    async (file) => {
      const form = new FormData();
      form.set("photo", file);
      const response = await fetch("/api/photos", {
        method: "POST",
        headers: { "X-Workspace-Account": user.id },
        body: form,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to upload photo.");
      return result.image;
    },
    [user.id],
  );
  const importPreview = useCallback(async () => {
    if (busy) return false;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) throw new Error("No browser preview was found.");
      const preview = parseTravelData(raw);
      const ids = new Map();
      const trips = [];
      const notes = [];
      for (const trip of preview.trips) {
        const id = crypto.randomUUID();
        ids.set(trip.id, id);
        trips.push({ ...trip, id });
      }
      for (const note of preview.notes)
        notes.push({
          ...note,
          id: crypto.randomUUID(),
          trip: ids.get(note.trip),
        });
      for (const record of [...trips, ...notes]) {
        if (record.image?.startsWith("data:")) {
          const image = await fetch(record.image);
          const blob = await image.blob();
          record.image = await uploadPhoto(
            new File([blob], "imported-photo", { type: blob.type }),
          );
        } else if (record.image?.startsWith("/api/photos/"))
          throw new Error(
            "Cloud photos cannot be imported from another account.",
          );
      }
      const saved = await save((current) => ({
        trips: [...current.trips, ...trips],
        notes: [...current.notes, ...notes],
      }));
      if (saved) setLocalPreview(null);
      return saved;
    } catch (failure) {
      setError(failure.message);
      return false;
    }
  }, [busy, save, uploadPhoto]);
  const value = useMemo(
    () => ({
      data,
      save,
      error,
      busy,
      user,
      reload,
      uploadPhoto,
      localPreview,
      importPreview,
    }),
    [
      data,
      save,
      error,
      busy,
      user,
      reload,
      uploadPhoto,
      localPreview,
      importPreview,
    ],
  );
  return (
    <TravelContext.Provider value={value}>{children}</TravelContext.Provider>
  );
}
export function useTravel() {
  const value = useContext(TravelContext);
  if (!value)
    throw new Error("Travel pages must be inside the workspace provider.");
  return value;
}
