import { Icon } from "@iconify/react";
import { useState } from "react";
import AssignDropdown from "../AssignDropdown";
import DueDropdown from "../../../components/DueDropdown";
import { Button } from "../../../components";

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
                        <Button icon="material-symbols:person" variant="blueModern" iconSize={24} size="md" onClick={() => setShowAssign((s) => !s)} />

                        <AssignDropdown open={showAssign} members={boardMembers} selectedIds={assignedIds} onToggle={toggleAssign} anchor="left" />

                        <div style={{ position: "relative" }}>
                            <Button icon="material-symbols:schedule" variant="greenModern" iconSize={24} size="md" onClick={() => setShowDue((s) => !s)} />

                            <DueDropdown open={showDue} value={dueDate} onChange={setDueDate} anchor="left" />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: ".5rem" }}>
                        <Button name="Save" icon="material-symbols:save" variant="primary" iconSize={24} size="md" onClick={() => onSave({ title, assignedIds, dueDate })} disabled={!title.trim()} />
                        <Button name="Cancel" icon="material-symbols:close" variant="redModern" iconSize={24} size="md" onClick={onCancel} />
                    </div>
                </div>
            </div>
        </div>
    );
}
