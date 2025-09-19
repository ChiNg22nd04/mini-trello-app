import { useState, useEffect, useMemo, useCallback } from "react";
import { socket } from "../../config";
import { toast } from "react-toastify";
import InvitePopup from "../pages/Board/InvitePopup";
import BoardSettingsPopup from "../pages/Board/BoardSettingsPopup";
import { Button, ConfirmDialog } from "./index";
import axios from "axios";
import API_BASE_URL from "../../config/config";

const TopSideBar = ({ token, boardName = "Board Management", boardId, style = {}, className = "", onRefreshMembers, onRefreshBoard, isClosed = false, isOwner = false, onLocalClosedChange }) => {
    const [showInvite, setShowInvite] = useState(false);
    const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
    const [closing, setClosing] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [reopening, setReopening] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

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
        const onClosed = (payload) => {
            if (String(payload?.id) !== String(boardId)) return;
            toast.warn("Board has been closed");
            onLocalClosedChange?.(true);
            onRefreshBoard?.();
        };
        const onReopened = (payload) => {
            if (String(payload?.id) !== String(boardId)) return;
            toast.success("Board reopened");
            onLocalClosedChange?.(false);
            onRefreshBoard?.();
        };
        socket.on("boards:closed", onClosed);
        socket.on("boards:reopened", onReopened);

        return () => {
            socket.off("invites:sent", onInviteSent);
            socket.off("invites:received", onInviteReceived);
            socket.off("invites:accepted", onInviteAcceptedSelf);
            socket.off("invites:acceptedNotify", onInviteAcceptedNotify);
            socket.off("boards:memberInvited", onMemberInvited);
            socket.off("boards:memberJoined", onMemberJoined);
            socket.off("boards:closed", onClosed);
            socket.off("boards:reopened", onReopened);
            socket.emit("boards:leave", { boardId });
        };
    }, [boardId]);

    useEffect(() => {
        const onDocClick = () => {
            // close menu on outside click
            setShowMenu(false);
        };
        if (showMenu) {
            document.addEventListener("click", onDocClick);
        }
        return () => document.removeEventListener("click", onDocClick);
    }, [showMenu]);

    const handleLeave = useCallback(async () => {
        try {
            setLeaving(true);
            await axios.post(`${API_BASE_URL}/boards/${boardId}/leave`, {}, auth);
            toast.success("You left the board");
            onRefreshMembers?.(boardId);
            onRefreshBoard?.();
        } catch (err) {
            console.error(err);
            toast.error("Failed to leave board");
        } finally {
            setLeaving(false);
        }
    }, [boardId, auth, onRefreshBoard, onRefreshMembers]);

    const handleCloseBoard = useCallback(async () => {
        try {
            setClosing(true);
            await axios.post(`${API_BASE_URL}/boards/${boardId}/close`, {}, auth);
            toast.warn("Board closed");
            onLocalClosedChange?.(true);
            onRefreshBoard?.();
        } catch (err) {
            console.error(err);
            toast.error("Failed to close board");
        } finally {
            setClosing(false);
        }
    }, [boardId, auth, onLocalClosedChange, onRefreshBoard]);

    const handleReopenBoard = useCallback(async () => {
        try {
            setReopening(true);
            await axios.post(`${API_BASE_URL}/boards/${boardId}/reopen`, {}, auth);
            toast.success("Board reopened");
            onLocalClosedChange?.(false);
            onRefreshBoard?.();
        } catch (err) {
            console.error(err);
            toast.error("Failed to reopen board");
        } finally {
            setReopening(false);
        }
    }, [boardId, auth, onLocalClosedChange, onRefreshBoard]);

    return (
        <>
            <style jsx>{`
                .top-sidebar-container {
                    background: #fff;
                    border-radius: 16px;
                    border: 1px solid #10b981;
                    padding: 1rem 2rem;
                    position: relative;
                    overflow: visible;
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
                    <h1 className="board-title">
                        {boardName}
                        {isClosed ? " (Closed)" : ""}
                    </h1>
                    <div style={{ position: "relative", display: "flex", gap: 8, alignItems: "center" }}>
                        <Button
                            icon="mdi:dots-vertical"
                            variant="outline"
                            iconSize={22}
                            size="md"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu((s) => !s);
                            }}
                        />

                        {showMenu && (
                            <div
                                className="popover"
                                style={{
                                    position: "absolute",
                                    top: 44,
                                    right: 0,
                                    background: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 12,
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                    padding: 8,
                                    zIndex: 50,
                                    minWidth: 200,
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Button
                                    name="Board settings"
                                    icon="material-symbols:settings"
                                    variant="primary"
                                    iconSize={20}
                                    size="md"
                                    style={{ width: "100%", justifyContent: "flex-start" }}
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowSettings(true);
                                    }}
                                />
                                <div className="pb-2"></div>

                                {!isOwner && (
                                    <Button
                                        name="Leave board"
                                        icon="material-symbols:logout-rounded"
                                        variant="redModern"
                                        iconSize={20}
                                        size="md"
                                        style={{ width: "100%", justifyContent: "flex-start" }}
                                        onClick={async () => {
                                            setShowMenu(false);
                                            await handleLeave();
                                        }}
                                        disabled={leaving}
                                    />
                                )}

                                {isOwner && !isClosed && (
                                    <Button
                                        name="Close board"
                                        icon="material-symbols:lock-outline"
                                        variant="redModern"
                                        iconSize={20}
                                        size="md"
                                        style={{ width: "100%", justifyContent: "flex-start" }}
                                        onClick={() => {
                                            setShowMenu(false);
                                            setShowCloseConfirm(true);
                                        }}
                                        disabled={closing}
                                    />
                                )}

                                {isOwner && isClosed && (
                                    <Button
                                        name="Reopen board"
                                        icon="material-symbols:lock-open-outline"
                                        variant="greenModern"
                                        iconSize={20}
                                        size="md"
                                        style={{ width: "100%", justifyContent: "flex-start" }}
                                        onClick={async () => {
                                            setShowMenu(false);
                                            await handleReopenBoard();
                                        }}
                                        disabled={reopening}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showInvite && <InvitePopup boardId={boardId} token={token} onClose={() => setShowInvite(false)} />}
            {showSettings && (
                <BoardSettingsPopup
                    boardId={boardId}
                    token={token}
                    initialName={boardName}
                    // description is provided from parent; if needed extend props to pass it
                    initialDescription={""}
                    isOwner={isOwner}
                    isClosed={isClosed}
                    onSaved={onRefreshBoard}
                    onClose={() => setShowSettings(false)}
                />
            )}
            {showCloseConfirm && (
                <ConfirmDialog
                    title="Close board"
                    message="Are you sure you want to close this board? You won't be able to add new cards or tasks until it is reopened."
                    confirmText="Close board"
                    cancelText="Cancel"
                    onConfirm={async () => {
                        await handleCloseBoard();
                        setShowCloseConfirm(false);
                    }}
                    onCancel={() => setShowCloseConfirm(false)}
                    loading={closing}
                    tone="destructive"
                />
            )}
        </>
    );
};

export default TopSideBar;
