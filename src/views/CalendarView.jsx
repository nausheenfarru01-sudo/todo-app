import { useState } from "react";
import { useTasks } from "../store/TaskContext";
import { PRIORITY_META } from "../lib/selectors";
import { toISO } from "../lib/date";
import Icon from "../components/Icon";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarView() {
  const { state, actions, today, setUI } = useTasks();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [over, setOver] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first grid
  const days = Array.from({ length: 42 }, (_, i) => new Date(year, month, i - offset + 1));

  const byDate = new Map();
  for (const t of state.tasks) {
    if (!t.due) continue;
    if (!byDate.has(t.due)) byDate.set(t.due, []);
    byDate.get(t.due).push(t);
  }
  const unscheduled = state.tasks.filter((t) => !t.due && t.status !== "done");

  const shift = (n) => setCursor(new Date(year, month + n, 1));

  return (
    <div className="calendar-view">
      <div className="toolbar">
        <h2 className="month-title">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
        <div className="spacer" />
        <button className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)}><Icon name="chevronLeft" /></button>
        <button className="btn ghost sm" onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</button>
        <button className="icon-btn" aria-label="Next month" onClick={() => shift(1)}><Icon name="chevronRight" /></button>
      </div>

      <div className="calendar-layout">
        <div className="calendar">
          {WEEKDAY_LABELS.map((d) => <div key={d} className="cal-weekday">{d}</div>)}
          {days.map((date) => {
            const iso = toISO(date);
            const tasks = byDate.get(iso) ?? [];
            const outside = date.getMonth() !== month;
            return (
              <div
                key={iso}
                className={`cal-day${outside ? " outside" : ""}${iso === today ? " today" : ""}${iso < today ? " past" : ""}${over === iso ? " over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(iso);
                }}
                onDragLeave={() => setOver((o) => (o === iso ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/task-id");
                  if (id) actions.update(id, { due: iso });
                  setOver(null);
                }}
                onDoubleClick={() => setUI((u) => ({ ...u, quickAdd: { due: iso } }))}
              >
                <div className="cal-date">
                  <span>{date.getDate()}</span>
                  <button className="icon-btn xs cal-add" aria-label={`Add task on ${iso}`} onClick={() => setUI((u) => ({ ...u, quickAdd: { due: iso } }))}>
                    <Icon name="plus" size={13} />
                  </button>
                </div>
                <div className="cal-tasks">
                  {tasks.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/task-id", t.id)}
                      className={`cal-task${t.status === "done" ? " done" : ""}`}
                      style={{ "--c": PRIORITY_META[t.priority].color }}
                      onClick={() => setUI((u) => ({ ...u, selectedId: t.id }))}
                      title={t.title}
                    >
                      {t.title}
                    </button>
                  ))}
                  {tasks.length > 3 && <span className="cal-more">+{tasks.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="card unscheduled">
          <header className="card-header">
            <h3>Unscheduled</h3>
            <span className="muted">{unscheduled.length}</span>
          </header>
          <p className="muted small">Drag onto a day to schedule. Double-click a day to add a task.</p>
          <div className="unscheduled-list">
            {unscheduled.map((t) => (
              <button
                key={t.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/task-id", t.id)}
                className="cal-task"
                style={{ "--c": PRIORITY_META[t.priority].color }}
                onClick={() => setUI((u) => ({ ...u, selectedId: t.id }))}
              >
                <Icon name="grip" size={14} /> {t.title}
              </button>
            ))}
            {unscheduled.length === 0 && <p className="empty-inline">Everything has a date 👌</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
