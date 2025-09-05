import React from "react";
import { Icon } from "@iconify/react";

const Sidebar = ({ members = [], fullHeight = false, title = "Sample Board" }) => {
    const mockMembers = members.length > 0 ? members : [{ id: 1000, username: "Guest" }];

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
                    box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px;
                }

                .modern-sidebar:hover {
                }

                .members-section {
                    border-radius: 16px;
                    padding: 1.25rem;
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
                }

                .members-count {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border-radius: 12px;
                    padding: 0.25rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-left: auto;
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
                    cursor: pointer;
                    border: 1px solid transparent;
                    background: rgba(255, 255, 255, 0.5);
                    transition: all 0.3s ease;
                }

                .member-item:hover {
                    background: rgba(59, 130, 246, 0.05);
                    border-color: rgba(59, 130, 246, 0.2);
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
                    overflow: hidden;
                }

                .member-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
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
                }

                .member-status {
                    width: 10px;
                    height: 10px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-radius: 50%;
                    margin-left: auto;
                    flex-shrink: 0;
                }

                @media (max-width: 768px) {
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
                                    {console.log("member", member)}
                                    <div
                                        className="member-avatar"
                                        style={{
                                            backgroundColor: member.avatar ? "transparent" : "#3b82f6",
                                        }}
                                    >
                                        {member.avatar ? <img src={member.avatar} alt={member.username} /> : getInitials(member.username)}
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
