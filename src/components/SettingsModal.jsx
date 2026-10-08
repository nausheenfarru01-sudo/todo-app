import { useRef, useState } from "react";
import { useTasks } from "../store/TaskContext";
import Icon from "./Icon";
import Modal from "./Modal";

const ACCENTS = ["#7c5cff", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

export default function SettingsModal() {
  const { state, actions, setUI } = useTasks();
  const { settings } = state;
  const fileRef = useRef(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const close = () => setUI((u) => ({ ...u, settings: false }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.tasks)) throw new Error("Not a TaskFlow backup");
      actions.load(data);
      actions.toast(`Imported ${data.tasks.length} tasks`);
      close();
    } catch {
      actions.toast("That file isn't a valid TaskFlow backup");
    }
  };

  return (
    <Modal title="Settings" onClose={close} className="settings">
      <div className="settings-body">
        <label className="field">
          <span>Your name</span>
          <input value={settings.name} onChange={(e) => actions.setSettings({ name: e.target.value })} maxLength={40} />
        </label>

        <div className="field">
          <span>Theme</span>
          <div className="segmented">
            {["light", "dark", "system"].map((t) => (
              <button key={t} type="button" className={settings.theme === t ? "active" : ""} onClick={() => actions.setSettings({ theme: t })}>
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>Accent colour</span>
          <div className="swatches">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Accent ${c}`}
                className={settings.accent === c ? "active" : ""}
                style={{ background: c }}
                onClick={() => actions.setSettings({ accent: c })}
              />
            ))}
          </div>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Focus length (min)</span>
            <input type="number" min={5} max={90} value={settings.focusMinutes} onChange={(e) => actions.setSettings({ focusMinutes: Math.max(1, Number(e.target.value) || 25) })} />
          </label>
          <label className="field">
            <span>Break length (min)</span>
            <input type="number" min={1} max={30} value={settings.breakMinutes} onChange={(e) => actions.setSettings({ breakMinutes: Math.max(1, Number(e.target.value) || 5) })} />
          </label>
        </div>

        <div className="field">
          <span>Your data</span>
          <p className="muted">Everything is stored privately in this browser. Back it up or move it to another device.</p>
          <div className="button-row">
            <button className="btn" onClick={exportData}><Icon name="download" size={16} /> Export JSON</button>
            <button className="btn" onClick={() => fileRef.current.click()}><Icon name="upload" size={16} /> Import JSON</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
            <button className="btn" onClick={() => { actions.loadSample(); close(); }}><Icon name="sparkle" size={16} /> Load sample data</button>
          </div>
        </div>

        <div className="field danger-zone">
          <span>Danger zone</span>
          {confirmReset ? (
            <div className="button-row">
              <span>Delete every task and project?</span>
              <button className="btn danger" onClick={() => { actions.reset(); setConfirmReset(false); close(); }}>Yes, delete all</button>
              <button className="btn ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn danger ghost" onClick={() => setConfirmReset(true)}><Icon name="trash" size={16} /> Start fresh</button>
          )}
        </div>
      </div>
    </Modal>
  );
}
