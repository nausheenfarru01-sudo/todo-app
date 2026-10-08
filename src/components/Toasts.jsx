import { useTasks } from "../store/TaskContext";
import Icon from "./Icon";

export default function Toasts() {
  const { toasts, dismissToast } = useTasks();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span>{t.message}</span>
          {t.undo && (
            <button
              className="toast-undo"
              onClick={() => {
                t.undo();
                dismissToast(t.id);
              }}
            >
              <Icon name="undo" size={14} /> Undo
            </button>
          )}
          <button className="icon-btn" aria-label="Dismiss" onClick={() => dismissToast(t.id)}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
