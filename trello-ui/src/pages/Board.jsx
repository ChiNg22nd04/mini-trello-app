import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import API_BASE_URL from "../../config/config";

import { BoardCard, Sidebar, Header } from "../components";
import { useUser } from "../hooks";
import { Icon } from "@iconify/react";

const BoardPage = () => {
    const headerHeight = "60px";
    const { user, token } = useUser();
    const [boards, setBoards] = useState([]);

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

    const content = useMemo(() => {
        if (!user || !token) return null;

        return (
            <>
                <Header username={user?.username} style={{ height: headerHeight, zIndex: 1030 }} />

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
                        <h6 className="text-secondary fw-bold mb-4">YOUR WORKSPACES</h6>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="board-list" direction="horizontal" isDropDisabled={false}>
                                {(provided) => (
                                    <div className="row g-3" {...provided.droppableProps} ref={provided.innerRef}>
                                        {boards.map((board, index) => (
                                            <Draggable key={board.id} draggableId={String(board.id)} index={index}>
                                                {(provided) => (
                                                    <div
                                                        className="col-12 col-sm-6 col-md-4 col-lg-3" // responsive 1-4 columns
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <BoardCard title={board.name} description={board.description} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {provided.placeholder}

                                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                            <div className="border rounded border-white p-3 d-flex align-items-center justify-content-center gap-2" style={{ cursor: "pointer", minHeight: "100px" }}>
                                                <Icon className="text-white" icon="material-symbols:add" />
                                                <span className="text-white">Create a new board</span>
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

    return content;
};

export default BoardPage;
