import { useTasks } from "../store/TaskContext";
import Modal from "./Modal";

const SHORTCUTS = [
  ["Ctrl / ⌘ + K", "Command palette"],
  ["N", "New task"],
  ["/", "Search"],
  ["G then D", "Dashboard"],
  ["G then T", "Today"],
  ["G then U", "Upcoming"],
  ["G then I", "Inbox"],
  ["G then B", "Board"],
  ["G then C", "Calendar"],
  ["G then F", "Focus timer"],
  ["[", "Toggle sidebar"],
  ["?", "This help"],
  ["Esc", "Close panels"],
];

const QUICK_ADD_SYNTAX = [
  ["tomorrow, fri, next week, in 3 days, oct 12", "Due date"],
  ["!urgent  !high  !med  !low  (or !1–!4)", "Priority"],
  ["#tag", "Tags (as many as you like)"],
  ["@Project", "Project (created if new)"],
];

export default function ShortcutsHelp() {
  const { setUI } = useTasks();
  return (
    <Modal title="Keyboard shortcuts" onClose={() => setUI((u) => ({ ...u, help: false }))} className="help">
      <div className="help-grid">
        <section>
          <h3>Navigation</h3>
          <dl>
            {SHORTCUTS.map(([keys, label]) => (
              <div key={keys}>
                <dt>{keys.split(" ").map((k, i) => (k === "+" || k === "then" ? <span key={i}> {k} </span> : <kbd key={i}>{k}</kbd>))}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h3>Quick-add magic</h3>
          <dl>
            {QUICK_ADD_SYNTAX.map(([syntax, label]) => (
              <div key={label}>
                <dt><code>{syntax}</code></dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
          <p className="muted">Example: <code>Revise DBMS fri !high #exam @College</code></p>
        </section>
      </div>
    </Modal>
  );
}
