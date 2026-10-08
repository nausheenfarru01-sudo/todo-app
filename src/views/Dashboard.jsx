import { useTasks } from "../store/TaskContext";
import { dueTone, formatDue, fromISO } from "../lib/date";
import { PRIORITY_META, SORTERS, computeStats, isDone } from "../lib/selectors";
import Icon from "../components/Icon";
import TaskItem from "../components/TaskItem";

function StatCard({ icon, label, value, sub, tone, onClick }) {
  return (
    <button className={`stat-card ${tone ?? ""}`} onClick={onClick}>
      <span className="stat-icon"><Icon name={icon} size={18} /></span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </button>
  );
}

function WeekChart({ week, today }) {
  const max = Math.max(4, ...week.map((d) => d.count));
  const H = 140;
  const barW = 28;
  const gap = 18;
  const W = week.length * (barW + gap) - gap;
  return (
    <svg className="week-chart" viewBox={`0 -18 ${W} ${H + 40}`} role="img" aria-label="Tasks completed per day over the last 7 days">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={0} x2={W} y1={H - H * f} y2={H - H * f} className="grid" />
      ))}
      {week.map((d, i) => {
        const h = (d.count / max) * H;
        const x = i * (barW + gap);
        const isToday = d.date === today;
        return (
          <g key={d.date}>
            <rect x={x} y={H - Math.max(h, 3)} width={barW} height={Math.max(h, 3)} rx={7} className={`bar${isToday ? " today" : ""}`}>
              <title>{`${d.count} completed`}</title>
            </rect>
            {d.count > 0 && (
              <text x={x + barW / 2} y={H - h - 6} className="bar-value">{d.count}</text>
            )}
            <text x={x + barW / 2} y={H + 18} className={`bar-label${isToday ? " today" : ""}`}>
              {isToday ? "Today" : fromISO(d.date).toLocaleDateString(undefined, { weekday: "short" })}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Ring({ value, size = 120, stroke = 12, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-value"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-center">
        <b>{value}%</b>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, navigate, today, setUI } = useTasks();
  const stats = computeStats(state, today);
  const upcoming = state.tasks.filter((t) => !isDone(t) && t.due).sort(SORTERS.smart).slice(0, 6);
  const inProgress = state.tasks.filter((t) => t.status === "doing").slice(0, 4);
  const openTotal = Object.values(stats.byPriority).reduce((a, b) => a + b, 0) || 1;
  // Today's progress: everything finished today vs. what is still due today or overdue.
  const remainingToday = stats.dueToday + stats.overdue;
  const todayPct = stats.doneToday + remainingToday ? Math.round((stats.doneToday / (stats.doneToday + remainingToday)) * 100) : 100;

  return (
    <div className="dashboard">
      <section className="hero card">
        <div>
          <h2>
            {remainingToday === 0
              ? "You're all caught up for today 🎉"
              : `${remainingToday} task${remainingToday === 1 ? "" : "s"} need${remainingToday === 1 ? "s" : ""} your attention today`}
          </h2>
          <p className="muted">
            {stats.overdue > 0 ? `${stats.overdue} overdue · ` : ""}
            {stats.doneThisWeek} completed this week{stats.streak > 1 ? ` · ${stats.streak}-day streak 🔥` : ""}
          </p>
          <div className="button-row">
            <button className="btn primary" onClick={() => navigate("today")}>Plan my day <Icon name="arrowRight" size={16} /></button>
            <button className="btn" onClick={() => navigate("focus")}><Icon name="focus" size={16} /> Start focus session</button>
          </div>
        </div>
        <Ring value={todayPct} label="day done" />
      </section>

      <section className="stats-grid">
        <StatCard icon="sun" label="Due today" value={stats.dueToday} tone="accent" onClick={() => navigate("today")} />
        <StatCard icon="alert" label="Overdue" value={stats.overdue} tone={stats.overdue ? "danger" : ""} onClick={() => navigate("today")} />
        <StatCard icon="trend" label="Done this week" value={stats.doneThisWeek} sub={`${stats.completionRate}% of all tasks`} tone="success" onClick={() => navigate("completed")} />
        <StatCard icon="clock" label="Focus today" value={`${stats.focusToday}m`} sub={`${Math.round(stats.focusWeek / 60 * 10) / 10}h this week`} tone="info" onClick={() => navigate("focus")} />
      </section>

      <div className="dash-grid">
        <section className="card chart-card">
          <header className="card-header">
            <h3>Productivity</h3>
            <span className="muted">Tasks completed, last 7 days</span>
          </header>
          <WeekChart week={stats.week} today={today} />
        </section>

        <section className="card">
          <header className="card-header">
            <h3>Open by priority</h3>
            <span className="muted">{stats.open} open</span>
          </header>
          <div className="stacked-bar" role="img" aria-label="Open tasks by priority">
            {Object.entries(stats.byPriority).map(([p, n]) =>
              n ? <span key={p} style={{ flex: n, background: PRIORITY_META[p].color }} title={`${PRIORITY_META[p].label}: ${n}`} /> : null,
            )}
          </div>
          <ul className="legend">
            {Object.entries(stats.byPriority).map(([p, n]) => (
              <li key={p}>
                <span className="dot" style={{ background: PRIORITY_META[p].color }} />
                {PRIORITY_META[p].label}
                <b>{n}</b>
                <em>{Math.round((n / openTotal) * 100)}%</em>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <header className="card-header">
            <h3>Projects</h3>
            <button className="link" onClick={() => navigate("board")}>Board view</button>
          </header>
          <ul className="project-progress">
            {state.projects.length === 0 && <li className="muted">No projects yet. Add one from the sidebar or type @Project in quick add.</li>}
            {state.projects.map((p) => {
              const tasks = state.tasks.filter((t) => t.projectId === p.id);
              const done = tasks.filter(isDone).length;
              const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
              return (
                <li key={p.id}>
                  <button onClick={() => navigate("project", p.id)}>
                    <span className="dot" style={{ background: p.color }} />
                    <span className="name">{p.name}</span>
                    <span className="muted">{done}/{tasks.length}</span>
                  </button>
                  <div className="progress"><div style={{ width: `${pct}%`, background: p.color }} /></div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card span-2">
          <header className="card-header">
            <h3>Coming up</h3>
            <button className="link" onClick={() => navigate("upcoming")}>See all</button>
          </header>
          {upcoming.length === 0 ? (
            <p className="empty-inline">Nothing scheduled. Enjoy the calm ✨</p>
          ) : (
            <ul className="deadline-list">
              {upcoming.map((t) => (
                <li key={t.id}>
                  <button onClick={() => setUI((u) => ({ ...u, selectedId: t.id }))}>
                    <span className={`date-badge ${dueTone(t.due, today)}`}>{formatDue(t.due, today)}</span>
                    <span className="name">{t.title}</span>
                    {t.priority !== "none" && <Icon name="flag" size={14} style={{ color: PRIORITY_META[t.priority].color }} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <header className="card-header">
            <h3>In progress</h3>
            <span className="muted">{stats.inProgress}</span>
          </header>
          {inProgress.length === 0 ? (
            <p className="empty-inline">Drag a card to “In progress” on the board to track it here.</p>
          ) : (
            <div className="task-list compact" role="list">
              {inProgress.map((t) => <TaskItem key={t.id} task={t} compact />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
