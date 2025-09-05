import { Icon } from "@iconify/react";
import { useState } from "react";
import AssignDropdown from "../AssignDropdown";
import DueDropdown from "../DueDropdown";

export default function TaskAddRow({ boardMembers, onAdd, onCancel }) {
    const [title, setTitle] = useState("");
    const [assignedIds, setAssignedIds] = useState([]); // FIXED: đúng state cho Add
    const [dueDate, setDueDate] = useState("");
    const [showAssign, setShowAssign] = useState(false);
    const [showDue, setShowDue] = useState(false);

    const toggleAssign = (mid, selected) => {
        setAssignedIds((prev) => (selected ? prev.filter((p) => p !== mid) : [...prev, mid]));
    };

    return (
        <div className="add-task-section">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Add an item" style={{ marginBottom: "1rem" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", gap: ".5rem" }}>
                    <button className="btn btn-primary" onClick={() => onAdd({ title, assignedIds, dueDate })} disabled={!title.trim()}>
                        <Icon icon="material-symbols:add" width={24} />
                        Save
                    </button>
                    <button className="btn btn-outline" onClick={onCancel}>
                        <Icon icon="material-symbols:close" width={24} />
                        Cancel
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", position: "relative" }}>
                    <button className="btn btn-outline" onClick={() => setShowAssign((s) => !s)}>
                        <Icon icon="material-symbols:person" width={24} /> Assign
                    </button>
                    <AssignDropdown open={showAssign} members={boardMembers} selectedIds={assignedIds} onToggle={toggleAssign} anchor="right" />

                    <div style={{ position: "relative" }}>
                        <button className="btn btn-outline" onClick={() => setShowDue((s) => !s)}>
                            <Icon icon="material-symbols:schedule" width={24} />
                        </button>
                        <DueDropdown open={showDue} value={dueDate} onChange={setDueDate} anchor="right" />
                    </div>
                </div>
            </div>
        </div>
    );
}
