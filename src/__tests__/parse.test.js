import { describe, expect, it } from "vitest";
import { parseQuickAdd } from "../lib/parse";

// 2026-10-08 is a Thursday.
const TODAY = "2026-10-08";
const parse = (text) => parseQuickAdd(text, TODAY);

describe("parseQuickAdd", () => {
  it("returns plain text as the title", () => {
    expect(parse("Buy milk")).toEqual({ title: "Buy milk", priority: "none", due: null, tags: [], projectName: null });
  });

  it("extracts priority, tags, project and date together", () => {
    expect(parse("Revise OS deadlocks fri !high #exam #os @College")).toEqual({
      title: "Revise OS deadlocks",
      priority: "high",
      due: "2026-10-09",
      tags: ["exam", "os"],
      projectName: "College",
    });
  });

  it.each([
    ["today", "2026-10-08"],
    ["tomorrow", "2026-10-09"],
    ["tmrw", "2026-10-09"],
    ["next week", "2026-10-15"],
    ["in 3 days", "2026-10-11"],
    ["in 2 weeks", "2026-10-22"],
    ["monday", "2026-10-12"],
    ["thu", "2026-10-15"],
    ["oct 20", "2026-10-20"],
    ["5 jan", "2027-01-05"],
    ["2026-12-25", "2026-12-25"],
  ])("understands “%s”", (phrase, expected) => {
    const result = parse(`Task ${phrase}`);
    expect(result.due).toBe(expected);
    expect(result.title).toBe("Task");
  });

  it("drops a dangling 'by' before the date", () => {
    expect(parse("Submit report by friday").title).toBe("Submit report");
  });

  it.each([["!1", "urgent"], ["!urgent", "urgent"], ["!h", "high"], ["!med", "medium"], ["!4", "low"]])("maps %s to %s", (token, priority) => {
    expect(parse(`Task ${token}`).priority).toBe(priority);
  });

  it("leaves unknown ! words in the title", () => {
    expect(parse("Wow !amazing").title).toBe("Wow !amazing");
  });

  it("does not treat words that contain day names as dates", () => {
    expect(parse("Read Sunday newspaper").due).toBe("2026-10-11");
    expect(parse("Fix the monitor").due).toBe(null);
  });

  it("turns dashes in project names into spaces", () => {
    expect(parse("Apply @internship-prep").projectName).toBe("internship prep");
  });
});
