import { forwardRef } from "react";
import { useTasks } from "../store/TaskContext";
import Icon from "./Icon";

const Header = forwardRef(function Header({ title, subtitle }, searchRef) {
  const { state, actions, search, setSearch, setUI, navigate, route } = useTasks();
  const dark = state.settings.theme === "dark";
  const initials = state.settings.name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "ME";

  return (
    <header className="topbar">
      <button className="icon-btn mobile-only" aria-label="Open menu" onClick={() => setUI((u) => ({ ...u, sidebar: true }))}>
        <Icon name="menu" />
      </button>

      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="search">
        <Icon name="search" size={16} />
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value && route.name !== "search") navigate("search");
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearch("");
              e.currentTarget.blur();
            }
          }}
          placeholder="Search tasks, tags, projects"
          aria-label="Search"
        />
        {search ? (
          <button className="icon-btn xs" aria-label="Clear search" onClick={() => setSearch("")}>
            <Icon name="x" size={14} />
          </button>
        ) : (
          <kbd>/</kbd>
        )}
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Command palette" title="Command palette (Ctrl+K)" onClick={() => setUI((u) => ({ ...u, palette: true }))}>
          <Icon name="command" />
        </button>
        <button className="icon-btn" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => actions.setSettings({ theme: dark ? "light" : "dark" })}>
          <Icon name={dark ? "sun" : "moon"} />
        </button>
        <button className="btn primary sm hide-mobile" onClick={() => setUI((u) => ({ ...u, quickAdd: {} }))}>
          <Icon name="plus" size={16} /> New task
        </button>
        <button className="avatar" aria-label="Settings" title={state.settings.name} onClick={() => setUI((u) => ({ ...u, settings: true }))}>
          {initials}
        </button>
      </div>
    </header>
  );
});

export default Header;
