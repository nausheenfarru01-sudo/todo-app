import { useRef } from "react";
import { TaskProvider, useTasks } from "./store/TaskContext";
import { FocusProvider } from "./store/FocusContext";
import { useHotkeys } from "./hooks/useHotkeys";
import { greeting } from "./lib/date";
import { tasksForView } from "./lib/selectors";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TaskDrawer from "./components/TaskDrawer";
import CommandPalette from "./components/CommandPalette";
import ShortcutsHelp from "./components/ShortcutsHelp";
import SettingsModal from "./components/SettingsModal";
import Toasts from "./components/Toasts";
import Modal from "./components/Modal";
import QuickAdd from "./components/QuickAdd";
import Dashboard from "./views/Dashboard";
import ListView from "./views/ListView";
import BoardView from "./views/BoardView";
import CalendarView from "./views/CalendarView";
import FocusView from "./views/FocusView";
import "./styles/app.css";

function useViewTitle() {
  const { state, route, today, search } = useTasks();
  const longDate = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const count = (name) => tasksForView(state.tasks, { name }, today).length;
  switch (route.name) {
    case "today":
      return ["Today", `${longDate} · ${count("today")} to do`];
    case "upcoming":
      return ["Upcoming", `${count("upcoming")} scheduled tasks`];
    case "inbox":
      return ["Inbox", `${count("inbox")} open tasks`];
    case "completed":
      return ["Completed", `${count("completed")} tasks done. Nice work!`];
    case "board":
      return ["Board", "Plan your work in columns"];
    case "calendar":
      return ["Calendar", "Drag tasks to reschedule"];
    case "focus":
      return ["Focus", "One task at a time"];
    case "search":
      return ["Search", search ? `Results for “${search}”` : "Type to search"];
    case "project":
      return [state.projects.find((p) => p.id === route.id)?.name ?? "Project", "Project"];
    case "tag":
      return [`#${route.id}`, "Tagged tasks"];
    default:
      return [`${greeting()}, ${state.settings.name || "there"}`, longDate];
  }
}

function Shell() {
  const { route, navigate, ui, setUI } = useTasks();
  const searchRef = useRef(null);
  const [title, subtitle] = useViewTitle();

  const open = (key, value = true) => setUI((u) => ({ ...u, [key]: value }));
  useHotkeys({
    "mod+k": () => setUI((u) => ({ ...u, palette: !u.palette })),
    n: () => open("quickAdd", {}),
    "/": () => searchRef.current?.focus(),
    "?": () => open("help"),
    "[": () => document.body.classList.toggle("sidebar-collapsed"),
    escape: () => setUI((u) => ({ ...u, selectedId: null, sidebar: false })),
    "g d": () => navigate("dashboard"),
    "g t": () => navigate("today"),
    "g u": () => navigate("upcoming"),
    "g i": () => navigate("inbox"),
    "g b": () => navigate("board"),
    "g c": () => navigate("calendar"),
    "g f": () => navigate("focus"),
  });

  const View = { dashboard: Dashboard, board: BoardView, calendar: CalendarView, focus: FocusView }[route.name] ?? ListView;

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Header ref={searchRef} title={title} subtitle={subtitle} />
        <main className="content" key={`${route.name}-${route.id ?? ""}`}>
          <View />
        </main>
        <Footer />
      </div>

      <TaskDrawer />
      {ui.quickAdd && (
        <Modal title="New task" onClose={() => open("quickAdd", null)} className="quick-add-modal">
          <QuickAdd autoFocus defaults={ui.quickAdd} onAdded={() => open("quickAdd", null)} />
          <p className="muted small">
            Tip: type <code>tomorrow</code>, <code>!high</code>, <code>#tag</code> or <code>@Project</code> right in the title.
          </p>
        </Modal>
      )}
      {ui.palette && <CommandPalette />}
      {ui.help && <ShortcutsHelp />}
      {ui.settings && <SettingsModal />}
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <FocusProvider>
        <Shell />
      </FocusProvider>
    </TaskProvider>
  );
}
