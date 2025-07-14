import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../hooks";
import { API_BASE_URL, socket } from "../../../config";

const InviteAcceptPage = () => {
    console.log(1);
    const { id: boardId, inviteId } = useParams();
    const navigate = useNavigate();
    const { token } = useUser();

    useEffect(() => {
        const acceptInvite = async () => {
            try {
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
                    navigate(`/boards/${boardId}`);
                }
            } catch (err) {
                console.error(" Error accepting invite:", err.response?.data || err.message);
                navigate(`/boards/${boardId}`);
            }
        };

        if (inviteId && boardId && token) {
            acceptInvite();
        }

        socket.on("boardInviteAccepted");

        return () => {
            socket.off("boardInviteAccepted");
        };
    }, [inviteId, boardId, token, navigate]);

    return <div>Processing invitation...</div>;
};

export default InviteAcceptPage;
