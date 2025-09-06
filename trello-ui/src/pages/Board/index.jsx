import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import API_BASE_URL from "../../../config/config";
import { BoardCard, Header, CreateBoardForm, ConfirmDialog } from "../../components";
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

    useEffect(() => {
        if (!user || !token) return;
        axios
            .get(`${API_BASE_URL}/boards`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setBoards(res.data))
            .catch(console.error);
    }, [user, token]);

    const onDragEnd = useCallback(
        (result) => {
            const { source: from, destination: to } = result;
            if (!to) return;

            const reordered = Array.from(boards);
            const [moved] = reordered.splice(from.index, 1);
            reordered.splice(to.index, 0, moved);
            setBoards(reordered);

            reordered.forEach((board, index) => {
                axios.put(`${API_BASE_URL}/boards/${board.id}`, { order: index }, { headers: { Authorization: `Bearer ${token}` } }).catch(console.error);
            });
        },
        [boards, token]
    );

    const toggleSelect = useCallback((id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
    const selectAll = useCallback(() => setSelectedIds(new Set(boards.map((b) => b.id))), [boards]);

    const openConfirm = useCallback((ids) => setConfirmState({ open: true, ids, loading: false }), []);
    const closeConfirm = useCallback(() => {
        if (confirmState.loading) return;
        setConfirmState({ open: false, ids: [], loading: false });
    }, [confirmState.loading]);

    const handleDeleteConfirmed = useCallback(async () => {
        const ids = confirmState.ids;
        setConfirmState((s) => ({ ...s, loading: true }));
        try {
            await Promise.all(ids.map((id) => axios.delete(`${API_BASE_URL}/boards/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
            setBoards((prev) => prev.filter((b) => !ids.includes(b.id)));
            setSelectedIds((prev) => {
                const next = new Set(prev);
                ids.forEach((id) => next.delete(id));
                return next;
            });
            toast.success(ids.length > 1 ? `Deleted ${ids.length} boards` : `Board deleted`);
            closeConfirm();
        } catch (err) {
            console.error("Failed to delete boards", err);
            toast.error("Failed to delete. Please try again.");
            setConfirmState((s) => ({ ...s, loading: false }));
        }
    }, [confirmState.ids, token, closeConfirm]);

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

    const content = useMemo(() => {
        if (!user || !token) return null;

        return (
            <>
                <style jsx>{`
                    .board-page {
                        padding-top: calc(60px + 20px);
                        min-height: 100vh;
                        background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%);
                        position: relative;
                    }
                    .content-wrapper {
                        background: #ffffff;
                        border-radius: 16px;
                        margin: 0 20px 20px 20px;
                        min-height: calc(100vh - 100px);
                        padding: 2rem;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                        border: 1px solid #e5e7eb;
                    }
                    .actions-bar {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                        flex-wrap: wrap;
                    }
                    .btn {
                        border: none;
                        border-radius: 12px;
                        padding: 0.5rem 0.875rem;
                        font-weight: 600;
                        font-size: 0.9rem;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .btn:hover {
                        transform: translateY(-1px);
                    }
                    .btn-primary {
                        background: #10b981;
                        color: white;
                    }
                    .btn-secondary {
                        background: #f1f5f9;
                        color: #0f172a;
                    }
                    .btn-danger {
                        background: rgba(239, 68, 68, 0.1);
                        color: #dc2626;
                    }
                    .btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
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
                    .board-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 1.5rem;
                    }
                    .board-card {
                        background: #ffffff;
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 1.5rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    .board-card.selected {
                        border-color: #10b981;
                        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
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
                        transform: translateY(-4px);
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
                        top: 8px;
                        right: 8px;
                        display: flex;
                        gap: 6px;
                    }
                    .icon-btn {
                        width: 34px;
                        height: 34px;
                        border-radius: 10px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        border: none;
                        background: #f1f5f9;
                        color: #334155;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .icon-btn:hover {
                        transform: translateY(-1px);
                    }
                    .icon-btn.checkbox.active {
                        background: rgba(16, 185, 129, 0.1);
                        color: #047857;
                    }
                    .icon-btn.delete {
                        background: rgba(239, 68, 68, 0.08);
                        color: #dc2626;
                    }
                    .icon-btn.delete:hover {
                        background: rgba(239, 68, 68, 0.15);
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
                        min-height: 160px;
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
                        {/* Stats Bar */}
                        <div className="stats-bar">
                            <div className="stat-item">
                                <Icon icon="mdi:grid" width="18" height="18" />
                                <span>Total Boards</span>
                                <span className="stat-number">{boards.length}</span>
                            </div>

                            <div className="stat-item">
                                <Icon icon="mdi:star" width="18" height="18" />
                                <span>Personal Workspace</span>
                            </div>
                        </div>

                        {/* Selection Actions */}
                        <div className="actions-bar">
                            <button className="btn btn-secondary" onClick={selectAll} disabled={!boards.length}>
                                <Icon icon="mdi:select-all" width="18" height="18" />
                                Select all
                            </button>
                            <button className="btn btn-secondary" onClick={clearSelection} disabled={!selectedIds.size}>
                                <Icon icon="mdi:close" width="18" height="18" />
                                Clear
                            </button>
                            <button className="btn btn-danger" onClick={() => openConfirm(Array.from(selectedIds))} disabled={!selectedIds.size}>
                                <Icon icon="mdi:delete" width="18" height="18" />
                                Delete selected ({selectedIds.size || 0})
                            </button>
                        </div>

                        <h6 className="section-title">
                            <Icon icon="mdi:grid" width="16" height="16" />
                            YOUR WORKSPACES
                        </h6>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="board-list" direction="horizontal">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="board-grid">
                                        {boards.map((board, index) => (
                                            <Draggable key={board.id} draggableId={String(board.id)} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        onClick={() => {
                                                            if (selectedIds.size) {
                                                                toggleSelect(board.id);
                                                                return;
                                                            }
                                                            handleClickBoard(board.id);
                                                        }}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`board-card ${snapshot.isDragging ? "dragging" : ""} ${selectedIds.has(board.id) ? "selected" : ""}`}
                                                    >
                                                        <div className="card-actions" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                                            <button
                                                                className={`icon-btn checkbox ${selectedIds.has(board.id) ? "active" : ""}`}
                                                                title={selectedIds.has(board.id) ? "Deselect" : "Select"}
                                                                onClick={() => toggleSelect(board.id)}
                                                            >
                                                                {selectedIds.has(board.id) ? (
                                                                    <Icon icon="mdi:check-circle" width="18" height="18" />
                                                                ) : (
                                                                    <Icon icon="mdi:checkbox-blank-outline" width="18" height="18" />
                                                                )}
                                                            </button>
                                                            <button className="icon-btn delete" title="Delete board" onClick={() => openConfirm([board.id])}>
                                                                <Icon icon="mdi:delete" width="18" height="18" />
                                                            </button>
                                                        </div>
                                                        <BoardCard title={board.name} description={board.description} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {provided.placeholder}

                                        <div className="create-board-card" onClick={() => setShowForm(true)}>
                                            <div className="create-icon">
                                                <Icon icon="mdi:plus" width="24" height="24" color="white" />
                                            </div>
                                            <span className="fw-bold">Create a new board</span>
                                            <span className="small opacity-75">Start organizing your work</span>
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
            </>
        );
    }, [user, token, boards, selectedIds, onDragEnd, selectAll, clearSelection, toggleSelect, openConfirm, handleClickBoard]);

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
                />
            )}
        </>
    );
};

export default BoardPage;
