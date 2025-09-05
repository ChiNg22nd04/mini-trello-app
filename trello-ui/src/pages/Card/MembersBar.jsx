import { Icon } from "@iconify/react";
import { getInitial } from "../../utils/people";
import { Avatar } from "../../components";

const SIZE_MAP = {
    small: { avatar: 26, gap: "0" },
    medium: { avatar: 30, gap: "0" },
    big: { avatar: 38, gap: "0" },
};

export default function MembersBar({ members = [], size = "medium", isShow = true }) {
    const { avatar, gap } = SIZE_MAP[size] || SIZE_MAP.medium;

    return (
        <div style={{ display: "flex", alignItems: "center", gap }}>
            {isShow && (
                <div style={{}} className="section-header pe-3 ps-4">
                    <Icon icon="material-symbols:groups" width={24} />
                    Members
                </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap }}>
                {members.map((m) => (
                    <div
                        key={m.id}
                        className="avatar-small"
                        title={m.username}
                        style={{
                            marginRight: "-5px",
                            border: " 2px solid #fff",
                            boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.05)",
                            cursor: "pointer",
                            width: avatar,
                            height: avatar,
                            borderRadius: "50%",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: avatar * 0.5,
                            background: "#eee",
                        }}
                    >
                        {m.avatar ? (
                            <Avatar
                                src={m.avatar}
                                alt={m.username}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                }}
                            />
                        ) : (
                            getInitial(m.username)
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
