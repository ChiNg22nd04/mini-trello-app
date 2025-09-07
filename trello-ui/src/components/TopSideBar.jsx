import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { socket } from "../../config";
import { toast } from "react-toastify";
import InvitePopup from "../pages/Board/InvitePopup";
import { Button } from "./index";

const TopSideBar = ({ token, boardName = "Board Management", boardId, style = {}, className = "", onRefreshMembers, onRefreshBoard }) => {
    const [showInvite, setShowInvite] = useState(false);

    useEffect(() => {
        if (!boardId) return;

        // Join room board để nhận sync event (không toast)
        socket.emit("boards:join", { boardId });

        // ===== Toast events =====
        const onInviteSent = (data) => {
            // Server đã emit theo user, nên ai nhận được nghĩa là đúng vai
            toast.success(`Invitation sent to ${data.emailMember} successfully!`, { autoClose: 3000 });
            console.log("[socket] invites:sent", data);
        };

        const onInviteReceived = (data) => {
            toast.info(`You’ve been invited to board: ${data.boardName || data.boardId}`, { autoClose: 4000 });
            console.log("[socket] invites:received", data);
        };

        const onInviteAcceptedSelf = (data) => {
            // Invitee: joined successfully
            toast.success("You’ve joined the board successfully!", { autoClose: 3000 });
            console.log("[socket] invites:accepted", data);
        };

        const onInviteAcceptedNotify = (data) => {
            // Inviter: the other party joined
            toast.success(`${data.emailMember || "A member"} has joined your board!`, { autoClose: 3000 });
            console.log("[socket] invites:acceptedNotify", data);
            onRefreshMembers?.(data.boardId);
            onRefreshBoard?.();
        };

        // ===== Sync-only events ===== (không toast, có thể refetch members)
        const onMemberInvited = (data) => {
            if (data?.boardId === boardId) {
                // TODO: refetch invites/members if cần
            }
        };
        const onMemberJoined = (data) => {
            if (data?.boardId === boardId) {
                // TODO: refetch members list
                onRefreshMembers?.(boardId);
                onRefreshBoard?.();
            }
        };

        socket.on("invites:sent", onInviteSent);
        socket.on("invites:received", onInviteReceived);
        socket.on("invites:accepted", onInviteAcceptedSelf);
        socket.on("invites:acceptedNotify", onInviteAcceptedNotify);
        socket.on("boards:memberInvited", onMemberInvited);
        socket.on("boards:memberJoined", onMemberJoined);

        return () => {
            socket.off("invites:sent", onInviteSent);
            socket.off("invites:received", onInviteReceived);
            socket.off("invites:accepted", onInviteAcceptedSelf);
            socket.off("invites:acceptedNotify", onInviteAcceptedNotify);
            socket.off("boards:memberInvited", onMemberInvited);
            socket.off("boards:memberJoined", onMemberJoined);
            socket.emit("boards:leave", { boardId });
        };
    }, [boardId]);

    return (
        <>
            <style jsx>{`
                .top-sidebar-container {
                    background: #fff;
                    border-radius: 16px;
                    border: 1px solid #10b981;
                    padding: 1rem 2rem;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    justify-content: space-between;
                }
                .top-sidebar-container::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    transition: left 0.6s ease;
                }
                .top-sidebar-container:hover::before {
                    left: 100%;
                }
                .top-sidebar-content {
                    display: flex;
                    flex: 1;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    z-index: 1;
                }
                .board-title {
                    color: #10b981;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: -0.02em;
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: calc(100% - 200px);
                }
                .invite-button {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1.5rem;
                    background: #10b981;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    color: white;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                    position: relative;
                    overflow: hidden;
                }
                .invite-button::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    transition: left 0.5s ease;
                }
                .invite-button:hover {
                    background: #10b981;
                    border-color: rgba(255, 255, 255, 0.4);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(16, 185, 129, 0.3);
                }
                .invite-button:hover::before {
                    left: 100%;
                }
                .invite-button:active {
                    transform: translateY(0);
                    transition: transform 0.1s ease;
                }
                .invite-icon {
                    margin-right: 0.5rem;
                    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
                    transition: transform 0.3s ease;
                }
                .invite-button:hover .invite-icon {
                    transform: scale(1.1) rotate(5deg);
                }
                .invite-text {
                    white-space: nowrap;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                @media (max-width: 768px) {
                    .top-sidebar-container {
                        padding: 0.75rem 1rem;
                    }
                    .board-title {
                        font-size: 1rem;
                        max-width: calc(100% - 120px);
                    }
                    .invite-button {
                        padding: 0.5rem 1rem;
                        font-size: 0.8rem;
                    }
                    .invite-text {
                        display: none;
                    }
                }
                @media (max-width: 480px) {
                    .board-title {
                        font-size: 0.9rem;
                        max-width: calc(100% - 80px);
                    }
                    .invite-button {
                        padding: 0.5rem;
                    }
                }
            `}</style>

            <div className={`top-sidebar-container ${className}`} style={style}>
                <div className="top-sidebar-content">
                    <h1 className="board-title">{boardName}</h1>
                    <Button name="Invite Member" icon="material-symbols:person-add-rounded" variant="primary" iconSize={22} size="md" onClick={() => setShowInvite(true)} />
                </div>
            </div>

            {showInvite && <InvitePopup boardId={boardId} token={token} onClose={() => setShowInvite(false)} />}
        </>
    );
};

export default TopSideBar;
