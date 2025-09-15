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
                .board-settings-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.98));
                    backdrop-filter: blur(18px);
                    border: 1px solid rgba(226, 232, 240, 0.9);
                    box-shadow: 0 20px 60px rgba(2, 6, 23, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.6);
                    width: 840px;
                    max-width: 95vw;
                    max-height: 90vh;
                    overflow-y: auto;
                    z-index: 1050;
                    border-radius: 24px;
                    padding: 0;
                    animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #e5e7eb;
                    background: rgba(255, 255, 255, 0.9);
                    border-top-left-radius: 24px;
                    border-top-right-radius: 24px;
                }
                .title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    color: #0f172a;
                    margin: 0;
                }
                .content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    padding: 1.25rem;
                }
                .section {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 1rem;
                }
                .label {
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                .input {
                    width: 100%;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 0.6rem 0.75rem;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                }
                .input:focus {
                    outline: none;
                    border-color: #60a5fa;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                }
                .textarea {
                    width: 100%;
                    min-height: 90px;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 0.6rem 0.75rem;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    resize: vertical;
                }
                .actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    padding: 1rem 1.25rem;
                    border-top: 1px solid #e5e7eb;
                    background: rgba(255, 255, 255, 0.9);
                    border-bottom-left-radius: 24px;
                    border-bottom-right-radius: 24px;
                }
                .danger {
                    background: linear-gradient(0deg, rgba(254, 242, 242, 0.9), rgba(255, 255, 255, 0.9));
                    border: 1px solid #fecaca;
                }
            `}</style>

            <div className="backdrop" onClick={onClose} />
            <div className="board-settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="header">
                    <h3 className="title">
                        <Icon icon="material-symbols:dashboard-rounded" width={22} /> Board settings
                    </h3>
                    <Button icon="material-symbols:close" variant="redModern" size="sm" onClick={onClose} />
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
