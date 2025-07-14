import { useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { socket, API_BASE_URL } from "../../config";

const TopSideBar = ({ token, boardName = "Board Management", boardId, style = {}, className = {} }) => {
    useEffect(() => {
        socket.on("boardInviteSent", (data) => {
            console.log("📥 boardInviteSent:", data);
            alert(`📨 ${data.emailMember} has been invited to board "${data.boardId}"!`);
        });

        return () => {
            socket.off("boardInviteSent");
        };
    }, []);

    const handleInviteMember = async () => {
        const email = prompt("Enter email to invite:");
        if (!email) return;

        try {
            const response = await axios.post(
                `${API_BASE_URL}/boards/${boardId}/invite`,
                { emailMember: email },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("Invite sent:", response.data);
        } catch (error) {
            console.error("Failed to invite:", error.response?.data || error.message);
        }
    };

    return (
        <div className={`${className}`} style={{ ...style }}>
            <p className="m-0">{boardName}</p>
            <div onClick={handleInviteMember} className="d-flex align-items-center px-2 py-1 border rounded" style={{ background: "#1e252a", cursor: "pointer" }}>
                <Icon icon="material-symbols:account-circle" width="24" />
                <span className="ms-2">Invite member</span>
            </div>
        </div>
    );
};

export default TopSideBar;
