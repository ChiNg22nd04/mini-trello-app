import React from "react";
import { Icon } from "@iconify/react";

const Sidebar = ({ members = [], fullHeight = false, title = "Sample Board" }) => {
    const mockMembers = members.length > 0 ? members : [{ id: 1000, username: "Guest" }];

    const getAvatarColor = (username) => {
        const colors = [
            "#10b981", // Emerald-500
            "#3b82f6", // Blue-500
            "#06b6d4", // Cyan-500
            "#8b5cf6", // Purple-500
            "#f59e0b", // Amber-500
            "#ef4444", // Red-500
        ];
        const index = username.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getInitials = (username) => {
        if (!username || username.trim() === "") return "?";
        return username.charAt(0).toUpperCase();
    };

    const formatUsername = (username) => {
        if (!username || username.trim() === "") return "Anonymous";
        return username.charAt(0).toUpperCase() + username.slice(1);
    };

    return (
        <>
            <style jsx>{`
                .modern-sidebar {
                    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
                    border: 1px solid #e5e7eb;
                    border-radius: 20px;
                    height: ${fullHeight ? "100%" : "auto"};
                    min-height: 100vh;
                    overflow-y: auto;
                    position: relative;
                    margin: 0 10px 20px 20px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .modern-sidebar:hover {
                    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1);
                }

                .board-section {
                    margin-bottom: 2rem;
                }

                .board-item {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border: none;
                    border-radius: 16px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }

                .board-item::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s ease;
                }

                .board-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
                }

                .board-item:hover::before {
                    left: 100%;
                }

                .board-item:active {
                    transform: translateY(0);
                    transition: transform 0.1s ease;
                }

                .board-icon {
                    color: white;
                    margin-right: 0.75rem;
                    flex-shrink: 0;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                }

                .board-title {
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    letter-spacing: -0.02em;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .members-section {
                    border-radius: 16px;
                    padding: 1.25rem;
                    transition: all 0.3s ease;
                }

                .members-section:hover {
                }

                .members-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
                }

                .members-title {
                    color: #1e293b;
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0;
                    flex: 1;
                }

                .members-icon {
                    color: #3b82f6;
                    margin-right: 0.5rem;
                    transition: color 0.3s ease;
                }

                .members-count {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border-radius: 12px;
                    padding: 0.25rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-left: auto;
                    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
                    transition: all 0.3s ease;
                }

                .members-count:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
                }

                .members-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .member-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem;
                    border-radius: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    border: 1px solid transparent;
                    background: rgba(255, 255, 255, 0.5);
                }

                .member-item:hover {
                    background: rgba(59, 130, 246, 0.05);
                    border-color: rgba(59, 130, 246, 0.2);
                    transform: translateX(2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), -4px 0 8px rgba(16, 185, 129, 0.1);
                }

                .member-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.875rem;
                    margin-right: 0.75rem;
                    flex-shrink: 0;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                }

                .member-item:hover .member-avatar {
                    transform: scale(1.1);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4);
                }

                .member-info {
                    flex: 1;
                    min-width: 0;
                }

                .member-name {
                    color: #1e293b;
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    transition: color 0.3s ease;
                }

                .member-item:hover .member-name {
                    color: #059669;
                }

                .member-status {
                    width: 10px;
                    height: 10px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 50%;
                    margin-left: auto;
                    flex-shrink: 0;
                    border: 2px solid white;
                    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
                    transition: all 0.3s ease;
                }

                .member-item:hover .member-status {
                    transform: scale(1.2);
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
                }

                /* Scrollbar styling */
                .modern-sidebar::-webkit-scrollbar {
                    width: 6px;
                }

                .modern-sidebar::-webkit-scrollbar-track {
                    background: rgba(16, 185, 129, 0.05);
                    border-radius: 3px;
                }

                .modern-sidebar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                    border-radius: 3px;
                    transition: background 0.3s ease;
                }

                .modern-sidebar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #059669 0%, #2563eb 100%);
                }

                @media (max-width: 768px) {
                    .sidebar-content {
                        padding: 1rem;
                    }

                    .board-title,
                    .member-name {
                        font-size: 0.8rem;
                    }

                    .member-avatar {
                        width: 32px;
                        height: 32px;
                        font-size: 0.75rem;
                    }
                }
            `}</style>

            <div className="modern-sidebar">
                <div className="sidebar-content">
                    {/* Members Section */}
                    <div className="members-section">
                        <div className="members-header">
                            <Icon icon="material-symbols:group" width="20" className="members-icon" />
                            <span className="members-title">Team Members</span>
                            <span className="members-count">{mockMembers.length}</span>
                        </div>

                        <div className="members-list">
                            {mockMembers.map((member) => (
                                <div key={member.id} className="member-item">
                                    <div
                                        className="member-avatar"
                                        style={{
                                            backgroundColor: getAvatarColor(member.username),
                                        }}
                                    >
                                        {getInitials(member.username)}
                                    </div>
                                    <div className="member-info">
                                        <p className="member-name">{formatUsername(member.username)}</p>
                                    </div>
                                    <div className="member-status"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
