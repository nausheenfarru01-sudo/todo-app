# TaskFlow

[![test and deploy](https://github.com/nausheenfarru01-sudo/todo-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/nausheenfarru01-sudo/todo-app/actions/workflows/deploy.yml)

A fast, keyboard-first task manager built with React. It has a productivity dashboard, list views, a drag-and-drop Kanban board, a calendar, a Pomodoro focus timer, and quick-add that understands plain English.

**Live demo:** https://nausheenfarru01-sudo.github.io/todo-app/ (opens with sample data, so you can explore right away)

## Features

**Views**
- **Dashboard:** greeting, today's progress ring, stat cards, 7-day productivity chart, open tasks by priority, project progress, upcoming deadlines and in-progress work
- **Today / Upcoming / Inbox / Completed:** smart grouping (Overdue, Today, Tomorrow, This week, Later), priority filters and five sort orders
- **Board:** To do, In progress and Done columns with drag and drop, plus a project filter
- **Calendar:** month grid; drag tasks between days to reschedule, or drag from the Unscheduled panel
- **Focus:** Pomodoro timer with a progress ring, task picker, break mode, focus-time stats and a sidebar mini-timer that keeps running while you work elsewhere
- **Projects and tags:** colour-coded projects with progress rings, and a tag cloud

**Smart quick add.** Type naturally and TaskFlow picks out the details as you type:

```
Revise DBMS normalization fri !high #exam @College
```

| You type | It sets |
| --- | --- |
| `today`, `tomorrow`, `fri`, `next week`, `in 3 days`, `oct 20`, `2026-12-25` | Due date |
| `!urgent`, `!high`, `!med`, `!low` (or `!1` to `!4`) | Priority |
| `#tag` | Tags |
| `@Project` | Project (created if it doesn't exist) |

**Task details.** A slide-in panel for status, priority, due date, project, tags, subtasks with progress, and notes.

**Keyboard first**

| Shortcut | Action |
| --- | --- |
| `Ctrl/⌘ + K` | Command palette (search tasks, jump anywhere, run commands) |
| `N` | New task |
| `/` | Search |
| `G` then `D` / `T` / `U` / `I` / `B` / `C` / `F` | Go to Dashboard, Today, Upcoming, Inbox, Board, Calendar, Focus |
| `[` | Toggle sidebar |
| `?` | Show all shortcuts |

**Polish**
- Undo for deletes, completions and bulk actions
- Light and dark themes plus 8 accent colours
- Completion animations and live counts in the sidebar, header and footer
- Responsive layout with a slide-out sidebar on mobile
- Export and import your data as JSON
- Everything is saved in `localStorage`; no account needed

## Tech stack

React 18 (hooks, context, `useReducer`) · Vite 5 · plain CSS with design tokens · hand-drawn SVG icons and charts (no UI or chart libraries) · Vitest · React Testing Library · ESLint · GitHub Actions · GitHub Pages

## Architecture

```
src/
├── App.jsx                  # layout shell, routing, global shortcuts
├── store/
│   ├── reducer.js           # all state changes as pure reducer actions
│   ├── TaskContext.jsx      # state, persistence, undo toasts, hash routing
│   ├── FocusContext.jsx     # Pomodoro timer shared across views
│   └── seed.js              # sample data relative to today
├── lib/
│   ├── parse.js             # natural-language quick-add parser
│   ├── selectors.js         # filtering, grouping, sorting, dashboard stats
│   └── date.js              # time-zone-safe date helpers
├── hooks/useHotkeys.js      # single keys and "g then x" sequences
├── components/              # Sidebar, Header, Footer, TaskItem, TaskDrawer,
│                            # QuickAdd, CommandPalette, SettingsModal, Toasts, Icon…
├── views/                   # Dashboard, ListView, BoardView, CalendarView, FocusView
└── styles/app.css           # design tokens, themes, responsive layout
```

- State changes go through one pure reducer, so they are easy to test and undo.
- Views are linked with URL hashes (`#/today`, `#/project/<id>`), so the back button and bookmarks work.
- Dates are stored as local `YYYY-MM-DD` strings, so "today" never shifts with time zones.

## Getting started

Requires Node.js 18 or newer.

```bash
git clone https://github.com/nausheenfarru01-sudo/todo-app.git
cd todo-app
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server at http://localhost:5173 |
| `npm test` | Run 43 tests: parser, reducer, selectors and full user flows |
| `npm run lint` | ESLint |
| `npm run build` | Production build into `dist/` |

Every push to `main` runs lint, tests and the build, then deploys to GitHub Pages.
