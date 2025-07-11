import React, { useState, useEffect } from "react";
import axios from "axios";

import API_BASE_URL from "../../config/index";

import { BoardCard, Sidebar, Header } from "../components";

import { useUser } from "../hooks";

const BoardPage = () => {
    const user = useUser();
    const headerHeight = "60px";
    const [boards, setBoards] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        const fetchBoards = async () => {
            const response = await axios.get(`${API_BASE_URL}/boards`, {
                params: user.id,
            });
            setBoards(response.data);
        };

        fetchBoards();
    }, [user]);

    return (
        <>
            <Header username={user.username} style={{ height: headerHeight, zIndex: 1030 }} />

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
                    <div className="d-flex flex-wrap">
                        {boards.map((board) => (
                            <BoardCard key={board.id} title={board.name} description={board.description} />
                        ))}
                        <BoardCard title="+ Create a new board" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default BoardPage;
