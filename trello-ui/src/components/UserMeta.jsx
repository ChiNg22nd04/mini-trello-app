// Hiển thị tên và email (tái sử dụng ở nhiều nơi)
const UserMeta = ({ name = "Unknown", email = "-" }) => {
    return (
        <div style={{ minWidth: 0 }}>
            <div
                style={{
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
                title={name}
            >
                {name}
            </div>
            <div
                style={{
                    color: "#64748b",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
                title={email}
            >
                {email || "-"}
            </div>
        </div>
    );
};

export default UserMeta;
