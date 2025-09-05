import { useEffect, useMemo, useCallback, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config";

export default function useCardTasks({ card, boardId, token, onTaskCountsChange }) {
    const [tasks, setTasks] = useState([]);
    const [cardMembers, setCardMembers] = useState([]);
    const [taskMembersMap, setTaskMembersMap] = useState({});

    const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
    const memberCache = useMemo(() => new Map(), []);

    const completedCount = tasks.filter((t) => t.completed).length;
    const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

    useEffect(() => {
        if (!card || typeof onTaskCountsChange !== "function") return;
        onTaskCountsChange(card.id, { done: completedCount, total: tasks.length });
    }, [tasks, completedCount, card, onTaskCountsChange]);

    const fetchCardMembers = useCallback(async () => {
        try {
            if (!card?.id || !token) return;
            const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/members`, {
                headers: authHeaders,
            });
            const list = res.data || [];
            setCardMembers(list);
            list.forEach((u) => memberCache.set(String(u.id), u));
        } catch (e) {
            console.error("fetchCardMembers error", e);
            setCardMembers([]);
        }
    }, [card?.id, token, boardId, authHeaders, memberCache]);

    const fetchTaskMembers = useCallback(
        async (taskId) => {
            try {
                if (!card?.id || !taskId || !token) return [];
                const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${taskId}/members`, { headers: authHeaders });
                const list = res.data || [];
                list.forEach((u) => memberCache.set(String(u.id), u));
                return list;
            } catch (e) {
                console.error("fetchTaskMembers error", taskId, e);
                return [];
            }
        },
        [card?.id, token, boardId, authHeaders, memberCache]
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

    const fetchTasks = useCallback(async () => {
        if (!card || !boardId || !token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks`, {
                headers: authHeaders,
            });
            const list = res.data || [];
            setTasks(list);
            // hydrate
            fetchCardMembers();
            hydrateAllTaskMembers(list);
        } catch (err) {
            console.error("Failed to fetch tasks for card:", err);
            setTasks([]);
            setTaskMembersMap({});
            setCardMembers([]);
        }
    }, [card, boardId, token, authHeaders, fetchCardMembers, hydrateAllTaskMembers]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // CRUD handlers
    const toggleTask = async (task) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${task.id}`, { completed: !task.completed }, { headers: authHeaders });
            setTasks((prev) => prev.map((it) => (it.id === task.id ? res.data : it)));
        } catch (err) {
            console.error("Failed to update task:", err);
            setTasks((prev) => prev.map((it) => (it.id === task.id ? { ...it, completed: !it.completed } : it)));
        }
    };

    const deleteTask = async (taskId) => {
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
            fetchCardMembers();
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert("Failed to delete task");
        }
    };

    const deleteChecked = async () => {
        const checked = tasks.filter((t) => t.completed);
        if (checked.length === 0) return;
        const ok = window.confirm(`Delete ${checked.length} completed item(s)?`);
        if (!ok) return;

        try {
            await Promise.all(
                checked.map((t) =>
                    axios.delete(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${t.id}`, {
                        headers: authHeaders,
                    })
                )
            );
            setTasks((prev) => prev.filter((t) => !t.completed));
            setTaskMembersMap((prev) => {
                const next = { ...prev };
                checked.forEach((t) => delete next[t.id]);
                return next;
            });
            fetchCardMembers();
        } catch (err) {
            console.error("Failed to delete tasks:", err);
            alert("Failed to delete tasks");
        }
    };

    const addTask = async ({ title, assignedToIds, dueDate }) => {
        try {
            const res = await axios.post(
                `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks`,
                {
                    title: title.trim(),
                    assignedTo: (assignedToIds || []).map(String),
                    dueDate: dueDate || null,
                },
                { headers: authHeaders }
            );
            const created = res.data;
            setTasks((prev) => [...prev, created]);

            if (created?.id) {
                const m = await fetchTaskMembers(created.id);
                setTaskMembersMap((prev) => ({ ...prev, [created.id]: m }));
            }
            fetchCardMembers();
            return created;
        } catch (err) {
            console.error("Failed to create task:", err);
            alert("Failed to add task");
            return null;
        }
    };

    const saveTask = async (taskId, { title, assignedToIds, dueDate }) => {
        try {
            const res = await axios.put(
                `${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks/${taskId}`,
                {
                    title: title.trim(),
                    assignedTo: (assignedToIds || []).map(String),
                    dueDate: dueDate || null,
                },
                { headers: authHeaders }
            );
            setTasks((prev) => prev.map((it) => (it.id === taskId ? res.data : it)));

            const m = await fetchTaskMembers(taskId);
            setTaskMembersMap((prev) => ({ ...prev, [taskId]: m }));
            fetchCardMembers();
        } catch (err) {
            console.error("Failed to update task:", err);
            alert("Failed to save task");
        }
    };

    return {
        tasks,
        cardMembers,
        taskMembersMap,
        progress,
        completedCount,
        actions: {
            fetchTasks,
            fetchCardMembers,
            toggleTask,
            deleteTask,
            deleteChecked,
            addTask,
            saveTask,
        },
    };
}
