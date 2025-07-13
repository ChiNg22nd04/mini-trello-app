import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import API_BASE_URL from "../../../config/config";

import { Header, TopSideBar } from "../../components";
import Sidebar from "./Sidebar";

import { useUser } from "../../hooks";
import { Icon } from "@iconify/react";
const STATUSES = ["icebox", "todo", "doing", "done"];

const STATUS_LABELS = {
    todo: "To Do",
    doing: "Doing",
    done: "Done",
};

const CardPage = () => {
    const { user, token } = useUser();
    const { id: boardId } = useParams();

    const [board, setBoard] = useState(null);
    const [cards, setCards] = useState([]);

    const headerHeight = "60px";

    console.log(boardId);

    useEffect(() => {
        if (!user || !token || !boardId) return;
        const fetchData = async () => {
            try {
                const dataBoard = await axios.get(`${API_BASE_URL}/boards/${boardId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBoard(dataBoard.data);
                console.log("dataBoard", dataBoard.data);

                const cardsRes = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("cardsRes", cardsRes.data);

                const fetchCards = [];
                for (const card of cardsRes.data) {
                    console.log("card", card);
                    const taskRes = await axios.get(`${API_BASE_URL}/boards/${boardId}/cards/${card.id}/tasks`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const tasks = taskRes.data;
                    const firstStatus = tasks[0]?.status || "todo";

                    fetchCards.push({
                        ...card,
                        taskStatus: firstStatus,
                    });
                }
                setCards(fetchCards);
            } catch (error) {
                console.error("Failed to get data", error);
            }
        };
        fetchData();
    }, [user, token, boardId]);

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const movedCardId = draggableId;
        const newStatus = destination.droppableId;

        if (source.droppableId !== destination.droppableId) {
            try {
                await axios.put(
                    `${API_BASE_URL}/cards/${movedCardId}/status`,
                    {
                        status: newStatus,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setCards((prev) => prev.map((card) => (card.id === movedCardId ? { ...card, status: newStatus } : card)));
            } catch (error) {
                console.error("Failed to update card status", error);
            }
        }
    };

    const getCardsByStatus = (status) => cards.filter((card) => card.status === status);
    console.log("cards", cards);
    return (
        <>
            <Header isShow={false} username={user?.username} style={{ height: headerHeight, zIndex: 1030 }} />
            <div
                className="d-flex bg-dark text-white"
                style={{
                    paddingTop: headerHeight,
                    minHeight: "100vh",
                }}
            >
                <div style={{ width: "25%", position: "fixed" }}>
                    <Sidebar active="boards" fullHeight title={board?.name} members={board?.members} />
                </div>

                <div
                    style={{
                        marginLeft: "25%",
                        width: "75%",
                        overflowY: "auto",
                        backgroundColor: "#f5f5f5",
                    }}
                >
                    <TopSideBar
                        boardName={board?.name}
                        className="text-white fw-normal p-2 mb-4 fs-5 ps-4 pe-4 d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#743153" }}
                    />

                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="d-flex gap-3" style={{ overflowX: "auto", padding: "0px 10px 10px 10px" }}>
                            {STATUSES.map((status) => (
                                <Droppable droppableId={status} key={status}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="rounded p-3"
                                            style={{ minWidth: "250px", height: "100%", flex: "1", backgroundColor: "#1e252a" }}
                                        >
                                            <p className="text-white mb-3">{STATUS_LABELS[status]}</p>
                                            {getCardsByStatus(status).map((card, index) => (
                                                <Draggable key={card.id} draggableId={card.id} index={index}>
                                                    {(provided) => (
                                                        console.log("Card", card),
                                                        (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="bg-dark text-white border rounded mb-3 p-2"
                                                            >
                                                                <strong>{card.name}</strong>
                                                                <p className="mb-1">{card.description}</p>
                                                                {card.priority && (
                                                                    <span
                                                                        className={`badge ${
                                                                            card.priority === "high" ? "bg-danger" : card.priority === "medium" ? "bg-warning text-dark" : "bg-success"
                                                                        }`}
                                                                    >
                                                                        {card.priority}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </Draggable>
                                            ))}

                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </div>
        </>
    );
};

export default CardPage;
