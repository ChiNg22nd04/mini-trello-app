import React, { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import API_BASE_URL from "../../../config/config";

const CardDetail = ({ card, onClose, boardId, token, boardMembers = [] }) => {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [hideChecked, setHideChecked] = useState(false);

    const completedCount = tasks.filter((t) => t.completed).length;
    const progress =
        tasks.length === 0
            ? 0
            : Math.round((completedCount / tasks.length) * 100);

    const fetchTasks = useCallback(async () => {
        if (!card || !boardId || !token) return;
        try {
            const res = await axios.get(
                `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setTasks(res.data || []);
        } catch (err) {
            console.error("Failed to fetch tasks for card:", err);
            setTasks([]);
        }
    }, [card, boardId, token]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    if (!card) return null;

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            const res = await axios.post(
                `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks`,
                { title: newTaskTitle.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks((prev) => [...prev, res.data]);
            setNewTaskTitle("");
        } catch (err) {
            console.error("Failed to create task:", err);
            alert("Failed to add task");
        }
    };

    const handleToggle = async (task) => {
        try {
            const res = await axios.put(
                `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${task.id}`,
                { completed: !task.completed },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks((prev) =>
                prev.map((it) => (it.id === task.id ? res.data : it))
            );
        } catch (err) {
            console.error("Failed to update task:", err);
            // fallback optimistic
            setTasks((prev) =>
                prev.map((it) =>
                    it.id === task.id ? { ...it, completed: !it.completed } : it
                )
            );
        }
    };

    const handleDelete = async (taskId) => {
        const ok = window.confirm("Delete this task?");
        if (!ok) return;
        try {
            await axios.delete(
                `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${taskId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert("Failed to delete task");
        }
    };

    const handleDeleteChecked = async () => {
        const checked = tasks.filter((t) => t.completed);
        if (checked.length === 0) return;
        const confirmDelete = window.confirm(
            `Delete ${checked.length} completed item(s)?`
        );
        if (!confirmDelete) return;
        try {
            await Promise.all(
                checked.map((t) =>
                    axios.delete(
                        `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${t.id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    )
                )
            );
            setTasks((prev) => prev.filter((t) => !t.completed));
        } catch (err) {
            console.error("Failed to delete tasks:", err);
            alert("Failed to delete tasks");
        }
    };

    return (
        <>
            <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }}
                onClick={onClose}
            />

            <div
                className="position-fixed top-50 start-50 translate-middle rounded shadow px-4 py-4"
                style={{
                    backgroundColor: "#1d2125",
                    width: "1000px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    zIndex: 1050,
                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <Icon
                            icon="material-symbols:keyboard-onscreen"
                            width={22}
                            color="white"
                        />
                        <div>
                            <h5 className="mb-0 text-white">
                                {card.name || card.title}
                            </h5>
                            <small className="text-secondary">
                                in list{" "}
                                {card.status
                                    ? card.status.charAt(0).toUpperCase() +
                                      card.status.slice(1)
                                    : "To do"}
                            </small>
                        </div>
                    </div>
                    <button
                        className="btn"
                        style={{ marginRight: "-18px" }}
                        onClick={onClose}
                    >
                        <Icon
                            icon="material-symbols:close"
                            width={24}
                            color="white"
                        />
                    </button>
                </div>

                <div className="d-flex text-white" style={{ gap: "20px" }}>
                    <div style={{ width: "75%" }}>
                        <div className="d-flex mb-4 gap-5">
                            <div>
                                <p className="mb-1">Members</p>
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="bg-danger rounded-circle text-white d-flex align-items-center justify-content-center"
                                        style={{ width: 32, height: 32 }}
                                    >
                                        {(
                                            card.assignedTo ||
                                            card.owner ||
                                            (Array.isArray(card.members) &&
                                                card.members[0]) ||
                                            ""
                                        )
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div
                                        className="border border-primary rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 32, height: 32 }}
                                    >
                                        <Icon
                                            icon="material-symbols:add"
                                            width={20}
                                            color="white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="mb-1">Notifications</p>
                                <div
                                    className="px-2 py-1 border border-secondary rounded d-flex align-items-center gap-2"
                                    style={{
                                        cursor: "pointer",
                                        width: "fit-content",
                                    }}
                                >
                                    <Icon
                                        icon="material-symbols:eye-tracking-rounded"
                                        width={20}
                                        color="white"
                                    />
                                    <span className="text-white">Watch</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="d-flex align-items-center mb-2">
                                <Icon
                                    icon="material-symbols:description"
                                    width={20}
                                />
                                <span className="ps-2">Description</span>
                            </p>
                            <div className="border border-secondary rounded px-3 py-2 bg-dark text-white">
                                {card.description ||
                                    "Add a more detailed description"}
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="d-flex align-items-center mb-2">
                                <Icon
                                    icon="material-symbols:checklist"
                                    width={20}
                                />
                                <span className="ps-2">Checklist</span>
                            </p>

                            <div className="border border-secondary rounded px-3 py-2 bg-dark text-white">
                                <div className="d-flex align-items-center mb-2">
                                    <div className="small text-white me-auto">
                                        {progress}%
                                    </div>
                                    <div style={{ flex: 1, margin: "0 8px" }}>
                                        <div
                                            style={{
                                                height: 8,
                                                background: "#2b2f31",
                                                borderRadius: 8,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${progress}%`,
                                                    height: 8,
                                                    background: "#6ea8fe",
                                                    borderRadius: 8,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-secondary ms-2"
                                        onClick={() =>
                                            setHideChecked((s) => !s)
                                        }
                                    >
                                        {hideChecked
                                            ? "Show checked items"
                                            : "Hide checked items"}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger ms-2"
                                        onClick={handleDeleteChecked}
                                    >
                                        Delete
                                    </button>
                                </div>

                                {tasks.length === 0 ? (
                                    <div className="text-white">
                                        No tasks for this card
                                    </div>
                                ) : (
                                    <div
                                        className="d-flex flex-column"
                                        style={{ gap: 8 }}
                                    >
                                        {tasks
                                            .filter((t) =>
                                                hideChecked
                                                    ? !t.completed
                                                    : true
                                            )
                                            .map((t) => (
                                                <div
                                                    key={t.id}
                                                    className="p-2 border rounded bg-secondary d-flex justify-content-between align-items-center"
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                !!t.completed
                                                            }
                                                            onChange={() =>
                                                                handleToggle(t)
                                                            }
                                                        />
                                                        <div>
                                                            <div
                                                                className="fw-bold"
                                                                style={{
                                                                    textDecoration:
                                                                        t.completed
                                                                            ? "line-through"
                                                                            : "none",
                                                                    opacity:
                                                                        t.completed
                                                                            ? 0.6
                                                                            : 1,
                                                                }}
                                                            >
                                                                {t.title}
                                                            </div>
                                                            {t.description && (
                                                                <div className="small text-muted">
                                                                    {
                                                                        t.description
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="text-white small">
                                                            {t.assignedTo
                                                                ? String(
                                                                      t.assignedTo
                                                                  ).slice(0, 4)
                                                                : "-"}
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-link text-white p-0 ms-2"
                                                            title="Delete task"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(
                                                                    t.id
                                                                );
                                                            }}
                                                        >
                                                            <Icon
                                                                icon="material-symbols:delete-outline"
                                                                width={18}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                <div className="mt-3">
                                    <div className="d-flex gap-2">
                                        <input
                                            value={newTaskTitle}
                                            onChange={(e) =>
                                                setNewTaskTitle(e.target.value)
                                            }
                                            className="form-control form-control-sm bg-dark text-white border-secondary"
                                            placeholder="Add an item"
                                        />
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={handleAddTask}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="d-flex align-items-center mb-2">
                                <Icon
                                    icon="material-symbols:activity"
                                    width={20}
                                />
                                <span className="ps-2">Activity</span>
                                <button className="btn btn-sm btn-outline-secondary ms-auto">
                                    Show details
                                </button>
                            </p>
                            <div className="d-flex align-items-start gap-2">
                                <div
                                    className="bg-danger rounded-circle text-white d-flex align-items-center justify-content-center"
                                    style={{ width: 32, height: 32 }}
                                >
                                    {(
                                        card.assignedTo ||
                                        card.owner ||
                                        (Array.isArray(card.members) &&
                                            card.members[0]) ||
                                        ""
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <input
                                    className="form-control bg-dark text-white border-secondary"
                                    placeholder="Write a comment"
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ width: "25%" }}>
                        <div className="mb-4">
                            <p className="text-white fw-bold mb-2">
                                Add to card
                            </p>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">
                                <Icon
                                    icon="material-symbols:person"
                                    width={18}
                                    className="me-2"
                                />
                                Members
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-white fw-bold mb-2">Power-Ups</p>
                            <button className="btn btn-dark w-100 text-start mb-2 d-flex align-items-center gap-2">
                                <Icon icon="mdi:github" width={18} />
                                GitHub
                            </button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">
                                Attach Branch
                            </button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">
                                Attach Commit
                            </button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">
                                Attach Issue
                            </button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">
                                Attach Pull Request...
                            </button>
                        </div>

                        <button className="btn btn-outline-secondary w-100 text-start">
                            <Icon
                                icon="material-symbols:archive"
                                width={18}
                                className="me-2"
                            />
                            Archive
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CardDetail;
<button className="btn btn-outline-secondary w-100 text-start mb-2">
    Attach Issue
</button>;
