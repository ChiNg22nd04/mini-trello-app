import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import axios from "axios";
import API_BASE_URL from "../../../config/config";
import { Button } from "../../components";
import InvitePopup from "./InvitePopup";
import MembersBar from "../Card/MembersBar";
import { DescriptionBox } from "../../components";

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
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [meta, setMeta] = useState({ createdAt: null, closed: !!isClosed });

    useEffect(() => {
        setName(initialName || "");
        setDescription(initialDescription || "");
    }, [initialName, initialDescription]);

    useEffect(() => {
        let mounted = true;
        const fetchBoard = async () => {
            if (!boardId) return;
            try {
                setLoadingMeta(true);
                const res = await axios.get(`${API_BASE_URL}/boards/${boardId}`, auth);
                if (!mounted) return;
                const createdAt = res?.data?.createdAt || res?.data?.createAt || res?.data?.created_at || null;
                const closed = !!res?.data?.closed;
                setMeta({ createdAt, closed });
            } catch (err) {
                console.error("Failed to fetch board info", err);
            } finally {
                setLoadingMeta(false);
            }
        };
        const fetchMembers = async () => {
            if (!boardId) return;
            try {
                setLoadingMembers(true);
                const res = await axios.get(`${API_BASE_URL}/boards/${boardId}/members`, auth);
                if (!mounted) return;
                setMembers(res?.data?.members || []);
            } catch (err) {
                console.error("Failed to fetch members", err);
            } finally {
                setLoadingMembers(false);
            }
        };
        fetchBoard();
        fetchMembers();
        return () => {
            mounted = false;
        };
    }, [boardId, auth]);

    // Inline title editor
    const TitleEditable = ({ value, onChange }) => {
        const [editing, setEditing] = useState(false);
        const [temp, setTemp] = useState(value || "");

        useEffect(() => {
            setTemp(value || "");
        }, [value]);

        const commit = useCallback(() => {
            onChange?.(temp.trim());
            setEditing(false);
        }, [temp, onChange]);

        if (editing) {
            return (
                <input
                    className="title-input"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") commit();
                        if (e.key === "Escape") {
                            setTemp(value || "");
                            setEditing(false);
                        }
                    }}
                    placeholder="Enter board name"
                    autoFocus
                />
            );
        }
        return (
            <h1 className="card-title" title="Click to edit board name" onClick={() => setEditing(true)}>
                {value || "Untitled board"}
            </h1>
        );
    };

    const formatDateTime = useCallback((input) => {
        if (!input) return "—";
        try {
            let date;
            // Handle Date instance
            if (input instanceof Date) {
                date = input;
            }
            // Handle Firestore Timestamp-like objects
            else if (typeof input === "object" && input !== null) {
                if (typeof input.toDate === "function") {
                    date = input.toDate();
                } else if (typeof input.seconds === "number") {
                    date = new Date(input.seconds * 1000);
                } else if (typeof input._seconds === "number") {
                    date = new Date(input._seconds * 1000);
                }
            }
            // Handle epoch milliseconds
            else if (typeof input === "number") {
                date = new Date(input);
            }

            // Fallback: attempt to parse string (including formats like
            // "September 4, 2025 at 4:48:07 PM UTC+7"). If parsing fails,
            // render the original string to avoid "Invalid Date".
            if (!date) {
                const parsedMs = Date.parse(String(input));
                if (!Number.isNaN(parsedMs)) {
                    date = new Date(parsedMs);
                }
            }

            if (!date || Number.isNaN(date.getTime())) {
                return String(input);
            }
            return date.toLocaleString();
        } catch {
            return String(input);
        }
    }, []);

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
                    z-index: 2000;
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
                        opacity: 0.08;
                    }
                    50% {
                        transform: scale(1.02);
                        opacity: 0.12;
                    }
                }
                .card-title {
                    background: linear-gradient(to right, #374151, #6b7280);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    font-size: 1.5rem;
                    margin: 0;
                }

                .title-input {
                    font-size: 1.5rem;
                    font-weight: 700;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 6px 10px;
                    color: #111827;
                    background: rgba(255, 255, 255, 0.9);
                    transition: all 0.2s ease;
                    width: 100%;
                    max-width: 640px;
                }
                .title-input:focus {
                    border-color: #10b981;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
                    outline: none;
                }

                .board-settings-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
                    width: 980px;
                    max-width: 95vw;
                    max-height: 90vh;
                    overflow-y: auto;
                    z-index: 2050;
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
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.06) 50%, rgba(4, 120, 87, 0.1) 100%);
                    animation: pulse-custom 6s ease-in-out infinite;
                    z-index: -1;
                }
                .board-settings-modal::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .board-settings-modal::-webkit-scrollbar-track {
                    background: rgba(243, 244, 246, 0.5);
                    border-radius: 10px;
                }
                .board-settings-modal::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(5, 150, 105, 0.5));
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                    transition: all 0.3s ease;
                }
                .board-settings-modal::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8));
                    background-clip: content-box;
                }
                .board-settings-modal {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(16, 185, 129, 0.5) rgba(243, 244, 246, 0.5);
                    scroll-behavior: smooth;
                }
                .description-area {
                    background: rgba(255, 255, 255, 0.8);
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1rem;
                    min-height: 80px;
                    color: #374151;
                    font-size: 0.875rem;
                    line-height: 1.5;
                    transition: all 0.3s ease;
                }

                .description-area:hover {
                    border-color: #d1d5db;
                    background: white;
                }
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.75rem;
                    padding-right: 0.5rem;
                }
                .title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 800;
                    font-size: 1.5rem;
                    background: linear-gradient(to right, #374151, #6b7280);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0;
                }
                .content {
                    display: grid;
                    gap: 16px;
                    padding-top: 1rem;
                }
                .meta {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 6px 10px;
                    border-radius: 999px;
                    border: 1px solid rgba(16, 185, 129, 0.25);
                    background: rgba(16, 185, 129, 0.08);
                    color: #065f46;
                }
                .pill.closed {
                    border-color: rgba(239, 68, 68, 0.25);
                    background: rgba(239, 68, 68, 0.08);
                    color: #991b1b;
                }
                .section {
                    background: rgba(249, 250, 251, 0.7);
                    border: 1px solid rgba(229, 231, 235, 0.6);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    margin-bottom: 0.25rem;
                }
                .section:hover {
                    background: rgba(249, 250, 251, 0.8);
                    border-color: rgba(16, 185, 129, 0.25);
                    transform: translateY(-1px);
                }
                .label {
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.9rem;
                }
                .input,
                .textarea,
                .input-field {
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
                .textarea:focus,
                .input-field:focus {
                    border-color: #10b981;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
                    outline: none;
                    transform: translateY(-1px);
                }
                .textarea,
                .input-field {
                    min-height: 100px;
                    resize: vertical;
                }
                .members-list {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    max-height: none;
                    overflow: visible;
                    padding-right: 0;
                }
                .member-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 10px;
                    border: 1px solid rgba(229, 231, 235, 0.7);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.9);
                    transition: all 0.2s ease;
                }
                .member-item:hover {
                    transform: translateY(-1px);
                    border-color: rgba(16, 185, 129, 0.25);
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.12);
                }
                .member-name {
                    font-weight: 600;
                    color: #111827;
                    font-size: 0.93rem;
                }
                .member-sub {
                    color: #6b7280;
                    font-size: 0.8rem;
                }
                .avatar-stack {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .avatar-item {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #eee;
                    margin-right: -5px;
                    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
                    cursor: default;
                }
                .add-circle {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: #10b981;
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
                    box-shadow: 0 6px 12px rgba(16, 185, 129, 0.25);
                }
                .add-circle:hover {
                    transform: translateY(-1px) scale(1.05);
                    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.35);
                    background: #059669;
                }
                .actions {
                    display: flex;
                    gap: 10px;
                    justify-content: space-between;
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
                @media (max-width: 900px) {
                    .content {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="backdrop" onClick={onClose} />
            <div className="board-settings-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <Icon icon="material-symbols:close" width={24} />
                </button>
                <div className="header">
                    <TitleEditable value={name} onChange={setName} />
                </div>
                <div className="content">
                    <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }} className="member-sub" title={meta.createdAt || ""}>
                        <Icon icon="mdi:clock-outline" width={16} /> {loadingMeta ? "Loading..." : `Created ${formatDateTime(meta.createdAt)}`}
                    </span>

                    <DescriptionBox description={description} onSave={setDescription} />

                    <div className="section">
                        <div className="label member-sub" style={{ marginBottom: 10 }}>
                            <Icon icon="material-symbols:groups" width={16} /> Members: {Array.isArray(members) ? members.length : 0}
                        </div>
                        {loadingMembers ? (
                            <div className="member-sub">Loading members...</div>
                        ) : (
                            <div className="members-list" style={{ alignItems: "center" }}>
                                <MembersBar members={members} size="medium" isShow={false} />
                                <button style={{ marginLeft: -8 }} className="add-circle" title="Invite member" onClick={() => setShowInvite(true)}>
                                    <Icon icon="material-symbols:add" width={20} />
                                </button>
                            </div>
                        )}
                        <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>Invite teammates to collaborate on this board.</div>
                    </div>
                </div>

                <div className="actions">
                    {isOwner && (
                        <div>
                            {!meta.closed && <Button name="Close board" icon="material-symbols:lock-outline" variant="redModern" size="md" onClick={handleCloseBoard} loading={closing} />}
                            {meta.closed && <Button name="Reopen board" icon="material-symbols:lock-open-outline" variant="greenModern" size="md" onClick={handleReopenBoard} loading={reopening} />}
                        </div>
                    )}
                    <div className="flex">
                        <Button className="me-2" name="Save" icon="material-symbols:save" variant="primary" onClick={handleSave} loading={saving} disabled={!name.trim()} />
                        <Button name="Cancel" icon="material-symbols:close" variant="outline" onClick={onClose} />
                    </div>
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
