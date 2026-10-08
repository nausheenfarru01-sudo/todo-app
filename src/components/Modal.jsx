import { useEffect } from "react";
import Icon from "./Icon";

export default function Modal({ title, onClose, children, className = "", hideHeader = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        {!hideHeader && (
          <header className="modal-header">
            <h2>{title}</h2>
            <button className="icon-btn" aria-label="Close" onClick={onClose}>
              <Icon name="x" />
            </button>
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
