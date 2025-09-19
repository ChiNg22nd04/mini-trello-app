import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import axios from "axios";
import API_BASE_URL from "../../../config/config";
import { Button } from "../../components";
import InvitePopup from "./InvitePopup";

const BoardSettingsPopup = ({
    boardId,
    token,
    initialName = "",
    initialDescription = "",
    isOwner = false,
    isClosed = false,
    onClose,
    onSaved, // callback to refresh board info
}) => {
    const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
    const [name, setName] = useState(initialName || "");
    const [description, setDescription] = useState(initialDescription || "");
    const [saving, setSaving] = useState(false);
    const [closing, setClosing] = useState(false);
    const [reopening, setReopening] = useState(false);
    const [showInvite, setShowInvite] = useState(false);

    useEffect(() => {
        setName(initialName || "");
        setDescription(initialDescription || "");
    }, [initialName, initialDescription]);

    const handleSave = useCallback(async () => {
        if (!boardId) return;
        try {
            setSaving(true);
            await axios.put(`${API_BASE_URL}/boards/${boardId}`, { name, description }, auth);
            onSaved?.();
            onClose?.();
        } catch (err) {
            console.error("Failed to save board", err);
            alert("Failed to save board");
        } finally {
            setSaving(false);
        }
    }, [boardId, name, description, auth, onSaved, onClose]);

    const handleCloseBoard = useCallback(async () => {
        if (!boardId) return;
        try {
            setClosing(true);
            await axios.post(`${API_BASE_URL}/boards/${boardId}/close`, {}, auth);
            onSaved?.();
            onClose?.();
        } catch (err) {
            console.error("Failed to close board", err);
            alert("Failed to close board");
        } finally {
            setClosing(false);
        }
    }, [boardId, auth, onSaved, onClose]);

    const handleReopenBoard = useCallback(async () => {
        if (!boardId) return;
        try {
            setReopening(true);
            await axios.post(`${API_BASE_URL}/boards/${boardId}/reopen`, {}, auth);
            onSaved?.();
            onClose?.();
        } catch (err) {
            console.error("Failed to reopen board", err);
            alert("Failed to reopen board");
        } finally {
            setReopening(false);
        }
    }, [boardId, auth, onSaved, onClose]);

    const modalTree = (
        <>
            <style jsx>{`
                .backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1040;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -60%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                @keyframes pulse-custom {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.05;
                    }
                    50% {
                        transform: scale(1.02);
                        opacity: 0.1;
                    }
                }
                .board-settings-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    width: 900px;
                    max-width: 95vw;
                    max-height: 90vh;
                    overflow-y: auto;
                    z-index: 1050;
                    border-radius: 24px;
                    padding: 2rem;
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                    overflow-y: auto;
                }
                .board-settings-modal::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(139, 92, 246, 0.08) 100%);
                    animation: pulse-custom 6s ease-in-out infinite;
                    z-index: -1;
                }
                .board-settings-modal::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .board-settings-modal::-webkit-scrollbar-track {
                    background: rgba(241, 245, 249, 0.3);
                    border-radius: 10px;
                }
                .board-settings-modal::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(16, 185, 129, 0.4));
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                    transition: all 0.3s ease;
                }
                .board-settings-modal::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.7), rgba(16, 185, 129, 0.7));
                    background-clip: content-box;
                }
                .board-settings-modal {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(59, 130, 246, 0.4) rgba(241, 245, 249, 0.3);
                    scroll-behavior: smooth;
                }
                .header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding-right: 3rem;
                    border-right: 1px solid #e5e7eb;
                }
                .title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    font-size: 1.5rem;
                    color: #0f172a;
                    margin: 0;
                }
                .content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    padding-top: 1.25rem;
                }
                .section {
                    background: rgba(249, 250, 251, 0.6);
                    border: 1px solid rgba(229, 231, 235, 0.4);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    margin-bottom: 0.25rem;
                }
                .section:hover {
                    background: rgba(249, 250, 251, 0.8);
                    border-color: rgba(229, 231, 235, 0.6);
                    transform: translateY(-1px);
                }
                .label {
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                .input,
                .textarea {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.9);
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 0.75rem;
                    font-size: 0.95rem;
                    color: #374151;
                    transition: all 0.3s ease;
                }
                .input:focus,
                .textarea:focus {
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    outline: none;
                    transform: translateY(-1px);
                }
                .textarea {
                    min-height: 100px;
                    resize: vertical;
                }
                .actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    padding-top: 1rem;
                }
                .danger {
                    background: linear-gradient(0deg, rgba(254, 242, 242, 0.6), rgba(255, 255, 255, 0.6));
                    border: 1px solid rgba(239, 68, 68, 0.25);
                }
                .close-btn {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: none;
                    border-radius: 12px;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #ef4444;
                    z-index: 10;
                }
                .close-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                    transform: scale(1.1);
                }
            `}</style>

            <div className="backdrop" onClick={onClose} />
            <div className="board-settings-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <Icon icon="material-symbols:close" width={24} />
                </button>
                <div className="header">
                    <h3 className="title">
                        <Icon icon="material-symbols:dashboard-rounded" width={22} /> Board settings
                    </h3>
                </div>

                <div className="content">
                    <div className="section">
                        <div className="label">Board name</div>
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter board name" />
                    </div>

                    <div className="section">
                        <div className="label">Description</div>
                        <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" />
                    </div>

                    <div className="section">
                        <div className="label">Members</div>
                        <Button name="Invite member" icon="material-symbols:person-add-rounded" variant="primary" size="md" onClick={() => setShowInvite(true)} />
                        <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>Use invite to add teammates to this board.</div>
                    </div>

                    <div className={`section ${isOwner ? "danger" : ""}`}>
                        <div className="label">Danger zone</div>
                        {isOwner && !isClosed && <Button name="Close board" icon="material-symbols:lock-outline" variant="redModern" size="md" onClick={handleCloseBoard} loading={closing} />}
                        {isOwner && isClosed && (
                            <Button name="Reopen board" icon="material-symbols:lock-open-outline" variant="greenModern" size="md" onClick={handleReopenBoard} loading={reopening} />
                        )}
                        {!isOwner && <div style={{ fontSize: 12, color: "#64748b" }}>Only the board owner can close or reopen this board.</div>}
                    </div>
                </div>

                <div className="actions">
                    <Button name="Save" icon="material-symbols:save" variant="primary" onClick={handleSave} loading={saving} disabled={!name.trim()} />
                    <Button name="Cancel" icon="material-symbols:close" variant="outline" onClick={onClose} />
                </div>

                {showInvite && <InvitePopup boardId={boardId} token={token} onClose={() => setShowInvite(false)} />}
            </div>
        </>
    );

    if (typeof document !== "undefined") {
        return createPortal(modalTree, document.body);
    }
    return modalTree;
};

export default BoardSettingsPopup;
