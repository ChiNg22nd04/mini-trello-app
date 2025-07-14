import { useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

import { socket, API_BASE_URL } from "../../config";
import { toast } from "react-toastify";

const TopSideBar = ({
    token,
    boardName = "Board Management",
    boardId,
    style = {},
    className = {},
}) => {
    useEffect(() => {
        const handleInviteSent = (data) => {
            console.log("boardInviteSent:", data);
            toast.success(
                `Invitation sent to ${data.emailMember} successfully!`
            );
        };

        const handleInviteAccepted = (data) => {
            console.log("boardInviteAccepted:", data);
            toast.success(`${data.emailMember} has joined the board!`);
        };

        socket.on("boardInviteSent", handleInviteSent);
        socket.on("boardInviteAccepted", handleInviteAccepted);

        return () => {
            socket.off("boardInviteSent", handleInviteSent);
            socket.off("boardInviteAccepted", handleInviteAccepted);
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
            toast.info(`Invitation sent to ${email}`);
        } catch (error) {
            console.error(
                "Failed to invite:",
                error.response?.data || error.message
            );
            toast.error("Failed to send invitation. Please try again.");
        }
    };

    return (
        <div className={`${className}`} style={{ ...style }}>
            <p className="m-0">{boardName}</p>
            <div
                onClick={handleInviteMember}
                className="d-flex align-items-center px-2 py-1 border rounded"
                style={{ background: "#1e252a", cursor: "pointer" }}
            >
                <Icon icon="material-symbols:account-circle" width="24" />
                <span className="ms-2">Invite member</span>
            </div>
        </div>
    );
};

export default TopSideBar;
