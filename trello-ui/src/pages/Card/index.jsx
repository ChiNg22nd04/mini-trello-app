import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Avatar } from "../../components";

import API_BASE_URL from "../../../config/config";
import MembersBar from "./MembersBar";
import { Header, TopSideBar, CreateForm } from "../../components";
import Sidebar from "./Sidebar";
import CardDetail from "./CardDetail";

import { useUser } from "../../hooks";
import { socket } from "../../../config";
import { toast } from "react-toastify";

const STATUSES = ["todo", "doing", "done"];
const STATUS_LABELS = { todo: "To Do", doing: "Doing", done: "Done" };

const CardPage = () => {
    const { user, token } = useUser();
    const { id: boardId } = useParams();
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [cardsByStatus, setCardsByStatus] = useState({ todo: [], doing: [], done: [] });
    const [selectedCard, setSelectedCard] = useState(null);
    const [arrayMembersForBoard, setArrayMembersForBoard] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForStatus, setCreateForStatus] = useState("todo");
    const [taskCounts, setTaskCounts] = useState({});
    const [cardMembersMap, setCardMembersMap] = useState({}); // <== NEW

    const headerHeight = "60px";

    /* ---------- API helpers ---------- */

    const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
    console.log("auth", auth);

    const fetchCardMembers = useCallback(
        async (cardId) => {
            try {
                const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${cardId}/members`, auth);
                return Array.isArray(res.data) ? res.data : [];
            } catch (err) {
                console.error(`Failed to fetch members for card ${cardId}:`, err);
                return [];
            }
        },
        [boardId, auth]
    );

    const fetchCardsByStatus = useCallback(
        async (status) => {
            console.log("status", status);
            try {
                const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/status/${status}`, auth);
                console.log("res", res.data);
                return Array.isArray(res.data) ? res.data : [];
            } catch (err) {
                console.error(`Failed to get cards by status=${status}:`, err);
                return [];
            }
        },
        [boardId, auth]
    );

    const hydrateMembers = useCallback(
        async (grouped) => {
            // gom toàn bộ cardId của 3 cột
            const allCards = [...grouped.todo, ...grouped.doing, ...grouped.done];
            if (allCards.length === 0) return;

            // fetch song song members theo cardId
            const entries = await Promise.all(
                allCards.map(async (c) => {
                    const members = await fetchCardMembers(c.id);
                    return [String(c.id), members];
                })
            );

            setCardMembersMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
        },
        [fetchCardMembers]
    );

    const hydrateTaskCounts = useCallback(
        async (grouped) => {
            const allCards = [...grouped.todo, ...grouped.doing, ...grouped.done];
            if (allCards.length === 0) return;

            try {
                const entries = await Promise.all(
                    allCards.map(async (c) => {
                        try {
                            const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${c.id}/tasks`, auth);
                            const tasks = Array.isArray(res.data) ? res.data : [];
                            const done = tasks.filter((t) => t.completed).length;
                            return [String(c.id), { done, total: tasks.length }];
                        } catch {
                            return [String(c.id), { done: 0, total: 0 }];
                        }
                    })
                );
                setTaskCounts((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
            } catch {
                // ignore
            }
        },
        [boardId, auth]
    );

    /* ---------- Fetch all data ---------- */
    const fetchData = useCallback(async () => {
        if (!user || !token || !boardId) return;

        try {
            // board
            const boardRes = await axios.get(`${API_BASE_URL}/boards/${boardId}`, auth);
            setBoard(boardRes.data);

            // columns by status (server already filters & sorts)
            const [todo, doing, done] = await Promise.all(STATUSES.map((s) => fetchCardsByStatus(s)));
            const grouped = { todo, doing, done };
            setCardsByStatus(grouped);

            // board members (sidebar)
            const membersRes = await axios.get(`${API_BASE_URL}/boards/${boardId}/members`, auth);
            setArrayMembersForBoard(membersRes.data?.members || []);

            // hydrate members for cards + task counts
            await Promise.all([hydrateMembers(grouped), hydrateTaskCounts(grouped)]);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        }
    }, [user, token, boardId, auth, fetchCardsByStatus, hydrateMembers, hydrateTaskCounts]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Lightweight refreshers for members/board to use from TopSideBar + socket events
    const refreshMembers = useCallback(
        async (targetBoardId) => {
            try {
                const id = targetBoardId || boardId;
                if (!id) return;
                const membersRes = await axios.get(`${API_BASE_URL}/boards/${id}/members`, auth);
                setArrayMembersForBoard(membersRes.data?.members || []);
            } catch (err) {
                console.error("Failed to refresh board members:", err);
            }
        },
        [boardId, auth]
    );

    const refreshBoard = useCallback(async () => {
        try {
            if (!boardId) return;
            const boardRes = await axios.get(`${API_BASE_URL}/boards/${boardId}`, auth);
            setBoard(boardRes.data);
        } catch (err) {
            console.error("Failed to refresh board:", err);
        }
    }, [boardId, auth]);

    // Socket: join board room and listen to card/task events to auto refresh
    useEffect(() => {
        if (!boardId) return;
        socket.emit("boards:join", { boardId });

        const handleConnect = () => {
            // Re-join the board room after reconnects
            socket.emit("boards:join", { boardId });
        };
        const handleJoinDenied = () => {
            toast.error("Cannot join board room. Retrying...");
            // retry join shortly (token race or membership just updated)
            setTimeout(() => socket.emit("boards:join", { boardId }), 800);
        };

        const refresh = () => fetchData();
        const onCardsCreated = ({ card, actorName }) => {
            toast.success(`${card?.name || "Card"} created by ${actorName || "someone"}`);
            refresh();
        };
        const onCardsUpdated = (payload) => {
            const actor = payload?.actorName || "someone";
            toast.info(`Card updated by ${actor}`);
            refresh();
        };
        const onCardsDeleted = (payload) => {
            const actor = payload?.actorName || "someone";
            toast.warn(`Card deleted by ${actor}`);
            refresh();
        };

        const showTaskToast = (evt) => {
            const actor = evt?.actorName || "someone";
            const assignees = Array.isArray(evt?.assignedUsers) && evt.assignedUsers.length ? ` → Assigned: ${evt.assignedUsers.map((u) => u.username).join(", ")}` : "";
            toast.info(`Task change by ${actor}${assignees}`);
        };

        const onTasksCreated = (evt) => {
            showTaskToast(evt);
            refresh();
        };
        const onTasksUpdated = (evt) => {
            showTaskToast(evt);
            refresh();
        };
        const onTasksDeleted = (evt) => {
            showTaskToast(evt);
            refresh();
        };

        // Membership events → refresh members/board
        const onMemberJoined = (evt) => {
            if (!evt?.boardId || String(evt.boardId) !== String(boardId)) return;
            refreshMembers(evt.boardId);
            refreshBoard();
        };
        const onMemberInvited = (evt) => {
            if (!evt?.boardId || String(evt.boardId) !== String(boardId)) return;
            refreshMembers(evt.boardId);
        };
        // Inviter-specific notify (user room event)
        const onInviteAcceptedNotify = (evt) => {
            if (!evt?.boardId || String(evt.boardId) !== String(boardId)) return;
            refreshMembers(evt.boardId);
            refreshBoard();
        };

        // Board deleted → leave room, toast is handled globally in App.jsx, then redirect
        const onBoardDeleted = (payload) => {
            if (!payload?.id || String(payload.id) !== String(boardId)) return;
            try {
                socket.emit("boards:leave", { boardId });
            } catch (err) {
                console.error("Failed to emit boards:leave", err);
            }
            setTimeout(() => navigate("/boards"), 600);
        };

        socket.on("connect", handleConnect);
        socket.on("boards:join:denied", handleJoinDenied);
        socket.on("cards:created", onCardsCreated);
        socket.on("cards:updated", onCardsUpdated);
        socket.on("cards:deleted", onCardsDeleted);
        socket.on("tasks:created", onTasksCreated);
        socket.on("tasks:updated", onTasksUpdated);
        socket.on("tasks:deleted", onTasksDeleted);
        socket.on("boards:memberJoined", onMemberJoined);
        socket.on("boards:memberInvited", onMemberInvited);
        socket.on("invites:acceptedNotify", onInviteAcceptedNotify);
        socket.on("boards:deleted", onBoardDeleted);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("boards:join:denied", handleJoinDenied);
            socket.off("cards:created", onCardsCreated);
            socket.off("cards:updated", onCardsUpdated);
            socket.off("cards:deleted", onCardsDeleted);
            socket.off("tasks:created", onTasksCreated);
            socket.off("tasks:updated", onTasksUpdated);
            socket.off("tasks:deleted", onTasksDeleted);
            socket.off("boards:memberJoined", onMemberJoined);
            socket.off("boards:memberInvited", onMemberInvited);
            socket.off("invites:acceptedNotify", onInviteAcceptedNotify);
            socket.off("boards:deleted", onBoardDeleted);
            socket.emit("boards:leave", { boardId });
        };
    }, [boardId, fetchData, refreshMembers, refreshBoard, navigate]);

    /* ---------- DnD move ---------- */
    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const sourceStatus = source.droppableId;
        const destStatus = destination.droppableId;

        const movedCard = cardsByStatus[sourceStatus].find((c) => String(c.id) === String(draggableId));
        if (!movedCard) return;

        try {
            await axios.put(`${API_BASE_URL}/boards/${boardId}/cards/${draggableId}`, { status: destStatus }, auth);

            // Cập nhật UI nhanh (optimistic)
            setCardsByStatus((prev) => ({
                ...prev,
                [sourceStatus]: prev[sourceStatus].filter((c) => String(c.id) !== String(draggableId)),
                [destStatus]: [{ ...movedCard, status: destStatus }, ...prev[destStatus]],
            }));

            // Re-fetch 2 cột bị ảnh hưởng để đảm bảo đúng sort và data server
            const [srcCards, dstCards] = await Promise.all([fetchCardsByStatus(sourceStatus), fetchCardsByStatus(destStatus)]);
            setCardsByStatus((prev) => ({
                ...prev,
                [sourceStatus]: srcCards,
                [destStatus]: dstCards,
            }));

            // Hydrate lại members cho 2 cột (nhanh, chỉ fetch các card ở 2 cột)
            await hydrateMembers({ todo: sourceStatus === "todo" ? srcCards : [], doing: sourceStatus === "doing" ? srcCards : [], done: sourceStatus === "done" ? srcCards : [] });
            await hydrateMembers({ todo: destStatus === "todo" ? dstCards : [], doing: destStatus === "doing" ? dstCards : [], done: destStatus === "done" ? dstCards : [] });
        } catch (err) {
            console.error("Failed to update card status:", err);
        }
    };

    /* ---------- Handlers ---------- */
    const handleTaskCountsChange = useCallback((cardId, counts) => {
        setTaskCounts((prev) => ({
            ...prev,
            [cardId]: { done: counts?.done ?? 0, total: counts?.total ?? 0 },
        }));
    }, []);

    const handleCardMembersUpdate = useCallback((cardId, members) => {
        setCardMembersMap((prev) => ({
            ...prev,
            [String(cardId)]: Array.isArray(members) ? members : [],
        }));
    }, []);

    const handleAddTask = (status) => {
        setCreateForStatus(status || "todo");
        setIsCreateOpen(true);
    };

    const handleCreateCard = async ({ name, description, members, status }) => {
        const createdAt = new Date().toISOString();
        try {
            await axios.post(
                `${API_BASE_URL}/boards/${boardId}/cards`,
                {
                    name,
                    description,
                    createdAt,
                    members,
                    status: status || createForStatus || "todo",
                },
                auth
            );
            setIsCreateOpen(false);
            await fetchData();
        } catch (err) {
            console.error("Failed to create card:", err.response || err.message || err);
            alert("Failed to create card");
        }
    };

    return (
        <div style={{ paddingTop: "calc(60px + 20px)", ...pageStyles }}>
            <Header isShow={false} username={user?.username} avatar={user?.avatar} style={{ height: headerHeight, zIndex: 1030 }} />
            <div className="d-flex text-white pt-3" style={{ minHeight: "100vh" }}>
                <div style={{ width: "20%" }}>
                    <Sidebar members={arrayMembersForBoard} title={board?.name} />
                </div>

                <div style={{ marginRight: "20px", marginLeft: "10px", width: "80%", overflowY: "auto" }}>
                    <TopSideBar
                        memberId={board?.members}
                        ownerId={board?.ownerId}
                        token={token}
                        boardId={boardId}
                        boardName={board?.name}
                        onRefreshMembers={refreshMembers}
                        onRefreshBoard={refreshBoard}
                        className="text-black fw-normal p-2 mb-4 fs-5 ps-4 pe-4 d-flex justify-content-between align-items-center"
                    />

                    <div
                        style={{
                            overflowY: "auto",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            backgroundColor: "#fff",
                            minHeight: "72vh",
                        }}
                    >
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="d-flex gap-4 p-4" style={{ overflowX: "auto" }}>
                                {STATUSES.map((status) => (
                                    <Droppable droppableId={status} key={status}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="p-3 rounded-3"
                                                style={{
                                                    minWidth: "300px",
                                                    backgroundColor: snapshot.isDraggingOver ? "#d0f0ff" : "#e6f7ff",
                                                    border: "1px solid #e5e7eb",
                                                    flex: "1",
                                                    transition: "background-color 0.2s ease",
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        borderBottom: "3px solid #3ba9ff",
                                                        fontWeight: "600",
                                                        fontSize: "16px",
                                                    }}
                                                    className="text-black mb-3 pb-2"
                                                >
                                                    {STATUS_LABELS[status]}
                                                </p>

                                                {cardsByStatus[status].map((card, index) => {
                                                    const members = cardMembersMap[String(card.id)] || [];

                                                    return (
                                                        <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    onClick={() => setSelectedCard(card)}
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="mb-3 p-3 rounded-3 shadow-sm"
                                                                    style={{
                                                                        backgroundColor: snapshot.isDragging ? "#d1f7d6" : "#fff",
                                                                        border: "1px solid #cce5ff",
                                                                        boxShadow: snapshot.isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 6px rgba(0,0,0,0.05)",
                                                                        transition: "all 0.2s ease",
                                                                        ...provided.draggableProps.style,
                                                                    }}
                                                                >
                                                                    <strong className="text-black">{card.name}</strong>
                                                                    <div className="d-flex justify-content-between mt-2 align-items-center">
                                                                        {/* Members */}
                                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                                            {/* <MembersBar members={members} /> */}
                                                                            <MembersBar members={members} size="medium" isShow={false} />
                                                                        </div>

                                                                        {/* Task count */}
                                                                        <div style={{ display: "flex", alignItems: "center" }}>
                                                                            <Icon style={{ marginRight: 5 }} icon="material-symbols:checklist" width={20} />
                                                                            <small className="text-success d-block">
                                                                                {taskCounts[card.id]?.done ?? 0}/{taskCounts[card.id]?.total ?? 0}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}

                                                {/* Add Card Button */}
                                                <button
                                                    className="mt-2 p-2 w-100 text-start rounded-2 fw-medium"
                                                    style={{
                                                        border: "1px dashed #28a745",
                                                        background: "transparent",
                                                        color: "#28a745",
                                                        transition: "all 0.2s ease",
                                                    }}
                                                    onClick={() => handleAddTask(status)}
                                                    onMouseOver={(e) => (e.currentTarget.style.background = "#d1f7d6")}
                                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                                >
                                                    <Icon width={20} icon="material-symbols:add" /> Add a card
                                                </button>
                                            </div>
                                        )}
                                    </Droppable>
                                ))}
                            </div>
                        </DragDropContext>
                    </div>
                </div>
            </div>

            {isCreateOpen && (
                <CreateForm
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={(data) => handleCreateCard({ ...data, members: [], status: createForStatus })}
                    title="Create New Card"
                    nameLabel="Card Title"
                    namePlaceholder="Enter card title..."
                    descriptionLabel="Description"
                    submitLabel="Create Card"
                    initialValues={{ name: "", description: "" }}
                />
            )}

            <CardDetail
                card={selectedCard}
                onClose={() => setSelectedCard(null)}
                boardId={boardId}
                token={token}
                boardMembers={arrayMembersForBoard}
                onTaskCountsChange={handleTaskCountsChange}
                onCardMembersUpdate={handleCardMembersUpdate}
            />
        </div>
    );
};

const pageStyles = {
    background: "linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%)",
    minHeight: "100vh",
    paddingTop: "calc(60px + 20px)",
};

export default CardPage;
