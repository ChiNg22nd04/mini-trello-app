import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import API_BASE_URL from "../../../config/config";

import { Header, TopSideBar } from "../../components";
import Sidebar from "./Sidebar";
import CardDetail from "./CardDetail";
import CreateCardModal from "./CreateCardModal";

import { useUser } from "../../hooks";

const STATUSES = ["todo", "doing", "done"];

const STATUS_LABELS = {
    todo: "To Do",
    doing: "Doing",
    done: "Done",
};

const CardPage = () => {
    const { user, token } = useUser();
    const { id: boardId } = useParams();

    const [board, setBoard] = useState(null);
    const [cardsByStatus, setCardsByStatus] = useState({ todo: [], doing: [], done: [] });
    const [selectedCard, setSelectedCard] = useState(null);
    const [arrayMembers, setArrayMembers] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [taskCounts, setTaskCounts] = useState({});

    const headerHeight = "60px";

    const fetchCardMembers = async (cardId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/cards/${cardId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data || [];
        } catch (err) {
            console.error(`Failed to fetch members for card ${cardId}:`, err);
            return [];
        }
    };

    const fetchData = useCallback(async () => {
        if (!user || !token || !boardId) return;
        try {
            // fetch board
            const boardRes = await axios.get(`${API_BASE_URL}/boards/${boardId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBoard(boardRes.data);

            // fetch cards
            const cardsRes = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allCards = Array.isArray(cardsRes.data) ? cardsRes.data : [];

            // gắn members cho từng card
            const cardsWithMembers = await Promise.all(
                allCards.map(async (c) => {
                    const members = await fetchCardMembers(c.id);
                    return { ...c, members };
                })
            );

            // group theo status
            const grouped = { todo: [], doing: [], done: [] };
            cardsWithMembers.forEach((card) => {
                const status = card.status || "todo";
                if (!grouped[status]) grouped[status] = [];
                grouped[status].push(card);
            });
            setCardsByStatus(grouped);

            // fetch task counts
            if (allCards.length > 0) {
                try {
                    const entries = await Promise.all(
                        allCards.map(async (c) => {
                            try {
                                const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${c.id}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
                                const tasks = res.data || [];
                                const done = tasks.filter((t) => t.completed).length;
                                return [c.id, { done, total: tasks.length }];
                            } catch {
                                return [c.id, { done: 0, total: 0 }];
                            }
                        })
                    );
                    setTaskCounts((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
                } catch {
                    // ignore
                }
            }

            // fetch members của board
            const members = await axios.get(`${API_BASE_URL}/boards/${boardId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setArrayMembers(members.data.members || []);
        } catch (err) {
            console.error("Failed to fetch board or cards:", err);
        }
    }, [user, token, boardId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const sourceStatus = source.droppableId;
        const destStatus = destination.droppableId;

        const movedCard = cardsByStatus[sourceStatus].find((c) => String(c.id) === String(draggableId));
        if (!movedCard) return;

        try {
            await axios.put(`${API_BASE_URL}/cards/${draggableId}`, { status: destStatus }, { headers: { Authorization: `Bearer ${token}` } });

            setCardsByStatus((prev) => ({
                ...prev,
                [sourceStatus]: prev[sourceStatus].filter((c) => String(c.id) !== String(draggableId)),
                [destStatus]: [...prev[destStatus], { ...movedCard, status: destStatus }],
            }));
        } catch (err) {
            console.error("Failed to update card status:", err);
        }
    };

    const handleTaskCountsChange = useCallback((cardId, counts) => {
        setTaskCounts((prev) => ({
            ...prev,
            [cardId]: { done: counts?.done ?? 0, total: counts?.total ?? 0 },
        }));
    }, []);

    const handleAddTask = () => {
        setIsCreateOpen(true);
    };

    const handleCreateCard = async ({ name, description, members }) => {
        const createdAt = new Date().toISOString();
        try {
            await axios.post(`${API_BASE_URL}/boards/${boardId}/cards`, { name, description, createdAt, members }, { headers: { Authorization: `Bearer ${token}` } });
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
                    <Sidebar members={arrayMembers} fullHeight title={board?.name} />
                </div>

                <div style={{ marginRight: "20px", marginLeft: "10px", width: "80%", overflowY: "auto" }}>
                    <TopSideBar
                        memberId={board?.members}
                        ownerId={board?.ownerId}
                        token={token}
                        boardId={boardId}
                        boardName={board?.name}
                        className="text-black fw-normal p-2 mb-4 fs-5 ps-4 pe-4 d-flex justify-content-between align-items-center"
                    />

                    <div
                        style={{
                            overflowY: "auto",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            backgroundColor: "#fff",
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
                                                {/* Column Header */}
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

                                                {/* Cards */}
                                                {cardsByStatus[status].map((card, index) => (
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
                                                                        {card.members?.slice(0, 3).map((m) => (
                                                                            <img
                                                                                key={m.id}
                                                                                src={m.avatar}
                                                                                alt={m.username}
                                                                                title={m.username}
                                                                                style={{
                                                                                    width: 28,
                                                                                    height: 28,
                                                                                    borderRadius: "50%",
                                                                                    objectFit: "cover",
                                                                                    marginRight: "-8px",
                                                                                    border: "2px solid #fff",
                                                                                }}
                                                                            />
                                                                        ))}
                                                                        {card.members?.length > 3 && (
                                                                            <span
                                                                                style={{
                                                                                    fontSize: "12px",
                                                                                    marginLeft: "4px",
                                                                                    color: "#555",
                                                                                }}
                                                                            >
                                                                                +{card.members.length - 3}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {/* Task count */}
                                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                                        <Icon style={{ marginRight: 5, color: "#28a745" }} icon="material-symbols:checklist" width={20} />
                                                                        <small className="text-success d-block">
                                                                            {taskCounts[card.id]?.done ?? 0}/{taskCounts[card.id]?.total ?? 0}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
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
                                                    onClick={() => handleAddTask()}
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
            {isCreateOpen && <CreateCardModal onClose={() => setIsCreateOpen(false)} onCreate={handleCreateCard} members={arrayMembers} />}
            <CardDetail card={selectedCard} onClose={() => setSelectedCard(null)} boardId={boardId} token={token} boardMembers={arrayMembers} onTaskCountsChange={handleTaskCountsChange} />
        </div>
    );
};

const pageStyles = {
    background: "linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%)",
    minHeight: "100vh",
    paddingTop: "calc(60px + 20px)",
};

export default CardPage;
