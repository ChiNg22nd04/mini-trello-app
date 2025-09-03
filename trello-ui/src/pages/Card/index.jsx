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

    const [cardsByStatus, setCardsByStatus] = useState({
        todo: [],
        doing: [],
        done: [],
    });

    const [selectedCard, setSelectedCard] = useState(null);
    const [arrayMembers, setArrayMembers] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const headerHeight = "60px";

    console.log(boardId);

    const fetchData = useCallback(async () => {
        if (!user || !token || !boardId) return;
        try {
            const boardRes = await axios.get(
                `${API_BASE_URL}/boards/${boardId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setBoard(boardRes.data);

            // Fetch cards and group them by their own status
            const cardsRes = await axios.get(
                `${API_BASE_URL}/boards/${boardId}/cards`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const grouped = {
                todo: [],
                doing: [],
                done: [],
            };

            (cardsRes.data || []).forEach((card) => {
                const status = card.status || "todo";
                if (!grouped[status]) grouped[status] = [];
                grouped[status].push(card);
            });

            setCardsByStatus(grouped);

            const members = await axios.get(
                `${API_BASE_URL}/boards/${boardId}/members`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
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
        if (!destination || source.droppableId === destination.droppableId)
            return;

        const sourceStatus = source.droppableId;
        const destStatus = destination.droppableId;

        const movedCard = cardsByStatus[sourceStatus].find(
            (c) => String(c.id) === String(draggableId)
        );
        if (!movedCard) return;

        try {
            // Update card status on server
            await axios.put(
                `${API_BASE_URL}/cards/${draggableId}`,
                {
                    status: destStatus,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setCardsByStatus((prev) => {
                return {
                    ...prev,
                    [sourceStatus]: prev[sourceStatus].filter(
                        (c) => String(c.id) !== String(draggableId)
                    ),
                    [destStatus]: [
                        ...prev[destStatus],
                        { ...movedCard, status: destStatus },
                    ],
                };
            });
        } catch (err) {
            console.error("Failed to update card status:", err);
        }
    };

    const handleAddTask = () => {
        setIsCreateOpen(true);
    };

    const handleCreateCard = async ({ name, description, members }) => {
        const createdAt = new Date().toISOString();
        try {
            await axios.post(
                `${API_BASE_URL}/boards/${boardId}/cards`,
                {
                    name,
                    description,
                    createdAt,
                    members,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setIsCreateOpen(false);
            await fetchData();
        } catch (err) {
            console.error(
                "Failed to create card:",
                err.response || err.message || err
            );
            alert("Failed to create card");
        }
    };

    return (
        <>
            <Header
                isShow={false}
                username={user?.username}
                style={{ height: headerHeight, zIndex: 1030 }}
            />
            <div
                className="d-flex bg-dark text-white"
                style={{
                    paddingTop: headerHeight,
                    minHeight: "100vh",
                }}
            >
                <div style={{ width: "20%", position: "fixed" }}>
                    <Sidebar
                        members={arrayMembers}
                        fullHeight
                        title={board?.name}
                    />
                </div>

                <div
                    style={{
                        marginLeft: "20%",
                        width: "80%",
                        overflowY: "auto",
                        backgroundColor: "#f5f5f5",
                    }}
                >
                    <TopSideBar
                        memberId={board?.members}
                        ownerId={board?.ownerId}
                        token={token}
                        boardId={boardId}
                        boardName={board?.name}
                        className="text-white fw-normal p-2 mb-4 fs-5 ps-4 pe-4 d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#743153" }}
                    />
                    {console.log("user", user)}
                    {console.log("token", token)}
                    {console.log("board", board)}
                    {console.log("boardId", boardId)}

                    <DragDropContext onDragEnd={onDragEnd}>
                        <div
                            className="d-flex gap-3 p-3"
                            style={{ overflowX: "auto" }}
                        >
                            {STATUSES.map((status) => (
                                <Droppable droppableId={status} key={status}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="rounded p-3"
                                            style={{
                                                minWidth: "280px",
                                                backgroundColor: "#1e252a",
                                                flex: "1",
                                                height: "100%",
                                            }}
                                        >
                                            <p className="text-white mb-3">
                                                {STATUS_LABELS[status]}
                                            </p>

                                            {cardsByStatus[status].map(
                                                (card, index) => (
                                                    <Draggable
                                                        key={card.id}
                                                        draggableId={String(
                                                            card.id
                                                        )}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                onClick={() =>
                                                                    setSelectedCard(
                                                                        card
                                                                    )
                                                                }
                                                                ref={
                                                                    provided.innerRef
                                                                }
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="bg-dark text-white border rounded mb-3 p-2"
                                                            >
                                                                <strong>
                                                                    {card.name}
                                                                </strong>
                                                                <p className="mb-1">
                                                                    {
                                                                        card.description
                                                                    }
                                                                </p>
                                                                <small className="text-muted">
                                                                    Members:{" "}
                                                                    {Array.isArray(
                                                                        card.members
                                                                    )
                                                                        ? card
                                                                              .members
                                                                              .length
                                                                        : 0}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )
                                            )}

                                            {provided.placeholder}
                                            <button
                                                className="d-flex justify-content-between mt-2 btn btn-sm text-white text-start border-none mt-2 w-100"
                                                onClick={() => handleAddTask()}
                                            >
                                                <div className="d-flex justify-content-between">
                                                    <Icon
                                                        width={20}
                                                        icon="material-symbols:add"
                                                    />
                                                    <span>Add a card</span>
                                                </div>
                                                <Icon
                                                    width={20}
                                                    icon="material-symbols:ink-selection-rounded"
                                                />
                                            </button>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </div>
            {isCreateOpen && (
                <CreateCardModal
                    onClose={() => setIsCreateOpen(false)}
                    onCreate={handleCreateCard}
                    members={arrayMembers}
                />
            )}

            <CardDetail
                card={selectedCard}
                onClose={() => setSelectedCard(null)}
            />
        </>
    );
};

export default CardPage;
