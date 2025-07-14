import { Icon } from "@iconify/react";
import API_BASE_URL from "../../config/config";
import axios from "axios";

const TopSideBar = ({ token, boardName = "Board Management", boardId, style = {}, className = {} }) => {
    console.log("boardId", boardId);

    const handleInviteMember = async () => {
        try {
            const link = `${API_BASE_URL}/boards/${boardId}/invite`;

            const response = await axios.post(
                link,
                {
                    boardOwnerId: "ownerId",
                    memberId: "memberId",
                    emailMember: "diinguyen@test.com",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Invite sent:", response.data);
        } catch (error) {
            console.error("Failed to invite:", error.response?.data || error.message);
        }
    };

    return (
        <di className={`${className}`} style={{ ...style }}>
            <p className="m-0">{boardName}</p>
            <div onClick={handleInviteMember} className="d-flex align-items-center px-2 py-1 border rounded" style={{ background: "#1e252a" }}>
                <Icon icon="material-symbols:account-circle" width="24" />
                <span className="ms-2">Invite member</span>
            </div>
        </di>
    );
};

export default TopSideBar;
