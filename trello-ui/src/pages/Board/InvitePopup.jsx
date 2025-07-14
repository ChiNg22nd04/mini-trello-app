import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../../../config";

import { Icon } from "@iconify/react";

const InvitePopup = ({ boardId, token, onClose }) => {
    const [email, setEmail] = useState("");

    const handleInvite = async () => {
        if (!email.trim()) return;
        try {
            const res = await axios.post(
                `${API_BASE_URL}/boards/${boardId}/invite`,
                { emailMember: email.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Invite sent:", res.data);
            toast.success(`Invitation sent to ${email.trim()} successfully!`);
            onClose();
        } catch (err) {
            console.error("Invite failed:", err.response?.data || err.message);
            toast.error("Failed to send invitation. Please try again.");
        }
    };

    return (
        <div style={styles.backdrop}>
            <div style={styles.popup}>
                <button style={styles.closeBtn} onClick={onClose}>
                    <Icon icon="material-symbols:close" width="24" />
                </button>

                <h5 className="mb-3">Invite to Board</h5>

                <div className="d-flex mb-3">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email address or name"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <span>
                            Invite someone to this Workspace with a link:{" "}
                        </span>
                        <a
                            href="#"
                            className="text-primary"
                            onClick={() => alert("Disable link clicked")}
                        >
                            Disable link
                        </a>
                    </div>
                    <button
                        style={{ borderRadius: "3px" }}
                        className="btn btn-outline-light"
                        onClick={handleInvite}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    backdrop: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    popup: {
        position: "relative",
        backgroundColor: "#262d34",
        color: "#fff",
        padding: "24px",
        borderRadius: "3px",
        width: "800px",
        maxWidth: "90%",
    },
    closeBtn: {
        position: "absolute",
        top: "12px",
        right: "12px",
        background: "transparent",
        border: "none",
        fontSize: "20px",
        color: "#fff",
        cursor: "pointer",
    },
};

export default InvitePopup;
