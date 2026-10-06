"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import StoryPublisher from "@/components/StoryPublisher";
import { Icon } from "@/components/TravelUI";
import { useTravel } from "@/components/TravelProvider";
import {
  photos,
  validateFields,
  upsertRecord,
  deleteRecord,
} from "@/utils/travel-data.mjs";

const TripPlanner = dynamic(() => import("@/components/TripPlanner"), {
  loading: () => (
    <div className="panel planner-loading" role="status">
      Opening your trip planner…
    </div>
  ),
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
function date(value) {
  return dateFormatter.format(new Date(value + "T12:00:00Z"));
}
function Photo({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 600px) 100vw, (max-width: 1450px) 45vw, 25vw",
}) {
  return (
    <Image
      src={src || photos[0]}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="cover"
      unoptimized={src?.startsWith("data:") || src?.startsWith("/api/photos/")}
    />
  );
}
function TripCard({ trip, index }) {
  return (
    <Link
      href={`/dashboard/trip/${trip.id}`}
      className="trip-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="trip-photo">
        <Photo src={trip.image} alt={`${trip.city}, ${trip.country}`} />
        <span className={`status ${trip.status.toLowerCase()}`}>
          {trip.status === "Upcoming"
            ? "↗ "
            : trip.status === "Completed"
              ? "✓ "
              : "◌ "}
          {trip.status}
        </span>
        <span className="photo-arrow">
          <Icon name="arrow" />
        </span>
      </div>
      <div className="trip-card-body">
        <div className="eyebrow">
          <Icon name="pin" size={13} />
          {trip.country}
        </div>
        <h3>{trip.city}</h3>
        <p>{trip.title}</p>
        <div className="card-date">
          <Icon name="calendar" size={15} />
          {date(trip.start)} — {date(trip.end)}
        </div>
      </div>
    </Link>
  );
}
function NoteCard({ note, trip }) {
  return (
    <Link href={`/dashboard/note/${note.id}`} className="trip-card">
      <div className="trip-photo">
        <Photo src={note.image} alt={note.name} />
        <span className="status">{note.type}</span>
      </div>
      <div className="trip-card-body">
        <div className="eyebrow">
          {trip?.city || "Travel memory"} · {"★".repeat(Number(note.rating))}
        </div>
        <h3 className="note-title">{note.name}</h3>
        <p className="excerpt">{note.description}</p>
      </div>
    </Link>
  );
}
export function TravelPage({ mode, id }) {
  const { data, save, error, uploadPhoto } = useTravel();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All trips");
  const [sort, setSort] = useState("recent");
  const [formError, setFormError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const submission = useRef(false);
  const normalizedQuery = query.trim().toLowerCase();
  const tripsById = useMemo(
    () => new Map(data?.trips.map((trip) => [trip.id, trip]) || []),
    [data?.trips],
  );
  const visibleTrips = useMemo(
    () =>
      (data?.trips || [])
        .filter(
          (trip) =>
            (tab === "All trips" || trip.status === tab) &&
            `${trip.city} ${trip.country} ${trip.title}`
              .toLowerCase()
              .includes(normalizedQuery),
        )
        .sort((a, b) =>
          sort === "destination"
            ? a.city.localeCompare(b.city)
            : a.start.localeCompare(b.start),
        ),
    [data?.trips, tab, sort, normalizedQuery],
  );
  const visibleNotes = useMemo(
    () =>
      (data?.notes || []).filter((note) =>
        `${note.name} ${note.description}`
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    [data?.notes, normalizedQuery],
  );
  if (!data)
    return error ? (
      <div className="panel empty">
        <h1>We couldn’t load your workspace.</h1>
        <p role="alert">{error}</p>
        <button className="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    ) : (
      <div className="loading" role="status">
        <span className="loading-orbit" />
        Getting your adventures ready…
      </div>
    );
  const isNote = mode.startsWith("note");
  const item = id
    ? (isNote ? data.notes : data.trips).find((x) => x.id === id)
    : null;
  if (id && !item)
    return (
      <div className="empty panel">
        <Icon name="compass" size={40} />
        <h1>This adventure isn’t here.</h1>
        <p>It may have been removed, or belongs to a different account.</p>
        <Link
          className="button"
          href={isNote ? "/dashboard/note" : "/dashboard"}
        >
          Back to your workspace
        </Link>
      </div>
    );
  async function remove() {
    const saved = await save((current) =>
      deleteRecord(current, isNote ? "notes" : "trips", id),
    );
    if (saved) router.push(isNote ? "/dashboard/note" : "/dashboard");
  }
  async function submit(e) {
    e.preventDefault();
    if (submission.current) return;
    setFormError("");
    const submitted = new FormData(e.currentTarget);
    const fields = Object.fromEntries(submitted);
    for (const name of Object.keys(fields))
      if (typeof fields[name] === "string") fields[name] = fields[name].trim();
    delete fields.photo;
    const message = validateFields(fields, isNote, data.trips);
    if (message) {
      setFormError(message);
      return;
    }
    submission.current = true;
    setSaving(true);
    try {
      let image = item?.image || photos[0];
      const file = submitted.get("photo");
      if (file instanceof File && file.name && file.size > 0) {
        if (file.size > 2 * 1024 * 1024)
          throw new Error("Choose a photo smaller than 2 MB.");
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type))
          throw new Error("Choose a JPEG, PNG, WebP, or GIF photo.");
        image = await uploadPhoto(file);
      }
      const record = {
        ...item,
        ...fields,
        image,
        id: id || crypto.randomUUID(),
      };
      const collection = isNote ? "notes" : "trips";
      const saved = await save((current) =>
        upsertRecord(current, collection, record, Boolean(id)),
      );
      if (saved)
        router.push(`/dashboard/${isNote ? "note" : "trip"}/${record.id}`);
    } catch (error) {
      setFormError(error.message || "Unable to save. Please try again.");
    } finally {
      submission.current = false;
      setSaving(false);
    }
  }
  const notice = (
    <div className="preview-notice">
      <span>◌</span>
      <p>
        <strong>Your private travel workspace.</strong> Trips, plans, and
        memories are saved to your account. Only you can access them.
      </p>
    </div>
  );
  return (
    <div className="page-enter">
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {mode === "trips" ? (
        <>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                A LITTLE PLANNING. A WORLD OF POSSIBILITIES.
              </div>
              <h1>
                Your next chapter starts here<span>.</span>
              </h1>
              <p>
                Big adventures, small escapes. Keep every journey in one place.
              </p>
            </div>
            <Link className="button" href="/dashboard/trip/create">
              <Icon name="plus" size={18} />
              Plan a trip
            </Link>
          </div>
          <section className="dashboard-hero">
            <Photo
              sizes="(max-width: 600px) 100vw, 80vw"
              src={photos[3]}
              alt="A beautiful destination waiting to be explored"
              priority
            />
            <div className="hero-shade" />
            <div className="hero-copy">
              <span className="hero-kicker">
                FOR THE PLACES YOU HAVEN’T BEEN. YET.
              </span>
              <h2>
                Less scrolling.
                <br />
                More exploring.
              </h2>
              <p>Your next favorite memory is out there.</p>
              <Link href="/dashboard/trip/create" className="button light">
                Find your next adventure <Icon name="arrow" size={17} />
              </Link>
            </div>
            <span className="hero-caption">
              <Icon name="pin" size={14} /> A change of scenery, a fresh
              perspective
            </span>
          </section>
          <div className="stats">
            {[
              [data.trips.length, "Trips in your collection", "trips"],
              [
                data.trips.filter((x) => x.status !== "Completed").length,
                "Adventures ahead",
                "compass",
              ],
              [
                new Set(data.trips.map((x) => x.country)).size,
                "Countries explored & planned",
                "globe",
              ],
              [data.notes.length, "Memories captured", "notes"],
            ].map(([n, label, icon]) => (
              <div className="stat" key={label}>
                <span className="stat-icon">
                  <Icon name={icon} />
                </span>
                <div>
                  <strong>{String(n).padStart(2, "0")}</strong>
                  <p>{label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="section-heading">
            <div>
              <h2>
                My trips <span className="count">{data.trips.length}</span>
              </h2>
              <p>A collection of places, plans, and possibilities.</p>
            </div>
            <label className="search">
              <Icon name="search" size={17} />
              <input
                aria-label="Search trips"
                placeholder="Search destinations…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="filter-row">
            <div className="tabs">
              {["All trips", "Upcoming", "Planning", "Completed"].map((t) => (
                <button
                  key={t}
                  className={tab === t ? "selected" : ""}
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <label className="sort">
              Sort by{" "}
              <select
                aria-label="Sort trips"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recent">Date</option>
                <option value="destination">Destination</option>
              </select>
            </label>
          </div>
          <div className="card-grid">
            {visibleTrips.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))}
            <Link href="/dashboard/trip/create" className="add-card">
              <span>
                <Icon name="plus" size={25} />
              </span>
              <h3>Where to next?</h3>
              <p>
                A new place. A new story.
                <br />
                Start planning your next adventure.
              </p>
              <strong>
                Create a trip <Icon name="arrow" size={15} />
              </strong>
            </Link>
          </div>
          {visibleTrips.length === 0 && (
            <p className="empty" role="status">
              {normalizedQuery
                ? `No trips match “${query}” in this view.`
                : "No trips in this view yet."}
            </p>
          )}
          {notice}
        </>
      ) : mode === "notes" ? (
        <>
          <div className="page-heading">
            <div>
              <div className="eyebrow">THE MOMENTS THAT MAKE THE JOURNEY</div>
              <h1>
                Your travel journal<span>.</span>
              </h1>
              <p>Save the little details you’ll want to remember forever.</p>
            </div>
            <Link href="/dashboard/note/create" className="button">
              <Icon name="plus" />
              Add a memory
            </Link>
          </div>
          <label className="search journal-search">
            <Icon name="search" />
            <input
              aria-label="Search memories"
              placeholder="Find a memory…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="card-grid">
            {visibleNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                trip={tripsById.get(note.trip)}
              />
            ))}
          </div>
          {normalizedQuery &&
            visibleNotes.length === 0 &&
            data.notes.length > 0 && (
              <p className="empty" role="status">
                No memories match “{query}”.
              </p>
            )}
          {data.notes.length === 0 && (
            <div className="empty panel">
              <Icon name="notes" size={38} />
              <h2>Your story is waiting to be written.</h2>
              <p>
                Add your first memory, favorite meal, or unexpected discovery.
              </p>
              <Link href="/dashboard/note/create" className="button">
                Capture a moment
              </Link>
            </div>
          )}
          {notice}
        </>
      ) : mode.endsWith("form") ? (
        <>
          <Link
            className="back-link"
            href={isNote ? "/dashboard/note" : "/dashboard"}
          >
            ← Back to {isNote ? "journal" : "my trips"}
          </Link>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {isNote
                  ? "KEEP A LITTLE PIECE OF THE JOURNEY"
                  : "MAKE ROOM FOR SOMETHING NEW"}
              </div>
              <h1>
                {id ? "Edit your" : isNote ? "Capture a" : "Plan your next"}{" "}
                {isNote ? "memory" : "adventure"}
                <span>.</span>
              </h1>
              <p>
                {isNote
                  ? "A great meal. A hidden gem. A moment worth keeping."
                  : "Every great journey starts with a little inspiration."}
              </p>
            </div>
          </div>
          <div className="form-layout">
            <form
              key={`${mode}-${id || "new"}`}
              className="panel travel-form"
              onSubmit={submit}
              aria-busy={saving}
            >
              <fieldset disabled={saving} className="form-fields">
                <h2>{isNote ? "The moment" : "The essentials"}</h2>
                {isNote && data.trips.length === 0 && (
                  <p className="form-error">
                    Create a trip before adding a memory.{" "}
                    <Link href="/dashboard/trip/create">Plan a trip →</Link>
                  </p>
                )}
                <p className="form-intro">
                  {isNote
                    ? "Tell the story in your own words."
                    : "Give your next chapter a name and a destination."}
                </p>
                {isNote ? (
                  <>
                    <Field
                      name="name"
                      label="Memory title"
                      placeholder="A sunset I’ll never forget"
                      value={item?.name}
                    />
                    <label>
                      Related trip
                      <select
                        name="trip"
                        required
                        defaultValue={item?.trip || ""}
                      >
                        <option value="" disabled>
                          Choose a trip
                        </option>
                        {data.trips.map((t) => (
                          <option value={t.id} key={t.id}>
                            {t.city}, {t.country}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="form-row">
                      <label>
                        Category
                        <input name="type" list="journal-categories" defaultValue={item?.type || "Experience"} maxLength={40} required placeholder="Choose or name a category" />
                        <datalist id="journal-categories">
                          {Array.from(new Set(["Experience", "Dining", "Event", "General", "Nature", "Culture", "Hidden gem", "Stay", "People", ...data.notes.map(note => note.type)])).map(category => <option key={category} value={category} />)}
                        </datalist>
                        <small>Choose a suggestion or type your own category.</small>
                      </label>
                      <label>
                        Rating
                        <select name="rating" defaultValue={item?.rating || 5}>
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option value={n} key={n}>
                              {"★".repeat(n)} ({n}/5)
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <Field
                      name="title"
                      label="Trip name"
                      placeholder="Chasing the golden hour"
                      value={item?.title}
                    />
                    <div className="form-row">
                      <Field
                        name="city"
                        label="Destination / city"
                        placeholder="Lisbon"
                        value={item?.city}
                      />
                      <Field
                        name="country"
                        label="Country"
                        placeholder="Portugal"
                        value={item?.country}
                      />
                    </div>
                    <div className="form-row">
                      <Field
                        name="start"
                        label="Start date"
                        type="date"
                        value={item?.start}
                      />
                      <Field
                        name="end"
                        label="End date"
                        type="date"
                        value={item?.end}
                      />
                    </div>
                    <label>
                      Trip status
                      <select
                        name="status"
                        defaultValue={item?.status || "Planning"}
                      >
                        {["Planning", "Upcoming", "Completed"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
                <label>
                  {isNote ? "Your story" : "Notes & inspiration"}
                  <textarea
                    name="description"
                    rows={5}
                    required={isNote}
                    maxLength={10000}
                    defaultValue={item?.description || ""}
                    placeholder={
                      isNote
                        ? "What made this moment special?"
                        : "Places to see, things to try, reasons to go…"
                    }
                  />
                </label>
                <label className="upload">
                  <Icon name="plus" />
                  Add a {isNote ? "memory" : "cover"} photo
                  <input
                    type="file"
                    name="photo"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                  />
                  <small>Optional · up to 2 MB · private to your account</small>
                </label>
                {formError && (
                  <p className="form-error" role="alert">
                    {formError}
                  </p>
                )}
                <div className="form-actions">
                  <Link
                    className="button secondary"
                    href={isNote ? "/dashboard/note" : "/dashboard"}
                  >
                    Cancel
                  </Link>
                  <button
                    className="button"
                    type="submit"
                    disabled={saving || (isNote && data.trips.length === 0)}
                  >
                    {saving
                      ? "Saving…"
                      : id
                        ? "Save changes"
                        : isNote
                          ? "Save memory"
                          : "Create trip"}
                    <Icon name="arrow" size={17} />
                  </button>
                </div>
              </fieldset>
            </form>
            <aside className="form-aside">
              <div className="inspiration-photo">
                <Photo
                  src={isNote ? photos[2] : photos[1]}
                  alt="Travel inspiration"
                />
              </div>
              <div className="inspiration-copy">
                <div className="eyebrow">A FRIENDLY REMINDER</div>
                <h2>
                  {isNote
                    ? "The little things are the big things."
                    : "You don’t need to plan every moment."}
                </h2>
                <p>
                  {isNote
                    ? "Write it down while it’s fresh. Future you will be glad you did."
                    : "Start with a place and a date. Leave a little space for the unexpected."}
                </p>
              </div>
            </aside>
          </div>
          {notice}
        </>
      ) : (
        <>
          <Link
            className="back-link"
            href={isNote ? "/dashboard/note" : "/dashboard"}
          >
            ← Back to {isNote ? "journal" : "my trips"}
          </Link>
          <div className="detail-cover">
            <Photo
              sizes="(max-width: 600px) 100vw, 80vw"
              src={item.image}
              alt={isNote ? item.name : item.city}
              priority
            />
            <div className="hero-shade" />
            <div className="detail-title">
              <span className="hero-kicker">
                {isNote ? item.type : `${item.country} · ${item.status}`}
              </span>
              <h1>{isNote ? item.name : item.city}</h1>
              <p>{isNote ? "★".repeat(Number(item.rating)) : item.title}</p>
            </div>
          </div>
          <div className="detail-toolbar">
            <span>
              {isNote
                ? tripsById.get(item.trip)?.city
                : `${date(item.start)} — ${date(item.end)}`}
            </span>
            <div>
              <Link
                className="button secondary"
                href={`/dashboard/${isNote ? "note" : "trip"}/${id}/update`}
              >
                Edit {isNote ? "memory" : "trip"}
              </Link>
              <button
                className="delete-button"
                onClick={() => setConfirm(true)}
              >
                Delete
              </button>
            </div>
          </div>
          <section className="panel detail-description">
            <div className="eyebrow">{isNote ? "THE STORY" : "THE PLAN"}</div>
            <h2>{isNote ? "A moment worth remembering" : item.title}</h2>
            <p>
              {item.description ||
                "Your adventure is taking shape. Edit this trip to add your plans and inspiration."}
            </p>
          </section>
          {!isNote && item.sourceStory && <p className="panel detail-description">Inspired by <Link href={"/stories/"+item.sourceStory.id}>{item.sourceStory.author}’s travel story</Link>. Your dates and plans are your own.</p>}
          {!isNote && <StoryPublisher trip={item} notes={data.notes.filter(note => note.trip === item.id)} />}
          {!isNote && <TripPlanner key={item.id} trip={item} />}
          {!isNote && (
            <>
              <div className="section-heading">
                <div>
                  <h2>Memories from this trip</h2>
                  <p>Give your journey a story of its own.</p>
                </div>
                <Link
                  className="button secondary"
                  href="/dashboard/note/create"
                >
                  <Icon name="plus" />
                  Add a memory
                </Link>
              </div>
              <div className="card-grid">
                {data.notes
                  .filter((n) => n.trip === id)
                  .map((n) => (
                    <NoteCard key={n.id} note={n} trip={item} />
                  ))}
              </div>
              {!data.notes.some((n) => n.trip === id) && (
                <p className="empty panel">
                  No memories yet. Capture your first moment when inspiration
                  strikes.
                </p>
              )}
            </>
          )}
          {notice}
          {confirm && (
            <DeleteDialog
              isNote={isNote}
              onClose={() => setConfirm(false)}
              onDelete={remove}
            />
          )}
        </>
      )}
    </div>
  );
}
function Field({ name, label, placeholder, value, type = "text" }) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={value || ""}
        required
        maxLength={150}
      />
    </label>
  );
}

function DeleteDialog({ isNote, onClose, onDelete }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element.open) element.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal panel"
      aria-labelledby="delete-title"
      onCancel={onClose}
      onClose={onClose}
    >
      <h2 id="delete-title">Delete this {isNote ? "memory" : "trip"}?</h2>
      <p>
        {isNote
          ? "This memory will be removed from your account."
          : "This trip and its associated memories will be removed from your account."}{" "}
        This cannot be undone.
      </p>
      <div className="form-actions">
        <button className="button secondary" autoFocus onClick={onClose}>
          Keep it
        </button>
        <button className="button danger" onClick={onDelete}>
          Delete {isNote ? "memory" : "trip"}
        </button>
      </div>
    </dialog>
  );
}
