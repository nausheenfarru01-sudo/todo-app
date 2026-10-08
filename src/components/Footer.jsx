import { useTasks } from "../store/TaskContext";
import { computeStats } from "../lib/selectors";
import Icon from "./Icon";

export default function Footer() {
  const { state, today, setUI } = useTasks();
  const stats = computeStats(state, today);
  return (
    <footer className="footer">
      <span className="footer-stats">
        <span><b>{stats.open}</b> open</span>
        <span><b>{stats.doneToday}</b> done today</span>
        <span className="hide-mobile"><Icon name="fire" size={13} /> <b>{stats.streak}</b>-day streak</span>
        <span className="hide-mobile saved"><i /> Saved locally</span>
      </span>
      <span className="footer-right">
        <button className="link" onClick={() => setUI((u) => ({ ...u, help: true }))}>Press <kbd>?</kbd> for shortcuts</button>
        <a href="https://github.com/nausheenfarru01-sudo/todo-app" target="_blank" rel="noreferrer" className="hide-mobile">
          <Icon name="github" size={14} /> Built by Fareeha Nausheen
        </a>
      </span>
    </footer>
  );
}
