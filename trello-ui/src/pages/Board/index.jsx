import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import API_BASE_URL from "../../../config/config";
import { socket } from "../../../config";
import { BoardCard, Header, CreateBoardForm, ConfirmDialog, Button } from "../../components";
import { useUser } from "../../hooks";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BoardPage = () => {
    const navigate = useNavigate();
    const headerHeight = "60px";
    const { user, token } = useUser();
    const [boards, setBoards] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [confirmState, setConfirmState] = useState({ open: false, ids: [], loading: false });
    const [leaveState, setLeaveState] = useState({ open: false, id: null, loading: false });
    // const [hoveredId, setHoveredId] = useState(null);

    console.log("BoardPage rendered - user:", user, "token:", token);
    console.log("showForm value:", showForm);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!user || !token) {
                console.log("No user or token, redirecting to login");
                navigate("/signin");
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [user, token, navigate]);

    const fetchBoards = useCallback(() => {
        if (!user || !token) return;
        axios
            .get(`${API_BASE_URL}/boards`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => setBoards(res.data))
            .catch(console.error);
    }, [user, token]);

    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    useEffect(() => {
        const onBoardChanged = () => {
            fetchBoards();
        };
        socket.on("boards:created", onBoardChanged);
        socket.on("boards:updated", onBoardChanged);
        socket.on("boards:deleted", onBoardChanged);
        return () => {
            socket.off("boards:created", onBoardChanged);
            socket.off("boards:updated", onBoardChanged);
            socket.off("boards:deleted", onBoardChanged);
        };
    }, [fetchBoards]);

    // Drag reordering is disabled on grouped view

    const toggleSelect = useCallback(
        (board) => {
            if (!user || !board) return;
            const isOwner = board.ownerId === user.id;
            if (!isOwner) {
                toast.warn("You can only select boards you own");
                return;
            }
            const id = board.id;
            setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
        },
        [user]
    );

    // Removed clearSelection since selection is handled inline with actions

    const openConfirm = useCallback((ids) => setConfirmState({ open: true, ids, loading: false }), []);
    const closeConfirm = useCallback(() => {
        if (confirmState.loading) return;
        setConfirmState({ open: false, ids: [], loading: false });
    }, [confirmState.loading]);

    const handleDeleteConfirmed = useCallback(async () => {
        const ownedIds = confirmState.ids.filter((id) => {
            const b = boards.find((x) => x.id === id);
            return b && user && b.ownerId === user.id;
        });
        if (ownedIds.length === 0) {
            toast.warn("You can only delete boards you own");
            setConfirmState((s) => ({ ...s, loading: false }));
            closeConfirm();
            return;
        }
        setConfirmState((s) => ({ ...s, loading: true }));
        try {
            await Promise.all(ownedIds.map((id) => axios.delete(`${API_BASE_URL}/boards/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
            setBoards((prev) => prev.filter((b) => !ownedIds.includes(b.id)));
            setSelectedIds((prev) => {
                const next = new Set(prev);
                ownedIds.forEach((id) => next.delete(id));
                return next;
            });
            toast.success(ownedIds.length > 1 ? `Deleted ${ownedIds.length} boards` : `Board deleted`);
            closeConfirm();
        } catch (err) {
            console.error("Failed to delete boards", err);
            toast.error("Failed to delete. Please try again.");
            setConfirmState((s) => ({ ...s, loading: false }));
        }
    }, [boards, user, confirmState.ids, token, closeConfirm]);

    const openLeave = useCallback((id) => setLeaveState({ open: true, id, loading: false }), []);
    const closeLeave = useCallback(() => {
        if (leaveState.loading) return;
        setLeaveState({ open: false, id: null, loading: false });
    }, [leaveState.loading]);

    const handleLeaveConfirmed = useCallback(async () => {
        const id = leaveState.id;
        if (!id) return;
        setLeaveState((s) => ({ ...s, loading: true }));
        try {
            await axios.post(`${API_BASE_URL}/boards/${id}/leave`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setBoards((prev) => prev.filter((b) => b.id !== id));
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            toast.success("You left the board");
            closeLeave();
        } catch (err) {
            console.error("Failed to leave board", err);
            toast.error("Failed to leave. Please try again.");
            setLeaveState((s) => ({ ...s, loading: false }));
        }
    }, [leaveState.id, token, closeLeave]);

    const onSubmit = async (data) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/boards`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBoards((prev) => [...prev, res.data]);
            setShowForm(false);
            console.log("showForm value:", showForm);
        } catch (error) {
            console.error("Failed to create board", error);
        }
    };

    const handleClickBoard = useCallback(
        (boardId) => {
            navigate(`/boards/${boardId}`);
        },
        [navigate]
    );

    const privateBoards = useMemo(() => {
        if (!user) return [];
        return boards.filter((b) => {
            const members = Array.isArray(b.members) ? b.members : [];
            const otherMembersCount = members.filter((m) => m !== user.id).length;
            return b.ownerId === user.id && otherMembersCount === 0;
        });
    }, [boards, user]);

    const sharedBoards = useMemo(() => {
        if (!user) return [];
        return boards.filter((b) => {
            const members = Array.isArray(b.members) ? b.members : [];
            const otherMembersCount = members.filter((m) => m !== user.id).length;
            return !(b.ownerId === user.id && otherMembersCount === 0);
        });
    }, [boards, user]);

    const content = useMemo(() => {
        if (!user || !token) return null;

        return (
            <>
                <style jsx>{`
                    .board-page {
                        padding-top: calc(60px + 20px);
                        min-height: 100vh;
                        position: relative;
                        padding-bottom: 20px;
                    }
                    .part-page {
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                        border: 1px solid #e5e7eb;
                        border-radius: 16px;
                        padding: 2rem;
                        margin-bottom: 1rem;
                        background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%);
                    }
                    .content-wrapper {
                        background: #ffffff;
                        border-radius: 16px;
                        margin: 1rem 20px 20px 20px;
                        min-height: calc(100vh - 100px);
                    }
                    .actions-bar {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        margin-bottom: 1rem;
                        flex-wrap: wrap;
                        padding: 1rem;
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 16px;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                        justify-content: flex-end;
                    }
                    .actions-group {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        flex-wrap: wrap;
                    }
                    .actions-divider {
                        width: 2px;
                        height: 24px;
                        background: #e2e8f0;
                        border-radius: 1px;
                        margin: 0 0.5rem;
                    }
                    .btn {
                        border: none;
                        border-radius: 12px;
                        padding: 0.625rem 1rem;
                        font-weight: 600;
                        font-size: 0.875rem;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        cursor: pointer;
                        transition: all 0.25s ease;
                        position: relative;
                        overflow: hidden;
                        white-space: nowrap;
                    }
                    .btn::before {
                        content: "";
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 0;
                        height: 0;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        transition: all 0.3s ease;
                    }
                    .btn:hover::before {
                        width: 120%;
                        height: 120%;
                    }
                    .btn:hover {
                        transform: translateY(-2px);
                    }
                    .btn:active {
                        transform: translateY(0);
                    }
                    .btn-primary {
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
                    }
                    .btn-primary:hover {
                        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
                    }
                    .btn-secondary {
                        background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                        color: #475569;
                        border: 1px solid #cbd5e1;
                    }
                    .btn-secondary:hover {
                        background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
                        box-shadow: 0 4px 12px rgba(71, 85, 105, 0.15);
                    }
                    .btn-danger {
                        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.15));
                        color: #dc2626;
                        border: 1px solid rgba(239, 68, 68, 0.3);
                    }
                    .btn-danger:hover {
                        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.2));
                        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
                        border-color: rgba(239, 68, 68, 0.5);
                    }
                    .btn-danger.active {
                    }
                    @keyframes shake {
                        0%,
                        100% {
                            transform: translateX(0) translateY(-2px);
                        }
                        25% {
                            transform: translateX(-2px) translateY(-2px);
                        }
                        75% {
                            transform: translateX(2px) translateY(-2px);
                        }
                    }
                    .btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                        transform: none;
                        box-shadow: none;
                    }
                    .btn:disabled:hover {
                        transform: none;
                        box-shadow: none;
                    }
                    .selection-counter {
                        background: linear-gradient(135deg, #3399ff, #1d4ed8);
                        color: white;
                        border-radius: 20px;
                        padding: 0.5rem 1rem;
                        font-weight: 600;
                        font-size: 0.75rem;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        animation: ${selectedIds.size > 0 ? "bounce-in 0.3s ease" : "none"};
                        box-shadow: 0 4px 12px rgba(51, 153, 255, 0.3);
                    }
                    @keyframes bounce-in {
                        0% {
                            transform: scale(0.8);
                            opacity: 0;
                        }
                        50% {
                            transform: scale(1.1);
                        }
                        100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }

                    @keyframes pulse-scale {
                        0%,
                        100% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.05);
                        }
                    }
                    .stats-bar {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 1rem;
                    }
                    .stat-item {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        color: #64748b;
                        font-size: 0.875rem;
                        font-weight: 500;
                    }
                    .stat-item svg {
                        color: #3399ff;
                        flex-shrink: 0;
                    }
                    .stat-number {
                        background: #3399ff;
                        color: #ffffff;
                        border-radius: 8px;
                        padding: 0.25rem 0.75rem;
                        font-weight: 600;
                        font-size: 0.75rem;
                        margin-left: auto;
                    }
                    .section-title {
                        color: #1e293b;
                        font-weight: 700;
                        font-size: 0.875rem;
                        letter-spacing: 0.1em;
                        margin-bottom: 1.5rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        text-transform: uppercase;
                    }
                    .section-title svg {
                        color: #3399ff;
                    }
                    .selection-bar {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 1rem;
                        padding: 0.75rem 1rem;
                        margin-bottom: 1rem;
                        background: rgba(16, 185, 129, 0.06);
                        border: 1px solid rgba(16, 185, 129, 0.25);
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(16, 185, 129, 0.08);
                    }
                    .selection-bar .label {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        font-weight: 600;
                        color: #065f46;
                    }
                    .board-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                        gap: 1.25rem;
                        transition: all 0.3s ease;
                    }
                    .board-grid.delete-mode {
                    }
                    .board-card {
                        background: #ffffff;
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    .board-card > div {
                        min-height: 96px !important;
                    }
                    .board-card h6 {
                        font-size: 0.95rem;
                        margin-bottom: 4px !important;
                        font-weight: 700;
                        letter-spacing: 0.2px;
                    }
                    .board-card p {
                        font-size: 0.82rem !important;
                        line-height: 1.35 !important;
                        display: -webkit-box !important;
                        -webkit-line-clamp: 2 !important;
                        -webkit-box-orient: vertical !important;
                        overflow: hidden !important;
                    }
                    .board-card.selected {
                        border-color: #10b981;
                        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
                        background: rgba(16, 185, 129, 0.02);
                    }
                    .board-card::before {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: #3399ff;
                        transform: scaleX(0);
                        transform-origin: left;
                        transition: transform 0.3s ease;
                    }
                    .board-card:hover {
                        transform: translateY(-3px);
                        border-color: #3399ff;
                        box-shadow: 0 8px 25px rgba(51, 153, 255, 0.1);
                    }
                    .board-card:hover::before {
                        transform: scaleX(1);
                    }
                    .board-card.dragging {
                        transform: rotate(2deg) scale(1.02);
                        box-shadow: 0 15px 35px rgba(51, 153, 255, 0.15);
                        z-index: 1000;
                        border-color: #3399ff;
                    }
                    .card-actions {
                        position: absolute;
                        top: 6px;
                        right: 6px;
                        display: flex;
                        gap: 4px;
                        opacity: 0;
                        transform: translateY(-10px);
                        transition: all 0.3s ease;
                        z-index: 5;
                    }
                    .board-card:hover .card-actions {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .icon-btn {
                        width: 32px;
                        height: 32px;
                        border-radius: 12px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        border: none;
                        background: rgba(255, 255, 255, 0.95);
                        color: #334155;
                        cursor: pointer;
                        transition: all 0.25s ease;
                        backdrop-filter: blur(8px);
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }
                    .icon-btn:hover {
                        transform: translateY(-2px) scale(1.05);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    }
                    .icon-btn.checkbox.active {
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                    }
                    .icon-btn.menu {
                        background: rgba(255, 255, 255, 0.95);
                        color: #334155;
                        border: 1px solid #e2e8f0;
                    }
                    .popover {
                        position: absolute;
                        top: 40px;
                        right: 6px;
                        background: white;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                        padding: 8px;
                        z-index: 20;
                        min-width: 160px;
                    }
                    .popover button {
                        width: 100%;
                        background: transparent;
                        border: none;
                        text-align: left;
                        padding: 8px 10px;
                        border-radius: 8px;
                        color: #334155;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .popover button:hover {
                        background: #f1f5f9;
                    }
                    .icon-btn.delete {
                        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.15));
                        color: #dc2626;
                        border: 1px solid rgba(239, 68, 68, 0.2);
                    }
                    .icon-btn.delete:hover {
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        color: white;
                        box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
                        animation: shake-small 0.3s ease;
                    }
                    @keyframes shake-small {
                        0%,
                        100% {
                            transform: translateY(-2px) scale(1.05) rotate(0deg);
                        }
                        25% {
                            transform: translateY(-2px) scale(1.05) rotate(-2deg);
                        }
                        75% {
                            transform: translateY(-2px) scale(1.05) rotate(2deg);
                        }
                    }
                    .create-board-card {
                        background: #f8fafc;
                        border: 2px dashed #cbd5e1;
                        border-radius: 12px;
                        padding: 3rem 1.5rem;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        color: #64748b;
                        min-height: 140px;
                    }
                    .create-board-card:hover {
                        background: #f1f5f9;
                        border-color: #10b981;
                        border-style: solid;
                        color: #10b981;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
                    }
                    .create-icon {
                        width: 48px;
                        height: 48px;
                        border-radius: 12px;
                        background: #10b981;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                    }
                    .create-board-card:hover .create-icon {
                        transform: scale(1.05);
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
                    }
                    .fw-bold {
                        font-weight: 600;
                        font-size: 1rem;
                        margin: 0;
                    }
                    .small {
                        font-size: 0.875rem;
                    }
                    .opacity-75 {
                        opacity: 0.75;
                    }
                    @media (max-width: 768px) {
                        .content-wrapper {
                            margin: 10px;
                            margin-top: calc(60px + 10px);
                            padding: 1rem;
                        }
                        .board-grid {
                            grid-template-columns: 1fr;
                            gap: 1rem;
                        }
                        .stats-bar {
                            flex-direction: column;
                            align-items: flex-start;
                            gap: 1rem;
                        }
                        .stat-item {
                            width: 100%;
                            justify-content: space-between;
                        }
                        .actions-bar {
                            flex-direction: column;
                            align-items: stretch;
                            gap: 1rem;
                        }
                        .actions-group {
                            justify-content: center;
                        }
                        .actions-divider {
                            display: none;
                        }
                    }
                    @media (max-width: 480px) {
                        .board-grid {
                            grid-template-columns: 1fr;
                        }
                        .create-board-card {
                            padding: 2rem 1rem;
                            min-height: 140px;
                        }
                    }
                `}</style>

                {/* Header mới tự lấy user từ hook */}
                <Header style={{ height: headerHeight, zIndex: 1030 }} />

                <div className="board-page">
                    <div className="content-wrapper">
                        <div className="part-page">
                            <h6 className="section-title">
                                <Icon icon="mdi:lock" width="22" height="22" />
                                PRIVATE WORKSPACES
                                <span className="stat-number">{privateBoards.length}</span>
                            </h6>
                            {selectedIds.size > 0 && (
                                <div className="selection-bar">
                                    <div className="label">
                                        <Icon icon="mdi:check-circle" width="22" height="22" />
                                        {selectedIds.size} selected
                                    </div>
                                    <div className="actions-group">
                                        <Button name="Delete" icon="mdi:delete-forever" variant="redModern" iconSize={22} size="md" onClick={() => openConfirm(Array.from(selectedIds))} />
                                        <span className="small opacity-75">Only your boards will be deleted</span>
                                    </div>
                                </div>
                            )}

                            <DragDropContext onDragEnd={() => {}}>
                                <Droppable droppableId="board-list" direction="horizontal">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} className={`board-grid`}>
                                            {privateBoards.map((board, index) => (
                                                <Draggable key={board.id} draggableId={String(board.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            onClick={() => {
                                                                handleClickBoard(board.id);
                                                            }}
                                                            onMouseEnter={() => {}}
                                                            onMouseLeave={() => {}}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`board-card ${snapshot.isDragging ? "dragging" : ""} ${selectedIds.has(board.id) ? "selected" : ""}`}
                                                        >
                                                            <div className="card-actions" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                                                {user && board.ownerId === user.id ? (
                                                                    <button
                                                                        className={`icon-btn checkbox ${selectedIds.has(board.id) ? "active" : ""}`}
                                                                        title={selectedIds.has(board.id) ? "Deselect" : "Select"}
                                                                        onClick={() => toggleSelect(board)}
                                                                    >
                                                                        {selectedIds.has(board.id) ? (
                                                                            <Icon icon="mdi:check-circle" width="22" height="22" />
                                                                        ) : (
                                                                            <Icon icon="mdi:checkbox-blank-outline" width="22" height="22" />
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <button className="icon-btn menu" title="More" onClick={() => openLeave(board.id)}>
                                                                        <Icon icon="mdi:dots-vertical" width="22" height="22" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <BoardCard
                                                                title={board.name}
                                                                description={board.description}
                                                                createdAt={board.createdAt}
                                                                membersCount={(Array.isArray(board.members) && board.members.length) || 0}
                                                                badge="Private"
                                                                badgeColor="#10b981"
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}

                                            {provided.placeholder}

                                            <div className="create-board-card" onClick={() => setShowForm(true)}>
                                                <Button icon="mdi:plus" variant="greenModern" iconSize={24} size="md" onClick={() => setShowForm(true)} />

                                                <span className="fw-bold">Create a new board</span>
                                                <span className="small opacity-75">Start organizing your work</span>
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                        <div className="part-page">
                            <h6 className="section-title">
                                <Icon icon="mdi:share" width="22" height="22" />
                                SHARED WORKSPACES
                                <span className="stat-number">{sharedBoards.length}</span>
                            </h6>
                            {selectedIds.size > 0 && (
                                <div className="selection-bar">
                                    <div className="label">
                                        <Icon icon="mdi:check-circle" width="22" height="22" />
                                        {selectedIds.size} selected
                                    </div>
                                    <div className="actions-group">
                                        <Button name="Delete" icon="mdi:delete-forever" variant="redModern" iconSize={22} size="md" onClick={() => openConfirm(Array.from(selectedIds))} />
                                        <span className="small opacity-75">Only your boards will be deleted</span>
                                    </div>
                                </div>
                            )}

                            <DragDropContext onDragEnd={() => {}}>
                                <Droppable droppableId="board-list" direction="horizontal">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} className={`board-grid`}>
                                            {sharedBoards.map((board, index) => (
                                                <Draggable key={board.id} draggableId={String(board.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            onClick={() => {
                                                                handleClickBoard(board.id);
                                                            }}
                                                            onMouseEnter={() => {}}
                                                            onMouseLeave={() => {}}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`board-card ${snapshot.isDragging ? "dragging" : ""} ${selectedIds.has(board.id) ? "selected" : ""}`}
                                                        >
                                                            <div className="card-actions" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                                                {user && board.ownerId === user.id ? (
                                                                    <button
                                                                        className={`icon-btn checkbox ${selectedIds.has(board.id) ? "active" : ""}`}
                                                                        title={selectedIds.has(board.id) ? "Deselect" : "Select"}
                                                                        onClick={() => toggleSelect(board)}
                                                                    >
                                                                        {selectedIds.has(board.id) ? (
                                                                            <Icon icon="mdi:check-circle" width="22" height="22" />
                                                                        ) : (
                                                                            <Icon icon="mdi:checkbox-blank-outline" width="22" height="22" />
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <button className="icon-btn menu" title="More" onClick={() => openLeave(board.id)}>
                                                                        <Icon icon="mdi:dots-vertical" width="22" height="22" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <BoardCard
                                                                title={board.name}
                                                                description={board.description}
                                                                createdAt={board.createdAt}
                                                                membersCount={(Array.isArray(board.members) && board.members.length) || 0}
                                                                badge="Shared"
                                                                badgeColor="#3b82f6"
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}

                                            {provided.placeholder}

                                            <div className="create-board-card" onClick={() => setShowForm(true)}>
                                                <Button icon="mdi:plus" variant="greenModern" iconSize={24} size="md" onClick={() => setShowForm(true)} />

                                                <span className="fw-bold">Create a new board</span>
                                                <span className="small opacity-75">Start organizing your work</span>
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    </div>
                </div>
            </>
        );
    }, [user, token, selectedIds, toggleSelect, openConfirm, openLeave, handleClickBoard, privateBoards, sharedBoards]);

    return (
        <>
            {content}
            {showForm && <CreateBoardForm onSubmit={onSubmit} onClose={() => setShowForm(false)} />}
            {confirmState.open && (
                <ConfirmDialog
                    title={confirmState.ids.length > 1 ? "Delete boards" : "Delete board"}
                    message={
                        confirmState.ids.length > 1
                            ? `Are you sure you want to delete ${confirmState.ids.length} boards? This action cannot be undone.`
                            : "Are you sure you want to delete this board? This action cannot be undone."
                    }
                    confirmText={confirmState.ids.length > 1 ? "Delete boards" : "Delete board"}
                    cancelText="Cancel"
                    onConfirm={handleDeleteConfirmed}
                    onCancel={closeConfirm}
                    loading={confirmState.loading}
                    tone="destructive"
                />
            )}
            {leaveState.open && (
                <ConfirmDialog
                    title="Leave board"
                    message="Are you sure you want to leave this board? You will lose access."
                    confirmText="Leave board"
                    cancelText="Cancel"
                    onConfirm={handleLeaveConfirmed}
                    onCancel={closeLeave}
                    loading={leaveState.loading}
                    tone="destructive"
                />
            )}
        </>
    );
};

export default BoardPage;
