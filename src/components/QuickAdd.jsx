import { forwardRef, useMemo, useState } from "react";
import { useTasks } from "../store/TaskContext";
import { formatDue } from "../lib/date";
import { parseQuickAdd } from "../lib/parse";
import { PRIORITY_META } from "../lib/selectors";
import Icon from "./Icon";

const QuickAdd = forwardRef(function QuickAdd({ defaults = {}, onAdded, autoFocus = false, placeholder }, ref) {
  const { actions, today } = useTasks();
  const [text, setText] = useState("");
  const parsed = useMemo(() => (text.trim() ? parseQuickAdd(text, today) : null), [text, today]);

  const submit = (e) => {
    e.preventDefault();
    const task = actions.addFromText(text, defaults);
    if (task) {
      setText("");
      onAdded?.(task);
    }
  };

  const chips = [];
  if (parsed?.due) chips.push(<span key="due" className="chip"><Icon name="calendar" size={12} /> {formatDue(parsed.due, today)}</span>);
  if (parsed && parsed.priority !== "none")
    chips.push(<span key="p" className="chip" style={{ color: PRIORITY_META[parsed.priority].color }}><Icon name="flag" size={12} /> {PRIORITY_META[parsed.priority].label}</span>);
  if (parsed?.projectName) chips.push(<span key="proj" className="chip"><Icon name="folder" size={12} /> {parsed.projectName}</span>);
  parsed?.tags.forEach((t) => chips.push(<span key={t} className="chip">#{t}</span>));

  return (
    <form className="quick-add" onSubmit={submit}>
      <div className="quick-add-row">
        <Icon name="plus" size={18} className="quick-add-icon" />
        <input
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder ?? "Add a task… try “Submit report friday !high #college @Work”"}
          aria-label="New task"
          maxLength={240}
          autoFocus={autoFocus}
        />
        <button type="submit" className="btn primary sm" disabled={!parsed?.title}>
          Add
        </button>
      </div>
      {chips.length > 0 && <div className="quick-add-preview">{chips}</div>}
    </form>
  );
});

export default QuickAdd;
