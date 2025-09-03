import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import API_BASE_URL from "../../../config/config";

const CardDetail = ({ card, onClose, boardId, token, boardMembers = [], onTaskCountsChange }) => {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newAssigned, setNewAssigned] = useState([]); // array of member ids
    const [newDueDate, setNewDueDate] = useState(""); // yyyy-mm-dd
    const [hideChecked, setHideChecked] = useState(false);

    const assignedMembers = useMemo(() => {
        if (!tasks || tasks.length === 0) {
            console.log("assignedMembers: no tasks");
            return [];
        }

        // B1: flatten assignedTo
        const raw = tasks.flatMap((t) => (Array.isArray(t.assignedTo) ? t.assignedTo : t.assignedTo ? [t.assignedTo] : []));
        console.log("assignedMembers raw:", raw);

        // B2: chuẩn hóa id
        const normalized = raw
            .map((a) => {
                if (!a) return null;
                if (typeof a === "object") {
                    const id = a.id || a._id || a.uid || a.email || a.name || null;
                    return id ? { id: String(id), memberFromTask: a } : null;
                }
                return { id: String(a), memberFromTask: null };
            })
            .filter(Boolean);

        console.log("assignedMembers normalized:", normalized);

        // B3: gom map
        const map = new Map();
        normalized.forEach(({ id, memberFromTask }) => {
            if (map.has(id)) return;

            let member = memberFromTask || null;
            if (!member) {
                member = Array.isArray(boardMembers) ? boardMembers.find((m) => String(m.id || m._id || m.uid || m.email || m.name) === id) : null;
            }

            console.log("assignedMembers loop -> id:", id, "member:", member);

            const label = member ? member.name || member.displayName || member.email || member.id : id;
            const initial = label ? String(label).charAt(0).toUpperCase() : "?";

            map.set(id, { id, member, label, initial });
        });

        const result = Array.from(map.values());
        console.log("assignedMembers result:", result);

        return result;
    }, [tasks, boardMembers]);

    // popover toggles for create
    const [showAssignPicker, setShowAssignPicker] = useState(false);
    const [showDuePicker, setShowDuePicker] = useState(false);

    // editing existing task
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editAssigned, setEditAssigned] = useState([]);
    const [editDueDate, setEditDueDate] = useState("");
    const [showEditAssignPicker, setShowEditAssignPicker] = useState(null);
    const [showEditDuePicker, setShowEditDuePicker] = useState(false);

    const completedCount = tasks.filter((t) => t.completed).length;
    const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

    // Notify parent when task counts change so it can update UI without reload
    useEffect(() => {
        if (!card || typeof onTaskCountsChange !== "function") return;
        const done = tasks.filter((t) => t.completed).length;
        const total = tasks.length;
        onTaskCountsChange(card.id, { done, total });
    }, [tasks, card, onTaskCountsChange]);

    const fetchTasks = useCallback(async () => {
        if (!card || !boardId || !token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
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
                {
                    title: newTaskTitle.trim(),
                    assignedTo: newAssigned.map((mid) => String(mid)), // ✅ luôn là id dạng string
                    dueDate: newDueDate || null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks((prev) => [...prev, res.data]);
            setNewTaskTitle("");
            setNewAssigned([]);
            setNewDueDate("");
        } catch (err) {
            console.error("Failed to create task:", err);
            alert("Failed to add task");
        }
    };

    const handleToggle = async (task) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${task.id}`, { completed: !task.completed }, { headers: { Authorization: `Bearer ${token}` } });
            setTasks((prev) => prev.map((it) => (it.id === task.id ? res.data : it)));
        } catch (err) {
            console.error("Failed to update task:", err);
            // fallback optimistic
            setTasks((prev) => prev.map((it) => (it.id === task.id ? { ...it, completed: !it.completed } : it)));
        }
    };

    const handleDelete = async (taskId) => {
        const ok = window.confirm("Delete this task?");
        if (!ok) return;
        try {
            await axios.delete(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert("Failed to delete task");
        }
    };

    const startEdit = (task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title || "");
        // Normalize assignedTo into array of ids or strings
        const assigned = Array.isArray(task.assignedTo) ? task.assignedTo.map((a) => (typeof a === "object" ? a.id || a._id || a.uid || a.name : a)) : task.assignedTo ? [task.assignedTo] : [];
        setEditAssigned(assigned);
        // dueDate -> yyyy-mm-dd
        setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
        setEditTitle("");
        setEditAssigned([]);
        setEditDueDate("");
    };

    const saveEdit = async (taskId) => {
        try {
            const res = await axios.put(
                `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${taskId}`,
                {
                    title: editTitle.trim(),
                    assignedTo: editAssigned.map((mid) => String(mid)), // ✅ normalize về string id
                    dueDate: editDueDate || null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks((prev) => prev.map((it) => (it.id === taskId ? res.data : it)));
            cancelEdit();
        } catch (err) {
            console.error("Failed to update task:", err);
            alert("Failed to save task");
        }
    };

    const handleDeleteChecked = async () => {
        const checked = tasks.filter((t) => t.completed);
        if (checked.length === 0) return;
        const confirmDelete = window.confirm(`Delete ${checked.length} completed item(s)?`);
        if (!confirmDelete) return;
        try {
            await Promise.all(
                checked.map((t) =>
                    axios.delete(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${t.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                )
            );
            setTasks((prev) => prev.filter((t) => !t.completed));
        } catch (err) {
            console.error("Failed to delete tasks:", err);
            alert("Failed to delete tasks");
        }
    };

    const getInitial = (name) => {
        console.log("name", name);
        if (!name) return "?";
        return name
            .normalize("NFD") // chuẩn Unicode tách dấu
            .replace(/[\u0300-\u036f]/g, "") // xóa dấu
            .charAt(0)
            .toUpperCase();
    };

    return (
        <>
            <div className="position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }} onClick={onClose} />

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
                        <Icon icon="material-symbols:keyboard-onscreen" width={22} color="white" />
                        <div>
                            <h5 className="mb-0 text-black">{card.name || card.title}</h5>
                            <small className="text-secondary">in list {card.status ? card.status.charAt(0).toUpperCase() + card.status.slice(1) : "To do"}</small>
                        </div>
                    </div>
                    <button className="btn" style={{ marginRight: "-18px" }} onClick={onClose}>
                        <Icon icon="material-symbols:close" width={24} color="white" />
                    </button>
                </div>

                <div className="text-black ">
                    <div className="d-flex gap-4 mb-4 align-items-start">
                        {/* Members */}
                        <div style={{ minWidth: 200, maxWidth: 250 }}>
                            <p className="mb-2 fw-semibold text-black">Members</p>
                            <div className="d-flex flex-wrap" style={{ gap: 8, rowGap: 12 }}>
                                {assignedMembers.length === 0 ? (
                                    <div className="bg-danger rounded-circle text-black d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                        {(card.assignedTo || card.owner || (Array.isArray(card.members.username) && card.members.username[0]) || "").charAt(0).toUpperCase()}
                                    </div>
                                ) : (
                                    assignedMembers.map((a, idx) => (
                                        <div
                                            key={a.id}
                                            className="bg-primary rounded-circle border border-2 border-dark text-black d-flex align-items-center justify-content-center fw-semibold"
                                            style={{
                                                width: 40,
                                                height: 40,
                                                fontSize: 14,
                                                marginLeft: idx === 0 ? 0 : -15, // 👈 overlap nhẹ
                                                zIndex: 100 - idx, // 👈 đảm bảo avatar sau nằm dưới
                                                transition: "transform 0.2s ease",
                                                cursor: "pointer",
                                            }}
                                            title={a.member.username}
                                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                        >
                                            {getInitial(a.member.username)}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex-grow-1">
                            <p className="d-flex align-items-center mb-2 fw-semibold text-black">
                                <Icon icon="material-symbols:description" width={20} />
                                <span className="ps-2">Description</span>
                            </p>
                            <div
                                className="border border-secondary rounded-3 px-3 py-3 bg-dark text-black"
                                style={{
                                    minHeight: 80,
                                    lineHeight: 1.5,
                                    fontSize: 14,
                                }}
                            >
                                {card.description ? <span>{card.description}</span> : <span className="text-muted fst-italic">Add a more detailed description</span>}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="d-flex align-items-center mb-2 fw-semibold text-black">
                            <Icon icon="material-symbols:checklist" width={20} />
                            <span className="ps-2">Checklist</span>
                        </p>

                        <div className="border border-secondary rounded px-3 py-3 bg-dark text-black shadow-sm">
                            {/* Progress bar */}
                            <div className="d-flex align-items-center mb-3">
                                <div className="small text-black me-auto fw-semibold">{progress}%</div>
                                <div style={{ flex: 1, margin: "0 12px" }}>
                                    <div
                                        style={{
                                            height: 8,
                                            background: "#2b2f31",
                                            borderRadius: 50,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${progress}%`,
                                                height: "100%",
                                                background: "linear-gradient(90deg,#6ea8fe,#3a7afe)",
                                                borderRadius: 50,
                                                transition: "width 0.3s ease",
                                            }}
                                        />
                                    </div>
                                </div>
                                <button className="btn btn-sm btn-outline-light ms-2" onClick={() => setHideChecked((s) => !s)}>
                                    {hideChecked ? "Show checked" : "Hide checked"}
                                </button>
                                <button className="btn btn-sm btn-outline-danger ms-2" onClick={handleDeleteChecked}>
                                    Delete
                                </button>
                            </div>

                            {tasks
                                .filter((t) => (hideChecked ? !t.completed : true))
                                .map((t) => (
                                    <div key={t.id}>
                                        {/* Task item hiển thị */}
                                        <div
                                            className="p-2 mb-1 rounded d-flex justify-content-between align-items-center"
                                            style={{
                                                background: "#2c3034",
                                                transition: "background 0.2s ease",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#343a40")}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = "#2c3034")}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <input type="checkbox" checked={!!t.completed} onChange={() => handleToggle(t)} />
                                                <div>
                                                    <div
                                                        className="fw-semibold"
                                                        style={{
                                                            textDecoration: t.completed ? "line-through" : "none",
                                                            opacity: t.completed ? 0.6 : 1,
                                                        }}
                                                    >
                                                        {t.title}
                                                    </div>
                                                    {t.description && <div className="small text-muted">{t.description}</div>}
                                                    {t.dueDate && <div className="small text-warning">Due: {new Date(t.dueDate).toLocaleDateString()}</div>}
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center gap-2">
                                                {/* Avatars */}
                                                <div className="d-flex" style={{ marginRight: 6 }}>
                                                    {(Array.isArray(t.assignedTo) ? t.assignedTo : []).slice(0, 3).map((a, idx) => {
                                                        const mem = boardMembers.find((m) => String(m.id || m._id || m.uid || m.name || m.email) === String(a));
                                                        const label = mem?.username || mem?.name || mem?.displayName || mem?.email || a;
                                                        const initial = label.charAt(0).toUpperCase();
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="rounded-circle bg-primary text-black border border-2 border-dark d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: 26,
                                                                    height: 26,
                                                                    fontSize: 12,
                                                                    marginLeft: idx === 0 ? 0 : -5,
                                                                    zIndex: 10 - idx,
                                                                }}
                                                                title={label}
                                                            >
                                                                {initial}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Actions */}
                                                <button
                                                    className="d-flex align-items-center justify-content-center"
                                                    title="Edit task"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEdit(t);
                                                    }}
                                                    style={{
                                                        cursor: "pointer",
                                                        border: "none",
                                                        background: "transparent",
                                                        color: "#6ea8fe",
                                                        padding: "4px 8px",
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#3a7afe")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6ea8fe")}
                                                >
                                                    <Icon icon="material-symbols:edit-outline" width={20} />
                                                </button>

                                                <button
                                                    className="d-flex align-items-center justify-content-center"
                                                    title="Delete task"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(t.id);
                                                    }}
                                                    style={{
                                                        cursor: "pointer",
                                                        border: "none",
                                                        background: "transparent",
                                                        color: "#dc3545",
                                                        padding: "4px 8px",
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4d5b")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#dc3545")}
                                                >
                                                    <Icon icon="material-symbols:delete-outline" width={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {editingTaskId === t.id && (
                                            <div className="p-2">
                                                <div className="border p-2 rounded bg-dark">
                                                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="form-control mb-2 bg-dark text-black border-secondary" />

                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="d-flex align-items-center gap-2 position-relative mb-2">
                                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowEditAssignPicker((s) => (s === t.id ? null : t.id))}>
                                                                <Icon icon="material-symbols:person" width={16} /> Assign
                                                            </button>
                                                            {showEditAssignPicker === t.id && (
                                                                <div
                                                                    className="position-absolute"
                                                                    style={{
                                                                        top: "105%",
                                                                        left: 0,
                                                                        zIndex: 2000,
                                                                        background: "#1d2125",
                                                                        border: "1px solid #444",
                                                                        padding: 8,
                                                                        borderRadius: 6,
                                                                        minWidth: 220,
                                                                    }}
                                                                >
                                                                    {(boardMembers || []).map((m) => {
                                                                        const mid = m.id || m._id || m.uid || m.name || m.email;
                                                                        const isSelected = editAssigned.includes(mid);
                                                                        const label = m.username || m.name || m.displayName || m.email || mid;
                                                                        const initial = getInitial(label);

                                                                        return (
                                                                            <div
                                                                                key={mid}
                                                                                className="d-flex align-items-center gap-2 p-1 rounded"
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                    background: isSelected ? "#2b2f31" : "transparent",
                                                                                }}
                                                                                onClick={() => {
                                                                                    if (isSelected) {
                                                                                        setEditAssigned((prev) => prev.filter((p) => p !== mid));
                                                                                    } else {
                                                                                        setEditAssigned((prev) => [...prev, mid]);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    className="rounded-circle bg-primary text-black d-flex align-items-center justify-content-center"
                                                                                    style={{ width: 28, height: 28, fontSize: 13 }}
                                                                                >
                                                                                    {initial}
                                                                                </div>
                                                                                <span className="text-black small">{label}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {/* Due Date */}
                                                            <div className="position-relative">
                                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowEditDuePicker((s) => !s)}>
                                                                    <Icon icon="material-symbols:schedule" width={16} />
                                                                </button>
                                                                {showEditDuePicker && (
                                                                    <div
                                                                        className="position-absolute"
                                                                        style={{
                                                                            top: "105%",
                                                                            left: 0,
                                                                            zIndex: 2000,
                                                                            background: "#1d2125",
                                                                            border: "1px solid #444",
                                                                            padding: 8,
                                                                            borderRadius: 6,
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="date"
                                                                            value={editDueDate}
                                                                            onChange={(e) => setEditDueDate(e.target.value)}
                                                                            className="form-control form-control-sm bg-dark text-black border-secondary"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="d-flex gap-2">
                                                            <button className="btn btn-sm btn-primary" onClick={() => saveEdit(t.id)}>
                                                                Save
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                            {/* Input add task */}
                            <div className="mt-3">
                                <div className="d-flex flex-column" style={{ gap: 8 }}>
                                    <input
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        className="form-control form-control-sm bg-dark text-black border-secondary"
                                        placeholder="Add an item"
                                    />

                                    <div className="d-flex align-items-center justify-content-between mt-2">
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-primary" onClick={handleAddTask}>
                                                Save
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => {
                                                    setNewTaskTitle("");
                                                    setNewAssigned([]);
                                                    setNewDueDate("");
                                                    setShowAssignPicker(false);
                                                    setShowDuePicker(false);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <div className="d-flex align-items-center gap-2 position-relative">
                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowAssignPicker((s) => !s)}>
                                                <Icon icon="material-symbols:person" width={16} /> Assign
                                            </button>
                                            {showAssignPicker && (
                                                <div
                                                    className="position-absolute"
                                                    style={{
                                                        top: "105%",
                                                        right: 0,
                                                        zIndex: 2000,
                                                        background: "#1d2125",
                                                        border: "1px solid #444",
                                                        padding: 8,
                                                        borderRadius: 6,
                                                        minWidth: 220,
                                                    }}
                                                >
                                                    {(boardMembers || []).map((m) => {
                                                        const mid = m.id || m._id || m.uid || m.name || m.email;
                                                        const isSelected = newAssigned.includes(mid);

                                                        const label = m.username || m.name || m.displayName || m.email || mid;
                                                        const initial = getInitial(label);

                                                        return (
                                                            <div
                                                                key={mid}
                                                                className="d-flex align-items-center gap-2 p-1 rounded"
                                                                style={{
                                                                    cursor: "pointer",
                                                                    background: isSelected ? "#2b2f31" : "transparent",
                                                                }}
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        setNewAssigned((prev) => prev.filter((p) => p !== mid));
                                                                    } else {
                                                                        setNewAssigned((prev) => [...prev, mid]);
                                                                    }
                                                                }}
                                                            >
                                                                <div
                                                                    className="rounded-circle bg-primary text-black d-flex align-items-center justify-content-center"
                                                                    style={{ width: 28, height: 28, fontSize: 13 }}
                                                                >
                                                                    {initial}
                                                                </div>
                                                                <span className="text-black small">{label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="position-relative">
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowDuePicker((s) => !s)}>
                                                    <Icon icon="material-symbols:schedule" width={16} />
                                                </button>
                                                {showDuePicker && (
                                                    <div
                                                        className="position-absolute"
                                                        style={{
                                                            top: "105%",
                                                            right: 0,
                                                            zIndex: 2000,
                                                            background: "#1d2125",
                                                            border: "1px solid #444",
                                                            padding: 8,
                                                            borderRadius: 6,
                                                        }}
                                                    >
                                                        <input
                                                            type="date"
                                                            value={newDueDate}
                                                            onChange={(e) => setNewDueDate(e.target.value)}
                                                            className="form-control form-control-sm bg-dark text-black border-secondary"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div>
                        <p className="d-flex align-items-center mb-2">
                            <Icon icon="material-symbols:activity" width={20} />
                            <span className="ps-2">Activity</span>
                            <button className="btn btn-sm btn-outline-secondary ms-auto">Show details</button>
                        </p>
                        <div className="d-flex align-items-start gap-2">
                            <div className="bg-danger rounded-circle text-black d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                {(card.assignedTo || card.owner || (Array.isArray(card.members) && card.members[0]) || "").charAt(0).toUpperCase()}
                            </div>
                            <input className="form-control bg-dark text-black border-secondary" placeholder="Write a comment" />
                        </div>
                    </div> */}
                </div>

                {/* <div style={{ width: "25%" }}>
                        <div className="mb-4">
                            <p className="text-black fw-bold mb-2">Add to card</p>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">
                                <Icon icon="material-symbols:person" width={18} className="me-2" />
                                Members
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-black fw-bold mb-2">Power-Ups</p>
                            <button className="btn btn-dark w-100 text-start mb-2 d-flex align-items-center gap-2">
                                <Icon icon="mdi:github" width={18} />
                                GitHub
                            </button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">Attach Branch</button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">Attach Commit</button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">Attach Issue</button>
                            <button className="btn btn-outline-secondary w-100 text-start mb-2">Attach Pull Request...</button>
                        </div>

                        <button className="btn btn-outline-secondary w-100 text-start">
                            <Icon icon="material-symbols:archive" width={18} className="me-2" />
                            Archive
                        </button>
                    </div> */}
            </div>
        </>
    );
};

export default CardDetail;
