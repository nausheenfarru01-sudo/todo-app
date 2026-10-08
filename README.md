# To-Do List App

[![test and deploy](https://github.com/nausheenfarru01-sudo/todo-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/nausheenfarru01-sudo/todo-app/actions/workflows/deploy.yml)

A clean, fast task manager built with React and Vite. Tasks are saved in the browser, so they are still there after a refresh.

**Live demo:** https://nausheenfarru01-sudo.github.io/todo-app/

## Features

- Add, complete, edit and delete tasks
- Edit inline: double-click a task (or press ✎), **Enter** to save, **Esc** to cancel
- Filter by **All**, **Active** or **Completed**, and clear all completed tasks at once
- Progress bar and live "items left" counter
- Tasks persist in `localStorage` through a reusable `useLocalStorage` hook
- Light and dark theme that follows the system setting
- Accessible: keyboard friendly, labelled controls, works on mobile

## Tech stack

React 18 · Vite 5 · JavaScript · CSS · Vitest · React Testing Library · ESLint · GitHub Actions · GitHub Pages

## Getting started

Requires Node.js 18 or newer.

```bash
git clone https://github.com/nausheenfarru01-sudo/todo-app.git
cd todo-app
npm install
npm run dev
```

Open http://localhost:5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run the test suite (8 tests) |
| `npm run lint` | Check the code with ESLint |
| `npm run build` | Build for production into `dist/` |

## Project structure

```
src/
├── App.jsx                 # state and task operations
├── components/
│   ├── TodoInput.jsx       # new-task form
│   ├── TodoList.jsx        # list and empty states
│   ├── TodoItem.jsx        # one task: toggle, inline edit, delete
│   └── TodoFilters.jsx     # filter buttons, counter, clear completed
├── hooks/
│   └── useLocalStorage.js  # state synced to localStorage
└── App.test.jsx            # user-level tests with Testing Library
```

## Deployment

Every push to `main` runs lint, tests and the build, then deploys to GitHub Pages through GitHub Actions.
