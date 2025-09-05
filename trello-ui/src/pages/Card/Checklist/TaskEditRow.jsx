import { Icon } from "@iconify/react";
import { useState } from "react";
import AssignDropdown from "../AssignDropdown";
import DueDropdown from "../DueDropdown";

export default function TaskEditRow({ task, defaultTitle, defaultAssignedIds, defaultDue, boardMembers, onSave, onCancel }) {
    const [title, setTitle] = useState(defaultTitle || "");
    const [assignedIds, setAssignedIds] = useState(defaultAssignedIds || []);
    const [dueDate, setDueDate] = useState(defaultDue || "");
    const [showAssign, setShowAssign] = useState(false);
    const [showDue, setShowDue] = useState(false);

    const toggleAssign = (mid, selected) => {
        setAssignedIds((prev) => (selected ? prev.filter((p) => p !== mid) : [...prev, mid]));
    };

    return (
        <div className="task-row">
            <div className="edit-section">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    style={{ marginBottom: "1rem" }}
                    placeholder="Task title"
                    onKeyDown={(e) => {
                        if (e.key === "Escape") onCancel();
                        if (e.key === "Enter" && title.trim()) onSave({ title, assignedIds, dueDate });
                    }}
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", position: "relative" }}>
                        <button className="btn btn-outline" onClick={() => setShowAssign((s) => !s)}>
                            <Icon icon="material-symbols:person" width={24} /> Assign
                        </button>
                        <AssignDropdown open={showAssign} members={boardMembers} selectedIds={assignedIds} onToggle={toggleAssign} anchor="left" />

                        <div style={{ position: "relative" }}>
                            <button className="btn btn-outline" onClick={() => setShowDue((s) => !s)}>
                                <Icon icon="material-symbols:schedule" width={24} />
                            </button>
                            <DueDropdown open={showDue} value={dueDate} onChange={setDueDate} anchor="left" />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: ".5rem" }}>
                        <button className="btn btn-primary" onClick={() => onSave({ title, assignedIds, dueDate })} disabled={!title.trim()}>
                            <Icon icon="material-symbols:save" width={24} />
                            Save
                        </button>
                        <button className="btn btn-outline" onClick={onCancel}>
                            <Icon icon="material-symbols:close" width={24} />
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
