import { useEffect, useMemo, useRef, useState } from "react";
import { useTasks } from "../store/TaskContext";
import { matchesSearch } from "../lib/selectors";
import Icon from "./Icon";
import Modal from "./Modal";

export default function CommandPalette() {
  const { state, actions, navigate, setUI } = useTasks();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const close = () => setUI((u) => ({ ...u, palette: false }));

  const commands = useMemo(() => {
    const go = (label, icon, name, id) => ({ label, icon, group: "Go to", run: () => navigate(name, id) });
    return [
      { label: "Create new task", icon: "plus", group: "Actions", hint: "N", run: () => setUI((u) => ({ ...u, quickAdd: {} })) },
      go("Dashboard", "dashboard", "dashboard"),
      go("Today", "sun", "today"),
      go("Upcoming", "upcoming", "upcoming"),
      go("Inbox", "inbox", "inbox"),
      go("Board", "board", "board"),
      go("Calendar", "calendar", "calendar"),
      go("Focus timer", "focus", "focus"),
      go("Completed", "checkCircle", "completed"),
      ...state.projects.map((p) => go(`Project: ${p.name}`, "folder", "project", p.id)),
      {
        label: `Switch to ${state.settings.theme === "dark" ? "light" : "dark"} theme`,
        icon: state.settings.theme === "dark" ? "sun" : "moon",
        group: "Actions",
        run: () => actions.setSettings({ theme: state.settings.theme === "dark" ? "light" : "dark" }),
      },
      { label: "Clear completed tasks", icon: "trash", group: "Actions", run: actions.clearCompleted },
      { label: "Settings", icon: "settings", group: "Actions", run: () => setUI((u) => ({ ...u, settings: true })) },
      { label: "Keyboard shortcuts", icon: "keyboard", group: "Actions", hint: "?", run: () => setUI((u) => ({ ...u, help: true })) },
    ];
  }, [state.projects, state.settings.theme, actions, navigate, setUI]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cmds = commands.filter((c) => c.label.toLowerCase().includes(q));
    const tasks = q
      ? state.tasks
          .filter((t) => matchesSearch(t, q, state.projects))
          .slice(0, 8)
          .map((t) => ({
            label: t.title,
            icon: t.status === "done" ? "checkCircle" : "list",
            group: "Tasks",
            run: () => setUI((u) => ({ ...u, selectedId: t.id })),
          }))
      : [];
    return [...tasks, ...cmds];
  }, [query, commands, state.tasks, state.projects, setUI]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector(".active")?.scrollIntoView?.({ block: "nearest" });
  }, [active]);

  const run = (item) => {
    close();
    item.run();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  };

  let lastGroup = null;
  return (
    <Modal title="Command palette" onClose={close} className="palette" hideHeader>
      <div className="palette-input">
        <Icon name="search" />
        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown} placeholder="Search tasks or type a command…" aria-label="Search tasks or commands" />
        <kbd>Esc</kbd>
      </div>
      <ul className="palette-list" ref={listRef} role="listbox">
        {results.length === 0 && <li className="palette-empty">No matches for “{query}”</li>}
        {results.map((item, i) => {
          const header = item.group !== lastGroup ? <li className="palette-group" key={`g-${item.group}`}>{item.group}</li> : null;
          lastGroup = item.group;
          return [
            header,
            <li
              key={`${item.group}-${item.label}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? "active" : ""}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(item)}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              {item.hint && <kbd>{item.hint}</kbd>}
            </li>,
          ];
        })}
      </ul>
    </Modal>
  );
}
