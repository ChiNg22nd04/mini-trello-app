import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import API_BASE_URL from "../../config/config";

import { BoardCard, Sidebar, Header } from "../components";
import { useUser } from "../hooks";

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
                        {/* <div className="d-flex flex-wrap">
                            {boards.map((board) => (
                                <BoardCard key={board.id} title={board.name} description={board.description} />
                            ))}
                            <BoardCard title="+ Create a new board" />
                        </div> */}

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="board-list" direction="horizontal" isDropDisabled={false}>
                                {(provided) => (
                                    <div className="d-flex flex-wrap" {...provided.droppableProps} ref={provided.innerRef}>
                                        {boards.map((board, index) => (
                                            <Draggable key={board.id} draggableId={String(board.id)} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="m-2">
                                                        <BoardCard title={board.name} description={board.description} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>

                            {/* Đặt Create Board button bên ngoài Droppable */}
                            <div className="d-flex flex-wrap mt-2">
                                <div className="m-2">
                                    <BoardCard title="+ Create a new board" />
                                </div>
                            </div>
                        </DragDropContext>
                    </div>
                </div>
            </>
        );
    }, [user, token, boards]);

    return content;
};

export default BoardPage;
