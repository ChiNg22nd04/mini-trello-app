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
                <Header username={user?.username} style={{ height: headerHeight, zIndex: 1030 }} />
                <div
                    className="d-flex"
                    style={{
                        backgroundColor: "#f4f6f9", // nền sáng
                        paddingTop: `calc(${headerHeight} + 20px)`,
                        minHeight: "100vh",
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "2rem",
                        }}
                    >
                        <h6 className="text-secondary fw-bold mb-4">YOUR WORKSPACES</h6>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="board-list" direction="horizontal">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} style={gridStyle}>
                                        {boards.map((board, index) => (
                                            <Draggable key={board.id} draggableId={String(board.id)} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        onClick={() => handleClickBoard(board.id)}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...boardCardStyle,
                                                            ...(snapshot.isDragging ? boardCardHover : {}),
                                                        }}
                                                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, { ...boardCardStyle, ...boardCardHover })}
                                                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...boardCardStyle })}
                                                    >
                                                        <BoardCard title={board.name} description={board.description} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {provided.placeholder}

                                        <div
                                            style={createBoardCardStyle}
                                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, createBoardCardHover)}
                                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, createBoardCardStyle)}
                                            onClick={() => setShowForm(true)}
                                        >
                                            <Icon className="text-primary" icon="material-symbols:add" width="28" />
                                            <span className="fw-bold">Create a new board</span>
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
            {showForm && <CreateBoardForm onSubmit={onSubmit} onClose={() => setShowForm(false)} />}
        </>
    );
};

const layoutStyle = {
    backgroundColor: "#f4f6f9",
    paddingTop: "80px",
    minHeight: "100vh",
    display: "flex",
};

const boardCardHoverBlue = {
    background: "#eef6ff",
    borderColor: "#3399ff",
};

const sidebarWrapper = {
    width: "240px",
    position: "fixed",
    top: "60px", // = headerHeight
    left: 0,
};

const contentStyle = {
    marginLeft: "240px",
    flex: 1,
    overflowY: "auto",
    padding: "2rem",
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem",
};

const boardCardStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
    cursor: "pointer",
};
const boardCardHover = {
    background: "#3399ff",
    borderColor: "#3399ff",
    color: "#fff",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
    transform: "translateY(-4px)",
};

const createBoardCardStyle = {
    background: "#f9fafb",
    border: "2px dashed #bbb",
    borderRadius: "12px",
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    color: "#666",
    cursor: "pointer",
    transition: "all 0.2s ease",
};
const createBoardCardHover = {
    background: "#eef6ff",
    borderColor: "#3399ff",
    color: "#3399ff",
};

export default BoardPage;
