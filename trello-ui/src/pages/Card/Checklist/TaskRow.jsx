import { Icon } from "@iconify/react";
import MembersBar from "../MembersBar";
import { Button } from "../../../components";

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

                        <Button icon="material-symbols:edit-outline" variant="blueModern" iconSize={24} size="md" onClick={onEdit} />

                        <Button icon="material-symbols:delete-outline" variant="redModern" iconSize={24} size="md" onClick={onDelete} />
                    </div>
                </div>
            </div>
        </div>
    );
}
