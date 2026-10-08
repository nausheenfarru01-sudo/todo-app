import { beforeEach, describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { emptyState } from "../store/reducer";

function start(hash = "#/inbox") {
  window.location.hash = hash;
  return { user: userEvent.setup(), ...render(<App />) };
}

beforeEach(() => {
  localStorage.setItem("taskflow.v1", JSON.stringify(emptyState()));
});

describe("TaskFlow", () => {
  it("loads sample data on first visit", () => {
    localStorage.clear();
    start("#/dashboard");
    expect(screen.getByText(/Good (morning|afternoon|evening)|midnight oil/)).toBeInTheDocument();
    expect(screen.getByText("Productivity")).toBeInTheDocument();
  });

  it("adds a task with smart quick-add parsing", async () => {
    const { user } = start("#/inbox");
    await user.type(screen.getByLabelText("New task"), "Revise DBMS tomorrow !high #exam @College{Enter}");

    const item = screen.getByRole("listitem", { name: "Revise DBMS" });
    expect(within(item).getByText("Tomorrow")).toBeInTheDocument();
    expect(within(item).getByText("#exam")).toBeInTheDocument();
    expect(within(item).getByText("College")).toBeInTheDocument();
    // The new project appears in the sidebar.
    expect(within(screen.getByRole("complementary", { name: "Main navigation" })).getByRole("button", { name: /^College/ })).toBeInTheDocument();
  });

  it("completes a task and can undo it", async () => {
    const { user } = start("#/inbox");
    await user.type(screen.getByLabelText("New task"), "Write tests{Enter}");
    await user.click(screen.getByRole("checkbox", { name: /Mark “Write tests” as done/ }));

    expect(screen.queryByRole("listitem", { name: "Write tests" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Undo/ }));
    expect(screen.getByRole("listitem", { name: "Write tests" })).toBeInTheDocument();
  });

  it("deletes a task and restores it with undo", async () => {
    const { user } = start("#/inbox");
    await user.type(screen.getByLabelText("New task"), "Temporary{Enter}");
    await user.click(screen.getByRole("button", { name: "Delete “Temporary”" }));
    expect(screen.queryByText("Temporary")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Undo/ }));
    expect(screen.getByText("Temporary")).toBeInTheDocument();
  });

  it("edits a task and its subtasks in the detail panel", async () => {
    const { user } = start("#/inbox");
    await user.type(screen.getByLabelText("New task"), "Seminar{Enter}");
    await user.click(screen.getByRole("listitem", { name: "Seminar" }));

    const panel = screen.getByRole("complementary", { name: "Task details" });
    await user.click(within(panel).getByRole("button", { name: "Urgent" }));
    await user.type(within(panel).getByLabelText("Add a subtask"), "Make slides{Enter}");
    expect(within(panel).getByText("0/1")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    const item = screen.getByRole("listitem", { name: "Seminar" });
    expect(within(item).getByText("0/1")).toBeInTheDocument();
    expect(within(item).getByTitle("Urgent priority")).toBeInTheDocument();
  });

  it("filters list by priority", async () => {
    const { user } = start("#/inbox");
    await user.type(screen.getByLabelText("New task"), "Big thing !urgent{Enter}");
    await user.type(screen.getByLabelText("New task"), "Small thing !low{Enter}");
    await user.click(within(screen.getByRole("group", { name: "Filter by priority" })).getByRole("button", { name: /Urgent/ }));

    expect(screen.getByText("Big thing")).toBeInTheDocument();
    expect(screen.queryByText("Small thing")).not.toBeInTheDocument();
  });

  it("searches across tasks", async () => {
    const { user } = start("#/inbox");
    await user.type(screen.getByLabelText("New task"), "Alpha task{Enter}");
    await user.type(screen.getByLabelText("New task"), "Beta task #special{Enter}");
    await user.type(screen.getByLabelText("Search"), "special");

    expect(screen.getByRole("heading", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByText("Beta task")).toBeInTheDocument();
    expect(screen.queryByText("Alpha task")).not.toBeInTheDocument();
  });

  it("opens the command palette with Ctrl+K and navigates", async () => {
    const { user } = start("#/inbox");
    await user.keyboard("{Control>}k{/Control}");
    const palette = screen.getByRole("dialog", { name: "Command palette" });
    await user.type(within(palette).getByRole("textbox"), "calendar{Enter}");
    await act(() => new Promise((r) => setTimeout(r, 0)));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Calendar" })).toBeInTheDocument();
  });

  it("supports keyboard shortcuts for new task and navigation", async () => {
    const { user } = start("#/inbox");
    await user.keyboard("n");
    const dialog = screen.getByRole("dialog", { name: "New task" });
    await user.type(within(dialog).getByLabelText("New task"), "From shortcut{Enter}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("From shortcut")).toBeInTheDocument();

    await user.keyboard("gb");
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(screen.getByRole("heading", { name: "Board" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "To do" })).toBeInTheDocument();
  });

  it("persists tasks across reloads", async () => {
    const { user, unmount } = start("#/inbox");
    await user.type(screen.getByLabelText("New task"), "Remember me{Enter}");
    unmount();
    start("#/inbox");
    expect(screen.getByText("Remember me")).toBeInTheDocument();
  });
});
