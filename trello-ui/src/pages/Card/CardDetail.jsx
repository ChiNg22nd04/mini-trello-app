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
    const [showAddTask, setShowAddTask] = useState(false);

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
    const [eyePulse, setEyePulse] = useState(false);

    // NEW: members from API
    const [cardMembers, setCardMembers] = useState([]); // [{id, username, avatar}, ...]
    const [taskMembersMap, setTaskMembersMap] = useState({}); // { [taskId]: Member[] }

    // (optional) cache by id
    const memberCache = useMemo(() => new Map(), []);

    const completedCount = tasks.filter((t) => t.completed).length;
    const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

    // Notify parent when task counts change so it can update UI without reload
    useEffect(() => {
        if (!card || typeof onTaskCountsChange !== "function") return;
        const done = tasks.filter((t) => t.completed).length;
        const total = tasks.length;
        onTaskCountsChange(card.id, { done, total });
    }, [tasks, card, onTaskCountsChange]);

    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    const fetchTasks = useCallback(async () => {
        if (!card || !boardId || !token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks`, {
                headers: authHeaders,
            });
            const list = res.data || [];
            setTasks(list);
            // hydrate members after tasks loaded
            fetchCardMembers();
            hydrateAllTaskMembers(list);
        } catch (err) {
            console.error("Failed to fetch tasks for card:", err);
            setTasks([]);
            setTaskMembersMap({});
            setCardMembers([]);
        }
    }, [card, boardId, token]); // fetchCardMembers & hydrateAllTaskMembers defined below with stable deps

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const fetchCardMembers = useCallback(async () => {
        try {
            if (!card?.id || !token) return;
            const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/members`, {
                headers: authHeaders,
            });
            console.log("res members of card", res);
            const list = res.data || [];
            console.log("list members of card", list);
            setCardMembers(list);
            list.forEach((u) => memberCache.set(String(u.id), u));
        } catch (e) {
            console.error("fetchCardMembers error", e);
            setCardMembers([]);
        }
    }, [card?.id, token, authHeaders, memberCache]);

    const fetchTaskMembers = useCallback(
        async (taskId) => {
            try {
                if (!card?.id || !taskId || !token) return [];
                const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${taskId}/members`, {
                    headers: authHeaders,
                });
                const list = res.data || [];
                list.forEach((u) => memberCache.set(String(u.id), u));
                return list;
            } catch (e) {
                console.error("fetchTaskMembers error", taskId, e);
                return [];
            }
        },
        [card?.id, token, authHeaders, memberCache]
    );

    const hydrateAllTaskMembers = useCallback(
        async (taskList) => {
            const ids = (taskList || []).map((t) => t.id).filter(Boolean);
            const pairs = await Promise.all(
                ids.map(async (tid) => {
                    const members = await fetchTaskMembers(tid);
                    return [tid, members];
                })
            );
            setTaskMembersMap(Object.fromEntries(pairs));
        },
        [fetchTaskMembers]
    );

    if (!card) return null;

    // -------- Task CRUD handlers --------
    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            const res = await axios.post(
                `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks`,
                {
                    title: newTaskTitle.trim(),
                    assignedTo: newAssigned.map((mid) => String(mid)),
                    dueDate: newDueDate || null,
                },
                { headers: authHeaders }
            );
            const created = res.data;
            setTasks((prev) => [...prev, created]);
            setNewTaskTitle("");
            setNewAssigned([]);
            setNewDueDate("");
            setShowAddTask(false);

            // sync members for new task + card
            if (created?.id) {
                const m = await fetchTaskMembers(created.id);
                setTaskMembersMap((prev) => ({ ...prev, [created.id]: m }));
            }
            fetchCardMembers();
        } catch (err) {
            console.error("Failed to create task:", err);
            alert("Failed to add task");
        }
    };

    const handleToggle = async (task) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${task.id}`, { completed: !task.completed }, { headers: authHeaders });
            setTasks((prev) => prev.map((it) => (it.id === task.id ? res.data : it)));
            // (optional) no members change
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
                headers: authHeaders,
            });
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            setTaskMembersMap((prev) => {
                const next = { ...prev };
                delete next[taskId];
                return next;
            });
            // card members might change if the deleted task had unique assignees
            fetchCardMembers();
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert("Failed to delete task");
        }
    };

    const startEdit = (task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title || "");
        const assigned = Array.isArray(task.assignedTo) ? task.assignedTo.map((a) => (typeof a === "object" ? a.id || a._id || a.uid || a.name : a)) : task.assignedTo ? [task.assignedTo] : [];
        setEditAssigned(assigned);
        setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
        setEditTitle("");
        setEditAssigned([]);
        setEditDueDate("");
    };
    const handleCancelAddTask = () => {
        setNewTaskTitle("");
        setNewAssigned([]);
        setNewDueDate("");
        setShowAssignPicker(false);
        setShowDuePicker(false);
        setShowAddTask(false);
    };

    const saveEdit = async (taskId) => {
        try {
            const res = await axios.put(
                `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${taskId}`,
                {
                    title: editTitle.trim(),
                    assignedTo: editAssigned.map((mid) => String(mid)),
                    dueDate: editDueDate || null,
                },
                { headers: authHeaders }
            );
            setTasks((prev) => prev.map((it) => (it.id === taskId ? res.data : it)));
            cancelEdit();

            // members can change → refresh for this task + card
            const m = await fetchTaskMembers(taskId);
            setTaskMembersMap((prev) => ({ ...prev, [taskId]: m }));
            fetchCardMembers();
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
                        headers: authHeaders,
                    })
                )
            );
            const remaining = tasks.filter((t) => !t.completed);
            setTasks(remaining);
            // drop removed tasks from members map
            setTaskMembersMap((prev) => {
                const next = { ...prev };
                checked.forEach((t) => delete next[t.id]);
                return next;
            });
            // recompute card members from backend
            fetchCardMembers();
        } catch (err) {
            console.error("Failed to delete tasks:", err);
            alert("Failed to delete tasks");
        }
    };

    const safeLabel = (u) => u?.username || u?.name || u?.displayName || u?.email || String(u?.id || "U");
    const getInitial = (name) => {
        const s = String(name || "").trim();
        if (!s) return "U";
        return s
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .charAt(0)
            .toUpperCase();
    };

    return (
        <>
            <style jsx>{`
                .backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1040;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -60%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                @keyframes pulse-custom {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.05;
                    }
                    50% {
                        transform: scale(1.02);
                        opacity: 0.1;
                    }
                }

                .card-detail-popup {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    width: 1000px;
                    max-width: 95vw;
                    max-height: 90vh;
                    overflow-y: auto;
                    z-index: 1050;
                    border-radius: 24px;
                    padding: 2rem;
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                    overflow-y: auto;
                }

                .card-detail-popup::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(139, 92, 246, 0.08) 100%);
                    animation: pulse-custom 6s ease-in-out infinite;
                    z-index: -1;
                }

                .card-detail-popup::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                .card-detail-popup::-webkit-scrollbar-track {
                    background: rgba(241, 245, 249, 0.3);
                    border-radius: 10px;
                }

                .card-detail-popup::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(16, 185, 129, 0.4));
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                    transition: all 0.3s ease;
                }

                .card-detail-popup::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.7), rgba(16, 185, 129, 0.7));
                    background-clip: content-box;
                }

                /* Firefox */
                .card-detail-popup {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(59, 130, 246, 0.4) rgba(241, 245, 249, 0.3);
                    scroll-behavior: smooth;
                }
                .close-btn {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: none;
                    border-radius: 12px;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #ef4444;
                    z-index: 10;
                }

                .close-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                    transform: scale(1.1);
                }

                .card-header {
                    border-right: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding-right: 3rem;
                }

                .card-title {
                    background: linear-gradient(to right, #374151, #6b7280);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    font-size: 1.5rem;
                    margin: 0;
                }

                .card-subtitle {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .section {
                    background: rgba(249, 250, 251, 0.6);
                    border: 1px solid rgba(229, 231, 235, 0.4);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    transition: all 0.3s ease;
                }

                .section:hover {
                    background: rgba(249, 250, 251, 0.8);
                    border-color: rgba(229, 231, 235, 0.6);
                    transform: translateY(-1px);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #374151;
                    font-weight: 600;
                    font-size: 1rem;
                }

                .member-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                    border: 2px solid white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .member-avatar:hover {
                    transform: scale(1.1) translateY(-2px);
                    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
                }

                .description-area {
                    background: rgba(255, 255, 255, 0.8);
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1rem;
                    min-height: 80px;
                    color: #374151;
                    font-size: 0.875rem;
                    line-height: 1.5;
                    transition: all 0.3s ease;
                }

                .description-area:hover {
                    border-color: #d1d5db;
                    background: white;
                }

                .progress-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .progress-bar-container {
                    flex: 1;
                    height: 8px;
                    background: rgba(229, 231, 235, 0.6);
                    border-radius: 50px;
                    overflow: hidden;
                    position: relative;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #059669);
                    border-radius: 50px;
                    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .progress-bar::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% {
                        left: -100%;
                    }
                    100% {
                        left: 100%;
                    }
                }

                .progress-text {
                    color: #374151;
                    font-weight: 600;
                    font-size: 0.875rem;
                    min-width: 35px;
                }

                .btn {
                    border: none;
                    border-radius: 12px;
                    padding: 0.5rem 1rem;
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
                }

                .btn-primary:hover {
                    background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.4);
                }

                .btn-outline {
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid #d1d5db;
                    color: #374151;
                }

                .btn-outline:hover {
                    background: white;
                    border-color: #9ca3af;
                    transform: translateY(-1px);
                }

                .btn-danger {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
                }

                .btn-danger:hover {
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 15px -3px rgba(239, 68, 68, 0.4);
                }

                .task-item {
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(229, 231, 235, 0.6);
                    border-radius: 12px;
                    padding: 0.5rem;
                    margin-bottom: 0.75rem;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: visible;
                }

                .task-item:hover {
                    background: white;
                    border-color: rgba(156, 163, 175, 0.8);
                    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .task-item.completed {
                    opacity: 0.7;
                    background: rgba(243, 244, 246, 0.8);
                }

                .task-checkbox {
                    background: #e5e7eb;
                    margin: 10px;
                    width: 20px;
                    height: 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .task-title {
                    font-weight: 500;
                    color: #374151;
                    transition: all 0.1s ease;
                }

                .task-title.completed {
                    text-decoration: line-through;
                    opacity: 0.6;
                }

                .task-row {
                    overflow: visible;
                    max-height: 240px;
                    margin-bottom: 0.75rem;
                }

                .task-row.hidden-checked {
                    opacity: 0;
                    transform: translateY(-6px) scale(0.98);
                    max-height: 0;
                    margin: 0;
                    pointer-events: none;
                }

                .task-row.hidden-checked .task-item {
                    margin: 0;
                    border-width: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                }

                .eye-btn.active {
                    background: rgba(59, 130, 246, 0.08);
                    border-color: #9ca3af;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 12px -5px rgba(59, 130, 246, 0.25);
                }

                .eye-btn.pulse {
                    animation: pulse-custom 0.32s ease-in-out;
                }

                .input-field {
                    background: rgba(255, 255, 255, 0.9);
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 0.75rem;
                    font-size: 0.875rem;
                    color: #374151;
                    transition: all 0.3s ease;
                    width: 100%;
                }

                .input-field:focus {
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    outline: none;
                    transform: translateY(-1px);
                }

                .dropdown {
                    position: absolute;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    padding: 0.15rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    z-index: 1000;
                    min-width: 220px;
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.5rem;
                    margin-bottom: 0.15rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .dropdown-item:hover {
                    background: #f3f4f6;
                }

                .dropdown-item.selected {
                    background: rgba(59, 130, 246, 0.1);
                    color: #1d4ed8;
                }

                .avatar-small {
                    margin-right: -5px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8); /* nếu ko có ảnh */
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;

                    /* border trắng + shadow */
                    border: 2px solid #fff;
                    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .avatar-small img {
                    border-radius: 50%;
                    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05); /* đổ bóng nhẹ */
                }

                .task-avatars {
                    display: flex;
                    margin-right: 0.5rem;
                }

                .task-avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 500;
                    border: 2px solid white;
                    margin-left: -5px;
                    transition: all 0.2s ease;
                }

                .task-avatar:first-child {
                    margin-left: 0;
                }

                .task-avatar:hover {
                    transform: scale(1.1);
                    z-index: 10;
                }

                .action-btn {
                    background: transparent;
                    border: none;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-btn:hover {
                    background: rgba(0, 0, 0, 0.05);
                    transform: scale(1.1);
                }

                .edit-section {
                    background: rgba(249, 250, 251, 0.9);
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 0.5rem;
                }

                .add-task-section {
                    background: rgba(255, 255, 255, 0.7);
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                }

                .add-task-section:hover {
                    background: rgba(255, 255, 255, 0.9);
                    border-color: #9ca3af;
                }

                .add-task-button {
                    background: rgba(255, 255, 255, 0.7);
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                    cursor: pointer;
                    text-align: center;
                    color: #6b7280;
                    font-weight: 500;
                }

                .add-task-button:hover {
                    background: rgba(255, 255, 255, 0.9);
                    border-color: #9ca3af;
                    color: #374151;
                }
            `}</style>

            <div className="backdrop" onClick={onClose} />

            <div className="card-detail-popup">
                <button className="close-btn" onClick={onClose}>
                    <Icon icon="material-symbols:close" width={24} />
                </button>

                {/* Card Header with Title */}
                <div className="d-flex mb-4">
                    <div className="card-header">
                        <div>
                            <h1 className="card-title">{card.name || card.title}</h1>
                            <p className="card-subtitle">in list {card.status ? card.status.charAt(0).toUpperCase() + card.status.slice(1) : "To do"}</p>
                        </div>
                    </div>

                    {/* Members Section (FROM API) */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ paddingLeft: "3rem" }} className="section-header">
                            <Icon icon="material-symbols:groups" width={24} />
                            Members
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                            {cardMembers.map((m) => (
                                <div key={m.id} className="avatar-small" title={m.username}>
                                    {m.avatar ? <img src={m.avatar} alt={m.username} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : getInitial(m.username)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="section">
                    <div className="section-header mb-2">
                        <Icon icon="material-symbols:description" width={24} />
                        Description
                    </div>
                    <div className="description-area">{card.description || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Add a more detailed description</span>}</div>
                </div>

                {/* Checklist */}
                <div className="section">
                    <div className="section-header">
                        <Icon icon="material-symbols:checklist" width={24} />
                        Checklist
                    </div>

                    {/* Progress */}
                    <div className="progress-container">
                        <span className="progress-text">{progress}%</span>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }} />
                        </div>
                        <button
                            className={`btn btn-outline eye-btn ${hideChecked ? "active" : ""} ${eyePulse ? "pulse" : ""}`}
                            onClick={() => {
                                setHideChecked((s) => !s);
                                setEyePulse(true);
                                setTimeout(() => setEyePulse(false), 320); // trùng thời lượng animation
                            }}
                        >
                            <Icon icon={hideChecked ? "material-symbols:visibility" : "material-symbols:visibility-off"} width={24} />
                        </button>
                        <button className="btn btn-danger" onClick={handleDeleteChecked}>
                            <Icon icon="material-symbols:delete-outline" width={24} />
                            Delete
                        </button>
                    </div>

                    {/* Task List */}
                    {tasks.map((t) => {
                        const tMembers = taskMembersMap[t.id] || [];
                        const isEditing = editingTaskId === t.id;
                        // Nếu đang edit thì đừng ẩn dù có hideChecked
                        const hidden = hideChecked && t.completed && !isEditing;

                        if (hidden) {
                            return <div id={`task-row-${t.id}`} key={t.id} className="task-row hidden-checked" />;
                        }

                        return (
                            <div id={`task-row-${t.id}`} key={t.id} className="task-row">
                                {/* ======= CHẾ ĐỘ XEM (VIEW) ======= */}
                                {!isEditing && (
                                    <div className={`task-item ${t.completed ? "completed" : ""}`}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                                                <input type="checkbox" className="task-checkbox" checked={!!t.completed} onChange={() => handleToggle(t)} />
                                                <div style={{ flex: 1 }}>
                                                    <div className={`task-title ${t.completed ? "completed" : ""}`}>{t.title}</div>
                                                    {t.description && <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>{t.description}</div>}
                                                    {t.dueDate && <div style={{ fontSize: "0.8rem", color: "#f59e0b", marginTop: "0.25rem" }}>Due: {new Date(t.dueDate).toLocaleDateString()}</div>}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                {/* Avatars */}
                                                <div className="task-avatars" title={`${tMembers.length} member(s)`}>
                                                    {tMembers.slice(0, 3).map((u, idx) => {
                                                        const label = safeLabel(u);
                                                        return (
                                                            <div key={u.id || idx} className="task-avatar" title={label}>
                                                                {u.avatar ? (
                                                                    <img src={u.avatar} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                                                                ) : (
                                                                    getInitial(label)
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Actions */}
                                                <button
                                                    className="action-btn"
                                                    title="Edit task"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEdit(t);
                                                    }}
                                                    style={{ color: "#3b82f6" }}
                                                >
                                                    <Icon icon="material-symbols:edit-outline" width={24} />
                                                </button>

                                                <button
                                                    className="action-btn"
                                                    title="Delete task"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(t.id);
                                                    }}
                                                    style={{ color: "#ef4444" }}
                                                >
                                                    <Icon icon="material-symbols:delete-outline" width={24} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ======= CHẾ ĐỘ EDIT (REPLACE VIEW) ======= */}
                                {isEditing && (
                                    <div className="edit-section">
                                        <input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="input-field"
                                            style={{ marginBottom: "1rem" }}
                                            placeholder="Task title"
                                            onKeyDown={(e) => {
                                                if (e.key === "Escape") cancelEdit();
                                                if (e.key === "Enter" && editTitle.trim()) saveEdit(t.id);
                                            }}
                                        />

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", position: "relative" }}>
                                                <button className="btn btn-outline" onClick={() => setShowEditAssignPicker((s) => (s === t.id ? null : t.id))}>
                                                    <Icon icon="material-symbols:person" width={24} /> Assign
                                                </button>

                                                {showEditAssignPicker === t.id && (
                                                    <div className="dropdown" style={{ top: "105%", left: 0 }}>
                                                        {(boardMembers || []).map((m) => {
                                                            const mid = m.id || m._id || m.uid || m.name || m.email;
                                                            const isSelected = editAssigned.includes(mid);
                                                            const label = m.username || m.name || m.displayName || m.email || mid;
                                                            const avatarUrl = m.avatar || m.photoURL; // link ảnh avatar

                                                            return (
                                                                <div
                                                                    key={mid}
                                                                    className={`dropdown-item ${isSelected ? "selected" : ""}`}
                                                                    onClick={() => {
                                                                        if (isSelected) setEditAssigned((prev) => prev.filter((p) => p !== mid));
                                                                        else setEditAssigned((prev) => [...prev, mid]);
                                                                    }}
                                                                >
                                                                    <div className="avatar-small">
                                                                        {avatarUrl && (
                                                                            <img
                                                                                style={{ width: "35px", height: "35px", backgroundColor: "transparent" }}
                                                                                src={avatarUrl}
                                                                                alt={label}
                                                                                className="rounded-full object-cover"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <span style={{ fontSize: "0.875rem", paddingLeft: "0.75rem" }}>{label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                <div style={{ position: "relative" }}>
                                                    <button className="btn btn-outline" onClick={() => setShowEditDuePicker((s) => !s)}>
                                                        <Icon icon="material-symbols:schedule" width={24} />
                                                    </button>
                                                    {showEditDuePicker && (
                                                        <div className="dropdown" style={{ top: "105%", left: 0 }}>
                                                            <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="input-field" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button className="btn btn-primary" onClick={() => saveEdit(t.id)} disabled={!editTitle.trim()}>
                                                    <Icon icon="material-symbols:save" width={24} />
                                                    Save
                                                </button>
                                                <button className="btn btn-outline" onClick={cancelEdit}>
                                                    <Icon icon="material-symbols:close" width={24} />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Add Task */}
                    {!showAddTask ? (
                        <div className="add-task-button" onClick={() => setShowAddTask(true)}>
                            <Icon icon="material-symbols:add" width={24} />
                            Add an item
                        </div>
                    ) : (
                        <div className="add-task-section">
                            <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="input-field" placeholder="Add an item" style={{ marginBottom: "1rem" }} />

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button className="btn btn-primary" onClick={handleAddTask}>
                                        <Icon icon="material-symbols:add" width={24} />
                                        Save
                                    </button>
                                    <button className="btn btn-outline" onClick={handleCancelAddTask}>
                                        <Icon icon="material-symbols:close" width={24} />
                                        Cancel
                                    </button>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", position: "relative" }}>
                                    <button className="btn btn-outline" onClick={() => setShowAssignPicker((s) => !s)}>
                                        <Icon icon="material-symbols:person" width={24} /> Assign
                                    </button>
                                    {showAssignPicker && (
                                        <div className="dropdown" style={{ top: "105%", right: 0 }}>
                                            {(boardMembers || []).map((m) => {
                                                const mid = m.id || m._id || m.uid || m.name || m.email;
                                                const isSelected = editAssigned.includes(mid);
                                                const label = m.username || m.name || m.displayName || m.email || mid;
                                                const avatarUrl = m.avatar || m.photoURL; // link ảnh avatar

                                                return (
                                                    <div
                                                        key={mid}
                                                        className={`dropdown-item ${isSelected ? "selected" : ""}`}
                                                        onClick={() => {
                                                            if (isSelected) setEditAssigned((prev) => prev.filter((p) => p !== mid));
                                                            else setEditAssigned((prev) => [...prev, mid]);
                                                        }}
                                                    >
                                                        <div className="avatar-small">
                                                            {avatarUrl && (
                                                                <img
                                                                    style={{ width: "35px", height: "35px", backgroundColor: "transparent" }}
                                                                    src={avatarUrl}
                                                                    alt={label}
                                                                    className="rounded-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: "0.875rem", paddingLeft: "0.75rem" }}>{label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div style={{ position: "relative" }}>
                                        <button className="btn btn-outline" onClick={() => setShowDuePicker((s) => !s)}>
                                            <Icon icon="material-symbols:schedule" width={24} />
                                        </button>
                                        {showDuePicker && (
                                            <div className="dropdown" style={{ top: "105%", right: 0 }}>
                                                <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="input-field" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CardDetail;
