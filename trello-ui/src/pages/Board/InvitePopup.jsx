import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../config";
import { UserPlus, Send, X, Mail, Link, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const InvitePopup = ({ boardId, token, onClose }) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [focus, setFocus] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 'success' or 'error'

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleInvite = async () => {
        if (!email.trim()) {
            setMessage("Please enter an email address");
            setMessageType("error");
            return;
        }

        if (!isValidEmail(email.trim())) {
            setMessage("Please enter a valid email address");
            setMessageType("error");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const res = await axios.post(`${API_BASE_URL}/boards/${boardId}/invite`, { emailMember: email.trim() }, { headers: { Authorization: `Bearer ${token}` } });

            console.log("Invite sent:", res.data);
            setMessage(`Invitation sent successfully!`);
            setMessageType("success");
            toast.success(`Invitation sent to ${email.trim()} successfully!`);

            // Auto close after success
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Invite failed:", err.response?.data || err.message);
            setMessage("Failed to send invitation. Please try again.");
            setMessageType("error");
            toast.error("Failed to send invitation. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleInvite();
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

                .invite-popup {
                    position: relative;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
                    padding: 2rem;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 480px;
                    margin: 1rem;
                    animation: slideUp 0.3s ease-out;
                    overflow: hidden;
                }

                .invite-popup::before {
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
                }

                .email-input {
                    background: rgba(249, 250, 251, 0.8);
                    border: 2px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 1rem 3.5rem 1rem 1rem;
                    font-size: 1rem;
                    font-family: "Courier New", monospace;
                    letter-spacing: 0.1em;
                    transition: all 0.3s ease;
                    width: 100%;
                    color: #374151;
                }

                .email-input:focus {
                    border-color: #10b981;
                    background: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(16, 185, 129, 0.1);
                    transform: translateY(-2px);
                    outline: none;
                }

                .email-input:hover:not(:focus) {
                    border-color: #d1d5db;
                }

                .input-container {
                    position: relative;
                    margin-bottom: 1rem;
                }

                .input-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    transition: all 0.3s ease;
                    color: #9ca3af;
                }

                .input-icon.focus {
                    color: #10b981;
                }

                .input-icon.valid {
                    color: #10b981;
                }

                .send-btn {
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
                }

                .send-btn:not(:disabled):hover {
                    background: linear-gradient(135deg, #059669 0%, #047857 100%);
                    box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.4);
                    transform: translateY(-2px) scale(1.02);
                }

                .send-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1);
                }

                .link-section {
                    background: rgba(243, 244, 246, 0.8);
                    border: 1px solid rgba(229, 231, 235, 0.8);
                    border-radius: 16px;
                    padding: 1.25rem;
                    text-align: center;
                }

                .link-btn {
                    color: #2563eb;
                    background: none;
                    border: none;
                    text-decoration: underline;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .link-btn:hover {
                    color: #1d4ed8;
                    transform: translateY(-1px);
                }

                .message-alert {
                    border-radius: 12px;
                    padding: 0.75rem 1rem;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    animation: slideUp 0.3s ease-out;
                }

                .message-alert.success {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    color: #047857;
                }

                .message-alert.error {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #dc2626;
                }

                .loading-spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>

            <div className="backdrop" onClick={onClose}>
                <div className="invite-popup" onClick={(e) => e.stopPropagation()}>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                        <h2 className="title-gradient">Invite to Board</h2>
                        <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>Send an invitation to collaborate on this board</p>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <div className={`message-alert ${messageType}`}>
                            {messageType === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <span>{message}</span>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="input-container">
                        <input
                            type="email"
                            className="email-input"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (message) {
                                    setMessage("");
                                }
                            }}
                            onFocus={() => setFocus(true)}
                            onBlur={() => setFocus(false)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <div className={`input-icon ${focus ? "focus" : ""} ${isValidEmail(email) ? "valid" : ""}`}>{isValidEmail(email) ? <CheckCircle size={22} /> : <Mail size={22} />}</div>
                    </div>

                    {/* Send Button */}
                    <button className="send-btn" onClick={handleInvite} disabled={isLoading || !email.trim()}>
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="loading-spinner" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Send Invitation
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default InvitePopup;
