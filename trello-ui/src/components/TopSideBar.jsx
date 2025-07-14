import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { socket } from "../../config";
import { toast } from "react-toastify";
import InvitePopup from "../pages/Board/InvitePopup";

const TopSideBar = ({ token, boardName = "Board Management", boardId, style = {}, className = {} }) => {
    const [showInvite, setShowInvite] = useState(false);

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

    return (
        <>
            <div className={`${className}`} style={{ ...style }}>
                <p className="m-0">{boardName}</p>
                <div onClick={() => setShowInvite(true)} className="d-flex align-items-center px-2 py-1 border rounded" style={{ background: "#1e252a", cursor: "pointer" }}>
                    <Icon icon="material-symbols:account-circle" width="24" />
                    <span className="ms-2">Invite member</span>
                </div>
            </div>

            {showInvite && <InvitePopup boardId={boardId} token={token} onClose={() => setShowInvite(false)} />}
        </>
    );
};

export default TopSideBar;
