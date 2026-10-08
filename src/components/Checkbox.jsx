import { useState } from "react";
import Icon from "./Icon";
import { PRIORITY_META } from "../lib/selectors";

const BURST = Array.from({ length: 10 }, (_, i) => i);

export default function Checkbox({ checked, onChange, priority = "none", label }) {
  const [burst, setBurst] = useState(0);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!checked) setBurst((n) => n + 1);
    onChange();
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`checkbox${checked ? " checked" : ""}`}
      style={{ "--ring": PRIORITY_META[priority].color }}
      onClick={handleClick}
    >
      {checked && <Icon name="check" size={13} strokeWidth={3} />}
      {burst > 0 && (
        <span className="burst" key={burst} aria-hidden="true">
          {BURST.map((i) => (
            <i key={i} style={{ "--a": `${i * 36}deg` }} />
          ))}
        </span>
      )}
    </button>
  );
}
