import React from "react";

const BoardCard = ({ title = "My Trello board", isCreate = false }) => {
    return (
        <div className="border rounded bg-white p-3 me-3 mb-3" style={{ width: "200px", height: "120px" }}>
            {isCreate ? <div className="text-muted text-center">+ Create a new board</div> : <div className="text-dark">{title}</div>}
        </div>
    );
};

export default BoardCard;
