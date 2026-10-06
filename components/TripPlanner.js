"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/TravelUI";
import { useTravel } from "@/components/TravelProvider";
import {
  activityTypes,
  currencies,
  emptyPlan,
  getBudget,
  itineraryText,
  saveActivity,
  shiftDate,
  sortedActivities,
  toCents,
  tripLength,
  updateTripPlan,
} from "@/utils/trip-plan.mjs";

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const showDay = (value) => dayFormatter.format(new Date(value + "T12:00:00Z"));
function download(contents, type, name) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function PlanDialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="panel plan-dialog"
      aria-labelledby="plan-dialog-title"
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="plan-dialog-heading">
        <h2 id="plan-dialog-title">{title}</h2>
        <button
          className="icon-button"
          aria-label="Close editor"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function TripPlanner({ trip }) {
  const { data, save, error } = useTravel();
  const plan = trip.plan || emptyPlan();
  const [day, setDay] = useState(trip.start);
  const [week, setWeek] = useState(trip.start);
  const [editor, setEditor] = useState(null);
  const [budgetEditor, setBudgetEditor] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [undo, setUndo] = useState(null);
  const activities = useMemo(
    () => sortedActivities(plan.activities),
    [plan.activities],
  );
  const budget = getBudget(plan);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: plan.currency,
      }),
    [plan.currency],
  );
  const money = (value) => currencyFormatter.format(value / 100);
  const stopsByDay = useMemo(() => {
    const counts = new Map();
    for (const activity of activities)
      counts.set(activity.date, (counts.get(activity.date) || 0) + 1);
    return counts;
  }, [activities]);
  const selectedDay = day < trip.start || day > trip.end ? trip.start : day;
  const firstDay = week < trip.start || week > trip.end ? trip.start : week;
  const days = Array.from({ length: 7 }, (_, index) =>
    shiftDate(firstDay, index),
  ).filter((date) => date <= trip.end);
  const dayActivities = activities.filter((item) => item.date === selectedDay);
  const outside = activities.filter(
    (item) => item.date < trip.start || item.date > trip.end,
  );
  const packed = plan.packing.filter((item) => item.done).length;
  async function mutate(update, success) {
    setFormError("");
    try {
      if (await save((current) => updateTripPlan(current, trip.id, update))) {
        setMessage(success);
        return true;
      }
    } catch (failure) {
      setFormError(failure.message);
    }
    return false;
  }
  async function submitActivity(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    for (const key of Object.keys(fields)) fields[key] = fields[key].trim();
    try {
      const item = {
        id: editor.id || crypto.randomUUID(),
        title: fields.title,
        date: fields.date,
        time: fields.time,
        type: fields.type,
        place: fields.place,
        notes: fields.notes,
        link: fields.link,
        cost: toCents(fields.cost),
        actualCost: fields.actualCost === "" ? null : toCents(fields.actualCost),
        done: editor.done || false,
      };
      if (
        await mutate(
          (current, currentTrip) =>
            saveActivity(current, item, currentTrip, Boolean(editor.id)),
          editor.id ? "Activity updated." : "Activity added to your itinerary.",
        )
      )
        setEditor(null);
    } catch (failure) {
      setFormError(failure.message);
    }
  }
  async function remove(collection, item) {
    if (
      await mutate(
        (current) => ({
          ...current,
          [collection]: current[collection].filter((row) => row.id !== item.id),
        }),
        "Item removed. You can undo this.",
      )
    )
      setUndo({ collection, item });
  }
  async function restore() {
    if (
      await mutate(
        (current) => ({
          ...current,
          [undo.collection]: current[undo.collection].some(
            (item) => item.id === undo.item.id,
          )
            ? current[undo.collection]
            : [...current[undo.collection], undo.item],
        }),
        "Item restored.",
      )
    )
      setUndo(null);
  }
  async function addPacking(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const title = String(new FormData(form).get("title")).trim();
    if (!title) return;
    if (
      await mutate(
        (current) => ({
          ...current,
          packing: [
            ...current.packing,
            { id: crypto.randomUUID(), title, done: false },
          ],
        }),
        "Added to your checklist.",
      )
    )
      form.reset();
  }
  async function saveBudget(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const target = toCents(fields.budget);
      if (
        await mutate(
          (current) => ({
            ...current,
            budget: target,
            currency: fields.currency,
          }),
          "Budget updated. Existing cost numbers stay the same; no currency conversion is applied.",
        )
      )
        setBudgetEditor(false);
    } catch (failure) {
      setFormError(failure.message);
    }
  }
  const progress = plan.activities.length
    ? Math.round(
        (plan.activities.filter((item) => item.done).length /
          plan.activities.length) *
          100,
      )
    : 0;
  return (
    <section className="trip-planner" aria-labelledby="planner-heading">
      <div className="section-heading planner-heading">
        <div>
          <div className="eyebrow">FROM SOMEDAY TO A REAL PLAN</div>
          <h2 id="planner-heading">
            Your trip, day by day
            <span className="count">{tripLength(trip)} days</span>
          </h2>
          <p>
            Give your adventure a little structure. Leave room for surprises.
          </p>
        </div>
        <div className="planner-export">
          <button
            className="button secondary"
            onClick={() =>
              download(
                itineraryText(trip),
                "text/plain;charset=utf-8",
                `${trip.id}-itinerary.txt`,
              )
            }
          >
            ↓ Download itinerary
          </button>
          <button
            className="text-link"
            onClick={() =>
              download(
                JSON.stringify(
                  {
                    version: 1,
                    trip,
                    notes: data.notes.filter((note) => note.trip === trip.id),
                  },
                  null,
                  2,
                ),
                "application/json",
                `${trip.id}-trip-data.json`,
              )
            }
          >
            Export trip data
          </button>
        </div>
      </div>
      {message && (
        <div className="planner-message" role="status">
          {message}
          {undo && <button onClick={restore}>Undo removal</button>}
        </div>
      )}
      {(error || formError) && (
        <p role="alert" className="form-error">
          {formError || error}
        </p>
      )}
      <div className="planner-layout">
        <div className="planner-main panel">
          <div className="planner-main-heading">
            <div>
              <Icon name="calendar" />
              <h3>The itinerary</h3>
            </div>
            <button
              className="button"
              onClick={() => {
                setFormError("");
                setEditor({ date: selectedDay });
              }}
            >
              <Icon name="plus" size={16} />
              Add activity
            </button>
          </div>
          <div className="planner-day-controls">
            <button
              className="icon-button"
              disabled={firstDay === trip.start}
              aria-label="Previous week"
              onClick={() => {
                const previous = shiftDate(firstDay, -7);
                setWeek(previous < trip.start ? trip.start : previous);
              }}
            >
              ←
            </button>
            <div className="planner-days">
              {days.map((date) => (
                <button
                  className={selectedDay === date ? "selected" : ""}
                  key={date}
                  onClick={() => setDay(date)}
                  aria-pressed={selectedDay === date}
                >
                  <span>{showDay(date).split(",")[0]}</span>
                  <strong>{new Date(date + "T12:00:00Z").getUTCDate()}</strong>
                  <small>
                    {stopsByDay.get(date) || 0}{" "}
                    {stopsByDay.get(date) === 1 ? "stop" : "stops"}
                  </small>
                </button>
              ))}
            </div>
            <button
              className="icon-button"
              aria-label="Next week"
              disabled={shiftDate(firstDay, 7) > trip.end}
              onClick={() => setWeek(shiftDate(firstDay, 7))}
            >
              →
            </button>
          </div>
          <div className="planner-date-heading">
            <div>
              <h3>{showDay(selectedDay)}</h3>
              <span>
                Day {tripLength({ start: trip.start, end: selectedDay })} ·{" "}
                {dayActivities.length}{" "}
                {dayActivities.length === 1 ? "activity" : "activities"}
              </span>
            </div>
            <label>
              Jump to a day
              <input
                aria-label="Jump to itinerary day"
                type="date"
                min={trip.start}
                max={trip.end}
                value={selectedDay}
                onChange={(event) => {
                  if (
                    event.target.value >= trip.start &&
                    event.target.value <= trip.end
                  ) {
                    setDay(event.target.value);
                    setWeek(event.target.value);
                  }
                }}
              />
            </label>
          </div>
          {dayActivities.length === 0 ? (
            <div className="planner-empty">
              <span className="stat-icon">
                <Icon name="compass" size={25} />
              </span>
              <h3>A little space for possibility.</h3>
              <p>
                Add a place to explore, a meal to remember, or a booking to keep
                handy.
              </p>
              <button
                className="button secondary"
                onClick={() => {
                  setFormError("");
                  setEditor({ date: selectedDay });
                }}
              >
                Plan this day <Icon name="plus" size={15} />
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {dayActivities.map((item) => (
                <Activity
                  key={item.id}
                  item={item}
                  money={money}
                  onToggle={() =>
                    mutate(
                      (current) => ({
                        ...current,
                        activities: current.activities.map((row) =>
                          row.id === item.id
                            ? { ...row, done: !row.done }
                            : row,
                        ),
                      }),
                      "Activity status updated.",
                    )
                  }
                  onEdit={() => {
                    setFormError("");
                    setEditor(item);
                  }}
                  onRemove={() => remove("activities", item)}
                />
              ))}
            </div>
          )}
          {outside.length > 0 && (
            <div className="unscheduled">
              <h3>Plans outside your updated dates</h3>
              <p>
                Your activities were preserved. Edit their dates to move them
                into this trip.
              </p>
              {outside.map((item) => (
                <button key={item.id} onClick={() => setEditor(item)}>
                  {item.date} · {item.title} <span>Edit →</span>
                </button>
              ))}
            </div>
          )}
          <div className="planner-progress">
            <span>
              {plan.activities.filter((item) => item.done).length} of{" "}
              {plan.activities.length} activities experienced
            </span>
            <progress
              value={progress}
              max="100"
              aria-label="Itinerary completion"
            />
          </div>
        </div>
        <aside className="planner-aside">
          <section className="panel budget-panel">
            <div className="planner-panel-title">
              <span className="stat-icon">
                <Icon name="trips" />
              </span>
              <h3>A little budget clarity</h3>
            </div>
            <div className="budget-total">
              <small>PLANNED ACTIVITY COSTS</small>
              <strong>{money(budget.planned)}</strong>
              <span>{plan.currency} · Your estimates, no live prices</span>
            </div>
            <div className="actual-spending"><span>Actual spending recorded</span><strong>{money(budget.actual)}</strong><small>{budget.recorded} of {plan.activities.length} activities recorded · unrecorded costs are excluded</small></div>
            <div className="budget-meter">
              <progress
                max={Math.max(plan.budget, budget.planned, 1)}
                value={budget.planned}
                aria-label="Planned costs against budget"
              />
              <div>
                <span>Trip budget</span>
                <strong>{plan.budget ? money(plan.budget) : "Not set"}</strong>
              </div>
              {plan.budget > 0 && (
                <div className={budget.over ? "over-budget" : ""}>
                  <span>
                    {budget.over ? "Over budget" : "Room in your budget"}
                  </span>
                  <strong>{money(Math.abs(budget.remaining))}</strong>
                </div>
              )}
            </div>
            <button
              className="button secondary budget-button"
              onClick={() => {
                setFormError("");
                setBudgetEditor(true);
              }}
            >
              {plan.budget ? "Edit budget" : "Set a trip budget"}
            </button>
            <p className="budget-help">
              Add flights, stays, meals, and activities to account for your
              planned costs. Changing currency relabels amounts; it does not
              convert them.
            </p>
          </section>
          <section className="panel packing-panel">
            <div className="planner-panel-title">
              <span className="stat-icon">
                <Icon name="notes" />
              </span>
              <div>
                <h3>Ready, set, go.</h3>
                <p>
                  {packed} of {plan.packing.length} ready
                </p>
              </div>
            </div>
            <div className="packing-list">
              {plan.packing.map((item) => (
                <div key={item.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        mutate(
                          (current) => ({
                            ...current,
                            packing: current.packing.map((row) =>
                              row.id === item.id
                                ? { ...row, done: !row.done }
                                : row,
                            ),
                          }),
                          "Checklist updated.",
                        )
                      }
                    />
                    <span className={item.done ? "checked" : ""}>
                      {item.title}
                    </span>
                  </label>
                  <button
                    className="icon-button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => remove("packing", item)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addPacking} className="packing-add">
              <input
                aria-label="New packing item"
                name="title"
                maxLength={150}
                required
                placeholder="Passport, charger, book…"
              />
              <button
                className="icon-button"
                aria-label="Add packing item"
                type="submit"
              >
                <Icon name="plus" size={18} />
              </button>
            </form>
            {plan.packing.length === 0 && (
              <button
                className="packing-starter"
                onClick={() =>
                  mutate(
                    (current) => ({
                      ...current,
                      packing: [
                        ...current.packing,
                        ...[
                          "Travel documents",
                          "Phone charger",
                          "Weather-ready clothes",
                          "Reservations & tickets",
                        ]
                          .filter(
                            (title) =>
                              !current.packing.some(
                                (item) => item.title === title,
                              ),
                          )
                          .map((title) => ({
                            id: crypto.randomUUID(),
                            title,
                            done: false,
                          })),
                      ],
                    }),
                    "Starter checklist added. Customize it for your trip.",
                  )
                }
              >
                + Start with the essentials
              </button>
            )}
          </section>
        </aside>
      </div>
      {editor && (
        <PlanDialog
          title={editor.id ? "Edit an activity" : "Make a little plan"}
          onClose={() => {
            setEditor(null);
            setFormError("");
          }}
        >
          <form onSubmit={submitActivity} className="travel-form">
            <label>
              Activity name
              <input
                name="title"
                defaultValue={editor.title || ""}
                required
                maxLength={150}
                placeholder="Explore the old town"
              />
            </label>
            <div className="form-row">
              <label>
                Date
                <input
                  name="date"
                  type="date"
                  defaultValue={editor.date}
                  min={trip.start}
                  max={trip.end}
                  required
                />
              </label>
              <label>
                Time (optional)
                <input
                  name="time"
                  type="time"
                  defaultValue={editor.time || ""}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Category
                <select name="type" defaultValue={editor.type || "Explore"}>
                  {activityTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                Estimated cost ({plan.currency})
                <input
                  name="cost"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="9999999.99"
                  step="0.01"
                  defaultValue={
                    editor.cost === undefined
                      ? ""
                      : (editor.cost / 100).toFixed(2)
                  }
                  placeholder="0.00"
                />
              </label>
            </div>
            <label>
              Actual amount paid ({plan.currency}) · optional
              <input name="actualCost" type="text" inputMode="decimal" pattern="[0-9]{1,7}([.][0-9]{1,2})?" placeholder="Not recorded" defaultValue={editor.actualCost == null ? "" : (editor.actualCost / 100).toFixed(2)} onFocus={event => event.currentTarget.select()} />
              <small>Leave blank until paid. Enter 0 for a free activity.</small>
            </label>
            <label>
              Place / address (optional)
              <input
                name="place"
                defaultValue={editor.place || ""}
                maxLength={200}
                placeholder="A place you want to remember"
              />
            </label>
            <label>
              Booking or website link (optional)
              <input
                name="link"
                type="url"
                defaultValue={editor.link || ""}
                maxLength={2000}
                placeholder="https://…"
              />
            </label>
            <label>
              Notes (optional)
              <textarea
                name="notes"
                rows={3}
                defaultValue={editor.notes || ""}
                maxLength={2000}
                placeholder="Reservation details, ideas, or a friendly reminder…"
              />
            </label>
            {(formError || error) && (
              <p role="alert" className="form-error">
                {formError || error}
              </p>
            )}
            <div className="form-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => setEditor(null)}
              >
                Cancel
              </button>
              <button className="button" type="submit">
                {editor.id ? "Save changes" : "Add to itinerary"}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </form>
        </PlanDialog>
      )}
      {budgetEditor && (
        <PlanDialog
          title="Make room in your budget"
          onClose={() => setBudgetEditor(false)}
        >
          <form onSubmit={saveBudget} className="travel-form">
            <p className="form-intro">
              One currency for this trip. Existing costs keep their numeric
              amounts when you change the currency.
            </p>
            <div className="form-row">
              <label>
                Currency
                <select name="currency" defaultValue={plan.currency}>
                  {currencies.map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </select>
              </label>
              <label>
                Trip budget
                <input
                  name="budget"
                  type="text"
                  pattern="[0-9]{1,7}([.][0-9]{1,2})?"
                  inputMode="decimal"
                  placeholder="0.00"
                  onFocus={(event) => event.currentTarget.select()}
                  defaultValue={plan.budget ? (plan.budget / 100).toFixed(2) : ""}
                  required
                />
              </label>
            </div>
            {(formError || error) && (
              <p role="alert" className="form-error">
                {formError || error}
              </p>
            )}
            <div className="form-actions">
              <button className="button" type="submit">
                Save budget
              </button>
            </div>
          </form>
        </PlanDialog>
      )}
    </section>
  );
}
function Activity({ item, money, onToggle, onEdit, onRemove }) {
  return (
    <article className={`activity ${item.done ? "activity-done" : ""}`}>
      <div className="activity-time">
        {item.time || "Any time"}
        <span>{item.type}</span>
      </div>
      <div className="activity-body">
        <div className="activity-title">
          <label>
            <input
              type="checkbox"
              checked={item.done}
              onChange={onToggle}
              aria-label={`Mark ${item.title} experienced`}
            />
            <h4>{item.title}</h4>
          </label>
          <strong>{money(item.cost)} estimate{item.actualCost != null && <small> · {money(item.actualCost)} paid</small>}</strong>
        </div>
        {item.place && (
          <p className="activity-place">
            <Icon name="pin" size={13} />
            {item.place}
          </p>
        )}
        {item.notes && <p className="activity-notes">{item.notes}</p>}
        <div className="activity-actions">
          {item.place && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.place)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open map ↗
            </a>
          )}
          {item.link && (
            <a href={item.link} target="_blank" rel="noreferrer">
              Booking / website ↗
            </a>
          )}
          <button onClick={onEdit} aria-label={`Edit ${item.title}`}>
            Edit
          </button>
          <button onClick={onRemove} aria-label={`Remove ${item.title}`}>
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
