import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import API_BASE_URL from "../../../config/config";

import { Header, TopSideBar } from "../../components";
import Sidebar from "./Sidebar";

import { useUser } from "../../hooks";
import { Icon } from "@iconify/react";

const CardPage = () => {
    const { user, token } = useUser();
    const boardId = useParams().id;

    const [board, setBoard] = useState(null);
    const headerHeight = "60px";

    console.log(boardId);

    useEffect(() => {
        if (!user || !token) return;
        const fetchBoard = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/boards/${boardId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBoard(res.data);
                console.log("res.data", res.data);
            } catch (error) {
                console.error("Failed to get board", error);
            }
        };
        fetchBoard();
    }, [user, token]);

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
                    }}
                >
                    <TopSideBar
                        boardName={board?.name}
                        className="text-white fw-normal p-2 mb-4 fs-5 ps-4 pe-4 d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#743153" }}
                    />

                    {console.log(board)}
                    {/* <DragDropContext>
                        <Droppable droppableId="board-list" direction="horizontal" isDropDisabled={false}>
                            {(provided) => (
                                <div
                                    className="d-grid"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4, 1fr)",
                                        gap: "1rem",
                                    }}
                                >
                                    {board?.map((board, index) => console.log(board, index))}

                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext> */}
                </div>
            </div>
        </>
    );
};

export default CardPage;
