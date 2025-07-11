import React from "react";
import { BoardCard, Sidebar, Topbar } from "../components";

const BoardPage = () => {
    return (
        <div className="d-flex vh-100">
            <Sidebar />
            <div className="flex-grow-1 bg-dark text-white">
                <Topbar />
                <div className="p-4">
                    <h6 className="text-uppercase text-muted mb-4">Your Workspaces</h6>
                    <div className="d-flex flex-wrap">
                        <BoardCard title="My Trello board" />
                        <BoardCard isCreate />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardPage;
