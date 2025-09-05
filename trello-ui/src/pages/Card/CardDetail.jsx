import React from "react";
import { Icon } from "@iconify/react";
import useCardTasks from "../../hooks/useCardTask";
import CardHeader from "./CardHeader";
import MembersBar from "./MembersBar";
import DescriptionBox from "./DescriptionBox";
import Checklist from "../Card/Checklist/index";

const CardDetail = ({ card, onClose, boardId, token, boardMembers = [], onTaskCountsChange }) => {
    const { tasks, cardMembers, taskMembersMap, progress, actions } = useCardTasks({
        card,
        boardId,
        token,
        onTaskCountsChange,
    });

    if (!card) return null;

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

                .card-detail-popup {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    width: 1000px;
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

                .card-detail-popup::before {
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

                .card-detail-popup::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                .card-detail-popup::-webkit-scrollbar-track {
                    background: rgba(241, 245, 249, 0.3);
                    border-radius: 10px;
                }

                .card-detail-popup::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(16, 185, 129, 0.4));
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                    transition: all 0.3s ease;
                }

                .card-detail-popup::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.7), rgba(16, 185, 129, 0.7));
                    background-clip: content-box;
                }

                /* Firefox */
                .card-detail-popup {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(59, 130, 246, 0.4) rgba(241, 245, 249, 0.3);
                    scroll-behavior: smooth;
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

                .card-header {
                    border-right: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding-right: 3rem;
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

                .card-subtitle {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .section {
                    background: rgba(249, 250, 251, 0.6);
                    border: 1px solid rgba(229, 231, 235, 0.4);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    transition: all 0.3s ease;
                }

                .section:hover {
                    background: rgba(249, 250, 251, 0.8);
                    border-color: rgba(229, 231, 235, 0.6);
                    transform: translateY(-1px);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #374151;
                    font-weight: 600;
                    font-size: 1rem;
                }

                .member-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                    border: 2px solid white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .member-avatar:hover {
                    transform: scale(1.1) translateY(-2px);
                    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
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

                .progress-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .progress-bar-container {
                    flex: 1;
                    height: 8px;
                    background: rgba(229, 231, 235, 0.6);
                    border-radius: 50px;
                    overflow: hidden;
                    position: relative;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #059669);
                    border-radius: 50px;
                    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .progress-bar::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% {
                        left: -100%;
                    }
                    100% {
                        left: 100%;
                    }
                }

                .progress-text {
                    color: #374151;
                    font-weight: 600;
                    font-size: 0.875rem;
                    min-width: 35px;
                }

                .btn {
                    border: none;
                    border-radius: 12px;
                    padding: 0.5rem 1rem;
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
                }

                .btn-primary:hover {
                    background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.4);
                }

                .btn-outline {
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid #d1d5db;
                    color: #374151;
                }

                .btn-outline:hover {
                    background: white;
                    border-color: #9ca3af;
                    transform: translateY(-1px);
                }

                .btn-danger {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
                }

                .btn-danger:hover {
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 15px -3px rgba(239, 68, 68, 0.4);
                }

                .task-item {
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(229, 231, 235, 0.6);
                    border-radius: 12px;
                    padding: 0.5rem;
                    margin-bottom: 0.75rem;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: visible;
                }

                .task-item:hover {
                    background: white;
                    border-color: rgba(156, 163, 175, 0.8);
                    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .task-item.completed {
                    opacity: 0.7;
                    background: rgba(243, 244, 246, 0.8);
                }

                .task-checkbox {
                    background: #e5e7eb;
                    margin: 10px;
                    width: 20px;
                    height: 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .task-title {
                    font-weight: 500;
                    color: #374151;
                    transition: all 0.1s ease;
                }

                .task-title.completed {
                    text-decoration: line-through;
                    opacity: 0.6;
                }

                .task-row {
                    overflow: visible;
                    max-height: 240px;
                    margin-bottom: 0.75rem;
                }

                .task-row.hidden-checked {
                    opacity: 0;
                    transform: translateY(-6px) scale(0.98);
                    max-height: 0;
                    margin: 0;
                    pointer-events: none;
                }

                .task-row.hidden-checked .task-item {
                    margin: 0;
                    border-width: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                }

                .eye-btn.active {
                    background: rgba(59, 130, 246, 0.08);
                    border-color: #9ca3af;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 12px -5px rgba(59, 130, 246, 0.25);
                }

                .eye-btn.pulse {
                    animation: pulse-custom 0.32s ease-in-out;
                }

                .input-field {
                    background: rgba(255, 255, 255, 0.9);
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 0.75rem;
                    font-size: 0.875rem;
                    color: #374151;
                    transition: all 0.3s ease;
                    width: 100%;
                }

                .input-field:focus {
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    outline: none;
                    transform: translateY(-1px);
                }

                .dropdown {
                    position: absolute;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    padding: 0.15rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    z-index: 1000;
                    min-width: 220px;
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.5rem;
                    margin-bottom: 0.15rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .dropdown-item:hover {
                    background: #f3f4f6;
                }

                .dropdown-item.selected {
                    background: rgba(59, 130, 246, 0.1);
                    color: #1d4ed8;
                }

                .avatar-small {
                    margin-right: -5px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;

                    /* border trắng + shadow */
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .avatar-small img {
                    border-radius: 50%;
                    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05); /* đổ bóng nhẹ */
                }

                .task-avatars {
                    display: flex;
                    margin-right: 0.5rem;
                }

                .task-avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 500;
                    border: 2px solid white;
                    margin-left: -5px;
                    transition: all 0.2s ease;
                }

                .task-avatar:first-child {
                    margin-left: 0;
                }

                .task-avatar:hover {
                    transform: scale(1.1);
                    z-index: 10;
                }

                .action-btn {
                    background: transparent;
                    border: none;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-btn:hover {
                    background: rgba(0, 0, 0, 0.05);
                    transform: scale(1.1);
                }

                .edit-section {
                    background: rgba(249, 250, 251, 0.9);
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 0.5rem;
                }

                .add-task-section {
                    background: rgba(255, 255, 255, 0.7);
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                }

                .add-task-section:hover {
                    background: rgba(255, 255, 255, 0.9);
                    border-color: #9ca3af;
                }

                .add-task-button {
                    background: rgba(255, 255, 255, 0.7);
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-top: 1rem;
                    cursor: pointer;
                    text-align: center;
                    color: #6b7280;
                    font-weight: 500;
                }

                .add-task-button:hover {
                    background: rgba(255, 255, 255, 0.9);
                    border-color: #9ca3af;
                    color: #374151;
                }
            `}</style>
            {/* backdrop */}
            <div className="backdrop" onClick={onClose} />

            <div className="card-detail-popup" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <Icon icon="material-symbols:close" width={24} />
                </button>

                {/* Header row */}
                <div className="d-flex mb-4" style={{ gap: "1rem", alignItems: "center" }}>
                    <CardHeader title={card.name || card.title} listName={card.status ? card.status.charAt(0).toUpperCase() + card.status.slice(1) : "To do"} />
                    {/* <MembersBar members={cardMembers} /> */}
                    <MembersBar members={cardMembers} size="big" />
                </div>

                <DescriptionBox description={card.description} />

                <Checklist tasks={tasks} taskMembersMap={taskMembersMap} boardMembers={boardMembers} progress={progress} actions={actions} />
            </div>
        </>
    );
};

export default CardDetail;
