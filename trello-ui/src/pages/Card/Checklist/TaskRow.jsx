import { Icon } from "@iconify/react";
import { safeLabel, getInitial } from "../../../utils/people";
import MembersBar from "../MembersBar";

export default function TaskRow({ task, members, onToggle, onEdit, onDelete, hideChecked }) {
    const hidden = hideChecked && task.completed;
    if (hidden) return <div id={`task-row-${task.id}`} className="task-row hidden-checked" />;

    return (
        <div id={`task-row-${task.id}`} className="task-row">
            <div className={`task-item ${task.completed ? "completed" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flex: 1 }}>
                        <input type="checkbox" className="task-checkbox" checked={!!task.completed} onChange={() => onToggle(task)} />
                        <div style={{ flex: 1 }}>
                            <div className={`task-title ${task.completed ? "completed" : ""}`}>{task.title}</div>
                            {task.description && <div style={{ fontSize: ".8rem", color: "#6b7280", marginTop: ".25rem" }}>{task.description}</div>}
                            {task.dueDate && <div style={{ fontSize: ".8rem", color: "#f59e0b", marginTop: ".25rem" }}>Due: {new Date(task.dueDate).toLocaleDateString()}</div>}
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                        <div className="task-avatars" title={`${members.length} member(s)`}>
                            <MembersBar members={members} size="small" isShow={false} />
                        </div>

                        <button className="action-btn" title="Edit task" onClick={onEdit} style={{ color: "#3b82f6" }}>
                            <Icon icon="material-symbols:edit-outline" width={24} />
                        </button>

                        <button className="action-btn" title="Delete task" onClick={onDelete} style={{ color: "#ef4444" }}>
                            <Icon icon="material-symbols:delete-outline" width={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
