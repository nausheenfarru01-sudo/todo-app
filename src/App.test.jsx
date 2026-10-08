import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

async function addTask(user, text) {
  await user.type(screen.getByLabelText("New task"), `${text}{Enter}`);
}

describe("To-Do app", () => {
  it("adds a task and clears the input", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTask(user, "Finish Java lab record");

    expect(screen.getByText("Finish Java lab record")).toBeInTheDocument();
    expect(screen.getByLabelText("New task")).toHaveValue("");
    expect(screen.getByText("1 of 1 tasks left")).toBeInTheDocument();
  });

  it("ignores empty or whitespace-only tasks", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("New task"), "   {Enter}");

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("marks a task as done and updates the counter", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTask(user, "Read RAG paper");
    await user.click(screen.getByRole("checkbox"));

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByText("0 items left")).toBeInTheDocument();
  });

  it("deletes a task", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTask(user, "Temporary");
    await user.click(screen.getByLabelText('Delete "Temporary"'));

    expect(screen.queryByText("Temporary")).not.toBeInTheDocument();
  });

  it("edits a task with Enter and cancels with Escape", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTask(user, "Old name");

    await user.click(screen.getByLabelText('Edit "Old name"'));
    const editor = screen.getByLabelText("Edit task");
    await user.clear(editor);
    await user.type(editor, "New name{Enter}");
    expect(screen.getByText("New name")).toBeInTheDocument();

    await user.dblClick(screen.getByText("New name"));
    await user.type(screen.getByLabelText("Edit task"), " changed{Escape}");
    expect(screen.getByText("New name")).toBeInTheDocument();
  });

  it("filters active and completed tasks", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTask(user, "Task A");
    await addTask(user, "Task B");
    await user.click(screen.getByLabelText('Mark "Task A" as done'));

    await user.click(screen.getByRole("button", { name: "Active" }));
    let list = screen.getByRole("list");
    expect(within(list).getByText("Task B")).toBeInTheDocument();
    expect(within(list).queryByText("Task A")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Completed" }));
    list = screen.getByRole("list");
    expect(within(list).getByText("Task A")).toBeInTheDocument();
    expect(within(list).queryByText("Task B")).not.toBeInTheDocument();
  });

  it("clears completed tasks", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTask(user, "Done one");
    await addTask(user, "Still open");
    await user.click(screen.getByLabelText('Mark "Done one" as done'));
    await user.click(screen.getByRole("button", { name: "Clear completed" }));

    expect(screen.queryByText("Done one")).not.toBeInTheDocument();
    expect(screen.getByText("Still open")).toBeInTheDocument();
  });

  it("keeps tasks after a reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await addTask(user, "Persist me");
    unmount();

    render(<App />);
    expect(screen.getByText("Persist me")).toBeInTheDocument();
  });
});
