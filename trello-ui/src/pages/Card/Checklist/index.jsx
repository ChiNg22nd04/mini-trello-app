import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import TaskRow from "./TaskRow";
import TaskEditRow from "./TaskEditRow";
import TaskAddRow from "./TaskAddRow";
import { Button } from "../../../components";

export default function Checklist({
    tasks,
    taskMembersMap,
    boardMembers,
    progress,
    actions, // { toggleTask, deleteTask, deleteChecked, addTask, saveTask }
    isBoardClosed = false,
}) {
    const [hideChecked, setHideChecked] = useState(false);
    const [eyePulse, setEyePulse] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showAdd, setShowAdd] = useState(false);

    const progressText = useMemo(() => `${progress}%`, [progress]);

    return (
        <div className="section">
            <div className="section-header">
                <Icon icon="material-symbols:checklist" width={24} />
                Checklist
            </div>

            {/* Progress */}
            <div className="progress-container">
                <span className="progress-text">{progressText}</span>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <Button
                    name={hideChecked ? "Hide Checked" : "Show Checked"}
                    icon={hideChecked ? "material-symbols:visibility" : "material-symbols:visibility-off"}
                    variant="greenModern"
                    iconSize={24}
                    size="md"
                    onClick={() => {
                        setHideChecked((s) => !s);
                        setEyePulse(true);
                        setTimeout(() => setEyePulse(false), 320);
                    }}
                />

                <Button name="Delete" icon="material-symbols:delete-outline" variant="redModern" iconSize={24} size="md" onClick={actions.deleteChecked} />
            </div>

            {/* Task list */}
            {tasks.map((t) => {
                const isEditing = editingId === t.id;

                if (!isEditing) {
                    return (
                        <TaskRow
                            key={t.id}
                            task={t}
                            members={taskMembersMap[t.id] || []}
                            hideChecked={hideChecked}
                            onToggle={actions.toggleTask}
                            onEdit={() => setEditingId(t.id)}
                            onDelete={() => actions.deleteTask(t.id)}
                        />
                    );
                }

                const assigned = Array.isArray(t.assignedTo) ? t.assignedTo.map((a) => (typeof a === "object" ? a.id || a._id || a.uid || a.name : a)) : t.assignedTo ? [t.assignedTo] : [];

                return (
                    <TaskEditRow
                        key={t.id}
                        task={t}
                        defaultTitle={t.title || ""}
                        defaultAssignedIds={assigned}
                        defaultDue={t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : ""}
                        boardMembers={boardMembers}
                        onSave={async ({ title, assignedIds, dueDate }) => {
                            await actions.saveTask(t.id, { title, assignedToIds: assignedIds, dueDate });
                            setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                    />
                );
            })}

            {/* Add task */}
            {!showAdd ? (
                <div className="add-task-button" onClick={() => !isBoardClosed && setShowAdd(true)} style={{ opacity: isBoardClosed ? 0.6 : 1, cursor: isBoardClosed ? "not-allowed" : "pointer" }}>
                    <Icon icon="material-symbols:add" width={24} />
                    {isBoardClosed ? "Board closed" : "Add an item"}
                </div>
            ) : (
                <TaskAddRow
                    boardMembers={boardMembers}
                    onAdd={async ({ title, assignedIds, dueDate }) => {
                        const created = await actions.addTask({ title, assignedToIds: assignedIds, dueDate });
                        if (created) setShowAdd(false);
                    }}
                    onCancel={() => setShowAdd(false)}
                    disabled={isBoardClosed}
                />
            )}
        </div>
    );
}
