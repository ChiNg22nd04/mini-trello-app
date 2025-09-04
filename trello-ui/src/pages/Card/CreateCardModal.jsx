import React, { useState } from "react";
import { X, Plus, User, FileText, Edit3 } from "lucide-react";

const CreateCardModal = ({ onClose, onCreate, members = [], boardId, ownerId }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        const createdAt = new Date().toISOString();
        onCreate({
            name: name.trim(),
            description: description.trim(),
            members: selectedMembers,
            boardId,
            ownerId,
            createdAt,
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
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
                    animation: fadeIn 0.3s ease-out;
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
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes pulse-custom {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.1;
                    }
                    50% {
                        transform: scale(1.05);
                        opacity: 0.15;
                    }
                }

                .create-modal {
                    position: relative;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
                    padding: 2rem;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 600px;
                    margin: 1rem;
                    animation: slideUp 0.3s ease-out;
                    overflow: hidden;
                    max-height: 90vh;
                }

                .create-modal::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 50%, rgba(4, 120, 87, 0.1) 100%);
                    animation: pulse-custom 4s ease-in-out infinite;
                    z-index: -1;
                }

                .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: none;
                    border-radius: 12px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #ef4444;
                }

                .close-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                    transform: scale(1.1);
                }

                .title-gradient {
                    background: linear-gradient(to right, #374151, #6b7280);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    font-size: 1.75rem;
                }

                .subtitle {
                    color: #6b7280;
                    font-size: 0.875rem;
                    line-height: 1.6;
                    margin: 0;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.875rem;
                }

                .label-icon {
                    color: #6b7280;
                    flex-shrink: 0;
                }

                .form-input {
                    background: rgba(249, 250, 251, 0.8);
                    border: 2px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 1rem;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    width: 100%;
                    color: #374151;
                    box-sizing: border-box;
                }

                .form-input:focus {
                    border-color: #10b981;
                    background: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(16, 185, 129, 0.1);
                    transform: translateY(-2px);
                    outline: none;
                }

                .form-input:hover:not(:focus) {
                    border-color: #d1d5db;
                }

                .form-textarea {
                    background: rgba(249, 250, 251, 0.8);
                    border: 2px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 1rem;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    width: 100%;
                    color: #374151;
                    resize: vertical;
                    min-height: 120px;
                    font-family: inherit;
                    box-sizing: border-box;
                }

                .form-textarea:focus {
                    border-color: #10b981;
                    background: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(16, 185, 129, 0.1);
                    transform: translateY(-2px);
                    outline: none;
                }

                .form-textarea:hover:not(:focus) {
                    border-color: #d1d5db;
                }

                .create-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border: none;
                    border-radius: 16px;
                    padding: 0.875rem 2rem;
                    font-weight: 600;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .create-btn:not(:disabled):hover {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.4);
                    transform: translateY(-2px) scale(1.02);
                }

                .create-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1);
                }

                .btn-icon {
                    flex-shrink: 0;
                }

                .header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
            `}</style>

            <div className="backdrop" onClick={onClose}>
                <div className="create-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="header">
                        <h2 className="title-gradient">Create New Card</h2>
                        <p className="subtitle">Add a new card to organize your tasks and ideas</p>
                    </div>

                    {/* Card Title */}
                    <div className="form-group">
                        <label className="form-label">
                            <Edit3 size={16} className="label-icon" />
                            Card Title
                        </label>
                        <input type="text" className="form-input" placeholder="Enter card title..." value={name} onChange={(e) => setName(e.target.value)} onKeyPress={handleKeyPress} autoFocus />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">
                            <FileText size={16} className="label-icon" />
                            Description
                        </label>
                        <textarea className="form-textarea" placeholder="Add a detailed description..." value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    {/* Create Button */}
                    <button type="button" className="create-btn" disabled={!name.trim()} onClick={handleSubmit}>
                        <Plus size={18} className="btn-icon" />
                        Create Card
                    </button>
                </div>
            </div>
        </>
    );
};

export default CreateCardModal;
