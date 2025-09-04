import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { socket } from "../../config";
import { toast } from "react-toastify";
import InvitePopup from "../pages/Board/InvitePopup";

const TopSideBar = ({ token, boardName = "Board Management", boardId, style = {}, className = "" }) => {
    const [showInvite, setShowInvite] = useState(false);

    useEffect(() => {
        const handleInviteSent = (data) => {
            console.log("boardInviteSent:", data);
            toast.success(`Invitation sent to ${data.emailMember} successfully!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        };

        const handleInviteAccepted = (data) => {
            console.log("boardInviteAccepted:", data);
            toast.success(`${data.emailMember} has joined the board!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
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
            <style jsx>{`
                .top-sidebar-container {
                    background: #10b981;
                    border-radius: 16px;
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
                    color: white;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
                    background: rgba(255, 255, 255, 0.15);
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
                    background: rgba(255, 255, 255, 0.25);
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

                /* Responsive Design */
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

                /* Animation keyframes */
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }

                .shimmer-effect {
                    position: relative;
                    overflow: hidden;
                }

                .shimmer-effect::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: shimmer 2s infinite;
                }
            `}</style>

            <div className={`top-sidebar-container ${className}`} style={style}>
                <div className="top-sidebar-content">
                    <h1 className="board-title">{boardName}</h1>

                    <button onClick={() => setShowInvite(true)} className="invite-button" type="button" aria-label="Invite team member">
                        <Icon icon="material-symbols:person-add-rounded" width="20" className="invite-icon" />
                        <span className="invite-text">Invite Member</span>
                    </button>
                </div>
            </div>

            {showInvite && <InvitePopup boardId={boardId} token={token} onClose={() => setShowInvite(false)} />}
        </>
    );
};

export default TopSideBar;
