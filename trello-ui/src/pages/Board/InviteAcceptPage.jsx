import React, { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../hooks";
import { API_BASE_URL } from "../../../config";

const InviteAcceptPage = () => {
    const { inviteId } = useParams();
    const [searchParams] = useSearchParams();
    const boardId = searchParams.get("boardId");
    const navigate = useNavigate();
    const { token } = useUser();

    useEffect(() => {
        const acceptInvite = async () => {
            try {
                const res = await axios.post(
                    `${API_BASE_URL}/boards/${boardId}/invite/${inviteId}/accept`,
                    {
                        invite_id: inviteId,
                    },
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
                console.error("Error accepting invite:", err.response?.data || err.message);

                navigate(`/boards/${boardId}`);
            }
        };

        if (inviteId && boardId && token) {
            acceptInvite();
        }
    }, [inviteId, boardId, token, navigate]);

    return <div>Processing invitation...</div>;
};

export default InviteAcceptPage;
