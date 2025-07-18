import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import API_BASE_URL from "../../../config/config";

import { BoardCard, Sidebar, Header, CreateBoardForm } from "../../components";

import { useUser } from "../../hooks";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const BoardPage = () => {
    const navigate = useNavigate();
    const headerHeight = "60px";
    const { user, token } = useUser();
    const [boards, setBoards] = useState([]);
    const [showForm, setShowForm] = useState(false);

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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => setBoards(res.data))
            .catch(console.error);
    }, [user, token]);

    const onDragEnd = (result) => {
        const { source: from, destination: to } = result;
        console.log(from, to);
        console.log(from.index, to.index);

        if (!to) return;

        const reordered = Array.from(boards);
        const [moved] = reordered.splice(from.index, 1);
        reordered.splice(to.index, 0, moved);

        setBoards(reordered);

        reordered.forEach((board, index) => {
            axios
                .put(
                    `${API_BASE_URL}/boards/${board.id}`,
                    { order: index },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
                .catch(console.error);
        });
    };

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

    const handleClickBoard = (boardId) => {
        console.log("boardId", boardId);
        navigate(`/boards/${boardId}`);
    };

    const content = useMemo(() => {
        if (!user || !token) return null;

        return (
            <>
                <Header
                    username={user?.username}
                    style={{ height: headerHeight, zIndex: 1030 }}
                />

                <div
                    className="d-flex bg-dark text-white"
                    style={{
                        paddingTop: `calc(${headerHeight} + 20px)`,
                        minHeight: "100vh",
                    }}
                >
                    <div style={{ width: "25%", position: "fixed" }}>
                        <Sidebar active="boards" fullHeight title="Board" />
                    </div>

                    <div
                        style={{
                            marginLeft: "25%",
                            width: "75%",
                            overflowY: "auto",
                            padding: "1.5rem",
                        }}
                    >
                        <h6 className="text-secondary fw-bold mb-4">
                            YOUR WORKSPACES
                        </h6>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable
                                droppableId="board-list"
                                direction="horizontal"
                                isDropDisabled={false}
                            >
                                {(provided) => (
                                    <div
                                        className="d-grid"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(4, 1fr)",
                                            gap: "1rem",
                                        }}
                                    >
                                        {boards.map((board, index) => (
                                            <Draggable
                                                key={board.id}
                                                draggableId={String(board.id)}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        onClick={() =>
                                                            handleClickBoard(
                                                                board.id
                                                            )
                                                        }
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            position:
                                                                "relative",
                                                        }}
                                                    >
                                                        <BoardCard
                                                            title={board.name}
                                                            description={
                                                                board.description
                                                            }
                                                        />
                                                        <span
                                                            className="position-absolute"
                                                            style={{
                                                                bottom: 0,
                                                                right: 0,
                                                                width: 0,
                                                                height: 0,
                                                                borderLeft:
                                                                    "20px solid transparent",
                                                                borderBottom:
                                                                    "20px solid #888888",
                                                                borderBottomRightRadius:
                                                                    "0.375rem",
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {provided.placeholder}

                                        <div className="col-12">
                                            <div
                                                className="border rounded border-white p-3 d-flex align-items-center justify-content-center gap-2"
                                                onClick={() =>
                                                    setShowForm(true)
                                                }
                                                style={{
                                                    cursor: "pointer",
                                                    minHeight: "100px",
                                                    ...createCardStyle,
                                                }}
                                            >
                                                <Icon
                                                    className="text-white"
                                                    icon="material-symbols:add"
                                                />
                                                <span className="text-white">
                                                    Create a new board
                                                </span>
                                                <span
                                                    className="position-absolute"
                                                    style={{
                                                        bottom: 0,
                                                        right: 0,
                                                        width: 0,
                                                        height: 0,
                                                        borderLeft:
                                                            "20px solid transparent",
                                                        borderBottom:
                                                            "20px solid #888888",
                                                        borderBottomRightRadius:
                                                            "0.375rem",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
            </>
        );
    }, [user, token, boards]);

    return (
        <>
            {content}
            {showForm && (
                <CreateBoardForm
                    onSubmit={onSubmit}
                    onClose={() => setShowForm(false)}
                />
            )}
        </>
    );
};

const createCardStyle = {
    cursor: "pointer",
    minHeight: "100px",
    position: "relative",
    padding: "1rem",
    border: "1px solid white",
    borderRadius: "0.375rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    backgroundColor: "transparent",
};

export default BoardPage;
