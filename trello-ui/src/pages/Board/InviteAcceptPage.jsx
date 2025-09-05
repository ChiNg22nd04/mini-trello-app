import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../hooks";
import { API_BASE_URL, socket } from "../../../config";
import { toast } from "react-toastify";

const InviteAcceptPage = () => {
    const { id: boardId, inviteId } = useParams();
    const navigate = useNavigate();
    const { token } = useUser();
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const handleInviteAccepted = (data) => {
            console.log("Received boardInviteAccepted via socket:", data);
            toast.success(`${data.emailMember} has joined board ${data.boardId}`);
        };

        socket.on("boardInviteAccepted", handleInviteAccepted);

        return () => {
            socket.off("boardInviteAccepted", handleInviteAccepted);
        };
    }, []);

    useEffect(() => {
        const acceptInvite = async () => {
            if (!inviteId || !boardId || !token) {
                console.error("Missing required parameters");
                navigate("/boards");
                return;
            }

            try {
                setProcessing(true);
                const res = await axios.post(
                    `${API_BASE_URL}/boards/${boardId}/invite/${inviteId}/accept`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.data.success) {
                    toast.success("Successfully joined the board!");
                    setTimeout(() => {
                        navigate(`/boards/${boardId}`);
                    }, 1000);
                } else {
                    toast.error("Failed to accept invitation");
                    navigate("/boards");
                }
            } catch (err) {
                console.error("Error accepting invite:", err.response?.data || err.message);
                toast.error("Failed to accept invitation");
                navigate("/boards");
            } finally {
                setProcessing(false);
            }
        };

        acceptInvite();
    }, [inviteId, boardId, token, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 text-center">
            {processing ? (
                <>
                    <div className="spinner-border text-primary mb-3" role="status" />
                    <p>Processing invitation...</p>
                </>
            ) : (
                <p>Redirecting...</p>
            )}
        </div>
    );
};

export default InviteAcceptPage;
