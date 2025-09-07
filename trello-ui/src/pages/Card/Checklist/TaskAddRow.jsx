import { useState } from "react";
import AssignDropdown from "../AssignDropdown";
import { Button, DueDropdown } from "../../../components";

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
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", position: "relative" }}>
                    <Button icon="material-symbols:person" variant="blueModern" iconSize={24} size="md" onClick={() => setShowAssign((s) => !s)} />

                    <AssignDropdown open={showAssign} members={boardMembers} selectedIds={assignedIds} onToggle={toggleAssign} anchor="right" />

                    <div style={{ position: "relative" }}>
                        <Button icon="material-symbols:schedule" variant="greenModern" iconSize={24} size="md" onClick={() => setShowDue((s) => !s)} />

                        <DueDropdown open={showDue} value={dueDate} onChange={setDueDate} anchor="right" />
                    </div>
                </div>
                <div style={{ display: "flex", gap: ".5rem" }}>
                    <Button name="Save" icon="material-symbols:save" variant="primary" iconSize={24} size="md" onClick={() => onAdd({ title, assignedIds, dueDate })} disabled={!title.trim()} />
                    <Button name="Cancel" icon="material-symbols:close" variant="redModern" iconSize={24} size="md" onClick={onCancel} />
                </div>
            </div>
        </div>
    );
}
