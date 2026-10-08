import { useTasks } from "../store/TaskContext";
import { useFocus } from "../store/FocusContext";
import { SORTERS, computeStats } from "../lib/selectors";
import Icon from "../components/Icon";
import { formatClock } from "../lib/date";


export default function FocusView() {
  const { state, actions, today } = useTasks();
  const focus = useFocus();
  const stats = computeStats(state, today);
  const task = state.tasks.find((t) => t.id === focus.taskId);
  const candidates = state.tasks.filter((t) => t.status !== "done").sort(SORTERS.smart);

  const size = 300;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = 1 - focus.remaining / focus.duration;

  return (
    <div className="focus-view">
      <section className={`card focus-card ${focus.mode}`}>
        <div className="segmented">
          <button className={focus.mode === "focus" ? "active" : ""} onClick={() => focus.switchMode("focus")}>Focus · {state.settings.focusMinutes}m</button>
          <button className={focus.mode === "break" ? "active" : ""} onClick={() => focus.switchMode("break")}>Break · {state.settings.breakMinutes}m</button>
        </div>

        <div className="timer" style={{ width: size, height: size }}>
          <svg viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              className="ring-value"
              strokeWidth={stroke}
              strokeDasharray={c}
              strokeDashoffset={c * (1 - progress)}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>
          <div className="timer-center">
            <span className="timer-mode">{focus.mode === "focus" ? "Stay focused" : "Take a breather"}</span>
            <span className="timer-clock" aria-live="off">{formatClock(focus.remaining)}</span>
            <span className="timer-task">{task ? task.title : "No task selected"}</span>
          </div>
        </div>

        <div className="timer-controls">
          <button className="icon-btn lg" aria-label="Reset timer" onClick={focus.reset}><Icon name="reset" /></button>
          {focus.running ? (
            <button className="btn primary xl" onClick={focus.pause}><Icon name="pause" /> Pause</button>
          ) : (
            <button className="btn primary xl" onClick={focus.start}><Icon name="play" /> {focus.remaining < focus.duration ? "Resume" : "Start"}</button>
          )}
          <button className="icon-btn lg" aria-label="Skip to next" title="Finish now" onClick={focus.skip}><Icon name="chevronRight" /></button>
        </div>

        <div className="focus-stats">
          <div><b>{stats.focusToday}m</b><span>focused today</span></div>
          <div><b>{focus.sessions}</b><span>sessions this visit</span></div>
          <div><b>{Math.round((stats.focusWeek / 60) * 10) / 10}h</b><span>this week</span></div>
        </div>
      </section>

      <section className="card focus-tasks">
        <header className="card-header">
          <h3>What are you working on?</h3>
        </header>
        <ul className="focus-task-list">
          {candidates.slice(0, 12).map((t) => (
            <li key={t.id}>
              <button className={focus.taskId === t.id ? "active" : ""} onClick={() => focus.setTaskId(focus.taskId === t.id ? null : t.id)}>
                <span className="radio" />
                <span className="name">{t.title}</span>
              </button>
            </li>
          ))}
          {candidates.length === 0 && <li className="empty-inline">No open tasks. Add one first!</li>}
        </ul>
        {task && (
          <button className="btn block" onClick={() => { actions.toggle(task.id); focus.setTaskId(null); }}>
            <Icon name="check" size={16} /> Mark “{task.title}” done
          </button>
        )}
      </section>
    </div>
  );
}
